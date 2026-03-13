/**
 * ticketService.ts
 * All database access for Ticket entities goes through here.
 * Swap the Supabase calls for any other DB without touching API routes.
 */

import { supabaseServer, COMPLETION_BUCKET } from "@/lib/supabase";
import { Ticket } from "@/lib/schemas";

const TABLE = "tickets";

export async function getAllTickets(): Promise<Ticket[]> {
  const { data, error } = await supabaseServer
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Ticket[];
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const { data, error } = await supabaseServer
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(error.message);
  }
  return data as Ticket;
}

export interface CompleteTicketPayload {
  employee_id: string;
  completionImageFile: File;
}

export async function completeTicket(
  id: string,
  payload: CompleteTicketPayload
): Promise<Ticket> {
  // 1. Upload completion image to Supabase Storage
  const ext = payload.completionImageFile.name.split(".").pop() ?? "jpg";
  const storagePath = `${id}/completion_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabaseServer.storage
    .from(COMPLETION_BUCKET)
    .upload(storagePath, payload.completionImageFile, { upsert: true });

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

  // 2. Get public URL
  const { data: urlData } = supabaseServer.storage
    .from(COMPLETION_BUCKET)
    .getPublicUrl(storagePath);

  // 3. Update the ticket row
  const { data, error } = await supabaseServer
    .from(TABLE)
    .update({
      status: "completed",
      employee_id: payload.employee_id,
      completion_image_url: urlData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Ticket;
}
