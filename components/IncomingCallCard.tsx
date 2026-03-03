"use client";

import { useRouter } from "next/navigation";
import { Phone, PhoneOff, Video } from "lucide-react";
import { toast } from "sonner";

import { useCall } from "@/hooks/useCall";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Reactive incoming-call card shown when a callee is ringing.
 */
export function IncomingCallCard(): React.JSX.Element | null {
  const router = useRouter();
  const { incomingCall, acceptCall, ignoreCall, isWorking } = useCall();

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
    <Card className="incoming-call-pulse border-[var(--primary)]/50">
      <CardHeader>
        <CardTitle>Incoming call</CardTitle>
        <CardDescription>
          {incomingCall.type === "video" ? "Video call" : "Voice call"} from {incomingCall.callerClerkId}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Button onClick={onAccept} disabled={isWorking}>
          {incomingCall.type === "video" ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
          Accept
        </Button>
        <Button variant="destructive" onClick={onIgnore} disabled={isWorking}>
          <PhoneOff className="h-4 w-4" />
          Ignore
        </Button>
      </CardContent>
    </Card>
  );
}
