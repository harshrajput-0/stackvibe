import { BuilderPage } from "@/components/builder/BuilderPage";

export default async function Builder({ params }) {
  const { projectId } = await params;
  return <BuilderPage projectSlug={projectId} />;
}
