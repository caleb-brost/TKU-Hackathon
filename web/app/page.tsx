"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import TicketCard from "@/components/TicketCard";
import RouteForm from "@/components/RouteForm";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { Ticket, GenerateRouteInput } from "@/lib/schemas";

const MapWidget = dynamic(() => import("@/components/MapWidget"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
      Loading map…
    </div>
  ),
});

export default function HomePage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  return (
    <APIProvider apiKey={apiKey}>
      <HomeContent />
    </APIProvider>
  );
}

function HomeContent() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [filterType, setFilterType] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<Set<string>>(new Set());
  const [filterSeverity, setFilterSeverity] = useState<Set<string>>(new Set());

  const routesLib = useMapsLibrary("routes");

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
    if (!routesLib) throw new Error("Maps not loaded yet");

    const selectedTickets = tickets.filter((t) => selected.has(t.id));

    const directionsService = new routesLib.DirectionsService();
    const result = await directionsService.route({
      origin: input.start_address,
      destination: input.end_address,
      waypoints: selectedTickets.map((t) => ({
        location: new google.maps.LatLng(t.latitude, t.longitude),
        stopover: true,
      })),
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    setDirectionsResult(result);

    // Persist to DB in the background
    fetch("/api/routes/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        selected_ticket_ids: Array.from(selected),
      }),
    }).catch(() => {});
  }

  // ── Sorting ───────────────────────────────────────────────────────────────
  function handleSort(col: string) {
    if (col === sortCol) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  }

  function toggleFilter(set: Set<string>, setFn: (s: Set<string>) => void, val: string) {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setFn(next);
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (filterType.size > 0 && !filterType.has(t.type)) return false;
      if (filterStatus.size > 0 && !filterStatus.has(t.status)) return false;
      if (filterSeverity.size > 0 && !filterSeverity.has(t.severity)) return false;
      return true;
    });
  }, [tickets, filterType, filterStatus, filterSeverity]);

  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortCol];
      const bVal = (b as Record<string, unknown>)[sortCol];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredTickets, sortCol, sortDir]);

  // ── Derived marker data (filtered) ───────────────────────────────────────
  const markers = filteredTickets.map((t) => ({
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

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Map */}
        <div className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <MapWidget markers={markers} onMarkerClick={toggleSelect} directionsResult={directionsResult} />
          {directionsResult && (
            <button
              onClick={() => setDirectionsResult(null)}
              className="absolute top-2 right-2 z-10 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm"
            >
              Clear route
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-wrap gap-3 items-center shadow-sm">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Filter</span>
          <MultiSelectDropdown
            label="Type"
            options={["pothole", "crack"]}
            selected={filterType}
            onToggle={(v) => toggleFilter(filterType, setFilterType, v)}
          />
          <MultiSelectDropdown
            label="Severity"
            options={["low", "medium", "high"]}
            selected={filterSeverity}
            onToggle={(v) => toggleFilter(filterSeverity, setFilterSeverity, v)}
          />
          <MultiSelectDropdown
            label="Status"
            options={["new", "completed"]}
            selected={filterStatus}
            onToggle={(v) => toggleFilter(filterStatus, setFilterStatus, v)}
          />
          {(filterType.size > 0 || filterSeverity.size > 0 || filterStatus.size > 0) && (
            <button
              onClick={() => { setFilterType(new Set()); setFilterSeverity(new Set()); setFilterStatus(new Set()); }}
              className="text-xs text-gray-400 hover:text-gray-600 underline ml-1"
            >
              Clear all
            </button>
          )}
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

        {tickets.length > 0 && (
          <div className="rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {[
                    { label: "Type",        col: "type" },
                    { label: "Severity",    col: "severity" },
                    { label: "Status",      col: "status" },
                    { label: "Description", col: "description" },
                    { label: "Location",    col: null },
                    { label: "Confidence",  col: "confidence" },
                    { label: "Date",        col: "created_at" },
                    { label: "Image",       col: null },
                    { label: "Select",      col: null },
                  ].map(({ label, col }) => (
                    <th
                      key={label}
                      className={`px-3 py-2 whitespace-nowrap ${col ? "cursor-pointer select-none hover:text-gray-700" : ""}`}
                      onClick={() => col && handleSort(col)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {label}
                        {col && (
                          <span className="text-gray-400">
                            {sortCol === col ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    selected={selected.has(ticket.id)}
                    onToggleSelect={toggleSelect}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Route generation */}
        <RouteForm
          selectedCount={selected.size}
          onGenerate={handleGenerateRoute}
        />
      </div>
    </main>
  );
}
