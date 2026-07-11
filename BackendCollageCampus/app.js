/**
 * app.js — Local development server
 * This mirrors the Firebase Cloud Function (functions/index.js) for local testing.
 * For production, deploy with: cd functions && npm run deploy
 *
 * NOTE: MongoDB has been removed. Auth is handled by Firebase Authentication.
 *       Use the Firebase Emulator Suite for full local emulation:
 *       firebase emulators:start
 */

const express = require('express')
require('dotenv').config()
const cors = require('cors')
const admin = require('firebase-admin')
const collegesData = require('./colleges.json')

const app = express()

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: true }))
app.use(express.json())

// ── Firebase Admin SDK Init ─────────────────────────────────────────────────
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'collage-campus1'
  });
}

// ── Firebase Auth Middleware ────────────────────────────────────────────────
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' })
  }
  const idToken = authHeader.split('Bearer ')[1]
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    req.user = decodedToken
    next()
  } catch (err) {
    console.error('Token verification error:', err)
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' })
  }
}

// ── Auth Routes ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth')
const applicationRoutes = require('./routes/applications')
const adminRoutes = require('./routes/admin')
app.use('/api/auth', authRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/admin', adminRoutes)

// ── Colleges Routes ─────────────────────────────────────────────────────────
app.get('/api/colleges', (req, res) => {
  res.json(collegesData)
})

app.get('/api/colleges/:id', (req, res) => {
  const college = collegesData.data.collegeList.find(c => c._id === req.params.id)
  if (college) {
    res.json({ success: true, data: college, message: 'College profile retrieved successfully.' })
  } else {
    res.status(404).json({ success: false, message: 'College not found' })
  }
})

// Protected route example
app.get('/api/colleges/protected/saved', authenticate, (req, res) => {
  res.json({ success: true, message: `Hello ${req.user.email}, your saved colleges will appear here.` })
})

// ── Start Server ────────────────────────────────────────────────────────────
app.listen(3000, () => {
  console.log('✅ Local dev server running at http://localhost:3000')
  console.log('💡 For production, deploy: cd functions && npm run deploy')
})