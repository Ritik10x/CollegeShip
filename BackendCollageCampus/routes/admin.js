const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { sendApplicationStatusEmail } = require('../functions/utils/gmailMailer');

// Middleware to check if the requester has role: "admin"
// The user's email must exist as a document in the 'admins' Firestore collection.
const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Check if the email exists in the admins collection with role: "admin"
    if (!decodedToken.email) {
      return res.status(403).json({ success: false, message: 'Forbidden: No email associated with token' });
    }
    
    const adminDoc = await admin.firestore().collection('admins').doc(decodedToken.email).get();
    
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
    
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('Admin token verification error:', err);
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

/**
 * GET /api/admin/users
 * Returns a list of all Firebase Authentication users.
 */
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers(1000); // Fetch up to 1000 users
    
    const users = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || 'No Name',
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
    }));
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ success: false, message: 'Failed to list users', error: error.message });
  }
});

/**
 * DELETE /api/admin/users/:uid
 * Deletes a specific Firebase user by UID.
 */
router.delete('/users/:uid', requireAdmin, async (req, res) => {
  const { uid } = req.params;
  try {
    await admin.auth().deleteUser(uid);
    res.json({ success: true, message: `Successfully deleted user: ${uid}` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
});

/**
 * PUT /api/admin/applications/:id/status
 * Updates an application's status and sends an email notification to the applicant.
 */
router.put('/applications/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Accepted', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const db = admin.firestore();
    const appRef = db.collection('applications').doc(id);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const applicationData = appDoc.data();

    // Update status in Firestore
    await appRef.update({ status });

    // Send email notification
    let emailSent = false;
    let emailError = null;

    try {
      await sendApplicationStatusEmail(
        {
          clientId: process.env.GMAIL_CLIENT_ID?.trim(),
          clientSecret: process.env.GMAIL_CLIENT_SECRET?.trim(),
          refreshToken: process.env.GMAIL_REFRESH_TOKEN?.trim(),
          user: process.env.GMAIL_USER?.trim(),
        },
        applicationData,
        status
      );
      emailSent = true;
    } catch (mailErr) {
      emailError = mailErr.message;
      console.error(`Application ${status} email failed:`, mailErr.message);
    }

    res.json({
      success: true,
      message: `Application ${status} successfully.`,
      emailSent,
      ...(emailError && !emailSent ? { emailError } : {}),
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Failed to update application status', error: error.message });
  }
});

module.exports = router;
