import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult, param } from 'express-validator';
import xss from 'xss';
import multer from 'multer';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============ SUPABASE SETUP ============
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const supabasePublic = createClient(supabaseUrl, supabaseKey);

// ============ SECURITY MIDDLEWARE ============

// Helmet - Sets HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS - Restrict to specific origins in production
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parser with size limit to prevent large payload attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Rate limiting for login attempts (strict)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== 'POST'
});

// Rate limiting for bookings
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 bookings per hour
  message: 'Too many bookings submitted, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== 'POST'
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);

// Middleware to sanitize user input
const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return xss(data.trim());
  }
  if (typeof data === 'object' && data !== null) {
    return Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = sanitizeInput(value);
      return acc;
    }, {});
  }
  return data;
};

app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
});

// Middleware to validate Supabase JWT token
const validateToken = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
  }
  
  try {
    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized - Invalid token' });
    }
    
    req.user = data.user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// ============ FILE UPLOAD CONFIGURATION ============

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed'));
    }
  }
});

// ============ SUPABASE HELPERS ============

const uploadImageToSupabase = async (file) => {
  try {
    const filename = `${uuidv4()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`;
    const filePath = `portfolio/${filename}`;
    
    const { data, error } = await supabase.storage
      .from('Kenya_photos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('Kenya_photos')
      .getPublicUrl(filePath);
    
    return {
      path: filePath,
      url: publicUrlData.publicUrl
    };
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw new Error('Failed to upload image');
  }
};

const deleteImageFromSupabase = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from('Kenya_photos')
      .remove([filePath]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting from Supabase:', error);
    throw new Error('Failed to delete image');
  }
};

let emailTransporter = null;

const initEmail = () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const isGmail = process.env.EMAIL_HOST.includes('gmail.com');
    emailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('Email configured with:', process.env.EMAIL_HOST);
    
    // Verify connection
    emailTransporter.verify(function(error, success) {
      if (error) {
        console.error('⚠️  SMTP Connection Error:', error.message);
        emailTransporter = null; // Set to null so we know it failed
      } else {
        console.log('✓ SMTP Server is ready to take messages');
      }
    });
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('Email configured with Gmail');
    
    // Verify connection
    emailTransporter.verify(function(error, success) {
      if (error) {
        console.error('⚠️  Gmail Connection Error:', error.message);
        emailTransporter = null; // Set to null so we know it failed
      } else {
        console.log('✓ Gmail is ready to take messages');
      }
    });
  } else {
    console.log('Email not configured - set EMAIL_USER and EMAIL_PASS in .env');
  }
};

