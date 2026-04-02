/**
 * actions.ts — Server Actions (Next.js)
 *
 * ⚠ SECURITY: This entire file runs exclusively on the server ("use server").
 * No secrets defined here are ever sent to the client. All process.env access
 * is intentionally confined to this file.
 *
 * HYBRID / MOCK MODE:
 * - Mux keys absent  → createUploadUrl() returns { mockMode: true }. The
 *   ScreenRecorder component detects this and triggers a local file download
 *   instead of uploading to Mux.
 * - OpenAI key absent → generateVideoSummary() skips the real API call and
 *   returns a placeholder string, so the UI still renders correctly.
 *
 * This allows the app to run end-to-end without any API keys for demo or
 * development purposes, while gracefully enabling full features when keys
 * are present in .env.local.
 */
"use server";

import Mux from "@mux/mux-node";

// Mux SDK is initialised at module level. It will throw at runtime only if
// credentials are missing AND a real API call is attempted (mock mode guards
// all entry points before any SDK method is called).
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function createUploadUrl() {
  // ── Mock mode ──────────────────────────────────────────────────────────────
  // If Mux credentials are not configured, signal the client to fall back to
  // a local file download instead of attempting an upload. This lets the app
  // run without any Mux account for demo/development purposes.
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    return { mockMode: true as const };
  }

  // ── Real path: create a Mux Direct Upload URL ───────────────────────────
  // Signed playback policy ensures videos are only accessible via JWT tokens.
  // Auto-generated English subtitles power the transcript feature.
  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ["signed"],
      video_quality: "plus",
      mp4_support: "standard",
      input: [
        {
          generated_subtitles: [
            { language_code: "en", name: "English (Auto)" },
          ],
        },
      ],
    },
    cors_origin: "*",
  });
  return upload;
}

export async function getAssetIdFromUpload(uploadId: string) {
  const upload = await mux.video.uploads.retrieve(uploadId);

  if (upload.asset_id) {
    const asset = await mux.video.assets.retrieve(upload.asset_id);
    return {
      playbackId: asset.playback_ids?.[0]?.id,
      status: asset.status,
    };
  }

  return {
    playbackId: null,
    status: upload.status,
  };
}

export async function listVideos() {
  try {
    const assets = await mux.video.assets.list({
      limit: 25,
    });
    return assets.data;
  } catch (error) {
    console.error("Error listing videos:", error);
    return [];
  }
}

function formatVttTime(timestamp: string) {
  return timestamp.split(".")[0];
}

