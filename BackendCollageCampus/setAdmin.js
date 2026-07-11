const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setAdmin() {
  const email = 'rickysn10x@gmail.com';
  try {
    await db.collection('admins').doc(email).set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      role: 'admin'
    });
    console.log(`✅ Successfully set ${email} as an admin in Firestore!`);
  } catch (err) {
    console.error('Error setting admin:', err);
  } finally {
    process.exit(0);
  }
}

setAdmin();
