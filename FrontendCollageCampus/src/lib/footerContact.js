export function truncateFooterPreview(text, maxLength = 34) {
  const value = String(text || "").trim();
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}…`;
}

export function shouldTruncateFooterPreview(text, maxLength = 34) {
  return String(text || "").trim().length > maxLength;
}
