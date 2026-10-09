const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { sendApplicationConfirmationEmail } = require('../functions/utils/gmailMailer');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

router.post('/apply', authenticate, async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      userPhone,
      userAge,
      course,
      selectedCourse,
      preferredCourse,
      studyMode,
      fatherName,
      studentAddress,
      universityId,
      universityName,
    } = req.body;

    if (req.user.uid !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot apply on behalf of another user' });
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'User email is required' });
    }

    if (!studyMode || !['online', 'offline'].includes(studyMode)) {
      return res.status(400).json({ success: false, message: 'Please select a valid study mode.' });
    }

    const courseKey = course || selectedCourse || 'General Inquiry';
    const db = admin.firestore();

    const existingAppSnapshot = await db.collection('applications')
      .where('userId', '==', userId)
      .where('universityId', '==', universityId)
      .where('course', '==', courseKey)
      .get();

    if (!existingAppSnapshot.empty) {
      return res.status(400).json({ success: false, message: 'You have already applied for this course at this college.' });
    }

    const docRef = await db.collection('applications').add({
      userId,
      userName,
      userEmail,
      userPhone,
      userAge,
      course: courseKey,
      selectedCourse: selectedCourse || courseKey,
      preferredCourse: preferredCourse || null,
      studyMode,
      fatherName: String(fatherName || '').trim(),
      studentAddress: String(studentAddress || '').trim(),
      universityId,
      universityName,
      status: 'Applied',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    let emailSent = false;
    let emailError = null;

    try {
      await sendApplicationConfirmationEmail(
        {
          clientId: process.env.GMAIL_CLIENT_ID?.trim(),
          clientSecret: process.env.GMAIL_CLIENT_SECRET?.trim(),
          refreshToken: process.env.GMAIL_REFRESH_TOKEN?.trim(),
          user: process.env.GMAIL_USER?.trim(),
        },
        { userName, userEmail, course, universityName }
      );
      emailSent = true;
    } catch (mailErr) {
      emailError = mailErr.message;
      console.error('Application confirmation email failed:', mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      id: docRef.id,
      emailSent,
      ...(emailError && !emailSent ? { emailError } : {}),
    });
  } catch (err) {
    console.error('Application Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
