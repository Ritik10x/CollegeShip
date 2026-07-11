require('dotenv').config();
const { sendApplicationConfirmationEmail } = require('./functions/utils/gmailMailer');

async function test() {
  const to = process.env.GMAIL_USER || process.argv[2];
  if (!to) {
    console.error('Usage: node test-email.js [recipient@gmail.com]');
    process.exit(1);
  }

  try {
    await sendApplicationConfirmationEmail(
      {
        clientId: process.env.GMAIL_CLIENT_ID?.trim(),
        clientSecret: process.env.GMAIL_CLIENT_SECRET?.trim(),
        refreshToken: process.env.GMAIL_REFRESH_TOKEN?.trim(),
        user: process.env.GMAIL_USER?.trim(),
      },
      {
        userName: 'Test Student',
        userEmail: to,
        course: 'Computer Science',
        universityName: 'Test University',
      }
    );
    console.log('Confirmation email sent to', to);
  } catch (err) {
    console.error('FAILED:', err.message);
    process.exit(1);
  }
}

test();
