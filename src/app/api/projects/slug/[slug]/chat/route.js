export async function POST(req, { params }) {
  const { slug } = await params;
  const { userId } = await auth();
  const { prompt } = await req.json();
  const result = await chatOnProjectBySlug(slug, userId, prompt);
  return Response.json(result);
}