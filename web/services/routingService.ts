/**
 * routingService.ts
 * Abstracts route generation so the Google Maps implementation can be
 * swapped, upgraded, or replaced without touching API routes.
 *
 * Currently supports Google Maps Routes API (Directions).
 * To swap providers: implement the same interface and change `generateRoute`.
 */

import { Ticket } from "@/lib/schemas";

export interface RouteResult {
  /** Provider-specific route object (serialisable to JSON for DB storage) */
  raw: unknown;
  /** Google Maps deeplink that opens the optimised route in the user's browser */
  mapsUrl: string;
  /** Ordered list of waypoints for display on the map */
  waypoints: { lat: number; lng: number; ticketId: string }[];
}

export interface RouteInput {
  tickets: Ticket[];
  startAddress: string;
  endAddress: string;
}

// ─── Google Maps implementation ──────────────────────────────────────────────

async function googleMapsRoute(input: RouteInput): Promise<RouteResult> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;

  const waypoints = input.tickets.map(
    (t) => `${t.latitude},${t.longitude}`
  );

  if (!apiKey) {
    // Return a stub when no key is configured (handy for local dev / CI)
    return stubRoute(input);
  }

  // Build Google Maps Directions API URL
  const origin = encodeURIComponent(input.startAddress);
  const destination = encodeURIComponent(input.endAddress);
  const waypointsParam = waypoints
    .map((w) => encodeURIComponent(w))
    .join("|");

  const url =
    `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${origin}` +
    `&destination=${destination}` +
    (waypointsParam ? `&waypoints=optimize:true|${waypointsParam}` : "") +
    `&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Maps API error: ${res.status}`);
  const raw = await res.json();

  if (raw.status !== "OK") {
    throw new Error(`Google Maps API: ${raw.status} – ${raw.error_message ?? ""}`);
  }

  // Build an ordered waypoints list (respecting optimised order)
  const order: number[] =
    raw.routes?.[0]?.waypoint_order ?? input.tickets.map((_, i) => i);
  const orderedTickets = order.map((i) => input.tickets[i]);

  // Build a Google Maps deeplink for the browser
  const mapsUrl = buildMapsUrl(
    input.startAddress,
    input.endAddress,
    orderedTickets
  );

  return {
    raw,
    mapsUrl,
    waypoints: orderedTickets.map((t) => ({
      lat: t.latitude,
      lng: t.longitude,
      ticketId: t.id,
    })),
  };
}

// ─── Stub (no API key) ────────────────────────────────────────────────────────

function stubRoute(input: RouteInput): RouteResult {
  return {
    raw: { stub: true },
    mapsUrl: buildMapsUrl(input.startAddress, input.endAddress, input.tickets),
    waypoints: input.tickets.map((t) => ({
      lat: t.latitude,
      lng: t.longitude,
      ticketId: t.id,
    })),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMapsUrl(
  start: string,
  end: string,
  tickets: Ticket[]
): string {
  const base = "https://www.google.com/maps/dir/";
  const parts = [
    encodeURIComponent(start),
    ...tickets.map((t) => `${t.latitude},${t.longitude}`),
    encodeURIComponent(end),
  ];
  return base + parts.join("/");
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * Generate an optimised route through the selected tickets.
 * Swap `googleMapsRoute` for any other routing provider here.
 */
export async function generateRoute(input: RouteInput): Promise<RouteResult> {
  return googleMapsRoute(input);
}
