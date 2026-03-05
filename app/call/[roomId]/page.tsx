import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { CallPageShell } from "@/components/call/CallPageShell";
import { VoiceRoom } from "@/components/VoiceRoom";
import { VideoRoom } from "@/components/VideoRoom";

interface CallRoomPageProps {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ mode?: string }>;
}

/**
 * Auth-protected active call room view.
 */
export default async function CallRoomPage({ params, searchParams }: CallRoomPageProps): Promise<React.JSX.Element> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const { roomId } = await params;
  const { mode: modeParam } = await searchParams;
  const mode = modeParam === "video" ? "video" : "voice";

  return (
    <CallPageShell roomId={roomId} mode={mode}>
      {mode === "video" ? <VideoRoom roomId={roomId} mode="video" /> : <VoiceRoom roomId={roomId} />}
    </CallPageShell>
  );
}
