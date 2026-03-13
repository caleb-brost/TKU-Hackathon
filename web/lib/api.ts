import { NextResponse } from "next/server";

/** Consistent success response */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/** Consistent error response */
export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
