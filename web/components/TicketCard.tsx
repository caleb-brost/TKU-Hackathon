"use client";

import { Ticket } from "@/lib/schemas";
import { useRouter } from "next/navigation";

interface TicketCardProps {
  ticket: Ticket;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}

const SEVERITY_BADGE: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const STATUS_BADGE: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-600",
};

export default function TicketCard({
  ticket,
  selected,
  onToggleSelect,
}: TicketCardProps) {
  const router = useRouter();

  return (
    <div
      className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
      onClick={() => router.push(`/tickets/${ticket.id}`)}
    >
      {/* Checkbox – stops propagation so clicking it doesn't navigate */}
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => {
          e.stopPropagation();
          onToggleSelect(ticket.id);
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-3 right-3 h-4 w-4 accent-blue-600"
      />

      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold capitalize text-sm">{ticket.type}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_BADGE[ticket.severity]}`}
        >
          {ticket.severity}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[ticket.status]}`}
        >
          {ticket.status}
        </span>
      </div>

      {ticket.description && (
        <p className="text-sm text-gray-600 mb-1 line-clamp-2">
          {ticket.description}
        </p>
      )}

      <p className="text-xs text-gray-400">
        {ticket.latitude.toFixed(5)}, {ticket.longitude.toFixed(5)}
      </p>

      {ticket.confidence != null && (
        <p className="text-xs text-gray-400">
          Confidence: {(ticket.confidence * 100).toFixed(0)}%
        </p>
      )}

      <p className="text-xs text-gray-400 mt-1">
        {new Date(ticket.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}
