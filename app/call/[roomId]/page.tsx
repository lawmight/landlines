import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { VoiceRoom } from "@/components/VoiceRoom";
import { VideoRoom } from "@/components/VideoRoom";

interface CallRoomPageProps {
  params: {
    roomId: string;
  };
  searchParams: {
    mode?: string;
  };
}

/**
 * Auth-protected active call room view.
 */
export default async function CallRoomPage({ params, searchParams }: CallRoomPageProps): Promise<React.JSX.Element> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const mode = searchParams.mode === "video" ? "video" : "voice";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      {mode === "video" ? <VideoRoom roomId={params.roomId} mode="video" /> : <VoiceRoom roomId={params.roomId} />}
    </main>
  );
}
