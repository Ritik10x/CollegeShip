import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { FaCrosshairs, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import {
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_LIBRARIES,
} from "../lib/googleMapsConfig";
import LeafletLocationPicker from "./LeafletLocationPicker";
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 5;
const PINNED_ZOOM = 16;
const mapContainerStyle = { width: "100%", height: "320px" };
function hasValidPin(location) {
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);
  return (
    Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)
  );
}
function GoogleMapRuntimeErrorDetector({ onError }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (document.querySelector(".gm-err-container")) {
        onError();
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [onError]);
  return null;
}
function GoogleLocationPicker({
  location,
  onChange,
  searchQuery,
  onRuntimeError,
}) {
  const autocompleteRef = useRef(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);
  const hasPin = hasValidPin(location);
  const mapCenter = useMemo(
    () => (hasPin ? { lat, lng } : DEFAULT_CENTER),
    [hasPin, lat, lng],
  );
  const mapZoom = hasPin ? PINNED_ZOOM : DEFAULT_ZOOM;
  const handlePick = useCallback(
    (nextLat, nextLng) => {
      onChange({
        ...location,
        lat: Number(nextLat.toFixed(6)),
        lng: Number(nextLng.toFixed(6)),
      });
      setSearchError("");
    },
    [location, onChange],
  );
  const handleMapClick = useCallback(
    (event) => {
      if (event.latLng) {
        handlePick(event.latLng.lat(), event.latLng.lng());
      }
    },
    [handlePick],
  );
  const handleMarkerDragEnd = useCallback(
    (event) => {
      if (event.latLng) {
        handlePick(event.latLng.lat(), event.latLng.lng());
      }
    },
    [handlePick],
  );
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    const placeLocation = place?.geometry?.location;
    if (!placeLocation) {
      setSearchError("Select a place from the Google Maps suggestions.");
      return;
    }
    handlePick(placeLocation.lat(), placeLocation.lng());
  };
  const handleFindOnMap = () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchError("Enter a city or formatted address first.");
      return;
    }
    if (!window.google?.maps?.Geocoder) {
      setSearchError("Google Maps is still loading. Please try again.");
      return;
    }
    setSearching(true);
    setSearchError("");
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: query }, (results, status) => {
      setSearching(false);
      if (status === "OK" && results?.[0]?.geometry?.location) {
        const resultLocation = results[0].geometry.location;
        handlePick(resultLocation.lat(), resultLocation.lng);
        return;
      }
      setSearchError(
        "Google Maps could not find that location. Try the search box or click the map.",
      );
    });
  };
  const handleClearPin = () => {
    onChange({ ...location, lat: null, lng: null });
    setSearchError("");
  };
  return (
    <div className="space-y-3">
      {" "}
      <div className="flex flex-col gap-3">
        {" "}
        <div>
          {" "}
          <p className="text-xs font-bold text-text-main flex items-center gap-2">
            {" "}
            <FaMapMarkerAlt className="text-primary" /> Pin location on Google
            Maps{" "}
          </p>{" "}
          <p className="text-[11px] text-text-muted mt-1">
            {" "}
            Search a place, click the map, or drag the pin to set the exact
            college location.{" "}
          </p>{" "}
        </div>{" "}
        <Autocomplete
          onLoad={(autocomplete) => {
            autocompleteRef.current = autocomplete;
          }}
          onPlaceChanged={handlePlaceChanged}
        >
          {" "}
          <input
            type="text"
            placeholder="Search college, address, or landmark on Google Maps..."
            className="w-full rounded-card border border-brand-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
          />{" "}
        </Autocomplete>{" "}
        <div className="flex flex-wrap gap-2">
          {" "}
          <button
            type="button"
            onClick={handleFindOnMap}
            disabled={searching}
            className="inline-flex items-center gap-2 rounded-card border border-primary px-3 py-2 text-xs font-bold text-primary hover:bg-brand-bg/80 transition-colors duration-200 disabled:opacity-60"
          >
            {" "}
            <FaSearch />{" "}
            {searching ? "Searching..." : "Find address on map"}{" "}
          </button>{" "}
          {hasPin && (
            <button
              type="button"
              onClick={handleClearPin}
              className="inline-flex items-center gap-2 rounded-card border border-brand-border px-3 py-2 text-xs font-bold text-text-muted hover:bg-brand-bg/80 transition-colors duration-200"
            >
              {" "}
              Clear pin{" "}
            </button>
          )}{" "}
        </div>{" "}
      </div>{" "}
      <div className="overflow-hidden rounded-card border border-brand-border">
        {" "}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={mapZoom}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {" "}
          <GoogleMapRuntimeErrorDetector onError={onRuntimeError} />{" "}
          {hasPin && (
            <Marker
              position={{ lat, lng }}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          )}{" "}
        </GoogleMap>{" "}
      </div>{" "}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-card bg-background border border-brand-bg px-4 py-3">
        {" "}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {" "}
          <FaCrosshairs className="text-primary" />{" "}
          {hasPin ? (
            <span>
              {" "}
              Pinned at{" "}
              <strong>
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </strong>{" "}
            </span>
          ) : (
            <span>No pin selected yet.</span>
          )}{" "}
        </div>{" "}
        {hasPin && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-primary hover:underline"
          >
            {" "}
            Open in Google Maps{" "}
          </a>
        )}{" "}
      </div>{" "}
      {searchError && (
        <p className="text-xs font-medium text-[#B3261E]">{searchError}</p>
      )}{" "}
    </div>
  );
}
function MapPickerErrorBoundary({ fallback, children }) {
  return (
    <MapPickerErrorBoundaryInner fallback={fallback}>
      {children}
    </MapPickerErrorBoundaryInner>
  );
}

