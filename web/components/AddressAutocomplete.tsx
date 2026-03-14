"use client";

import { useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface AddressAutocompleteProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}

export default function AddressAutocomplete({
  placeholder,
  value,
  onChange,
  className,
  required,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!places || !inputRef.current) return;

    // Bias/restrict suggestions to the greater Edmonton area
    const edmontonBounds = new google.maps.LatLngBounds(
      { lat: 53.3, lng: -114.0 }, // SW corner
      { lat: 53.9, lng: -113.1 }  // NE corner
    );

    const autocomplete = new places.Autocomplete(inputRef.current, {
      types: ["address"],
      fields: ["formatted_address"],
      bounds: edmontonBounds,
      strictBounds: true,
    });

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onChangeRef.current(place.formatted_address);
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [places]); // only re-run when the Places library loads

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      defaultValue={value}
      className={className}
      required={required}
    />
  );
}
