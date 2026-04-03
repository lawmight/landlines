"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { AlertTriangle, Clock3, PhoneCall, PhoneOff, ShieldCheck, UserRound, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

import { useCall } from "@/hooks/useCall";
import { useCallDuration } from "@/hooks/useCallDuration";
import { useContactIdentity } from "@/hooks/useContactIdentity";
import { usePresence } from "@/hooks/usePresence";
import { trackEvent } from "@/lib/analytics";
import { fetchTwilioTokens } from "@/lib/twilio";
import { CallFact, CallFactGrid, CallPanel, CallStatusChip } from "@/components/call/CallPanel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type VoiceDevice = {
  register: () => Promise<void>;
  connect: (options?: { params?: Record<string, string> }) => Promise<VoiceConnection>;
  disconnectAll: () => void;
  destroy: () => void;
  updateToken: (token: string) => void;
  on: (eventName: string, callback: (...args: any[]) => void) => void;
};

type VoiceConnection = {
  disconnect: () => void;
  on: (eventName: string, callback: (...args: any[]) => void) => void;
};

interface VoiceRoomProps {
  roomId: string;
}

/**
 * Twilio Voice SDK room that handles audio calling and network degradation.
 */
export function VoiceRoom({ roomId }: VoiceRoomProps): React.JSX.Element {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;
  const { endCall, failCall, recentCalls } = useCall();

  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [networkState, setNetworkState] = useState<"good" | "poor">("good");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deviceRef = useRef<VoiceDevice | null>(null);
  const connectionRef = useRef<VoiceConnection | null>(null);
  const connectedRoomRef = useRef<string | null>(null);
  const localExitRef = useRef(false);
  const previousCallStatusRef = useRef<"ringing" | "active" | "ended" | "failed" | "missed" | null>(null);

  const isRoomIdValid = roomId.trim().length > 0;
  const durationLabel = useCallDuration(status === "connected");

  usePresence(userId, roomId);

  const currentCall = useMemo(
    () => recentCalls?.find((candidate) => String(candidate._id) === roomId || candidate.roomName === roomId),
    [recentCalls, roomId]
  );

  const counterpartClerkId = useMemo(() => {
    if (!currentCall || !userId) {
      return undefined;
    }

    return currentCall.callerClerkId === userId ? currentCall.calleeClerkId : currentCall.callerClerkId;
  }, [currentCall, userId]);

  const counterpart = useContactIdentity(counterpartClerkId);
  const callerIdentity = useContactIdentity(currentCall?.callerClerkId);
  const directionLabel = currentCall && userId ? (currentCall.callerClerkId === userId ? "Outgoing line" : "Incoming line") : "Active line";
  const persistedCallId = currentCall?._id ? String(currentCall._id) : null;
  const shouldConnect = currentCall?.status === "active";

  useEffect(() => {
    const nextStatus = currentCall?.status ?? null;
    const previousStatus = previousCallStatusRef.current;
    previousCallStatusRef.current = nextStatus;

    if (!nextStatus || localExitRef.current || previousStatus === nextStatus) {
      return;
    }

    if (nextStatus === "ended" || nextStatus === "failed" || nextStatus === "missed") {
      connectionRef.current?.disconnect();
      deviceRef.current?.disconnectAll();
      deviceRef.current?.destroy();

      const message =
        nextStatus === "missed"
          ? "Call timed out."
          : nextStatus === "failed"
            ? currentCall?.endReason ?? "Call failed."
            : "Call ended.";
      toast.success(message);
      router.push("/dashboard");
    }
  }, [currentCall?.endReason, currentCall?.status, router]);

  useEffect(() => {
    if (!userId || !isRoomIdValid || !shouldConnect) {
      return;
    }
    if (connectedRoomRef.current === roomId) {
      return;
    }

    let mounted = true;

    const connectVoice = async (): Promise<void> => {
      connectedRoomRef.current = roomId;
      setStatus("connecting");
      setNetworkState("good");
      setErrorMessage(null);

      try {
        const tokens = await fetchTwilioTokens(userId, roomId, "voice");
        const VoiceSdk = await import("@twilio/voice-sdk");
        const device = new VoiceSdk.Device(tokens.voiceToken) as unknown as VoiceDevice;

        if (!mounted) {
          device.destroy();
          return;
        }

        deviceRef.current = device;

        device.on("tokenWillExpire", async () => {
          try {
            const refreshedTokens = await fetchTwilioTokens(userId, roomId, "voice");
            device.updateToken(refreshedTokens.voiceToken);
          } catch (caught) {
            const message = caught instanceof Error ? caught.message : "Token refresh failed.";
            toast.error(message);
            setErrorMessage(message);
            await failCall(roomId, `voice_token_refresh_error:${message}`);
          }
        });

        device.on("error", async (deviceError: { message?: string }) => {
          const message = deviceError.message ?? "Voice device error.";
          setStatus("error");
          setErrorMessage(message);
          toast.error(message);
          await failCall(roomId, `voice_device_error:${message}`);
        });

        await device.register();
        const connection = await device.connect({
          params: { roomName: roomId }
        });

        if (!mounted) {
          connection.disconnect();
          device.destroy();
          return;
        }

        connectionRef.current = connection;
        setStatus("connected");
        setErrorMessage(null);

        connection.on("warning", () => {
          setNetworkState("poor");
          setErrorMessage("Poor internet detected. Audio quality may degrade.");
          toast.warning("Poor internet detected. Audio quality may degrade.");
        });

        connection.on("warning-cleared", () => {
          setNetworkState("good");
          setErrorMessage(null);
          toast.success("Connection recovered.");
        });

        connection.on("disconnect", () => {
          setStatus("idle");
        });
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "Unable to connect voice call.";

        setStatus("error");
        setErrorMessage(message);
        toast.error(message);
        await failCall(roomId, `voice_connect_error:${message}`);
      }
    };

    const connectTimer = window.setTimeout(() => {
      void connectVoice();
    }, 0);

    return () => {
      mounted = false;
      window.clearTimeout(connectTimer);
      connectedRoomRef.current = null;
      connectionRef.current?.disconnect();
      deviceRef.current?.disconnectAll();
      deviceRef.current?.destroy();
    };
  }, [failCall, isRoomIdValid, roomId, shouldConnect, userId]);

  const handleHangup = async (): Promise<void> => {
    localExitRef.current = true;
    connectionRef.current?.disconnect();
    deviceRef.current?.disconnectAll();

    if (persistedCallId) {
      await endCall(persistedCallId, "left_room");
    }

    trackEvent("call_ended", { mode: "voice" });
    toast.success("Call ended.");
    router.push("/dashboard");
  };

  const connectionLabel =
    status === "connecting" ? "Connecting" : status === "connected" ? "Live" : status === "error" ? "Issue detected" : "Waiting";

  const statusDescription =
    status === "connecting"
      ? "Registering the voice device and dialing the shared room."
      : status === "connected"
        ? "The line is open and audio is being handled by the Twilio Voice transport."
        : status === "error"
          ? errorMessage ?? "The voice connection hit an issue."
          : "Waiting for the voice device to finish negotiating the line.";

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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
      <CallPanel
        eyebrow="Active voice"
        title={counterpart.displayName}
        description="The voice room keeps the same warm product language as the rest of Landlines while isolating transport state from controls."
        contentClassName="space-y-6"
      >
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--muted)]/45 px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center text-center">
            <Avatar
              fallback={counterpart.initials}
              className="h-28 w-28 border border-[var(--border)] bg-[var(--card)] text-3xl font-medium text-[var(--foreground)] shadow-[0_18px_45px_rgba(26,23,20,0.1)]"
            >
              {counterpart.avatarUrl ? <AvatarImage src={counterpart.avatarUrl} alt={`${counterpart.displayName} avatar`} /> : null}
              <AvatarFallback>{counterpart.initials}</AvatarFallback>
            </Avatar>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <CallStatusChip tone={status === "error" ? "danger" : status === "connected" ? "accent" : "neutral"}>
                {connectionLabel}
              </CallStatusChip>
              <CallStatusChip tone={networkState === "good" ? "success" : "danger"}>
                {networkState === "good" ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                {networkState === "good" ? "Stable connection" : "Recovering network"}
              </CallStatusChip>
              <CallStatusChip>{directionLabel}</CallStatusChip>
            </div>

            <p className="display-serif mt-6 text-4xl font-light tracking-[0.01em] text-[var(--foreground)]">
              {counterpart.displayName}
            </p>
            <p className="mt-4 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">{statusDescription}</p>
          </div>
        </div>

        <CallFactGrid className="md:grid-cols-4">
          <CallFact label="Duration" value={durationLabel} tone="accent" />
          <CallFact
            label="Network"
            value={networkState === "good" ? "Stable" : "Recovering"}
            tone={networkState === "good" ? "success" : "danger"}
          />
          <CallFact label="Started by" value={callerIdentity.displayName ?? "—"} />
          <CallFact label="Direction" value={directionLabel} />
        </CallFactGrid>
      </CallPanel>

      <div className="grid gap-6">
        <CallPanel eyebrow="Line status" title={connectionLabel} description={statusDescription}>
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
                label="Remote line"
                value={
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    {counterpart.displayName}
                  </span>
                }
              />
              <CallFact
                label="Transport"
                value={
                  <span className="inline-flex items-center gap-2">
                    <PhoneCall className="h-4 w-4" />
                    Twilio Voice SDK
                  </span>
                }
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
            </CallFactGrid>
          </div>
        </CallPanel>

        <CallPanel
          eyebrow="Call controls"
          title="One decisive action"
          description="The controls stay intentionally narrow until mute, device routing, and invite flows are fully implemented."
        >
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-[var(--border)]/70 bg-[var(--muted)]/45 p-5">
              <p className="text-sm font-medium text-[var(--foreground)]">Use this room to stay on the line without extra chrome.</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Ending the call disconnects the active Twilio Voice connection and records the hangup reason in Convex.
              </p>
            </div>

            <Button variant="destructive" onClick={handleHangup} className="h-12 w-full rounded-full text-sm">
              <PhoneOff className="h-4 w-4" />
              End call
            </Button>
          </div>
        </CallPanel>
      </div>
    </div>
  );
}