class MapPickerErrorBoundaryInner extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function GoogleMapsLoader({
  location,
  onChange,
  searchQuery,
  onFallback,
  fallbackReason,
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "collageship-google-map-picker",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    if (loadError) {
      onFallback(
        fallbackReason ||
          "Google Maps could not load on this site key, so the built-in map picker is being used instead. Your saved pin still opens in Google Maps on the college page.",
      );
    }
  }, [fallbackReason, loadError, onFallback]);

  if (loadError) {
    return (
      <LeafletLocationPicker
        location={location}
        onChange={onChange}
        searchQuery={searchQuery}
        googleApiKey={GOOGLE_MAPS_API_KEY}
        notice={fallbackReason}
      />
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-card border border-brand-border bg-brand-bg text-sm text-text-muted">
        Loading Google Maps...
      </div>
    );
  }

  return (
    <GoogleLocationPicker
      location={location}
      onChange={onChange}
      searchQuery={searchQuery}
      onRuntimeError={() =>
        onFallback(
          "Google Maps is not enabled for this project API key yet, so the built-in map picker is being used instead. You can still pin the exact location and it will open in Google Maps for students.",
        )
      }
    />
  );
}

export default function LocationMapPicker({
  location,
  onChange,
  searchQuery = "",
}) {
  const [useFallbackMap, setUseFallbackMap] = useState(false);
  const [fallbackReason, setFallbackReason] = useState("");
  const activateFallback = useCallback((reason) => {
    setFallbackReason(reason);
    setUseFallbackMap(true);
  }, []);
  const leafletFallback = (
    <LeafletLocationPicker
      location={location}
      onChange={onChange}
      searchQuery={searchQuery}
      googleApiKey={GOOGLE_MAPS_API_KEY}
      notice={fallbackReason}
    />
  );

  if (useFallbackMap) {
    return leafletFallback;
  }

  return (
    <MapPickerErrorBoundary fallback={leafletFallback}>
      <GoogleMapsLoader
        location={location}
        onChange={onChange}
        searchQuery={searchQuery}
        onFallback={activateFallback}
        fallbackReason={fallbackReason}
      />
    </MapPickerErrorBoundary>
  );
}