export async function getAssetStatus(playbackId: string) {
  try {
    // Find the asset by scanning for the matching playback ID
    const assets = await mux.video.assets.list({ limit: 100 });
    const asset = assets.data.find((a) =>
      a.playback_ids?.some((p) => p.id === playbackId),
    );

    if (!asset) {
      return {
        status: "preparing",
        transcriptStatus: "preparing",
        transcript: [],
      };
    }

    let transcript: { time: string; text: string }[] = [];
    let transcriptStatus = "preparing";

    if (asset.status === "ready" && asset.tracks) {
      const textTrack = asset.tracks.find(
        (t) => t.type === "text" && t.text_type === "subtitles",
      );

      if (textTrack && textTrack.status === "ready") {
        transcriptStatus = "ready";

        // Signed assets require a JWT on the VTT URL — without it Mux returns
        // a 403 HTML page that parses to zero transcript items.
        let vttUrl = `https://stream.mux.com/${playbackId}/text/${textTrack.id}.vtt`;
        try {
          const vttToken = await mux.jwt.signPlaybackId(playbackId, {
            keyId: process.env.MUX_SIGNING_KEY_ID,
            keySecret: process.env.MUX_SIGNING_KEY_PRIVATE,
            type: "video",
          });
          vttUrl += `?token=${vttToken}`;
        } catch {
          // If signing fails, attempt an unsigned fetch (public assets)
        }

        const response = await fetch(vttUrl);
        if (!response.ok) {
          // Signed token fetch failed — keep transcriptStatus = "ready"
          // but return empty transcript rather than crashing
        } else {
          const vttText = await response.text();
          const blocks = vttText.split("\n\n");
          transcript = blocks.reduce(
            (acc: { time: string; text: string }[], block) => {
              const lines = block.split("\n");
              if (lines.length >= 2 && lines[1].includes("-->")) {
                const time = formatVttTime(lines[1].split(" --> ")[0]);
                const text = lines.slice(2).join(" ");
                if (text.trim()) acc.push({ time, text });
              }
              return acc;
            },
            [],
          );
        }
      }
    }

    return {
      status: asset.status,
      transcriptStatus,
      transcript,
    };
  } catch (error) {
    // Return a safe error shape so callers don't have to handle thrown exceptions
    return { status: "errored", transcriptStatus: "errored", transcript: [] };
  }
}
export async function generateVideoSummary(playbackId: string) {
  try {
    // ── 1. Fetch the transcript via the existing Mux helper ──────────────────
    const status = await getAssetStatus(playbackId);

    const transcriptText =
      status.transcript.length > 0
        ? status.transcript.map((t) => t.text).join(" ")
        : null;

    // ── 2. Hybrid path: real OpenAI call vs. mock placeholder ────────────
    // If OPENAI_API_KEY is present in the environment, we call the Chat
    // Completions API (gpt-4o-mini) with the transcript as context.
    // If the key is absent (e.g., demo mode), we skip the API call and return
    // a descriptive placeholder so the UI still renders a result.
    const openaiKey = process.env.OPENAI_API_KEY;

    if (openaiKey) {
      // ── Real path: call OpenAI Chat Completions ─────────────────────────
      const prompt = transcriptText
        ? `You are a concise video summariser. Summarise the following transcript in 2–3 sentences:\n\n${transcriptText}`
        : "Produce a placeholder summary indicating that no transcript is available yet.";

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 200,
            temperature: 0.5,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(
          err?.error?.message ?? `OpenAI request failed: ${response.status}`
        );
      }

      const data = await response.json();
      const summary: string =
        data.choices?.[0]?.message?.content?.trim() ??
        "No summary content returned.";

      return { summary };
    } else {
      // ── Mock path: no OpenAI key configured ────────────────────────────
      // Simulate a short processing delay so the loading UI is still visible,
      // then return a helpful placeholder message for demo deployments.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        summary:
          "[Demo Mode] Here is where the AI-generated summary would appear. Clone the repo, add your OPENAI_API_KEY to .env.local, and this will be powered by GPT-4o-mini.",
      };
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    return { error: "Failed to generate summary with AI workflows." };
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  return cookieStore.get("user")?.value || null;
}

export async function deleteAsset(playbackId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Resolve playback ID → asset ID
    const assets = await mux.video.assets.list({ limit: 100 });
    const asset = assets.data.find((a) =>
      a.playback_ids?.some((p) => p.id === playbackId),
    );

    if (!asset) {
      return { error: "Recording not found" };
    }

    await mux.video.assets.delete(asset.id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting asset:", error);
    return { error: "Failed to delete recording" };
  }
}

export async function getSignedPlaybackToken(playbackId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Not authenticated" };
    }

    // Mux requires separate tokens for different resource types when using signed playback
    const [videoToken, thumbnailToken, storyboardToken] = await Promise.all([
      mux.jwt.signPlaybackId(playbackId, {
        keyId: process.env.MUX_SIGNING_KEY_ID,
        keySecret: process.env.MUX_SIGNING_KEY_PRIVATE,
        type: "video",
      }),
      mux.jwt.signPlaybackId(playbackId, {
        keyId: process.env.MUX_SIGNING_KEY_ID,
        keySecret: process.env.MUX_SIGNING_KEY_PRIVATE,
        type: "thumbnail",
      }),
      mux.jwt.signPlaybackId(playbackId, {
        keyId: process.env.MUX_SIGNING_KEY_ID,
        keySecret: process.env.MUX_SIGNING_KEY_PRIVATE,
        type: "storyboard",
      }),
    ]);

    return { videoToken, thumbnailToken, storyboardToken };
  } catch (error) {
    console.error("Error signing tokens:", error);
    return { error: "Failed to sign playback tokens" };
  }
}
