"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import TicketCard from "@/components/TicketCard";
import RouteForm from "@/components/RouteForm";
import { Ticket, GenerateRouteInput } from "@/lib/schemas";

// Lazy-load the map so it only runs client-side (Google Maps needs window)
const MapWidget = dynamic(() => import("@/components/MapWidget"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
      Loading map…
    </div>
  ),
});

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mapsUrl, setMapsUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all tickets ────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/tickets")
      .then((r) => r.json())
      .then((json) => setTickets(json.data ?? []))
      .catch(() => setError("Failed to load tickets"))
      .finally(() => setLoading(false));
  }, []);

  // ── Ticket selection ──────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── Route generation ──────────────────────────────────────────────────────
  async function handleGenerateRoute(input: GenerateRouteInput) {
    const res = await fetch("/api/routes/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        selected_ticket_ids: Array.from(selected),
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Route generation failed");
    setMapsUrl(json.data.mapsUrl);
  }

  // ── Derived marker data ───────────────────────────────────────────────────
  const markers = tickets.map((t) => ({
    lat: t.latitude,
    lng: t.longitude,
    id: t.id,
    severity: t.severity,
    selected: selected.has(t.id),
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Road Damage Tickets</h1>
        <p className="text-sm text-gray-500">Select tickets to plan a repair route</p>
      </header>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Map */}
        <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <MapWidget markers={markers} onMarkerClick={toggleSelect} />
        </div>

        {/* Ticket list */}
        {loading && (
          <p className="text-center text-sm text-gray-400 py-8">Loading tickets…</p>
        )}
        {error && (
          <p className="text-center text-sm text-red-500 py-8">{error}</p>
        )}
        {!loading && !error && tickets.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            No tickets found. Add some via Supabase or seed the DB.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              selected={selected.has(ticket.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>

        {/* Route generation */}
        <RouteForm
          selectedCount={selected.size}
          onGenerate={handleGenerateRoute}
          mapsUrl={mapsUrl}
        />
      </div>
    </main>
  );
}
