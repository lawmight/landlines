"use client";

import { Phone } from "lucide-react";

import { useInnerCircle } from "@/hooks/useInnerCircle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CallButton } from "@/components/CallButton";
import { PresenceDot } from "@/components/PresenceDot";

/**
 * Displays accepted inner-circle contacts with live presence and call actions.
 */
export function InnerCircle(): React.JSX.Element {
  const { members, isLoading } = useInnerCircle();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Inner Circle
        </CardTitle>
        <CardDescription>Only these people can directly reach you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-[var(--muted-foreground)]">Loading contacts...</p>
        ) : null}

        {!isLoading && members.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No accepted contacts yet. Send an invite to build your circle.
          </p>
        ) : null}

        {members.map((member) => (
          <div key={member.clerkId} className="flex items-center justify-between rounded-md border border-[var(--border)] p-3">
            <div className="flex items-center gap-3">
              <Avatar fallback={member.displayName.slice(0, 1).toUpperCase()}>
                {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={`${member.displayName} avatar`} /> : null}
                <AvatarFallback />
              </Avatar>
              <div>
                <p className="text-sm font-medium">{member.displayName}</p>
                <div className="mt-1">
                  <PresenceDot userClerkId={member.clerkId} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CallButton calleeClerkId={member.clerkId} type="voice" />
              <CallButton calleeClerkId={member.clerkId} type="video" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
