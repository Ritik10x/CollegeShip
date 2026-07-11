export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function apiUrl(path) {
  if (!path) return "";

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function resolveAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("blob:")) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  if (cleanPath.startsWith("college/")) {
    return `https://college-campus.s3.ap-south-1.amazonaws.com/${cleanPath}`;
  }

  return apiUrl(cleanPath);
}
