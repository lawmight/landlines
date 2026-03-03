"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Provides call lifecycle helpers backed by Convex call-state documents.
 * Requires `npx convex dev` to have been run so generated API references exist.
 */
export function useCall(): {
  incomingCall: { _id: Id<"calls">; type: "voice" | "video"; callerClerkId: string; roomName: string } | null | undefined;
  recentCalls: unknown[] | undefined;
  isWorking: boolean;
  initiateCall: (calleeClerkId: string, type: "voice" | "video") => Promise<{ callId: string; roomName: string }>;
  acceptCall: (callId: string) => Promise<void>;
  ignoreCall: (callId: string) => Promise<void>;
  endCall: (callId: string, reason?: string) => Promise<void>;
  failCall: (callId: string, reason: string) => Promise<void>;
} {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const [isWorking, setIsWorking] = useState(false);

  const incomingCall = useQuery(api.calls.getIncomingCall, user && isAuthenticated ? {} : "skip");
  const recentCalls = useQuery(api.calls.listCallsForUser, user && isAuthenticated ? {} : "skip");

  const initiateCallMutation = useMutation(api.calls.initiateCall);
  const acceptCallMutation = useMutation(api.calls.acceptCall);
  const ignoreCallMutation = useMutation(api.calls.ignoreCall);
  const endCallMutation = useMutation(api.calls.endCall);
  const failCallMutation = useMutation(api.calls.failCall);
  const markMissedMutation = useMutation(api.calls.markMissedRingingCalls);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const timer = window.setInterval(() => {
      void markMissedMutation({});
    }, 10_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isAuthenticated, markMissedMutation]);

  /**
   * Starts a call and returns the created call and room IDs.
   */
  const initiateCall = async (calleeClerkId: string, type: "voice" | "video"): Promise<{ callId: string; roomName: string }> => {
    if (!user) {
      throw new Error("You must be signed in to start a call.");
    }

    setIsWorking(true);
    try {
      const response = await initiateCallMutation({
        calleeClerkId,
        type
      });
      return {
        callId: String(response.callId),
        roomName: response.roomName
      };
    } finally {
      setIsWorking(false);
    }
  };

  /**
   * Accepts an incoming ringing call.
   */
  const acceptCall = async (callId: string): Promise<void> => {
    if (!user) {
      throw new Error("You must be signed in to accept a call.");
    }

    setIsWorking(true);
    try {
      await acceptCallMutation({ callId: callId as Id<"calls"> });
    } finally {
      setIsWorking(false);
    }
  };

  /**
   * Ignores an incoming call without joining.
   */
  const ignoreCall = async (callId: string): Promise<void> => {
    if (!user) {
      throw new Error("You must be signed in to ignore a call.");
    }

    await ignoreCallMutation({ callId: callId as Id<"calls"> });
  };

  /**
   * Ends an active call and records an optional reason.
   */
  const endCall = async (callId: string, reason?: string): Promise<void> => {
    if (!user) {
      throw new Error("You must be signed in to end a call.");
    }

    await endCallMutation({
      callId: callId as Id<"calls">,
      reason
    });
  };

  /**
   * Flags a call as failed due to a media or network issue.
   */
  const failCall = async (callId: string, reason: string): Promise<void> => {
    if (!user) {
      throw new Error("You must be signed in to fail a call.");
    }

    await failCallMutation({
      callId: callId as Id<"calls">,
      reason
    });
  };

  return {
    incomingCall,
    recentCalls,
    isWorking,
    initiateCall,
    acceptCall,
    ignoreCall,
    endCall,
    failCall
  };
}
