"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { PhoneOff, Wifi, WifiOff } from "lucide-react";

import { useCall } from "@/hooks/useCall";
import { usePresence } from "@/hooks/usePresence";
import { fetchTwilioTokens } from "@/lib/twilio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
  const { endCall, failCall } = useCall();

  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [networkState, setNetworkState] = useState<"good" | "poor">("good");
  const [error, setError] = useState<string | null>(null);

  const deviceRef = useRef<VoiceDevice | null>(null);
  const connectionRef = useRef<VoiceConnection | null>(null);

  usePresence(user?.id, roomId);

  useEffect(() => {
    if (!user) {
      return;
    }

    let mounted = true;

    const connectVoice = async (): Promise<void> => {
      setStatus("connecting");
      setError(null);

      try {
        const tokens = await fetchTwilioTokens(user.id, roomId, "voice");
        const VoiceSdk = await import("@twilio/voice-sdk");
        const device = new VoiceSdk.Device(tokens.voiceToken) as unknown as VoiceDevice;

        if (!mounted) {
          device.destroy();
          return;
        }

        deviceRef.current = device;

        device.on("tokenWillExpire", async () => {
          try {
            const refreshedTokens = await fetchTwilioTokens(user.id, roomId, "voice");
            device.updateToken(refreshedTokens.voiceToken);
          } catch (caught) {
            const message = caught instanceof Error ? caught.message : "Token refresh failed.";
            setError(message);
            await failCall(roomId, `voice_token_refresh_error:${message}`);
          }
        });

        device.on("error", async (deviceError: { message?: string }) => {
          const message = deviceError.message ?? "Voice device error.";
          setStatus("error");
          setError(message);
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

        connection.on("warning", () => {
          setNetworkState("poor");
          setError("Poor internet detected. Audio quality may degrade.");
        });

        connection.on("warning-cleared", () => {
          setNetworkState("good");
          setError(null);
        });

        connection.on("disconnect", () => {
          setStatus("idle");
        });
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "Unable to connect voice call.";
        setStatus("error");
        setError(message);
        await failCall(roomId, `voice_connect_error:${message}`);
      }
    };

    void connectVoice();

    return () => {
      mounted = false;
      connectionRef.current?.disconnect();
      deviceRef.current?.disconnectAll();
      deviceRef.current?.destroy();
    };
  }, [failCall, roomId, user]);

  const handleHangup = async (): Promise<void> => {
    connectionRef.current?.disconnect();
    deviceRef.current?.disconnectAll();
    await endCall(roomId, "left_room");
    router.push("/dashboard");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Voice Room</span>
          <Badge variant={networkState === "good" ? "success" : "destructive"}>
            {networkState === "good" ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
            {networkState === "good" ? "Stable" : "Poor connection"}
          </Badge>
        </CardTitle>
        <CardDescription>Room ID: {roomId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-[var(--muted-foreground)]">
          {status === "connecting" ? "Connecting voice..." : status === "connected" ? "Connected." : "Waiting..."}
        </p>
        {error ? <p className="rounded-md border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-3 text-sm text-[var(--danger)]">{error}</p> : null}
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="destructive" onClick={handleHangup}>
          <PhoneOff className="h-4 w-4" />
          End call
        </Button>
      </CardFooter>
    </Card>
  );
}
