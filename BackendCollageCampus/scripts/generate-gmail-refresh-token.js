/**
 * Run: node scripts/generate-gmail-refresh-token.js
 * Opens browser OAuth flow and prints a refresh token for Gmail SMTP.
 *
 * Prerequisites:
 * 1. Google Cloud Console → OAuth 2.0 Client (Web application)
 * 2. Add redirect URI: http://localhost:3001/oauth2callback
 * 3. OAuth consent screen → add your Gmail as a test user (if app is in Testing)
 */
require("dotenv").config();
const http = require("http");
const { URL } = require("url");
const { google } = require("googleapis");

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3001/oauth2callback";
const SCOPES = ["https://mail.google.com/"];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env first.");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost:3001");
    if (url.pathname !== "/oauth2callback") {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const code = url.searchParams.get("code");
    if (!code) {
      res.writeHead(400);
      res.end("Missing code");
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    let gmailUser = process.env.GMAIL_USER;
    if (!gmailUser) {
      try {
        const gmail = google.gmail({ version: "v1", auth: oauth2Client });
        const profile = await gmail.users.getProfile({ userId: "me" });
        gmailUser = profile.data.emailAddress;
      } catch {
        gmailUser = "(enable Gmail API or set GMAIL_USER manually)";
      }
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Success!</h1><p>You can close this tab and check the terminal.</p>");

    console.log("\n✅ OAuth success!\n");
    console.log("GMAIL_USER=" + gmailUser);
    console.log("GMAIL_REFRESH_TOKEN=" + tokens.refresh_token);
    console.log("\nAdd both to .env and Firebase secrets, then redeploy functions.\n");

    server.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end("OAuth failed — see terminal");
  }
});

server.listen(3001, () => {
  console.log("Open this URL in your browser to authorize Gmail:\n");
  console.log(authUrl);
  console.log("\nWaiting for callback on http://localhost:3001/oauth2callback ...\n");
});
