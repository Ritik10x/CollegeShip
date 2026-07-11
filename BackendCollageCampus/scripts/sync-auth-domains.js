const path = require("path");
const { GoogleAuth } = require("google-auth-library");

const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");
const serviceAccount = require(serviceAccountPath);
const projectId = serviceAccount.project_id;

const requiredDomains = [
  "localhost",
  "127.0.0.1",
  "collage-campus1.firebaseapp.com",
  "collage-campus1.web.app",
  "collageship.web.app",
];

async function syncAuthorizedDomains() {
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const client = await auth.getClient();
  const configUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`;

  const currentConfig = await client.request({ url: configUrl, method: "GET" });
  const currentDomains = currentConfig.data.authorizedDomains || [];
  const mergedDomains = [...new Set([...currentDomains, ...requiredDomains])];

  if (mergedDomains.length === currentDomains.length) {
    console.log("Authorized domains already include all required entries:");
    mergedDomains.forEach((domain) => console.log(`  - ${domain}`));
    return mergedDomains;
  }

  await client.request({
    url: `${configUrl}?updateMask=authorizedDomains`,
    method: "PATCH",
    data: { authorizedDomains: mergedDomains },
  });

  console.log("Updated Firebase Auth authorized domains:");
  mergedDomains.forEach((domain) => console.log(`  - ${domain}`));
  return mergedDomains;
}

syncAuthorizedDomains().catch((error) => {
  console.error("Failed to sync authorized domains:", error.message || error);
  process.exit(1);
});
