import { type NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  if (requestHeaders.get("x-real-ip") == null) {
    requestHeaders.set(
      "x-real-ip",
      requestHeaders.get("x-forwarded-for") ??
        (req as unknown as { socket: { remoteAddress: string } }).socket
          .remoteAddress,
    );
  }
  return NextResponse.next({
    ...req,
    headers: requestHeaders,
  });
}
