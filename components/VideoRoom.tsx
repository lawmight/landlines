"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { AlertTriangle, Clock3, Mic, PhoneOff, ShieldCheck, Users, Video as VideoIcon, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

import { useCall } from "@/hooks/useCall";
import { useCallDuration } from "@/hooks/useCallDuration";
import { useContactIdentity } from "@/hooks/useContactIdentity";
import { usePresence } from "@/hooks/usePresence";
import { trackEvent } from "@/lib/analytics";
import { fetchTwilioTokens, mapMediaError } from "@/lib/twilio";
import { CallFact, CallFactGrid, CallPanel, CallStatusChip } from "@/components/call/CallPanel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface VideoRoomProps {
  roomId: string;
  mode: "voice" | "video";
}

function getInitials(displayName: string): string {
  const parts = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "LL";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

/**
 * Twilio-powered active room with camera and network failure handling.
 */
export function VideoRoom({ roomId, mode }: VideoRoomProps): React.JSX.Element {
  const router = useRouter();
  const { user } = useUser();
  const { endCall, failCall, recentCalls } = useCall();

  const localMediaRef = useRef<HTMLDivElement | null>(null);
  const remoteMediaRef = useRef<HTMLDivElement | null>(null);

  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [networkState, setNetworkState] = useState<"good" | "poor">("good");
  const [participantCount, setParticipantCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isRoomIdValid = roomId.trim().length > 0;
  const durationLabel = useCallDuration(status === "connected");

  usePresence(user?.id, roomId);

  const currentCall = useMemo(
    () => recentCalls?.find((candidate) => String(candidate._id) === roomId || candidate.roomName === roomId),
    [recentCalls, roomId]
  );
  const persistedCallId = currentCall?._id ? String(currentCall._id) : null;

  const counterpartClerkId = useMemo(() => {
    if (!currentCall || !user?.id) {
      return undefined;
    }

    return currentCall.callerClerkId === user.id ? currentCall.calleeClerkId : currentCall.callerClerkId;
  }, [currentCall, user?.id]);

  const counterpart = useContactIdentity(counterpartClerkId);
  const localDisplayName = user?.fullName ?? user?.username ?? "You";
  const localInitials = useMemo(() => getInitials(localDisplayName), [localDisplayName]);

  const clearMediaElements = useCallback((): void => {
    localMediaRef.current?.replaceChildren();
    remoteMediaRef.current?.replaceChildren();
  }, []);

  const attachTrackToContainer = useCallback((track: LocalTrack | RemoteTrack, container: HTMLDivElement): void => {
    if ("attach" in track) {
      const mediaElement = track.attach();
      mediaElement.classList.add("h-full", "w-full", "object-cover");
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
    if (!user || !isRoomIdValid) {
      return;
    }

    let mounted = true;
    let activeRoom: Room | null = null;
    const localTracksToStop: LocalTrack[] = [];

    const connectRoom = async (): Promise<void> => {
      setStatus("connecting");
      setNetworkState("good");
      setErrorMessage(null);

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
            setErrorMessage(message);
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
        setParticipantCount(nextRoom.participants.size);
        setErrorMessage(null);

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
          setParticipantCount(nextRoom.participants.size);
        });

        nextRoom.on("participantDisconnected", (participant) => {
          participant.tracks.forEach((publication) => {
            const publicationTrack = (publication as RemoteTrackPublication).track;
            if (publicationTrack && "detach" in publicationTrack) {
              publicationTrack.detach().forEach((el: Element) => el.remove());
            }
          });
          setParticipantCount(nextRoom.participants.size);
        });

        nextRoom.on("reconnecting", () => {
          setNetworkState("poor");
          setErrorMessage("Poor internet detected. Trying to reconnect...");
          toast.warning("Poor internet detected. Trying to reconnect...");
        });

        nextRoom.on("reconnected", () => {
          setNetworkState("good");
          setErrorMessage(null);
          toast.success("Connection recovered.");
        });

        nextRoom.on("disconnected", async (_, disconnectError) => {
          clearMediaElements();
          setParticipantCount(0);
          if (disconnectError) {
            setStatus("error");
            setErrorMessage("Call disconnected due to network instability.");
            toast.error("Call disconnected due to network instability.");
            await failCall(roomId, "network_disconnected");
          }
        });
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "Failed to join room.";
        toast.error(message);
        setStatus("error");
        setErrorMessage(message);
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
  }, [attachParticipantTracks, attachTrackToContainer, clearMediaElements, failCall, isRoomIdValid, mode, roomId, user]);

  const handleLeave = async (): Promise<void> => {
    room?.disconnect();

    if (persistedCallId) {
      await endCall(persistedCallId, "left_room");
    }

    trackEvent("call_ended", { mode });
    toast.success("Call ended.");
    router.push("/dashboard");
  };

  const connectionLabel =
    status === "connecting"
      ? "Connecting"
      : status === "connected"
        ? participantCount > 0
          ? "Live"
          : "Ready"
        : status === "error"
          ? "Issue detected"
          : "Preparing";

  const statusDescription =
    status === "connecting"
      ? "Connecting your camera, microphone, and room permissions."
      : status === "connected"
        ? participantCount > 0
          ? "The room is live and media is flowing."
          : "You are connected. Waiting for the other participant to appear."
        : status === "error"
          ? errorMessage ?? "A connection issue interrupted the video room."
          : "Preparing the room and waiting for the transport to initialize.";

  if (!isRoomIdValid) {
    return (
      <CallPanel
        eyebrow="Call unavailable"
        title="This room cannot be opened."
        description="The room identifier is missing or malformed, so the call surface cannot connect safely."
      >
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="rounded-full px-6">
          Back to dashboard
        </Button>
      </CallPanel>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.82fr)]">
      <CallPanel
        eyebrow="Active video"
        title={counterpart.displayName}
        description="The large stage keeps attention on the live conversation, while support details move into separate panels for safer iteration later."
        contentClassName="space-y-5"
      >
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--muted)]/70">
          <div ref={remoteMediaRef} className="relative z-10 flex min-h-[460px] items-center justify-center" />

          {participantCount === 0 ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
              <Avatar
                fallback={counterpart.initials}
                className="h-24 w-24 border border-[var(--border)] bg-[var(--card)] text-2xl font-medium text-[var(--foreground)]"
              >
                {counterpart.avatarUrl ? <AvatarImage src={counterpart.avatarUrl} alt={`${counterpart.displayName} avatar`} /> : null}
                <AvatarFallback>{counterpart.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Remote stage</p>
                <p className="display-serif text-3xl font-light text-[var(--foreground)]">{counterpart.displayName}</p>
                <p className="max-w-sm text-sm leading-6 text-[var(--muted-foreground)]">
                  {status === "connected"
                    ? "You are inside the room. The remote line has not joined yet."
                    : "Preparing the room before the other participant appears."}
                </p>
              </div>
            </div>
          ) : null}

          <div className="absolute left-5 top-5 z-20 flex flex-wrap gap-2">
            <CallStatusChip tone={status === "error" ? "danger" : status === "connected" ? "accent" : "neutral"}>
              {connectionLabel}
            </CallStatusChip>
            <CallStatusChip tone={networkState === "good" ? "success" : "danger"}>
              {networkState === "good" ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {networkState === "good" ? "Stable connection" : "Recovering network"}
            </CallStatusChip>
          </div>

          <div className="absolute bottom-5 right-5 z-20 w-[170px] rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)]/95 p-3 shadow-[0_18px_45px_rgba(26,23,20,0.14)] backdrop-blur">
            <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">You</p>
            <div className="relative overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-[var(--muted)]">
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
                <span className="display-serif text-2xl font-light text-[var(--foreground)]">{localInitials}</span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Camera preview</span>
              </div>
              <div ref={localMediaRef} className="relative z-10 flex aspect-[4/5] items-center justify-center" />
            </div>
          </div>
        </div>

        <CallFactGrid className="md:grid-cols-4">
          <CallFact label="Duration" value={durationLabel} tone="accent" />
          <CallFact label="Participants" value={participantCount > 0 ? `${participantCount + 1} live` : "Waiting"} />
          <CallFact label="Room" value={roomId} />
          <CallFact label="Security" value="Twilio room" tone="success" />
        </CallFactGrid>
      </CallPanel>

      <div className="grid gap-6">
        <CallPanel eyebrow="Call controls" title="Keep the room intentional" description="Only live controls are shown right now so every button remains fully wired and easy to evolve later.">
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-[var(--border)]/70 bg-[var(--muted)]/45 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full border border-[var(--border)] bg-[var(--card)] p-2">
                  <VideoIcon className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--foreground)]">Camera and microphone are managed by Twilio.</p>
                  <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                    This layout deliberately keeps interaction scope narrow: join, stay connected, and end the line cleanly.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="destructive" onClick={handleLeave} className="h-12 w-full rounded-full text-sm">
              <PhoneOff className="h-4 w-4" />
              End call
            </Button>

            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Ending the room returns you to Dashboard and records the hangup in Convex.
            </p>
          </div>
        </CallPanel>

        <CallPanel eyebrow="Session details" title={connectionLabel} description={statusDescription}>
          <div className="space-y-4">
            {errorMessage ? (
              <div className="rounded-[1.5rem] border border-[var(--danger)]/20 bg-[var(--danger)]/10 p-4 text-sm leading-6 text-[var(--danger)]">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              </div>
            ) : null}

            <CallFactGrid>
              <CallFact
                label="Network"
                value={
                  <span className="inline-flex items-center gap-2">
                    {networkState === "good" ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                    {networkState === "good" ? "Stable" : "Recovering"}
                  </span>
                }
                tone={networkState === "good" ? "success" : "danger"}
              />
              <CallFact
                label="Remote line"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {counterpart.displayName}
                  </span>
                }
              />
              <CallFact
                label="Media"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    <VideoIcon className="h-4 w-4" />
                    Camera + mic
                  </span>
                }
              />
              <CallFact
                label="Connected for"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    {durationLabel}
                  </span>
                }
                tone="accent"
              />
              <CallFact
                label="Lifecycle"
                value={
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    {currentCall?.status ?? "Loading"}
                  </span>
                }
              />
              <CallFact label="Room ID" value={roomId} />
            </CallFactGrid>
          </div>
        </CallPanel>
      </div>
    </div>
  );
}
