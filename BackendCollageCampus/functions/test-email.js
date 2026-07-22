require("dotenv").config();
const { sendApplicationConfirmationEmail } = require("./utils/gmailMailer");

async function test() {
  console.log("Testing email with:");
  console.log("CLIENT_ID:", process.env.GMAIL_CLIENT_ID ? "Loaded" : "Missing");
  console.log("CLIENT_SECRET:", process.env.GMAIL_CLIENT_SECRET ? "Loaded" : "Missing");
  console.log("REFRESH_TOKEN:", process.env.GMAIL_REFRESH_TOKEN ? "Loaded" : "Missing");
  console.log("USER:", process.env.GMAIL_USER);

  try {
    const res = await sendApplicationConfirmationEmail({
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      user: process.env.GMAIL_USER
    }, {
      userName: "Test User",
      userEmail: "collageship007@gmail.com", // Sending to self for test
      course: "Test Course",
      universityName: "Test University"
    });
    console.log("Email sent successfully!", res);
  } catch (e) {
    console.error("Email failed:", e);
  }
}

test();
