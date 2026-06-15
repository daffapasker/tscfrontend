import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Role = "pengurus" | "pelatih";

const roleDashboardMap: Record<Role, string> = {
  pengurus: "/staff/dashboard",
  pelatih: "/coach/athlete",
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
};

const getRoleFromToken = (token?: string | null): Role | null => {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const decoded = decodeBase64Url(payload);
    const data = JSON.parse(decoded) as { role?: Role };
    return data?.role ?? null;
  } catch {
    return null;
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const role = getRoleFromToken(token);

  const isAuthPage = pathname === "/login";
  if (isAuthPage && role) {
    return NextResponse.redirect(new URL(roleDashboardMap[role], request.url));
  }

  const isStaffArea = pathname.startsWith("/staff");
  const isCoachArea = pathname.startsWith("/coach");

  if (isStaffArea || isCoachArea) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    if (isStaffArea && role !== "pengurus") {
      const target = role ? roleDashboardMap[role] : "/login";
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (isCoachArea && role !== "pelatih") {
      const target = role ? roleDashboardMap[role] : "/login";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }
}

export const config = {
  matcher: ["/login", "/staff/:path*", "/coach/:path*"],
};
