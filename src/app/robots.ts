import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/minha-conta", "/tvde/minha-conta", "/tvde/candidatura", "/rent-a-car/reserva", "/admin"] }],
    sitemap: [`${process.env.APP_URL ?? "https://www.decadaousada.pt"}/sitemap.xml`],
  };
}
