"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Ticket } from "@/lib/schemas";
import { getImageUrl } from "@/lib/supabase";

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
  const leftColRef = useRef<HTMLDivElement>(null);
  const [leftColHeight, setLeftColHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!leftColRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setLeftColHeight(entry.contentRect.height);
    });
    observer.observe(leftColRef.current);
    return () => observer.disconnect();
  }, []);

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

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  return (
    <APIProvider apiKey={apiKey}>
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

      <div className="max-w-7xl mx-auto p-4 space-y-4">

        {/* Map */}
        <div className="flex gap-4 h-96 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <MapWidget
            markers={[{ lat: ticket.latitude, lng: ticket.longitude, id: ticket.id, severity: ticket.severity }]}
            center={{ lat: ticket.latitude, lng: ticket.longitude }}
            zoom={16}
          />
        </div>

        {/* Bottom row: left column (info + completion) | right (image) */}
        <div className="flex gap-4 items-stretch">

          {/* Left column: info widget + completion form/status */}
          <div ref={leftColRef} className="w-96 shrink-0 flex flex-col gap-4">

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
                <InfoRow label="Confidence" value={`${(ticket.confidence * 100).toFixed(1)}%`} />
              )}
              <InfoRow label="Location" value={`${ticket.latitude.toFixed(6)}, ${ticket.longitude.toFixed(6)}`} mono />
              {ticket.description && <InfoRow label="Description" value={ticket.description} />}
              <InfoRow label="Created" value={new Date(ticket.created_at).toLocaleString()} />
              {isAlreadyComplete && ticket.employee_id && (
                <InfoRow label="Completed by" value={ticket.employee_id} />
              )}
            </div>

            {/* Completion form (new tickets only) */}
            {!isAlreadyComplete && (
              submitSuccess ? (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
                  <p className="text-green-700 font-medium">Ticket marked as completed!</p>
                  <button onClick={() => router.push("/")} className="mt-2 text-sm text-blue-600 underline">Back to map</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                  <h2 className="font-semibold text-gray-800">Complete Ticket</h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} className="h-4 w-4 accent-blue-600" />
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
                    <label className="block text-sm text-gray-600 mb-1">Upload completion photo</label>
                    <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className="text-sm text-gray-600" />
                    {imageFile && <p className="text-xs text-gray-400 mt-1">{imageFile.name}</p>}
                  </div>
                  {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                  <button type="submit" disabled={submitting} className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {submitting ? "Submitting…" : "Submit Completion"}
                  </button>
                </form>
              )
            )}

          </div>

          {/* Right: image viewer — height locked to left column */}
          <div className="flex-1 h-[565px]" style={leftColHeight ? { height: leftColHeight } : undefined}>
            {isAlreadyComplete ? (
              <div className="h-full flex flex-col">
                <ImageViewer
                  beforeUrl={ticket.image_url ? getImageUrl(ticket.image_url) : null}
                  afterUrl={ticket.completion_image_url ?? null}
                />
              </div>
            ) : (
              <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="flex border-b border-gray-200">
                  <span className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-500">Issue Image</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  {ticket.image_url ? (
                    <Image src={getImageUrl(ticket.image_url)} alt="Issue" width={900} height={600} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">No image</div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
    </APIProvider>
  );
}

// ── Image viewer with Before / After / Compare tabs ──────────────────────────

function ImageViewer({ beforeUrl, afterUrl }: { beforeUrl: string | null; afterUrl: string | null }) {
  const tabs = useMemo(() => {
    const t: string[] = [];
    if (beforeUrl) t.push("Before");
    if (afterUrl) t.push("After");
    if (beforeUrl && afterUrl) t.push("Compare");
    return t;
  }, [beforeUrl, afterUrl]);

  const [activeTab, setActiveTab] = useState(tabs[0] ?? "Before");

  if (tabs.length === 0) {
    return (
      <div className="flex-1 rounded-xl border border-dashed border-gray-200 h-64 flex items-center justify-center text-sm text-gray-400">
        No images
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Image area */}
      <div className="relative flex-1 overflow-hidden">
        {activeTab === "Before" && beforeUrl && (
          <Image src={beforeUrl} alt="Before" width={900} height={500} className="w-full h-full object-cover" />
        )}
        {activeTab === "After" && afterUrl && (
          <Image src={afterUrl} alt="After" width={900} height={500} className="w-full h-full object-cover" />
        )}
        {activeTab === "Compare" && beforeUrl && afterUrl && (
          <div className="flex gap-0.5 h-full">
            <div className="flex-1 relative">
              <span className="absolute top-2 left-2 z-10 bg-black/50 text-white text-xs px-2 py-0.5 rounded">Before</span>
              <Image src={beforeUrl} alt="Before" width={450} height={400} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 relative">
              <span className="absolute top-2 left-2 z-10 bg-black/50 text-white text-xs px-2 py-0.5 rounded">After</span>
              <Image src={afterUrl} alt="After" width={450} height={400} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </div>
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
