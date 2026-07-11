export function hasMapCoordinates(location) {
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);
  return (
    Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)
  );
}
export function getCollegeDisplayAddress(location) {
  return (
    location?.displayAddress?.trim() ||
    location?.formattedAddress?.trim() ||
    location?.city?.trim() ||
    ""
  );
}
export function getCollegeMapAddress(location) {
  return (
    location?.mapAddress?.trim() ||
    location?.formattedAddress?.trim() ||
    location?.displayAddress?.trim() ||
    location?.city?.trim() ||
    ""
  );
}
export function getGoogleMapsOpenUrl(location) {
  if (hasMapCoordinates(location)) {
    const lat = Number(location.lat);
    const lng = Number(location.lng);
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const address = getCollegeMapAddress(location);
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  return null;
}
export function getGoogleMapsEmbedUrl(location) {
  if (hasMapCoordinates(location)) {
    const lat = Number(location.lat);
    const lng = Number(location.lng);
    return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
  }
  const address = getCollegeMapAddress(location);
  if (address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&hl=en&z=15&output=embed`;
  }
  return null;
}
export function getStoragePathFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const match = decodeURIComponent(url).match(/\/o\/(.+?)(?:\?|$)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
