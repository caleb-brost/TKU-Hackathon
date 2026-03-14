"use client";

import Image from "next/image";
import { Ticket } from "@/lib/schemas";
import { getImageUrl } from "@/lib/supabase";
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
    <tr
      className={`cursor-pointer transition-colors ${
        selected ? "bg-blue-50" : "bg-white hover:bg-gray-50"
      }`}
      onClick={() => router.push(`/tickets/${ticket.id}`)}
    >
      <td className="px-3 py-2 text-sm font-medium capitalize text-gray-900">
        {ticket.type}
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_BADGE[ticket.severity]}`}>
          {ticket.severity}
        </span>
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[ticket.status]}`}>
          {ticket.status}
        </span>
      </td>
      <td className="px-3 py-2 text-sm text-gray-600 max-w-xs truncate">
        {ticket.description ?? <span className="text-gray-300">—</span>}
      </td>
      <td className="px-3 py-2 text-xs text-gray-400 font-mono whitespace-nowrap">
        {ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}
      </td>
      <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap">
        {ticket.confidence != null ? `${(ticket.confidence * 100).toFixed(0)}%` : "—"}
      </td>
      <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap">
        {new Date(ticket.created_at).toLocaleDateString()}
      </td>
      <td className="px-3 py-2">
        {ticket.image_url ? (
          <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 shrink-0">
            <Image
              src={getImageUrl(ticket.image_url)}
              alt="Road issue"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>
      <td
        className="px-3 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(ticket.id)}
          className="h-4 w-4 accent-blue-600 cursor-pointer"
        />
      </td>
    </tr>
  );
}
