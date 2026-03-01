"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Video } from "lucide-react";

import { useCall } from "@/hooks/useCall";
import { Button } from "@/components/ui/button";

interface CallButtonProps {
  calleeClerkId: string;
  type: "voice" | "video";
}

/**
 * Starts a voice or video call and routes to the active room.
 */
export function CallButton({ calleeClerkId, type }: CallButtonProps): React.JSX.Element {
  const router = useRouter();
  const { initiateCall, isWorking } = useCall();
  const [error, setError] = useState<string | null>(null);

  const startCall = async (): Promise<void> => {
    setError(null);
    try {
      const created = await initiateCall(calleeClerkId, type);
      router.push(`/call/${created.callId}?mode=${type}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to start call.";
      setError(message);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={startCall} size="sm" variant={type === "video" ? "default" : "secondary"} disabled={isWorking}>
        {type === "video" ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
        {type === "video" ? "Video" : "Voice"}
      </Button>
      {error ? <p className="max-w-44 text-right text-xs text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
