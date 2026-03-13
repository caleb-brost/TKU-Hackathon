import { z } from "zod";

// ─── Ticket ───────────────────────────────────────────────────────────────────

export const TicketTypeSchema = z.enum(["pothole", "crack"]);
export const TicketStatusSchema = z.enum(["new", "completed"]);
export const SeveritySchema = z.enum(["low", "medium", "high"]);

export const TicketSchema = z.object({
  id: z.string().uuid(),
  type: TicketTypeSchema,
  latitude: z.number(),
  longitude: z.number(),
  severity: SeveritySchema,
  confidence: z.number().min(0).max(1).nullable(),
  status: TicketStatusSchema,
  description: z.string().nullable(),
  image_url: z.string().url().nullable(),
  completion_image_url: z.string().url().nullable(),
  employee_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Ticket = z.infer<typeof TicketSchema>;

// ─── Complete Ticket Request ───────────────────────────────────────────────────

export const CompleteTicketSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  completed: z.literal(true),
  // completion_image is handled via FormData (File), validated separately
});

export type CompleteTicketInput = z.infer<typeof CompleteTicketSchema>;

// ─── Route Request ────────────────────────────────────────────────────────────

export const RouteSchema = z.object({
  id: z.string().uuid(),
  selected_ticket_ids: z.array(z.string().uuid()),
  start_address: z.string(),
  end_address: z.string(),
  generated_route: z.unknown().nullable(),
  created_at: z.string(),
});

export type RouteRequest = z.infer<typeof RouteSchema>;

export const GenerateRouteInputSchema = z.object({
  selected_ticket_ids: z
    .array(z.string().uuid())
    .min(1, "Select at least one ticket"),
  start_address: z.string().min(1, "Start address is required"),
  end_address: z.string().min(1, "End address is required"),
});

export type GenerateRouteInput = z.infer<typeof GenerateRouteInputSchema>;
