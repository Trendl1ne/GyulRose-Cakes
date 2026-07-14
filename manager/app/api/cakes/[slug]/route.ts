import { NextResponse } from "next/server";
import { setCakePublished } from "@/lib/github";

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { published } = await request.json();
    if (typeof published !== "boolean") throw new Error("Invalid archive request");
    return NextResponse.json(await setCakePublished(slug, published));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The cake could not be updated" }, { status: 400 });
  }
}
