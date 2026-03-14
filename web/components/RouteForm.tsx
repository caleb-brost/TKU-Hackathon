"use client";

import { useState } from "react";
import { GenerateRouteInput } from "@/lib/schemas";
import AddressAutocomplete from "@/components/AddressAutocomplete";

interface RouteFormProps {
  selectedCount: number;
  onGenerate: (input: GenerateRouteInput) => Promise<void>;
}

export default function RouteForm({
  selectedCount,
  onGenerate,
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
    <form
      onSubmit={handleSubmit}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 flex flex-col gap-2 w-72"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">Route Planner</span>
        <span className="text-xs text-gray-400">
          {selectedCount} stop{selectedCount !== 1 ? "s" : ""} selected
        </span>
      </div>

      <AddressAutocomplete
        placeholder="Start address"
        value={startAddress}
        onChange={setStartAddress}
        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      <AddressAutocomplete
        placeholder="End address"
        value={endAddress}
        onChange={setEndAddress}
        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || selectedCount === 0}
        className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Generating…" : "Generate Route"}
      </button>
    </form>
  );
}
