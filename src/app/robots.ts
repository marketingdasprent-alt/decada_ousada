import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Sem APP_URL (demo em *.vercel.app, antes de ligar o domínio): não indexar nada
  if (!process.env.APP_URL) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/minha-conta", "/tvde/minha-conta", "/tvde/candidatura", "/rent-a-car/reserva", "/admin"] }],
    sitemap: [`${process.env.APP_URL}/sitemap.xml`],
  };
}
