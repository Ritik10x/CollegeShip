import { useEffect, useMemo, useState, useId } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaCrosshairs, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;
const PINNED_ZOOM = 16;
const pinIcon = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;background:#002D62;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});
function MapClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}
function MapViewSync({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, map, zoom]);
  return null;
}
async function geocodeWithNominatim(query) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) {
    throw new Error("Could not search for that address.");
  }
  const results = await response.json();
  if (!results.length) {
    return null;
  }
  return { lat: Number(results[0].lat), lng: Number(results[0].lon) };
}
async function geocodeWithGoogle(query, apiKey) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`,
  );
  const data = await response.json();
  if (data.status !== "OK" || !data.results?.length) {
    return null;
  }
  const location = data.results[0].geometry.location;
  return { lat: Number(location.lat), lng: Number(location.lng) };
}
export default function LeafletLocationPicker({
  location,
  onChange,
  searchQuery = "",
  googleApiKey = "",
  notice = "",
}) {
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const mapInstanceId = useId();
  useEffect(() => {
    setMapReady(true);
    return () => setMapReady(false);
  }, []);
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);
  const hasPin =
    Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
  const mapCenter = useMemo(
    () => (hasPin ? [lat, lng] : DEFAULT_CENTER),
    [hasPin, lat, lng],
  );
  const mapZoom = hasPin ? PINNED_ZOOM : DEFAULT_ZOOM;
  const handlePick = (nextLat, nextLng) => {
    onChange({
      ...location,
      lat: Number(nextLat.toFixed(6)),
      lng: Number(nextLng.toFixed(6)),
    });
    setSearchError("");
  };
  const handleSearchAddress = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchError("Enter a city or formatted address first.");
      return;
    }
    setSearching(true);
    setSearchError("");
    try {
      let result = null;
      if (googleApiKey) {
        result = await geocodeWithGoogle(query, googleApiKey);
      }
      if (!result) {
        result = await geocodeWithNominatim(query);
      }
      if (!result) {
        setSearchError(
          "No location found. Try a more specific address or click the map.",
        );
        return;
      }
      handlePick(result.lat, result.lng);
    } catch (error) {
      setSearchError(error.message || "Could not search for that address.");
    } finally {
      setSearching(false);
    }
  };
  const handleClearPin = () => {
    onChange({ ...location, lat: null, lng: null });
    setSearchError("");
  };
  return (
    <div className="space-y-3">
      {" "}
      {notice && (
        <div className="rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          {" "}
          {notice}{" "}
        </div>
      )}{" "}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {" "}
        <div>
          {" "}
          <p className="text-xs font-bold text-text-main flex items-center gap-2">
            {" "}
            <FaMapMarkerAlt className="text-primary" /> Pin location on map{" "}
          </p>{" "}
          <p className="text-[11px] text-text-muted mt-1">
            {" "}
            Click the map to drop a pin, search your address, or drag the marker
            to adjust.{" "}
          </p>{" "}
        </div>{" "}
        <div className="flex flex-wrap gap-2">
          {" "}
          <button
            type="button"
            onClick={handleSearchAddress}
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
      <div className="overflow-hidden rounded-card border border-brand-border [&_.leaflet-container]:z-0">
        {" "}
        {mapReady ? (
          <MapContainer
            key={mapInstanceId}
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom
            className="h-[320px] w-full"
          >
            {" "}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />{" "}
            <MapClickHandler onPick={handlePick} />{" "}
            <MapViewSync center={mapCenter} zoom={mapZoom} />{" "}
            {hasPin && (
              <Marker
                position={[lat, lng]}
                icon={pinIcon}
                draggable
                eventHandlers={{
                  dragend: (event) => {
                    const marker = event.target;
                    const markerPosition = marker.getLatLng();
                    handlePick(markerPosition.lat, markerPosition.lng);
                  },
                }}
              />
            )}{" "}
          </MapContainer>
        ) : (
          <div className="flex h-[320px] items-center justify-center bg-brand-bg text-sm text-text-muted">
            Loading map...
          </div>
        )}{" "}
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
            Preview in Google Maps{" "}
          </a>
        )}{" "}
      </div>{" "}
      {searchError && (
        <p className="text-xs font-medium text-[#B3261E]">{searchError}</p>
      )}{" "}
    </div>
  );
}
