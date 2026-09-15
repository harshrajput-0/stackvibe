export async function GET(req, { params }) {
  const { slug } = await params;
  const { userId } = await auth();
  const project = await getProjectBySlug(slug, userId);
  return Response.json(project);
}