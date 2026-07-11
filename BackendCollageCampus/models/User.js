/**
 * User.js — DEPRECATED (MongoDB Mongoose model removed)
 *
 * User management is now handled entirely by Firebase Authentication.
 * - Signup: POST /api/auth/signup  (Admin SDK creates user in Firebase Auth)
 * - Login:  Handled on the frontend via Firebase Client SDK
 *           (signInWithEmailAndPassword) — no server route needed.
 * - Profile: GET /api/auth/me  (verified via Firebase ID Token)
 *
 * You can safely delete this file.
 */

module.exports = null;
