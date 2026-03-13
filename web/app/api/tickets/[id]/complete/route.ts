import { NextRequest } from "next/server";
import { completeTicket } from "@/services/ticketService";
import { CompleteTicketSchema } from "@/lib/schemas";
import { ok, err } from "@/lib/api";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();

    // Validate text fields via Zod
    const fields = {
      employee_id: formData.get("employee_id"),
      completed: formData.get("completed") === "true" ? true : undefined,
    };

    const parsed = CompleteTicketSchema.safeParse(fields);
    if (!parsed.success) {
      return err(parsed.error.errors.map((e) => e.message).join(", "), 422);
    }

    // Validate file
    const file = formData.get("completion_image");
    if (!file || !(file instanceof File)) {
      return err("completion_image file is required", 422);
    }

    const ticket = await completeTicket(id, {
      employee_id: parsed.data.employee_id,
      completionImageFile: file,
    });

    return ok(ticket);
  } catch (e) {
    return err((e as Error).message, 500);
  }
}
