import { NextRequest } from "next/server";
import { GenerateRouteInputSchema } from "@/lib/schemas";
import { getAllTickets } from "@/services/ticketService";
import { generateRoute } from "@/services/routingService";
import { supabaseServer } from "@/lib/supabase";
import { ok, err } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = GenerateRouteInputSchema.safeParse(body);
    if (!parsed.success) {
      return err(parsed.error.errors.map((e) => e.message).join(", "), 422);
    }

    const { selected_ticket_ids, start_address, end_address } = parsed.data;

    // Fetch only the selected tickets
    const allTickets = await getAllTickets();
    const tickets = allTickets.filter((t) =>
      selected_ticket_ids.includes(t.id)
    );

    if (tickets.length === 0) {
      return err("None of the selected tickets were found", 404);
    }

    // Generate the route (pluggable via routingService)
    const result = await generateRoute({ tickets, startAddress: start_address, endAddress: end_address });

    // Persist the route request to Supabase
    const { data: routeRecord, error } = await supabaseServer
      .from("route_requests")
      .insert({
        selected_ticket_ids,
        start_address,
        end_address,
        generated_route: result.raw,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return ok({ route: routeRecord, mapsUrl: result.mapsUrl, waypoints: result.waypoints });
  } catch (e) {
    return err((e as Error).message, 500);
  }
}
