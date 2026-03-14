"use client";

import { useState } from "react";
import { GenerateRouteInput } from "@/lib/schemas";
import AddressAutocomplete from "@/components/AddressAutocomplete";

interface RouteFormProps {
  selectedCount: number;
  onGenerate: (input: GenerateRouteInput) => Promise<void>;
  mapsUrl?: string | null;
  onClearRoute?: () => void;
  startAddress: string;
  endAddress: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  pickingFor: "start" | "end" | null;
  onPickStart: () => void;
  onPickEnd: () => void;
}

export default function RouteForm({
  selectedCount,
  onGenerate,
  mapsUrl,
  onClearRoute,
  startAddress,
  endAddress,
  onStartChange,
  onEndChange,
  pickingFor,
  onPickStart,
  onPickEnd,
}: RouteFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onGenerate({
        selected_ticket_ids: [],
        start_address: startAddress,
        end_address: endAddress,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="h-full bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">Route Planner</span>
        <span className="text-xs text-gray-400">
          {selectedCount} stop{selectedCount !== 1 ? "s" : ""} selected
        </span>
      </div>

      {pickingFor && (
        <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
          Click the map to set {pickingFor} location
        </p>
      )}

      {/* Start address */}
      <div className="flex gap-1">
        <AddressAutocomplete
          placeholder="Start address"
          value={startAddress}
          onChange={onStartChange}
          className={`flex-1 min-w-0 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${pickingFor === "start" ? "border-blue-400 ring-2 ring-blue-200" : "border-gray-300"}`}
          required
        />
        <button
          type="button"
          onClick={onPickStart}
          title="Pick start from map"
          className={`shrink-0 rounded-lg border px-2 py-1.5 transition-colors ${pickingFor === "start" ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-500 hover:bg-gray-50"}`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </button>
      </div>

      {/* End address */}
      <div className="flex gap-1">
        <AddressAutocomplete
          placeholder="End address"
          value={endAddress}
          onChange={onEndChange}
          className={`flex-1 min-w-0 rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${pickingFor === "end" ? "border-blue-400 ring-2 ring-blue-200" : "border-gray-300"}`}
          required
        />
        <button
          type="button"
          onClick={onPickEnd}
          title="Pick end from map"
          className={`shrink-0 rounded-lg border px-2 py-1.5 transition-colors ${pickingFor === "end" ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-500 hover:bg-gray-50"}`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || selectedCount === 0}
        className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Generating…" : "Generate Route"}
      </button>

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors text-center"
        >
          Open in Google Maps ↗
        </a>
      )}

      {onClearRoute && (
        <button
          type="button"
          onClick={onClearRoute}
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Clear route
        </button>
      )}
    </form>
  );
}
