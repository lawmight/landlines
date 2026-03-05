"use client";

import { useRouter } from "next/navigation";
import { Phone, Video } from "lucide-react";
import { toast } from "sonner";

import { useCall } from "@/hooks/useCall";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

interface CallButtonProps {
  calleeClerkId: string;
  type: "voice" | "video";
  canReach?: boolean;
}

/**
 * Starts a voice or video call and routes to the active room.
 * Disabled when canReach is false (callee has not added you to their inner circle).
 */
export function CallButton({ calleeClerkId, type, canReach = true }: CallButtonProps): React.JSX.Element {
  const router = useRouter();
  const { initiateCall, isWorking } = useCall();
  const disabled = isWorking || !canReach;

  const startCall = async (): Promise<void> => {
    try {
      const created = await initiateCall(calleeClerkId, type);
      trackEvent("call_started", { mode: type });
      toast.success(`${type === "video" ? "Video" : "Voice"} call started.`);
      router.push(`/call/${created.callId}?mode=${type}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to start call.";
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center">
      <Button
        onClick={startCall}
        size="sm"
        variant={type === "video" ? "default" : "secondary"}
        disabled={disabled}
        title={!canReach ? "They need to add you to their inner circle before you can call." : undefined}
      >
        {type === "video" ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
        {type === "video" ? "Video" : "Voice"}
      </Button>
    </div>
  );
}
