/**
 * Twilio configuration test. Run from project root:
 *
 *   npm run test:twilio
 *
 * This loads .env.local via Node's --env-file so Twilio (and required server env) are set.
 * Ensures: voice token, video token, and video room creation work.
 */

async function main() {
  const { createVoiceToken, createVideoToken, ensureVideoRoom } = await import(
    "../lib/twilioClient"
  );

  const identity = "test-identity-" + Date.now();
  const roomName = "test-room-" + Date.now();

  console.log("Testing Twilio configuration…\n");

  // 1. Voice token
  try {
    const voiceToken = createVoiceToken(identity, roomName);
    console.log("✓ Voice token created (length:", voiceToken.length, ")");
  } catch (err) {
    console.error("✗ Voice token failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // 2. Video token
  try {
    const videoToken = createVideoToken(identity, roomName);
    console.log("✓ Video token created (length:", videoToken.length, ")");
  } catch (err) {
    console.error("✗ Video token failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // 3. Ensure video room (Twilio API call)
  try {
    await ensureVideoRoom(roomName);
    console.log("✓ Video room ensured:", roomName);
  } catch (err) {
    console.error("✗ ensureVideoRoom failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }

  console.log("\nTwilio configuration OK. You can run the app and place voice/video calls.");
}

main();
