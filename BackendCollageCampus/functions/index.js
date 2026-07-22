const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const collegesData = require("./colleges.json");
const { sendApplicationConfirmationEmail, sendApplicationStatusEmail } = require("./utils/gmailMailer");

// Gmail credentials are loaded from functions/.env (never commit that file to git)
const getGmailCredentials = () => ({
  clientId: (process.env.GMAIL_CLIENT_ID || "").trim(),
  clientSecret: (process.env.GMAIL_CLIENT_SECRET || "").trim(),
  refreshToken: (process.env.GMAIL_REFRESH_TOKEN || "").trim(),
  user: (process.env.GMAIL_USER || "").trim(),
});

admin.initializeApp();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    req.user = await admin.auth().verifyIdToken(idToken);
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
  }
};

app.get("/health", (req, res) => {
  res.json({ success: true, message: "CollegeShip API is running" });
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name || "",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      uid: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      "Login is handled by the Firebase Client SDK on the frontend. Use signInWithEmailAndPassword() and pass the resulting ID token as a Bearer token.",
  });
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    const userRecord = await admin.auth().getUser(req.user.uid);
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
    console.error("Get user error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/colleges", (req, res) => {
  res.json(collegesData);
});

app.get("/api/colleges/:id", (req, res) => {
  const college = collegesData.data.collegeList.find((item) => item._id === req.params.id);
  if (!college) {
    return res.status(404).json({ success: false, message: "College not found" });
  }

  return res.json({
    success: true,
    data: college,
    message: "College profile retrieved successfully.",
  });
});

app.get("/api/colleges/protected/saved", authenticate, (req, res) => {
  res.json({ success: true, message: `Hello ${req.user.email}, your saved colleges will appear here.` });
});

app.post("/api/applications/apply", authenticate, async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      userPhone,
      userAge,
      course,
      universityId,
      universityName,
    } = req.body;

    // Enforce that the user can only apply for themselves (matching verified token uid)
    if (req.user.uid !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden: You cannot apply on behalf of another user" });
    }

    const verifiedEmail = req.user.email;
    if (!verifiedEmail) {
      return res.status(400).json({ success: false, message: "Your authenticated account has no email address" });
    }

    if (userEmail && userEmail.toLowerCase() !== verifiedEmail.toLowerCase()) {
      return res.status(403).json({ success: false, message: "Use the email address associated with your account" });
    }

    const db = admin.firestore();

    // Check for duplicate application (same user, same university, same course)
    const existingAppSnapshot = await db.collection("applications")
      .where("userId", "==", userId)
      .where("universityId", "==", universityId)
      .where("course", "==", course)
      .get();

    if (!existingAppSnapshot.empty) {
      return res.status(400).json({ success: false, message: "You have already applied for this course at this college." });
    }

    const docRef = await db.collection("applications").add({
      userId,
      userName,
      userEmail: verifiedEmail,
      userPhone,
      userAge,
      course,
      universityId,
      universityName,
      status: "Applied",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    let emailSent = false;
    let emailError = null;

    try {
      await sendApplicationConfirmationEmail(
        getGmailCredentials(),
        { userName, userEmail: verifiedEmail, course, universityName }
      );
      emailSent = true;
    } catch (mailErr) {
      emailError = mailErr.message;
      console.error("Application confirmation email failed:", mailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      id: docRef.id,
      emailSent,
      ...(emailError && !emailSent ? { emailError } : {}),
    });
  } catch (err) {
    console.error("Application error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin Middleware ──────────────────────────────────────────────────────────
const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (!decodedToken.email) {
      return res.status(403).json({ success: false, message: "Forbidden: No email associated with token" });
    }
    const adminDoc = await admin.firestore().collection("admins").doc(decodedToken.email).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
    }
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error("Admin token verification error:", err);
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
  }
};

// ── Admin: Update Application Status + Send Email ────────────────────────────
app.put("/api/admin/applications/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Accepted", "Rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const db = admin.firestore();
    const appRef = db.collection("applications").doc(id);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const applicationData = appDoc.data();

    // Update status in Firestore
    await appRef.update({ status });

    // Send status email to applicant
    let emailSent = false;
    let emailError = null;

    try {
      await sendApplicationStatusEmail(
        getGmailCredentials(),
        applicationData,
        status
      );
      emailSent = true;
    } catch (mailErr) {
      emailError = mailErr.message;
      console.error(`Application ${status} email failed:`, mailErr.message);
    }

    return res.json({
      success: true,
      message: `Application ${status} successfully.`,
      emailSent,
      ...(emailError && !emailSent ? { emailError } : {}),
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({ success: false, message: "Failed to update application status", error: error.message });
  }
});

let cachedIndexHtml = null;

exports.collegeSeo = onRequest(
  { region: "asia-south1" },
  async (req, res) => {
    try {
      // 1. Extract collegeId from URL
      const segments = req.path.split('/').filter(Boolean);
      const collegeId = segments[segments.length - 1];

      // 2. Fetch HTML if not cached
      if (!cachedIndexHtml) {
        // Fetch the production index.html from hosting
        const response = await fetch("https://collegeship.in/index.html");
        if (response.ok) {
          cachedIndexHtml = await response.text();
        } else {
          cachedIndexHtml = `<!doctype html><html lang="en-IN"><head><title>CollegeShip</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`;
        }
      }

      let html = cachedIndexHtml;

      // 3. Fetch College Data
      if (collegeId && collegeId !== 'college') {
        const docRef = admin.firestore().collection("colleges").doc(collegeId);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
          const college = docSnap.data();
          const title = `${college.name || 'College'} | CollegeShip`;
          const description = college.description 
            ? college.description.substring(0, 160).replace(/"/g, '&quot;')
            : `Explore ${college.name || 'this college'} including courses, fees, rankings, placements, admissions, and reviews.`;
          
          let imageUrl = "https://collegeship.in/og-image.png";
          if (college.thumbnail) {
            imageUrl = college.thumbnail.startsWith('http') ? college.thumbnail : `https://collegeship.in${college.thumbnail.startsWith('/') ? '' : '/'}${college.thumbnail}`;
          } else if (college.logo) {
            imageUrl = college.logo.startsWith('http') ? college.logo : `https://collegeship.in${college.logo.startsWith('/') ? '' : '/'}${college.logo}`;
          }

          const pageUrl = `https://collegeship.in/college/${collegeId}`;

          // 4. Inject Dynamic Metadata
          html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
          html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`);
          html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${pageUrl}" />`);
          
          html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
          html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
          html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${imageUrl}" />`);
          html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${pageUrl}" />`);
          
          html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
          html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);
          html = html.replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${imageUrl}" />`);
        } else {
          // 404 Not Found
          const title = "College Not Found | CollegeShip";
          const description = "The requested college profile could not be found on CollegeShip.";
          html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
          html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`);
          html = html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, `<meta name="robots" content="noindex" />`);
          res.status(404);
        }
      }

      res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
      res.send(html);
    } catch (error) {
      console.error("Error in collegeSeo function:", error);
      res.status(500).send(cachedIndexHtml || 'Error loading page');
    }
  }
);

exports.api = onRequest(
  {
    region: "asia-south1",
  },
  app
);
