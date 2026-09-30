import { NextResponse } from "next/server";
import { getCategoryTree } from "@/server/services/catalog.service";

export const dynamic = "force-dynamic";

/** GET /api/categories — active category tree (roots + children) for the storefront mega-menu. */
export async function GET() {
  try {
    const tree = await getCategoryTree();
    return NextResponse.json({ ok: true, data: { tree } });
  } catch (error) {
    console.error("GET /api/categories failed", error);
    return NextResponse.json({ ok: false, error: "Could not load categories" }, { status: 500 });
  }
}
