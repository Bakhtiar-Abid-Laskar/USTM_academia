import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Get all courses for URL generation
  const { data: courses } = await supabase
    .from("courses")
    .select("slug")
    .eq("is_active", true);

  const baseUrl = "https://ustm-academia.vercel.app";
  const lastModified = new Date().toISOString().split("T")[0];

  // Build sitemap XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/courses</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/help</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

  // Add dynamic course URLs
  if (courses && courses.length > 0) {
    courses.forEach((course: any) => {
      xml += `
  <url>
    <loc>${baseUrl}/courses/${course.slug}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800", // Cache for 1 day
    },
  });
}