const sendBookingEmail = async (booking) => {
  if (!emailTransporter) {
    console.error('❌ No email transporter configured - email not sent');
    return { success: false, error: 'Email not configured' };
  }
  
  // Sanitize all booking data for email to prevent XSS
  const sanitizedBooking = {
    name: xss(booking.name),
    email: xss(booking.email),
    phone: xss(booking.phone),
    service: xss(booking.service),
    date: xss(booking.date),
    location: xss(booking.location || 'Not specified'),
    message: xss(booking.message || 'No message')
  };
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
    subject: `New Booking: ${sanitizedBooking.service} - Kenya Capture Studio`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e11d48;">New Booking Request</h2>
        <p style="color: #666;">You have a new booking from your website:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong style="color: #333;">Name:</strong> ${sanitizedBooking.name}</p>
          <p><strong style="color: #333;">Email:</strong> ${sanitizedBooking.email}</p>
          <p><strong style="color: #333;">Phone:</strong> ${sanitizedBooking.phone}</p>
          <p><strong style="color: #333;">Service:</strong> ${sanitizedBooking.service}</p>
          <p><strong style="color: #333;">Date:</strong> ${sanitizedBooking.date}</p>
          <p><strong style="color: #333;">Location:</strong> ${sanitizedBooking.location}</p>
        </div>
        
        <div style="background: #fafafa; padding: 20px; border-radius: 8px;">
          <p><strong style="color: #333;">Message:</strong></p>
          <p style="color: #666; white-space: pre-wrap;">${sanitizedBooking.message}</p>
        </div>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Kenya Capture Studio - Admin Notification
        </p>
      </div>
    `
  };

  try {
    console.log('📧 Attempting to send email to:', mailOptions.to);
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✓ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('Error details:', error);
    return { success: false, error: error.message };
  }
};

// ============ ROUTES ============

// Login route using Supabase Auth
app.post('/api/auth/login', loginLimiter, [
  body('email').trim().isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }
  
  try {
    const { email, password } = req.body;
    
    // Sign in with Supabase Auth
    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    if (!data.session) {
      return res.status(401).json({ success: false, message: 'Login failed' });
    }
    
    return res.json({ 
      success: true, 
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login error' });
  }
});

// Get portfolio images (public)
app.get('/api/portfolio', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ error: 'Unable to fetch portfolio' });
  }
});

// Add portfolio image (protected)
app.post('/api/portfolio', validateToken, upload.single('image'), [
  body('label').trim().isLength({ min: 1, max: 100 }).withMessage('Invalid label'),
  body('alt').optional().trim().isLength({ max: 200 }),
  body('span').optional().isIn(['', 'md:col-span-2', 'md:row-span-2', 'md:col-span-2 md:row-span-2'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { label, alt, span } = req.body;
    
    // Upload to Supabase
    const uploadedFile = await uploadImageToSupabase(req.file);
    
    // Store metadata in database
    const { data, error } = await supabase
      .from('portfolio_images')
      .insert([{
        id: uuidv4(),
        src: uploadedFile.url,
        storage_path: uploadedFile.path,
        alt: xss(alt || label),
        label: xss(label),
        span: span || '',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: error.message || 'Unable to save image' });
  }
});

// Delete portfolio image (protected)
app.delete('/api/portfolio/:id', validateToken, [
  param('id').isUUID().withMessage('Invalid image ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }
  
  try {
    const { id } = req.params;
    
    // Get image details
    const { data: image, error: fetchError } = await supabase
      .from('portfolio_images')
      .select('storage_path')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (image?.storage_path) {
      await deleteImageFromSupabase(image.storage_path);
    }
    
    // Delete from database
    const { error: deleteError } = await supabase
      .from('portfolio_images')
      .delete()
      .eq('id', id);
    
    if (deleteError) throw deleteError;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ error: 'Unable to delete image' });
  }
});

// Update portfolio image (protected)
app.put('/api/portfolio/:id', validateToken, upload.single('image'), [
  param('id').isUUID().withMessage('Invalid image ID'),
  body('label').optional().trim().isLength({ min: 1, max: 100 }),
  body('alt').optional().trim().isLength({ max: 200 }),
  body('span').optional().isIn(['', 'md:col-span-2', 'md:row-span-2', 'md:col-span-2 md:row-span-2'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }
  
  try {
    const { id } = req.params;
    const { label, alt, span } = req.body;
    
    // Get current image
    const { data: currentImage, error: fetchError } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    let src = currentImage.src;
    let storagePath = currentImage.storage_path;
    
    // If new file uploaded
    if (req.file) {
      // Delete old file
      if (currentImage.storage_path) {
        await deleteImageFromSupabase(currentImage.storage_path);
      }
      
      // Upload new file
      const uploadedFile = await uploadImageToSupabase(req.file);
      src = uploadedFile.url;
      storagePath = uploadedFile.path;
    }
    
    // Update database
    const updateData = {
      src,
      storage_path: storagePath
    };
    
    if (label) updateData.label = xss(label);
    if (alt) updateData.alt = xss(alt);
    if (span !== undefined) updateData.span = span;
    
    const { data, error: updateError } = await supabase
      .from('portfolio_images')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    res.json(data);
  } catch (error) {
    console.error('Image update error:', error);
    res.status(500).json({ error: 'Unable to update image' });
  }
});

// Create booking (public)
app.post('/api/bookings', bookingLimiter, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').trim().isEmail().withMessage('Invalid email address'),
  body('phone').trim().isMobilePhone().withMessage('Invalid phone number'),
  body('service').trim().isLength({ min: 1, max: 100 }).withMessage('Invalid service'),
  body('date').trim().isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const bookingDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        throw new Error('Booking date cannot be in the past');
      }
      return true;
    }),
  body('location').optional().trim().isLength({ max: 200 }),
  body('message').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    const bookingData = {
      id: uuidv4(),
      name: xss(req.body.name),
      email: xss(req.body.email),
      phone: xss(req.body.phone),
      service: xss(req.body.service),
      date: xss(req.body.date),
      location: xss(req.body.location || ''),
      message: xss(req.body.message || ''),
      created_at: new Date().toISOString()
    };
    
    // Check for duplicate bookings
    const { data: recentBookings, error: checkError } = await supabase
      .from('bookings')
      .select('*')
      .eq('email', bookingData.email)
      .gte('created_at', new Date(Date.now() - 60000).toISOString());
    
    if (checkError) throw checkError;
    
    if (recentBookings && recentBookings.length > 0) {
      return res.status(429).json({ 
        success: false, 
        message: 'Please wait a moment before submitting another booking' 
      });
    }
    
    // Insert booking
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();
    
    if (error) throw error;
    
    // Send email
    const emailResult = await sendBookingEmail(bookingData);
    
    res.json({ success: true, booking: { id: data.id }, email: emailResult.success });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Unable to process booking' });
  }
});

// Get all bookings (protected)
app.get('/api/bookings', validateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(500).json({ error: 'Unable to fetch bookings' });
  }
});

// Delete booking
app.delete('/api/bookings/:id', validateToken, [
  param('id').isUUID().withMessage('Invalid booking ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Invalid input' });
  }
  
  try {
    const { id } = req.params;
    
    // Delete from database
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    if (deleteError) throw deleteError;
    
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete booking' });
  }
});

// Get admin profile image (public)
app.get('/api/admin/profile', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admin_profile')
      .select('*')
      .limit(1)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // No profile image yet
      return res.json({ id: null, src: null, storage_path: null });
    }
    
    if (error) throw error;
    res.json(data || {});
  } catch (error) {
    console.error('Admin profile fetch error:', error);
    res.status(500).json({ error: 'Unable to fetch admin profile' });
  }
});

// Upload/Update admin profile image (protected)
app.post('/api/admin/profile', validateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get existing profile image
    const { data: existingProfile } = await supabase
      .from('admin_profile')
      .select('*')
      .limit(1)
      .single();
    
    // Delete old profile image if exists
    if (existingProfile?.storage_path) {
      try {
        await deleteImageFromSupabase(existingProfile.storage_path);
      } catch (deleteErr) {
        console.warn('Could not delete old profile image:', deleteErr.message);
      }
    }
    
    // Upload new profile image to admin_profile folder
    const filename = `${uuidv4()}${req.file.originalname.substring(req.file.originalname.lastIndexOf('.'))}`;
    const filePath = `admin_profile/${filename}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('Kenya_photos')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('Kenya_photos')
      .getPublicUrl(filePath);
    
    const profileData = {
      src: publicUrlData.publicUrl,
      storage_path: filePath,
      updated_at: new Date().toISOString()
    };
    
    let result;
    if (existingProfile?.id) {
      // Update existing profile
      const { data, error: updateError } = await supabase
        .from('admin_profile')
        .update(profileData)
        .eq('id', existingProfile.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      result = data;
    } else {
      // Create new profile
      const { data, error: insertError } = await supabase
        .from('admin_profile')
        .insert([{
          id: uuidv4(),
          ...profileData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      result = data;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Admin profile upload error:', error);
    res.status(500).json({ error: error.message || 'Unable to save profile image' });
  }
});

// Delete admin profile image (protected)
app.delete('/api/admin/profile', validateToken, async (req, res) => {
  try {
    // Get existing profile image
    const { data: profile, error: fetchError } = await supabase
      .from('admin_profile')
      .select('*')
      .limit(1)
      .single();
    
    if (fetchError && fetchError.code === 'PGRST116') {
      return res.status(404).json({ success: false, message: 'No profile image found' });
    }
    
    if (fetchError) throw fetchError;
    
    // Delete from storage
    if (profile?.storage_path) {
      await deleteImageFromSupabase(profile.storage_path);
    }
    
    // Delete from database
    const { error: deleteError } = await supabase
      .from('admin_profile')
      .delete()
      .eq('id', profile.id);
    
    if (deleteError) throw deleteError;
    
    res.json({ success: true, message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Admin profile deletion error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete profile image' });
  }
});

// Error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ error: 'File too large (max 5MB)' });
    }
    return res.status(400).json({ error: 'File upload error' });
  }
  
  if (error.message === 'Invalid file type') {
    return res.status(400).json({ error: error.message });
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ============ INITIALIZATION ============

const initializeApp = async () => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.warn('⚠️  Supabase Auth not fully configured yet');
    } else {
      console.log('✓ Supabase Auth connected');
    }
    
    // Initialize email
    initEmail();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log('✓ Using Supabase for authentication and storage');
    });
  } catch (error) {
    console.error('❌ Initialization error:', error);
    process.exit(1);
  }
};

initializeApp();
