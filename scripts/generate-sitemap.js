import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://intentia.com.br";

const routes = [
  "",
  "/blog",
  "/precos",
  "/sobre",
  "/cases",
  "/contato",
  "/politica-de-privacidade",
  "/termos-de-servico",
  "/politica-de-cookies",
  "/exclusao-de-dados",
  "/diagnostico-url",
  "/analise-ia",
  "/benchmark-competitivo",
  "/score-canal",
  "/alertas-insights",
  "/dados-estruturados",
  "/gestao-campanhas",
  "/gestao-budget",
  "/relatorios",
  "/integracoes",
];

const generateSitemap = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => {
    return `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === "" ? "1.0" : "0.8"}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log('✅ Sitemap generated at public/sitemap.xml');
};

generateSitemap();
