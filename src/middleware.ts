import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Luma Boutique OS"',
    },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }


  const isCrmRoute =
    pathname === "/admin/dashboard" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/sales") ||
    pathname.startsWith("/api/receivables") ||
    pathname.startsWith("/api/contactos") ||
    pathname.startsWith("/api/dashboard");

  if (!isCrmRoute) {
    return NextResponse.next();
  }

  if (process.env.NEXT_PUBLIC_ADMIN_PROTECTED !== "true") {
    return NextResponse.next();
  }

  const configuredUser = process.env.CRM_BASIC_AUTH_USER;
  const configuredPassword = process.env.CRM_BASIC_AUTH_PASSWORD;

  if (!configuredUser || !configuredPassword) {
    return NextResponse.next();
  }

  const header = request.headers.get("authorization");

  if (!header?.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const decoded = atob(header.slice("Basic ".length));
    const [user, ...passwordParts] = decoded.split(":");
    const password = passwordParts.join(":");

    if (user === configuredUser && password === configuredPassword) {
      return NextResponse.next();
    }
  } catch {
    return unauthorized();
  }

  return unauthorized();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
