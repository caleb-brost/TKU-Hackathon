"use client";

/**
 * MapWidget – reusable Google Maps component.
 * Used on the main page (all pins) and on the ticket detail page (single pin).
 */

import {
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";

interface MarkerData {
  lat: number;
  lng: number;
  id: string;
  severity?: "low" | "medium" | "high";
  selected?: boolean;
}

interface MapWidgetProps {
  markers: MarkerData[];
  center?: { lat: number; lng: number };
  zoom?: number;
  /** Called when a marker is clicked */
  onMarkerClick?: (id: string) => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

export default function MapWidget({
  markers,
  center,
  zoom = 13,
  onMarkerClick,
}: MapWidgetProps) {
  const defaultCenter =
    center ??
    (markers.length > 0
      ? { lat: markers[0].lat, lng: markers[0].lng }
      : { lat: 53.5461, lng: -113.4938 }); // Default: Edmonton, Alberta

  return (
    <Map
      style={{ width: "100%", height: "100%" }}
      defaultCenter={defaultCenter}
      defaultZoom={zoom}
      mapId="road-damage-map"
      disableDefaultUI={false}
    >
      {markers.map((m) => (
        <AdvancedMarker
          key={m.id}
          position={{ lat: m.lat, lng: m.lng }}
          onClick={() => onMarkerClick?.(m.id)}
        >
          <Pin
            background={m.selected ? "#3b82f6" : (SEVERITY_COLOR[m.severity ?? "low"] ?? "#6b7280")}
            borderColor={m.selected ? "#1d4ed8" : "#fff"}
            glyphColor="#fff"
          />
        </AdvancedMarker>
      ))}
    </Map>
  );
}
