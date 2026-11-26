import { cache } from "react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db.js";
import { HttpError } from "@/lib/httpErrors";
import { getPublicProjectByHandle } from "@/controllers/project.controller";
import { SiteSandbox } from "@/components/shared/SiteSandbox";

export const dynamic = "force-dynamic";

const URL_PART_PATTERN = /^[a-z0-9-]+$/;

// URL looks like /<ownerHandle>/<projectSlug>.
// (The folder is named [slug] because it's shared with the old /[slug] page —
// here it holds the owner's prefix.)
const loadSite = cache(async (ownerHandle, projectSlug) => {
  if (!URL_PART_PATTERN.test(ownerHandle) || !URL_PART_PATTERN.test(projectSlug)) {
    return null;
  }

  try {
    await connectDB();
    return await getPublicProjectByHandle(ownerHandle, projectSlug);
  } catch (err) {
    // "Not found" is a normal outcome. Any other error is a real
    // problem (like the database being down), so let it bubble up.
    if (err instanceof HttpError && err.status === 404) return null;
    throw err;
  }
});

export async function generateMetadata({ params }) {
  const { slug, projectSlug } = await params;
  const site = await loadSite(slug, projectSlug);

  if (!site) return {};

  return {
    title: site.name,
    description: site.description || undefined,
  };
}

export default async function PublishedSitePage({ params }) {
  const { slug, projectSlug } = await params;
  const site = await loadSite(slug, projectSlug);

  if (!site) notFound();
  if (!site.files["/App.js"]) notFound();

  return (
    <main className="flex h-dvh w-full flex-col">
      <SiteSandbox files={site.files} showRefreshButton={false} />
    </main>
  );
}
