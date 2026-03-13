"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Ticket } from "@/lib/schemas";

const MapWidget = dynamic(() => import("@/components/MapWidget"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
      Loading map…
    </div>
  ),
});

const SEVERITY_COLOR: Record<string, string> = {
  low: "text-green-700 bg-green-100",
  medium: "text-yellow-700 bg-yellow-100",
  high: "text-red-700 bg-red-100",
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [completed, setCompleted] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Fetch ticket ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetch(`/api/tickets/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setTicket(json.data);
      })
      .catch(() => setError("Failed to load ticket"))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Submit completion ─────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!completed) {
      setSubmitError("Check the completed box to submit.");
      return;
    }
    if (!employeeId.trim()) {
      setSubmitError("Employee ID is required.");
      return;
    }
    if (!imageFile) {
      setSubmitError("Please upload a completion image.");
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("employee_id", employeeId.trim());
      form.append("completed", "true");
      form.append("completion_image", imageFile);

      const res = await fetch(`/api/tickets/${id}/complete`, {
        method: "PATCH",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submission failed");

      setTicket(json.data);
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading…
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-600">
        <p>{error ?? "Ticket not found."}</p>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-blue-600 underline"
        >
          ← Back to map
        </button>
      </div>
    );
  }

  const isAlreadyComplete = ticket.status === "completed";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/")} className="text-blue-600 text-sm hover:underline">
          ← Back
        </button>
        <h1 className="text-lg font-bold text-gray-900 capitalize">
          {ticket.type} – Ticket Detail
        </h1>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Map */}
        <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <MapWidget
            markers={[{
              lat: ticket.latitude,
              lng: ticket.longitude,
              id: ticket.id,
              severity: ticket.severity,
            }]}
            center={{ lat: ticket.latitude, lng: ticket.longitude }}
            zoom={16}
          />
        </div>

        {/* Issue image */}
        {ticket.image_url && (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <Image
              src={ticket.image_url}
              alt="Road issue"
              width={800}
              height={400}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Ticket info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <h2 className="font-semibold text-gray-800">Ticket Information</h2>
          <InfoRow label="ID" value={ticket.id} mono />
          <InfoRow label="Type" value={ticket.type} capitalize />
          <InfoRow
            label="Severity"
            value={
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLOR[ticket.severity]}`}>
                {ticket.severity}
              </span>
            }
          />
          <InfoRow label="Status" value={ticket.status} capitalize />
          {ticket.confidence != null && (
            <InfoRow
              label="Confidence"
              value={`${(ticket.confidence * 100).toFixed(1)}%`}
            />
          )}
          <InfoRow
            label="Location"
            value={`${ticket.latitude.toFixed(6)}, ${ticket.longitude.toFixed(6)}`}
            mono
          />
          {ticket.description && (
            <InfoRow label="Description" value={ticket.description} />
          )}
          <InfoRow
            label="Created"
            value={new Date(ticket.created_at).toLocaleString()}
          />
          {isAlreadyComplete && ticket.employee_id && (
            <InfoRow label="Completed by" value={ticket.employee_id} />
          )}
        </div>

        {/* Completion proof image */}
        {isAlreadyComplete && ticket.completion_image_url && (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <p className="text-sm font-medium text-gray-600 px-4 pt-3 pb-1">Completion proof</p>
            <Image
              src={ticket.completion_image_url}
              alt="Completion proof"
              width={800}
              height={400}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Completion form */}
        {submitSuccess ? (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
            <p className="text-green-700 font-medium">Ticket marked as completed!</p>
            <button onClick={() => router.push("/")} className="mt-2 text-sm text-blue-600 underline">
              Back to map
            </button>
          </div>
        ) : !isAlreadyComplete ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
          >
            <h2 className="font-semibold text-gray-800">Complete Ticket</h2>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              <span className="text-sm text-gray-700">Mark as completed</span>
            </label>

            <input
              type="text"
              placeholder="Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Upload completion photo
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="text-sm text-gray-600"
              />
              {imageFile && (
                <p className="text-xs text-gray-400 mt-1">{imageFile.name}</p>
              )}
            </div>

            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Submitting…" : "Submit Completion"}
            </button>
          </form>
        ) : (
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center text-sm text-gray-500">
            This ticket has already been completed.
          </div>
        )}
      </div>
    </main>
  );
}

// ── Small helper ─────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex justify-between items-start gap-2 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span
        className={`text-gray-800 text-right ${mono ? "font-mono text-xs" : ""} ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
