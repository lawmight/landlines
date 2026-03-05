"use client";

import { useRouter } from "next/navigation";
import { Phone, PhoneOff, Video } from "lucide-react";
import { toast } from "sonner";

import { useCall } from "@/hooks/useCall";
import { useContactIdentity } from "@/hooks/useContactIdentity";
import { trackEvent } from "@/lib/analytics";
import { CallPanel, CallStatusChip } from "@/components/call/CallPanel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

/**
 * Reactive incoming-call card shown when a callee is ringing.
 */
export function IncomingCallCard(): React.JSX.Element | null {
  const router = useRouter();
  const { incomingCall, acceptCall, ignoreCall, isWorking } = useCall();
  const caller = useContactIdentity(incomingCall?.callerClerkId);

  if (!incomingCall) {
    return null;
  }

  const onAccept = async (): Promise<void> => {
    try {
      await acceptCall(String(incomingCall._id));
      trackEvent("call_accepted", { mode: incomingCall.type });
      toast.success("Call accepted.");
      router.push(`/call/${String(incomingCall._id)}?mode=${incomingCall.type}`);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not accept call.");
    }
  };

  const onIgnore = async (): Promise<void> => {
    try {
      await ignoreCall(String(incomingCall._id));
      trackEvent("call_ignored", { mode: incomingCall.type });
      toast.success("Call ignored.");
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not ignore call.");
    }
  };

  return (
    <CallPanel
      eyebrow={incomingCall.type === "video" ? "Incoming video request" : "Incoming voice request"}
      title={caller.displayName}
      description="Someone from your inner circle is actively trying to reach you. Answering opens the live room immediately."
      className="incoming-call-pulse border-[var(--primary)]/30"
      contentClassName="space-y-6"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            fallback={caller.initials}
            className="h-16 w-16 border border-[var(--border)] bg-[var(--muted)] text-lg font-medium text-[var(--foreground)]"
          >
            {caller.avatarUrl ? <AvatarImage src={caller.avatarUrl} alt={`${caller.displayName} avatar`} /> : null}
            <AvatarFallback>{caller.initials}</AvatarFallback>
          </Avatar>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <CallStatusChip tone="accent">
                {incomingCall.type === "video" ? <Video className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
                {incomingCall.type === "video" ? "Camera + mic" : "Voice line"}
              </CallStatusChip>
              <CallStatusChip>Room {String(incomingCall._id)}</CallStatusChip>
            </div>
            <p className="max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
              Accept to move straight into the active call surface, or decline to mark this request as ignored.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onIgnore} disabled={isWorking} className="h-12 rounded-full px-6">
            <PhoneOff className="h-4 w-4" />
            Decline
          </Button>
          <Button onClick={onAccept} disabled={isWorking} className="h-12 rounded-full px-6">
            {incomingCall.type === "video" ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
            Accept
          </Button>
        </div>
      </div>
    </CallPanel>
  );
}
