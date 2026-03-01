export type PresenceState = "home" | "away";

export type InviteStatus = "pending" | "accepted" | "ignored" | "revoked" | "expired";

export type CallStatus = "ringing" | "active" | "ended" | "failed" | "missed";

export interface PresenceSnapshot {
  userClerkId: string;
  state: PresenceState;
  lastHeartbeatAt: number;
}

export interface InnerCircleMember {
  userClerkId: string;
  displayName: string;
  avatarUrl?: string;
  presence: PresenceState;
}

export interface CallSession {
  id: string;
  roomName: string;
  status: CallStatus;
  callerClerkId: string;
  calleeClerkId: string;
  startedAt?: number;
  endedAt?: number;
  endReason?: string;
}

export interface TypedActionResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
