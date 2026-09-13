import { Suspense } from "react";
import { BuilderPage } from "@/components/builder/BuilderPage";

export default async function Builder({ params }) {
  const { projectId } = await params;
  return (
    <Suspense fallback={null}>
      <BuilderPage projectSlug={projectId} />
    </Suspense>
  );
}
