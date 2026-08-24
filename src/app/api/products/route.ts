import { NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/products";

const MAX_PRODUCT_IDS = 50;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawIds = (url.searchParams.get("ids") ?? "").split(",").map((id) => id.trim()).filter(Boolean);
  if (rawIds.length > MAX_PRODUCT_IDS) return NextResponse.json({ error: "Максимум 50 товаров за запрос." }, { status: 400 });
  const ids = [...new Set(
    rawIds
  )];

  const products = await getProductsByIds(ids);
  return NextResponse.json(products);
}
