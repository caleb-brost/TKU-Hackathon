import { NextResponse } from "next/server";
import { getAllTickets } from "@/services/ticketService";
import { ok, err } from "@/lib/api";

export async function GET() {
  try {
    const tickets = await getAllTickets();
    return ok(tickets);
  } catch (e) {
    return err((e as Error).message, 500);
  }
}
