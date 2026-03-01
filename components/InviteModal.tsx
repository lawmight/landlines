"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MailPlus, UserRoundPlus } from "lucide-react";
import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Invite composer for adding people to a user's inner circle.
 */
export function InviteModal(): React.JSX.Element {
  const { user } = useUser();
  const sendInvite = useMutation(api.invites.sendInvite);

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitInvite = async (): Promise<void> => {
    if (!user) {
      setFeedback("You must be signed in.");
      return;
    }

    if (!email.trim() && !username.trim()) {
      setFeedback("Provide at least an email or username.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await sendInvite({
        inviterClerkId: user.id,
        inviteeEmail: email.trim() || undefined,
        inviteeUsername: username.trim() || undefined
      });
      setEmail("");
      setUsername("");
      setFeedback("Invite sent.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Failed to send invite.";
      setFeedback(message);
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
    <Card>
      <CardHeader>
        <CardTitle>Invite someone</CardTitle>
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
        {feedback ? <p className="text-sm text-[var(--muted-foreground)]">{feedback}</p> : null}
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
  );
}
