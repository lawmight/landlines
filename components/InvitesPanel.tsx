"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Check, Clock3, X } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Invite inbox and outbox management panel.
 */
export function InvitesPanel(): React.JSX.Element {
  const { user } = useUser();
  const [feedback, setFeedback] = useState<string | null>(null);

  const acceptInvite = useMutation(api.invites.acceptInvite);
  const ignoreInvite = useMutation(api.invites.ignoreInvite);
  const revokeInvite = useMutation(api.invites.revokeInvite);
  const expireStaleInvites = useMutation(api.invites.expireStaleInvites);

  const inviteState = useQuery(
    api.invites.listInvitesForUser,
    user
      ? {
          userClerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          username: user.username ?? undefined
        }
      : "skip"
  );

  useEffect(() => {
    void expireStaleInvites({});
  }, [expireStaleInvites]);

  const onAccept = async (inviteId: string): Promise<void> => {
    if (!user) {
      return;
    }
    try {
      await acceptInvite({ inviteId: inviteId as any, inviteeClerkId: user.id });
      setFeedback("Invite accepted.");
    } catch (caught) {
      setFeedback(caught instanceof Error ? caught.message : "Could not accept invite.");
    }
  };

  const onIgnore = async (inviteId: string): Promise<void> => {
    if (!user) {
      return;
    }
    try {
      await ignoreInvite({ inviteId: inviteId as any, inviteeClerkId: user.id });
      setFeedback("Invite ignored.");
    } catch (caught) {
      setFeedback(caught instanceof Error ? caught.message : "Could not ignore invite.");
    }
  };

  const onRevoke = async (inviteId: string): Promise<void> => {
    if (!user) {
      return;
    }
    try {
      await revokeInvite({ inviteId: inviteId as any, inviterClerkId: user.id });
      setFeedback("Invite revoked.");
    } catch (caught) {
      setFeedback(caught instanceof Error ? caught.message : "Could not revoke invite.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Received invites</CardTitle>
          <CardDescription>Accept to allow this person to reach you directly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {inviteState?.received.length ? null : (
            <p className="text-sm text-[var(--muted-foreground)]">No pending invites.</p>
          )}

          {(inviteState?.received ?? []).map((invite: any) => (
            <div key={String(invite._id)} className="rounded-md border border-[var(--border)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">{invite.inviterClerkId}</p>
                <Badge variant="outline">
                  <Clock3 className="mr-1 h-3 w-3" />
                  Pending
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onAccept(String(invite._id))}>
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onIgnore(String(invite._id))}>
                  <X className="h-4 w-4" />
                  Ignore
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sent invites</CardTitle>
          <CardDescription>Pending invites can be revoked at any time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {inviteState?.sent.length ? null : (
            <p className="text-sm text-[var(--muted-foreground)]">No pending sent invites.</p>
          )}

          {(inviteState?.sent ?? []).map((invite: any) => (
            <div key={String(invite._id)} className="rounded-md border border-[var(--border)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">
                  {invite.inviteeEmail ?? invite.inviteeUsername ?? invite.inviteeClerkId ?? "Unknown recipient"}
                </p>
                <Badge variant="outline">
                  <Clock3 className="mr-1 h-3 w-3" />
                  Pending
                </Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onRevoke(String(invite._id))}>
                Revoke invite
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {feedback ? <p className="text-sm text-[var(--muted-foreground)]">{feedback}</p> : null}
    </div>
  );
}
