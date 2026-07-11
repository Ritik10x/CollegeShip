export function truncateChars(text, maxChars) {
  const value = String(text || "");
  if (value.length <= maxChars) return value;
  return value.slice(0, maxChars);
}

export function shouldTruncateChars(text, maxChars) {
  return String(text || "").length > maxChars;
}
