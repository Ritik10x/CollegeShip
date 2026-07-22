/**
 * Gmail OAuth2 mailer for CollegeShip application confirmations.
 */
const nodemailer = require("nodemailer");

function getGoogle() {
  return require("googleapis").google;
}
function buildOAuthClient(clientId, clientSecret, refreshToken) {
  const { google } = require("googleapis");
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

function buildApplicationEmailContent({ userName, userEmail, course, universityName, senderEmail }) {
  const year = new Date().getFullYear();
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const subject = `Application Submitted - ${universityName || "College"}`;
  const text = `Dear ${userName || "Student"},

Thank you for submitting your application through CollegeShip. We are pleased to confirm that your inquiry has been successfully received by the admissions office.

Application Details:
- Institution: ${universityName || "Selected College"}
- Course: ${course || "Selected Course"}
- Applicant Name: ${userName || "N/A"}
- Status: Applied
- Date: ${dateStr}

You can track real-time application status updates from your CollegeShip Student Dashboard.

Best regards,
CollegeShip Team`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received - CollegeShip</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e1ecf7;">
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #002D62 0%, #002147 100%); padding: 40px; color: #ffffff;">
              <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.25em; text-transform: uppercase; color: #C5A059;">Admissions Portal</span>
              <h1 style="margin: 8px 0 0; font-size: 28px; font-weight: 800; color: #ffffff;">Application Received</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin-top: 0; color: #1f2937; font-size: 16px;">Dear <strong>${userName || "Student"}</strong>,</p>
              <p style="color: #4b5563;">Thank you for submitting your application through <strong>CollegeShip</strong>. Your inquiry has been successfully received.</p>
              <table width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0;">
                <tr><td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;"><span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8;">Institution</span><br><span style="font-size: 16px; font-weight: 700; color: #002D62;">${universityName || "Selected College"}</span></td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8;">Course</span><br><span style="font-size: 14px; font-weight: 600; color: #334155;">${course || "Selected Course"}</span></td></tr>
                <tr><td style="padding-top: 12px;"><span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8;">Status</span><br><span style="font-size: 12px; font-weight: 700; color: #C5A059;">Applied</span> &nbsp;·&nbsp; <span style="font-size: 13px; color: #334155;">${dateStr}</span></td></tr>
              </table>
              <p style="text-align: center;"><a href="https://collageship.web.app/dashboard/applications" style="background-color: #002D62; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 16px 32px; border-radius: 14px; display: inline-block;">Go to Dashboard →</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 40px; background-color: #fafbfc; color: #94a3b8; font-size: 11px; text-align: center;">
              <p style="margin: 0 0 8px; font-weight: 700; text-transform: uppercase; color: #64748b;">CollegeShip</p>
              <p style="margin: 0;">© ${year} CollegeShip. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const fromAddress = senderEmail || "noreply@collageship.com";

  return {
    from: `"CollegeShip" <${fromAddress}>`,
    to: userEmail,
    replyTo: fromAddress,
    subject,
    text,
    html,
  };
}

function buildApplicationStatusEmailContent({ userName, userEmail, course, universityName, senderEmail, status }) {
  const year = new Date().getFullYear();
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isAccepted = status === 'Accepted';
  const subject = `Application ${status} - ${universityName || "College"}`;
  
  const statusColor = isAccepted ? "#10b981" : "#ef4444"; // green vs red
  const headerGradient = isAccepted ? "linear-gradient(135deg, #047857 0%, #064e3b 100%)" : "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)";
  
  const textMsg = isAccepted 
    ? "Congratulations! We are pleased to inform you that your application has been accepted."
    : "We regret to inform you that your application could not be accepted at this time.";

  const text = `Dear ${userName || "Student"},

${textMsg}

Application Details:
- Institution: ${universityName || "Selected College"}
- Course: ${course || "Selected Course"}
- Applicant Name: ${userName || "N/A"}
- Status: ${status}
- Date: ${dateStr}

${isAccepted ? "Our team will reach out to you shortly with the next steps." : "Thank you for your interest and we wish you the best in your future endeavors."}

Best regards,
CollegeShip Team`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application ${status} - CollegeShip</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f9fc;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e1ecf7;">
          <tr>
            <td align="center" style="background: ${headerGradient}; padding: 40px; color: #ffffff;">
              <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.25em; text-transform: uppercase; color: #f8fafc;">Admissions Portal</span>
              <h1 style="margin: 8px 0 0; font-size: 28px; font-weight: 800; color: #ffffff;">Application ${status}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin-top: 0; color: #1f2937; font-size: 16px;">Dear <strong>${userName || "Student"}</strong>,</p>
              <p style="color: #4b5563;">${textMsg}</p>
              <table width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0;">
                <tr><td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;"><span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8;">Institution</span><br><span style="font-size: 16px; font-weight: 700; color: #002D62;">${universityName || "Selected College"}</span></td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8;">Course</span><br><span style="font-size: 14px; font-weight: 600; color: #334155;">${course || "Selected Course"}</span></td></tr>
                <tr><td style="padding-top: 12px;"><span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8;">Status</span><br><span style="font-size: 12px; font-weight: 700; color: ${statusColor};">${status}</span> &nbsp;·&nbsp; <span style="font-size: 13px; color: #334155;">${dateStr}</span></td></tr>
              </table>
              ${isAccepted ? '<p style="color: #4b5563; font-weight: 600;">Our team will reach out to you shortly with the next steps.</p>' : ''}
              <p style="text-align: center; margin-top: 24px;"><a href="https://collageship.web.app/dashboard/applications" style="background-color: #002D62; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 16px 32px; border-radius: 14px; display: inline-block;">View in Dashboard →</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px 40px; background-color: #fafbfc; color: #94a3b8; font-size: 11px; text-align: center;">
              <p style="margin: 0 0 8px; font-weight: 700; text-transform: uppercase; color: #64748b;">CollegeShip</p>
              <p style="margin: 0;">© ${year} CollegeShip. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const fromAddress = senderEmail || "noreply@collageship.com";

  return {
    from: `"CollegeShip" <${fromAddress}>`,
    to: userEmail,
    replyTo: fromAddress,
    subject,
    text,
    html,
  };
}

function encodeGmailRawMessage({ from, to, replyTo, subject, text, html }) {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Reply-To: ${replyTo || from}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    html || text,
  ];

  return Buffer.from(lines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function resolveSenderEmail(oauth2Client, explicitUser) {
  if (explicitUser) return explicitUser;

  try {
    const gmail = getGoogle().gmail({ version: "v1", auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: "me" });
    if (profile.data.emailAddress) return profile.data.emailAddress;
  } catch (err) {
    console.warn("Gmail profile lookup failed:", err.message);
  }

  return null;
}

async function sendViaGmailApi(oauth2Client, mailOptions) {
  const gmail = getGoogle().gmail({ version: "v1", auth: oauth2Client });
  const raw = encodeGmailRawMessage(mailOptions);
  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}

async function sendViaSmtp(credentials, mailOptions) {
  const oauth2Client = buildOAuthClient(
    credentials.clientId,
    credentials.clientSecret,
    credentials.refreshToken
  );

  const senderEmail =
    credentials.user || (await resolveSenderEmail(oauth2Client, credentials.user));

  if (!senderEmail) {
    throw new Error(
      "GMAIL_USER is required for SMTP — set it to the Gmail address that owns the refresh token"
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: senderEmail,
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      refreshToken: credentials.refreshToken,
      accessToken: async () => {
        const { token } = await oauth2Client.getAccessToken();
        if (!token) throw new Error("Failed to obtain Gmail access token");
        return token;
      },
    },
  });

  await transporter.sendMail({ ...mailOptions, from: `"CollegeShip" <${senderEmail}>` });
  return senderEmail;
}

async function sendApplicationConfirmationEmail(credentials, application) {
  const clientId = credentials.clientId?.trim();
  const clientSecret = credentials.clientSecret?.trim();
  const refreshToken = credentials.refreshToken?.trim();
  const user = credentials.user?.trim();

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Gmail OAuth credentials are not configured");
  }

  const oauth2Client = buildOAuthClient(clientId, clientSecret, refreshToken);
  const senderEmail = (await resolveSenderEmail(oauth2Client, user)) || user || "noreply@collageship.com";
  const mailOptions = buildApplicationEmailContent({ ...application, senderEmail });

  try {
    await sendViaGmailApi(oauth2Client, mailOptions);
    return { senderEmail, method: "gmail-api" };
  } catch (apiErr) {
    console.warn("Gmail API send failed, trying SMTP:", apiErr.message);
    const smtpSender = await sendViaSmtp(
      { clientId, clientSecret, refreshToken, user },
      mailOptions
    );
    return { senderEmail: smtpSender, method: "smtp" };
  }
}

async function sendApplicationStatusEmail(credentials, application, status) {
  const clientId = credentials.clientId?.trim();
  const clientSecret = credentials.clientSecret?.trim();
  const refreshToken = credentials.refreshToken?.trim();
  const user = credentials.user?.trim();

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Gmail OAuth credentials are not configured");
  }

  const oauth2Client = buildOAuthClient(clientId, clientSecret, refreshToken);
  const senderEmail = (await resolveSenderEmail(oauth2Client, user)) || user || "noreply@collageship.com";
  const mailOptions = buildApplicationStatusEmailContent({ ...application, senderEmail, status });

  try {
    await sendViaGmailApi(oauth2Client, mailOptions);
    return { senderEmail, method: "gmail-api" };
  } catch (apiErr) {
    console.warn("Gmail API send failed, trying SMTP:", apiErr.message);
    const smtpSender = await sendViaSmtp(
      { clientId, clientSecret, refreshToken, user },
      mailOptions
    );
    return { senderEmail: smtpSender, method: "smtp" };
  }
}

module.exports = {
  sendApplicationConfirmationEmail,
  buildApplicationEmailContent,
  sendApplicationStatusEmail,
  buildApplicationStatusEmailContent,
};
