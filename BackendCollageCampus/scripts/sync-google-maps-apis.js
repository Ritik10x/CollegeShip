const path = require("path");
const { GoogleAuth } = require("google-auth-library");

const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");
const serviceAccount = require(serviceAccountPath);
const projectId = serviceAccount.project_id;

const requiredServices = [
  "maps-backend.googleapis.com",
  "places-backend.googleapis.com",
  "geocoding-backend.googleapis.com",
];

async function enableService(client, serviceName) {
  const url = `https://serviceusage.googleapis.com/v1/projects/${projectId}/services/${serviceName}:enable`;

  try {
    await client.request({ url, method: "POST" });
    console.log(`Enabled ${serviceName}`);
  } catch (error) {
    const message = error?.response?.data?.error?.message || error.message || String(error);
    if (/already enabled|Permission denied|403/i.test(message)) {
      console.log(`${serviceName}: ${message}`);
      return;
    }
    throw new Error(`${serviceName}: ${message}`);
  }
}

async function syncGoogleMapsApis() {
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const client = await auth.getClient();

  console.log(`Ensuring Google Maps APIs are enabled for project: ${projectId}`);
  for (const serviceName of requiredServices) {
    await enableService(client, serviceName);
  }

  console.log("");
  console.log("Google Maps setup checklist:");
  console.log("  1. Billing must be enabled on the Google Cloud project.");
  console.log("  2. Browser key must allow Maps JavaScript API, Places API, and Geocoding API.");
  console.log("  3. HTTP referrers should include localhost, collageship.web.app, and *.web.app");
}

syncGoogleMapsApis().catch((error) => {
  console.error("Failed to sync Google Maps APIs:", error.message || error);
  process.exit(1);
});
