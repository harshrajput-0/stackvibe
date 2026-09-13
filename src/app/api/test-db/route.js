import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    return Response.json({
      message: "Database connected successfully",
    });
  } catch (error) {
    return Response.json(
      {
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}