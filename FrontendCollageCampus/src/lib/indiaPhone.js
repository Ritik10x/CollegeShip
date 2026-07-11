export const INDIA_COUNTRY_CODE = "+91";

export function extractIndiaMobileNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length >= 12 && digits.startsWith("91")) {
    return digits.slice(-10);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits.slice(0, 10);
}

export function formatIndiaPhoneDisplay(phone) {
  const mobile = extractIndiaMobileNumber(phone);
  return mobile ? `${INDIA_COUNTRY_CODE} ${mobile}` : INDIA_COUNTRY_CODE;
}

export function formatIndiaPhoneStorage(mobile10) {
  return `${INDIA_COUNTRY_CODE}${mobile10}`;
}

export function formatIndiaPhoneTel(phone) {
  const mobile = extractIndiaMobileNumber(phone);
  return mobile ? `${INDIA_COUNTRY_CODE}${mobile}` : "";
}
