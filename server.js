import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

const app = express();
// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: 'your-secret-key-very-secure', // IMPORTANT: Change this to a long, random string in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS in production
}));

// Common login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`[Backend] Attempting login for: ${email}`); // Log for debugging

  // Allow both 'Anika' and 'Anika@gmail.com' for admin login
  if (
    (email === 'Anika' || email === 'Anika@gmail.com') &&
    password === '2005Ani'
  ) {
    req.session.isAdmin = true;
    console.log(`[Backend] Admin login successful! Session set: ${req.session.isAdmin}`);
    return res.json({ success: true, isAdmin: true });
  }
  
  // For regular users, you would integrate Firebase Auth here on the backend
  // For now, it will always return isAdmin: false if not the hardcoded admin
  req.session.isAdmin = false;
  console.log('[Backend] Regular user login (or failed admin attempt). Session set:', req.session.isAdmin);
  return res.json({ success: true, isAdmin: false });
});

// Admin authentication middleware
function adminAuth(req, res, next) {
  console.log('[Backend] Admin Auth Middleware: Checking session...');
  console.log('[Backend] req.session:', req.session); // Log the full session object
  console.log('[Backend] req.session.isAdmin:', req.session.isAdmin); // Log the isAdmin property

  if (req.session && req.session.isAdmin) {
    console.log('[Backend] Admin access granted.');
    return next();
  }
  console.log('[Backend] Admin access denied. Sending 403 Forbidden.');
  return res.status(403).send('Forbidden: Admins only');
}

// Admin page route (serves admin.html from the public folder)
app.get('/admin', adminAuth, (req, res) => {
  console.log('[Backend] Serving admin.html');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Root route (serves index.html from the public folder)
app.get('/', (req, res) => {
  console.log('[Backend] Serving index.html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all for undefined routes/methods (helpful for debugging 405s)
app.use((req, res, next) => {
  console.log(`[Backend] Unhandled request: ${req.method} ${req.url}`);
  res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[Backend] Server running on port ${PORT}`));
