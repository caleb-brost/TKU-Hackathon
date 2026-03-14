"use client";

/**
 * MapWidget – reusable Google Maps component.
 * Used on the main page (all pins) and on the ticket detail page (single pin).
 */

import { useEffect } from "react";
import {
  Map,
  AdvancedMarker,
  Pin,
  useMap,
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
  onMarkerClick?: (id: string) => void;
  directionsResult?: google.maps.DirectionsResult | null;
  onMapClick?: (lat: number, lng: number) => void;
  pickMode?: boolean;
}

const SEVERITY_COLOR: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

const EDMONTON = { lat: 53.5461, lng: -113.4938 };

function RouteRenderer({ result }: { result: google.maps.DirectionsResult }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const renderer = new google.maps.DirectionsRenderer({ suppressMarkers: false });
    renderer.setMap(map);
    renderer.setDirections(result);
    return () => renderer.setMap(null);
  }, [map, result]);

  return null;
}

function BoundsFitter({ markers }: { markers: MarkerData[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (markers.length === 0) {
      map.setCenter(EDMONTON);
      map.setZoom(11);
      return;
    }

    if (markers.length === 1) {
      map.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
      map.setZoom(15);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
    map.fitBounds(bounds, 60);
  }, [map, markers]);

  return null;
}

export default function MapWidget({
  markers,
  center,
  zoom = 13,
  onMarkerClick,
  directionsResult,
  onMapClick,
  pickMode,
}: MapWidgetProps) {
  const defaultCenter = center ?? EDMONTON;

  return (
    <Map
      style={{ width: "100%", height: "100%", cursor: pickMode ? "crosshair" : undefined }}
      defaultCenter={defaultCenter}
      defaultZoom={zoom}
      mapId="road-damage-map"
      disableDefaultUI={false}
      onClick={pickMode && onMapClick ? (e) => {
        if (e.detail.latLng) onMapClick(e.detail.latLng.lat, e.detail.latLng.lng);
      } : undefined}
    >
      {directionsResult ? (
        <RouteRenderer result={directionsResult} />
      ) : (
        <>
          <BoundsFitter markers={markers} />
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
        </>
      )}
    </Map>
  );
}
