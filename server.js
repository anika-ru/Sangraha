import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: 'your-secret-key', // Change for production
  resave: false,
  saveUninitialized: true,
}));

// Common login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Allow both 'Anika' and 'Anika@gmail.com' for admin login
  if (
    (email === 'Anika' || email === 'Anika@gmail.com') &&
    password === '2005Ani'
  ) {
    req.session.isAdmin = true;
    return res.json({ success: true, isAdmin: true });
  }
  // TODO: Add your user authentication logic here (e.g., Firebase)
  // If user is valid:
  req.session.isAdmin = false;
  return res.json({ success: true, isAdmin: false });
});

// Admin auth middleware
function adminAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(403).send('Forbidden: Admins only');
}

// Admin page
app.get('/admin', adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));