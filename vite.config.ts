import { defineConfig, loadEnv, type Connect } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";
import { runAsk } from "./api/_lib/askCore";
import { runRun } from "./api/_lib/runCore";
import { runTts } from "./api/_lib/ttsCore";
import { runContact } from "./api/_lib/contactCore";
import { runAgent } from "./api/_lib/agentsCore";
import { runMission } from "./api/_lib/missionCore";
import { runLab } from "./api/_lib/labCore";
import { runGithub } from "./api/_lib/githubCore";
import { runFounder } from "./api/_lib/founderCore";
import { runStt } from "./api/_lib/sttCore";
import { readJson, callerKey, sendJson } from "./api/_lib/node";

/* Serve the /api functions during `vite dev` AND `vite preview` so the voice
   twin works end-to-end locally without Vercel. In production these same cores
   run as Vercel serverless functions (api/*.ts). Keys are read from the
   environment (loaded below) and never reach the client bundle. */
function devApi(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = req.url ?? "";
    const r = req as IncomingMessage & { method?: string };
    try {
      if (r.method === "POST" && url.startsWith("/api/ask")) {
        const out = await runAsk(await readJson(r), callerKey(r));
        return sendJson(res as ServerResponse, out.status, out.json);
      }
      if (r.method === "POST" && url.startsWith("/api/run")) {
        const out = await runRun(await readJson(r), callerKey(r));
        return sendJson(res as ServerResponse, out.status, out.json);
      }
      if (r.method === "POST" && url.startsWith("/api/tts")) {
        const out = await runTts(await readJson(r), callerKey(r));
        return sendJson(res as ServerResponse, out.status, out.json);
      }
      if (r.method === "POST" && url.startsWith("/api/contact")) {
        const out = await runContact(await readJson(r), callerKey(r));
        return sendJson(res as ServerResponse, out.status, out.json);
      }
      if (r.method === "POST" && url.startsWith("/api/agent")) {
        const out = await runAgent(await readJson(r), callerKey(r));
        return sendJson(res as ServerResponse, out.status, out.json);
      }
      if (r.method === "POST" && url.startsWith("/api/mission")) {
        const out = await runMission(await readJson(r), callerKey(r));
        return sendJson(res as ServerResponse, out.status, out.json);
      }
      if (r.method === "POST" && url.startsWith("/api/lab")) {
        const out = await runLab(await readJson(r), callerKey(r));
        return sendJson(res as ServerResponse, out.status, out.json);
      }
      if (r.method === "POST" && url.startsWith("/api/github")) {
        const out = await runGithub(await readJson(r), callerKey(r));
        return sendJson(res as ServerResponse, out.status, out.json);
      }
      if (r.method === "POST" && url.startsWith("/api/founder")) {
        const out = await runFounder(await readJson(r), callerKey(r));
        return sendJson(res as ServerResponse, out.status, out.json);
      }
      if (r.method === "POST" && url.startsWith("/api/stt")) {
        const out = await runStt(await readJson(r), callerKey(r));
        return sendJson(res as ServerResponse, out.status, out.json);
      }
    } catch {
      return sendJson(res as ServerResponse, 500, { error: "server_error" });
    }
    next();
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Make non-VITE_ secrets available to the server-side API middleware only.
  const env = loadEnv(mode, process.cwd(), "");
  for (const k of ["GROQ_API_KEY", "GROQ_MODEL", "GEMINI_API_KEY", "GEMINI_MODEL", "GEMINI_TTS_MODEL", "WEB3FORMS_ACCESS_KEY", "GITHUB_TOKEN", "FOUNDER_KEY"]) {
    if (env[k]) process.env[k] = env[k];
  }

  return {
    plugins: [
      react(),
      {
        name: "kos-dev-api",
        configureServer(server) {
          server.middlewares.use(devApi());
        },
        configurePreviewServer(server) {
          server.middlewares.use(devApi());
        },
      },
    ],
    build: {
      // Split long-lived vendor code into its own cacheable chunks so a content
      // change to app code doesn't bust the (large, stable) framework download.
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react";
            if (/node_modules\/(framer-motion|motion|motion-dom|motion-utils)\//.test(id)) return "motion";
            return undefined;
          },
        },
      },
    },
  };
});
