import { NextResponse } from "next/server";
import { cakeSchema, slugify } from "@/lib/cake-schema";
import { publishCake, readCakeIndex } from "@/lib/github";

export const runtime = "nodejs";
export async function GET() {
  try { return NextResponse.json({ cakes: await readCakeIndex() }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load cakes" }, { status: 500 }); }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = slugify(String(body.title || ""));
    const extension = body.imageType === "image/png" ? "png" : body.imageType === "image/webp" ? "webp" : "jpg";
    if (!body.imageBase64 || typeof body.imageBase64 !== "string" || body.imageBase64.length > 4_000_000) throw new Error("The compressed photograph is too large. Please choose another image.");
    const cake = cakeSchema.parse({ ...body, slug, image: `/images/cakes/${slug}.${extension}`, priceFrom: Number(body.priceFrom), featured: Boolean(body.featured), published: true });
    return NextResponse.json(await publishCake(cake, body.imageBase64, extension), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The cake could not be published" }, { status: 400 });
  }
}
