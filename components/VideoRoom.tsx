"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import type {
  LocalTrack,
  LocalTrackPublication,
  Participant,
  RemoteTrack,
  RemoteTrackPublication,
  Room
} from "twilio-video";
import { PhoneOff, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

import { useCall } from "@/hooks/useCall";
import { usePresence } from "@/hooks/usePresence";
import { trackEvent } from "@/lib/analytics";
import { fetchTwilioTokens, mapMediaError } from "@/lib/twilio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface VideoRoomProps {
  roomId: string;
  mode: "voice" | "video";
}

/**
 * Twilio-powered active room with camera and network failure handling.
 */
export function VideoRoom({ roomId, mode }: VideoRoomProps): React.JSX.Element {
  const router = useRouter();
  const { user } = useUser();
  const { endCall, failCall } = useCall();

  const localMediaRef = useRef<HTMLDivElement | null>(null);
  const remoteMediaRef = useRef<HTMLDivElement | null>(null);

  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [networkState, setNetworkState] = useState<"good" | "poor">("good");

  usePresence(user?.id, roomId);

  if (!roomId || roomId.trim() === "") {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-[var(--muted-foreground)]">Invalid room.</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => router.push("/dashboard")}
          >
            Back to dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const clearMediaElements = useCallback((): void => {
    const localContainer = localMediaRef.current;
    const remoteContainer = remoteMediaRef.current;

    if (localContainer) {
      localContainer.innerHTML = "";
    }
    if (remoteContainer) {
      remoteContainer.innerHTML = "";
    }
  }, []);

  const attachTrackToContainer = useCallback((track: LocalTrack | RemoteTrack, container: HTMLDivElement): void => {
    if ("attach" in track) {
      const mediaElement = track.attach();
      mediaElement.classList.add("h-full", "w-full", "rounded-md", "object-cover");
      container.appendChild(mediaElement);
    }
  }, []);

  const attachParticipantTracks = useCallback(
    (participant: Participant): void => {
      const container = remoteMediaRef.current;
      if (!container) {
        return;
      }

      participant.tracks.forEach((publication) => {
        const publicationTrack = (publication as LocalTrackPublication | RemoteTrackPublication).track;
        if (publicationTrack) {
          attachTrackToContainer(publicationTrack, container);
        }
      });

      participant.on("trackSubscribed", (track) => {
        attachTrackToContainer(track, container);
      });

      participant.on("trackUnsubscribed", (track) => {
        if ("detach" in track) {
          track.detach().forEach((el: Element) => el.remove());
        }
      });
    },
    [attachTrackToContainer]
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    let mounted = true;
    let activeRoom: Room | null = null;
    const localTracksToStop: LocalTrack[] = [];

    const connectRoom = async (): Promise<void> => {
      setStatus("connecting");

      try {
        const { videoToken, roomName } = await fetchTwilioTokens(user.id, roomId, mode);
        const Video = await import("twilio-video");

        let localTracks: LocalTrack[] = [];
        if (mode === "video") {
          try {
            localTracks = (await Video.createLocalTracks({
              audio: true,
              video: true
            })) as LocalTrack[];
            localTracksToStop.push(...localTracks);
          } catch (caught) {
            const message = mapMediaError(caught);
            toast.error(message);
            setStatus("error");
            await failCall(roomId, `media_error:${message}`);
            return;
          }
        }

        const nextRoom = await Video.connect(videoToken, {
          name: roomName,
          audio: true,
          video: mode === "video",
          tracks: localTracks.length > 0 ? localTracks : undefined
        });

        if (!mounted) {
          nextRoom.disconnect();
          return;
        }

        activeRoom = nextRoom;
        setRoom(nextRoom);
        setStatus("connected");

        const localContainer = localMediaRef.current;
        if (localContainer) {
          nextRoom.localParticipant.tracks.forEach((publication) => {
            const publicationTrack = (publication as LocalTrackPublication).track;
            if (publicationTrack) {
              attachTrackToContainer(publicationTrack, localContainer);
            }
          });
        }

        nextRoom.participants.forEach((participant) => {
          attachParticipantTracks(participant);
        });

        nextRoom.on("participantConnected", (participant) => {
          attachParticipantTracks(participant);
        });

        nextRoom.on("participantDisconnected", (participant) => {
          participant.tracks.forEach((publication) => {
            const publicationTrack = (publication as RemoteTrackPublication).track;
            if (publicationTrack && "detach" in publicationTrack) {
              publicationTrack.detach().forEach((el: Element) => el.remove());
            }
          });
        });

        nextRoom.on("reconnecting", () => {
          setNetworkState("poor");
          toast.warning("Poor internet detected. Trying to reconnect...");
        });

        nextRoom.on("reconnected", () => {
          setNetworkState("good");
          toast.success("Connection recovered.");
        });

        nextRoom.on("disconnected", async (_, disconnectError) => {
          clearMediaElements();
          if (disconnectError) {
            setStatus("error");
            toast.error("Call disconnected due to network instability.");
            await failCall(roomId, "network_disconnected");
          }
        });
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "Failed to join room.";
        toast.error(message);
        setStatus("error");
        await failCall(roomId, `connect_error:${message}`);
      }
    };

    void connectRoom();

    return () => {
      mounted = false;
      activeRoom?.disconnect();
      localTracksToStop.forEach((track) => {
        const stoppableTrack = track as LocalTrack & { stop?: () => void };
        stoppableTrack.stop?.();
      });
      clearMediaElements();
    };
  }, [attachParticipantTracks, attachTrackToContainer, clearMediaElements, failCall, mode, roomId, user]);

  const handleLeave = async (): Promise<void> => {
    room?.disconnect();
    await endCall(roomId, "left_room");
    trackEvent("call_ended", { mode });
    toast.success("Call ended.");
    router.push("/dashboard");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{mode === "video" ? "Video Room" : "Voice Room"}</span>
          <Badge variant={networkState === "good" ? "success" : "destructive"}>
            {networkState === "good" ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
            {networkState === "good" ? "Stable" : "Poor connection"}
          </Badge>
        </CardTitle>
        <CardDescription>Room ID: {roomId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[var(--muted-foreground)]">
          {status === "connecting" ? "Connecting..." : status === "connected" ? "Connected." : "Waiting for connection..."}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-[var(--border)] p-2">
            <p className="mb-2 text-xs text-[var(--muted-foreground)]">You</p>
            <div ref={localMediaRef} className="flex min-h-32 items-center justify-center rounded-md bg-[var(--muted)]" />
          </div>
          <div className="rounded-md border border-[var(--border)] p-2">
            <p className="mb-2 text-xs text-[var(--muted-foreground)]">Remote</p>
            <div ref={remoteMediaRef} className="flex min-h-32 items-center justify-center rounded-md bg-[var(--muted)]" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="destructive" onClick={handleLeave}>
          <PhoneOff className="h-4 w-4" />
          End call
        </Button>
      </CardFooter>
    </Card>
  );
}
