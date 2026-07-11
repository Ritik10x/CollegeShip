const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

/**
 * POST /api/auth/signup
 * Body: { email, password, name }
 * Creates a new Firebase Auth user via Admin SDK.
 * NOTE: In production, signup is usually done on the frontend using
 *       Firebase Client SDK (createUserWithEmailAndPassword).
 *       This server-side route is provided for API-based flows.
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name || '',
    });
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      uid: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName,
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/auth/login
 * NOTE: Firebase Authentication login (sign-in) is handled on the FRONTEND
 *       using the Firebase Client SDK (signInWithEmailAndPassword).
 *       The client receives an ID token which it sends in Authorization headers.
 *       This route is kept as an informational stub only.
 */
router.post('/login', (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      'Login is handled by the Firebase Client SDK on the frontend. ' +
      'Use signInWithEmailAndPassword() and pass the resulting ID token as a Bearer token.',
  });
});

/**
 * GET /api/auth/me  (requires Bearer token in Authorization header)
 * Returns the currently authenticated Firebase user's profile.
 */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userRecord = await admin.auth().getUser(decoded.uid);
    return res.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
      },
    });
  } catch (err) {
    console.error('Auth/me error:', err);
    return res.status(401).json({ success: false, message: 'Unauthorized: ' + err.message });
  }
});

module.exports = router;
