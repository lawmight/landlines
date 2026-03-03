"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MailPlus, UserRoundPlus } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Invite composer for adding people to a user's inner circle.
 */
export function InviteModal(): React.JSX.Element {
  const { user } = useUser();
  const sendInviteRef = (api as any)?.invites?.sendInvite;
  const fallbackMutationRef = (api as any).invites.expireStaleInvites;
  const sendInvite = useMutation(sendInviteRef ?? fallbackMutationRef);

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const modalNode = modalRef.current;
    if (!modalNode) {
      return;
    }

    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(
      modalNode.querySelectorAll<HTMLElement>(focusableSelectors)
    );

    focusable[0]?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    modalNode.addEventListener("keydown", onKeyDown);
    return () => {
      modalNode.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const submitInvite = async (): Promise<void> => {
    if (!user) {
      toast.error("You must be signed in.");
      return;
    }

    if (!email.trim() && !username.trim()) {
      toast.error("Provide at least an email or username.");
      return;
    }

    if (!sendInviteRef) {
      toast.error("Invites are temporarily unavailable. Run `npx convex dev` to regenerate API references.");
      return;
    }

    setIsSubmitting(true);

    try {
      await sendInvite({
        inviteeEmail: email.trim() || undefined,
        inviteeUsername: username.trim() || undefined
      });
      setEmail("");
      setUsername("");
      trackEvent("invite_sent");
      toast.success("Invite sent.");
      setIsOpen(false);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Failed to send invite.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
        <UserRoundPlus className="h-4 w-4" />
        Invite to inner circle
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={() => setIsOpen(false)}
    >
      <div
        aria-labelledby="invite-modal-title"
        aria-modal="true"
        className="w-full max-w-xl"
        onClick={(event) => event.stopPropagation()}
        ref={modalRef}
        role="dialog"
      >
        <Card>
          <CardHeader>
            <CardTitle id="invite-modal-title">Invite someone</CardTitle>
            <CardDescription>They must accept before they appear in your inner circle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                placeholder="friend@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-username">Username</Label>
              <Input
                id="invite-username"
                placeholder="friend_username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={submitInvite} disabled={isSubmitting}>
              <MailPlus className="h-4 w-4" />
              Send invite
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
