import { NextRequest } from "next/server";
import { getTicketById } from "@/services/ticketService";
import { ok, err } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await getTicketById(id);
    if (!ticket) return err("Ticket not found", 404);
    return ok(ticket);
  } catch (e) {
    return err((e as Error).message, 500);
  }
}
