import { NextResponse } from "next/server";
import { CANTEEN_MENUS } from "@/utils/mockData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campus = searchParams.get("campus");

  if (campus === "Kleve" || campus === "Kamp-Lintfort") {
    return NextResponse.json({
      success: true,
      campus,
      menu: CANTEEN_MENUS[campus],
    });
  }

  return NextResponse.json({
    success: true,
    menus: CANTEEN_MENUS,
  });
}
