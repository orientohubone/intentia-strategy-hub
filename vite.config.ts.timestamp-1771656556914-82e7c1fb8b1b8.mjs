// vite.config.ts
import { defineConfig } from "file:///C:/intentia-strategy-hub/node_modules/vite/dist/node/index.js";
import react from "file:///C:/intentia-strategy-hub/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/intentia-strategy-hub/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\intentia-strategy-hub";
function claudeProxyPlugin() {
  return {
    name: "claude-proxy",
    configureServer(server) {
      server.middlewares.use("/api/claude-proxy", async (req, res) => {
        if (req.method === "OPTIONS") {
          res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
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
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
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
                "anthropic-version": "2023-06-01"
              },
              body: JSON.stringify({
                model,
                max_tokens: maxTokens || 4096,
                temperature: 0.4,
                messages: [{ role: "user", content: prompt }]
              })
            });
            const data = await anthropicRes.json();
            if (!anthropicRes.ok) {
              res.writeHead(anthropicRes.status, { "Content-Type": "application/json" });
              res.end(JSON.stringify({
                error: `Anthropic API error (${anthropicRes.status}): ${data?.error?.message || anthropicRes.statusText}`
              }));
              return;
            }
            const text = data?.content?.[0]?.text || "";
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ text }));
          } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message || "Internal error" }));
          }
        });
      });
    }
  };
}
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "development" && claudeProxyPlugin()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          supabase: ["@supabase/supabase-js"]
        }
      }
    }
  },
  base: mode === "production" ? "/" : "/"
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxpbnRlbnRpYS1zdHJhdGVneS1odWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXGludGVudGlhLXN0cmF0ZWd5LWh1YlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovaW50ZW50aWEtc3RyYXRlZ3ktaHViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCB0eXBlIFBsdWdpbiB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xyXG5cclxuLy8gVml0ZSBwbHVnaW46IGxvY2FsIHByb3h5IGZvciBDbGF1ZGUgQVBJIChkZXYgb25seSlcclxuZnVuY3Rpb24gY2xhdWRlUHJveHlQbHVnaW4oKTogUGx1Z2luIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogXCJjbGF1ZGUtcHJveHlcIixcclxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShcIi9hcGkvY2xhdWRlLXByb3h5XCIsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSBcIk9QVElPTlNcIikge1xyXG4gICAgICAgICAgcmVzLndyaXRlSGVhZCgyMDAsIHtcclxuICAgICAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIsXHJcbiAgICAgICAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kc1wiOiBcIlBPU1QsIE9QVElPTlNcIixcclxuICAgICAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6IFwiQ29udGVudC1UeXBlXCIsXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSBcIlBPU1RcIikge1xyXG4gICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDUsIHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSk7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IFwiTWV0aG9kIG5vdCBhbGxvd2VkXCIgfSkpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGJvZHkgPSBcIlwiO1xyXG4gICAgICAgIHJlcS5vbihcImRhdGFcIiwgKGNodW5rOiBCdWZmZXIpID0+IHsgYm9keSArPSBjaHVuay50b1N0cmluZygpOyB9KTtcclxuICAgICAgICByZXEub24oXCJlbmRcIiwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgeyBhcGlLZXksIG1vZGVsLCBwcm9tcHQsIG1heFRva2VucyB9ID0gSlNPTi5wYXJzZShib2R5KTtcclxuXHJcbiAgICAgICAgICAgIGlmICghYXBpS2V5IHx8ICFtb2RlbCB8fCAhcHJvbXB0KSB7XHJcbiAgICAgICAgICAgICAgcmVzLndyaXRlSGVhZCg0MDAsIHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSk7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIk1pc3NpbmcgcmVxdWlyZWQgZmllbGRzXCIgfSkpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgYW50aHJvcGljUmVzID0gYXdhaXQgZmV0Y2goXCJodHRwczovL2FwaS5hbnRocm9waWMuY29tL3YxL21lc3NhZ2VzXCIsIHtcclxuICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgICAgICAgXCJ4LWFwaS1rZXlcIjogYXBpS2V5LFxyXG4gICAgICAgICAgICAgICAgXCJhbnRocm9waWMtdmVyc2lvblwiOiBcIjIwMjMtMDYtMDFcIixcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgIG1vZGVsLFxyXG4gICAgICAgICAgICAgICAgbWF4X3Rva2VuczogbWF4VG9rZW5zIHx8IDQwOTYsXHJcbiAgICAgICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC40LFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IFt7IHJvbGU6IFwidXNlclwiLCBjb250ZW50OiBwcm9tcHQgfV0sXHJcbiAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGFudGhyb3BpY1Jlcy5qc29uKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWFudGhyb3BpY1Jlcy5vaykge1xyXG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoYW50aHJvcGljUmVzLnN0YXR1cywgeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9KTtcclxuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgIGVycm9yOiBgQW50aHJvcGljIEFQSSBlcnJvciAoJHthbnRocm9waWNSZXMuc3RhdHVzfSk6ICR7ZGF0YT8uZXJyb3I/Lm1lc3NhZ2UgfHwgYW50aHJvcGljUmVzLnN0YXR1c1RleHR9YCxcclxuICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gZGF0YT8uY29udGVudD8uWzBdPy50ZXh0IHx8IFwiXCI7XHJcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0pO1xyXG4gICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgdGV4dCB9KSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwMCwgeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9KTtcclxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlcnIubWVzc2FnZSB8fCBcIkludGVybmFsIGVycm9yXCIgfSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBobXI6IHtcclxuICAgICAgb3ZlcmxheTogZmFsc2UsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKSxcclxuICAgIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjbGF1ZGVQcm94eVBsdWdpbigpLFxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBvdXREaXI6IFwiZGlzdFwiLFxyXG4gICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgIHZlbmRvcjogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIl0sXHJcbiAgICAgICAgICByb3V0ZXI6IFtcInJlYWN0LXJvdXRlci1kb21cIl0sXHJcbiAgICAgICAgICB1aTogW1wiQHJhZGl4LXVpL3JlYWN0LWRpYWxvZ1wiLCBcIkByYWRpeC11aS9yZWFjdC1kcm9wZG93bi1tZW51XCJdLFxyXG4gICAgICAgICAgc3VwYWJhc2U6IFtcIkBzdXBhYmFzZS9zdXBhYmFzZS1qc1wiXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGJhc2U6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiID8gXCIvXCIgOiBcIi9cIixcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThQLFNBQVMsb0JBQWlDO0FBQ3hTLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsU0FBUyxvQkFBNEI7QUFDbkMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sZ0JBQWdCLFFBQVE7QUFDdEIsYUFBTyxZQUFZLElBQUkscUJBQXFCLE9BQU8sS0FB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
