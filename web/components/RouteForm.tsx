"use client";

import { useState } from "react";
import { GenerateRouteInput } from "@/lib/schemas";
import AddressAutocomplete from "@/components/AddressAutocomplete";

interface RouteFormProps {
  selectedCount: number;
  onGenerate: (input: GenerateRouteInput) => Promise<void>;
  mapsUrl?: string;
}

export default function RouteForm({
  selectedCount,
  onGenerate,
  mapsUrl,
}: RouteFormProps) {
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onGenerate({
        selected_ticket_ids: [], // filled by parent
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <h2 className="font-semibold text-gray-800">Generate Route</h2>

      <p className="text-sm text-gray-500">
        {selectedCount} ticket{selectedCount !== 1 ? "s" : ""} selected
      </p>

      <AddressAutocomplete
        placeholder="Start address"
        value={startAddress}
        onChange={setStartAddress}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      <AddressAutocomplete
        placeholder="End address"
        value={endAddress}
        onChange={setEndAddress}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || selectedCount === 0}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Generating…" : "Generate Route"}
      </button>

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-blue-600 underline"
        >
          Open in Google Maps ↗
        </a>
      )}
    </form>
  );
}
