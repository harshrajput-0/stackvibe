import { cache } from "react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db.js";
import { HttpError } from "@/lib/httpErrors";
import { isReservedSlug } from "@/lib/reservedSlugs";
import { getPublicProjectBySlug } from "@/controllers/project.controller";
import { SiteSandbox } from "@/components/shared/SiteSandbox";

export const dynamic = "force-dynamic";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

const loadSite = cache(async (slug) => {
  if (!SLUG_PATTERN.test(slug) || isReservedSlug(slug)) return null;

  try {
    await connectDB();
    return await getPublicProjectBySlug(slug);
  } catch (err) {
    // "Not found" is a normal outcome. Any other error is a real
    // problem (like the database being down), so let it bubble up.
    if (err instanceof HttpError && err.status === 404) return null;
    throw err;
  }
});

// Sets the browser tab title and description from the project's details.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const site = await loadSite(slug);

  // No site means the 404 page is shown, so no custom title is needed.
  if (!site) return {};

  return {
    title: site.name,
    description: site.description || undefined,
  };
}

export default async function PublishedSitePage({ params }) {
  const { slug } = await params;
  const site = await loadSite(slug);

  // Shows Next.js's standard "404 - page not found" screen.
  if (!site) notFound();

  // The site's code needs an App.js file to start from. If it's missing,
  // the project has no real content yet, so treat it as "not found".
  if (!site.files["/App.js"]) notFound();

  // h-dvh = exactly the height of the browser window.
  // The site fills the whole screen, with no StackVibe frame around it.
  return (
    <main className="flex h-dvh w-full flex-col">
      <SiteSandbox files={site.files} showRefreshButton={false} />
    </main>
  );
}