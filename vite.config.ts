import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Vite plugin: local proxy for Claude API (dev only)
function claudeProxyPlugin(): Plugin {
  return {
    name: "claude-proxy",
    configureServer(server) {
      server.middlewares.use("/api/claude-proxy", async (req, res) => {
        if (req.method === "OPTIONS") {
          res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          });
          res.end();
          return;
        }

        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
        req.on("end", async () => {
          try {
            const { apiKey, model, prompt, maxTokens } = JSON.parse(body);

            if (!apiKey || !model || !prompt) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Missing required fields" }));
              return;
            }

            const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model,
                max_tokens: maxTokens || 4096,
                temperature: 0.4,
                messages: [{ role: "user", content: prompt }],
              }),
            });

            const data = await anthropicRes.json();

            if (!anthropicRes.ok) {
              res.writeHead(anthropicRes.status, { "Content-Type": "application/json" });
              res.end(JSON.stringify({
                error: `Anthropic API error (${anthropicRes.status}): ${data?.error?.message || anthropicRes.statusText}`,
              }));
              return;
            }

            const text = data?.content?.[0]?.text || "";
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ text }));
          } catch (err: any) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message || "Internal error" }));
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "development" && claudeProxyPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false, // Desabilitado em produção para não expor código fonte no devtools
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
  base: mode === "production" ? "/" : "/",
}));
