import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  // Získej seznam všech inzerátů z backendu (příklad)
  const res = await fetch(`${API_URL}/ad/all`);
  const ads = res.ok ? await res.json() : [];

  const urls = [
    "",
    "about",
    // ...další statické stránky
    ...ads.map((ad: any) => `ads/${ad.id}`),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `<url><loc>https://carta.cz/${url}</loc></url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: { "Content-Type": "application/xml" },
  });
}