# Lens of Kenya - Professional Photography Booking Platform

A modern, secure photography booking and portfolio website built with React, TypeScript, and Tailwind CSS on the frontend, with an Express.js backend and Supabase for authentication and data storage.

## Features

- 🎥 **Professional Portfolio Showcase** - Display your photography work with a beautiful grid layout
- 📅 **Booking System** - Clients can request bookings with date validation (no past dates allowed)
- 🛡️ **Secure Admin Dashboard** - Manage bookings, portfolio images, and profile with authentication
- 📧 **Email Notifications** - Automatic email alerts for new bookings
- 🔒 **Security Features**:
  - JWT authentication with Supabase
  - Input validation and XSS protection
  - Rate limiting on API endpoints
  - CORS and HTTP security headers with Helmet
  - Password protection for admin panel
  - Date validation prevents past date bookings
- 📱 **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- 🎨 **Beautiful UI** - Custom design with Tailwind CSS and Framer Motion animations

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- React Router
- TanStack Query (React Query)
- Radix UI components
- Vite (build tool)

### Backend
- Node.js
- Express.js
- Supabase (Auth & Database)
- Nodemailer (Email)
- Express Validator (Input validation)
- Helmet (Security headers)
- Express Rate Limit
- XSS protection

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- SMTP email service (Gmail, custom SMTP, etc.)

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd Photography
```

2. **Install dependencies**
```bash
npm install
cd server && npm install && cd ..
```

3. **Setup environment variables**

Create `.env` in the root directory:
```env
VITE_API_URL=http://localhost:3001
```

Create `.env` in the `server` directory:
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_HOST=smtp.gmail.com
ALLOWED_ORIGINS=http://localhost:8084,https://yourdomain.com
```

4. **Setup Supabase Database**

Create the following tables in Supabase:

**bookings**
- id (uuid, primary key)
- name (text)
- email (text)
- phone (text)
- service (text)
- date (date)
- location (text)
- message (text)
- created_at (timestamp)

**portfolio_images**
- id (uuid, primary key)
- src (text)
- alt (text)
- label (text)
- span (text)
- created_at (timestamp)

**admin_profile**
- id (uuid, primary key)
- src (text)
- storage_path (text)

### Running the Project

**Development:**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server && npm run dev
```

**Production Build:**
```bash
npm run build
```

## Security Features

✅ **Date Validation**
- Prevents booking requests with past dates
- Client-side validation with HTML5 date input
- Server-side validation with custom validator

✅ **Authentication**
- Supabase JWT-based authentication
- Protected admin routes
- Token validation on all protected endpoints

✅ **Input Validation**
- Express Validator on all endpoints
- Email and phone validation
- XSS protection with xss library
- SQL injection prevention via Supabase ORM

✅ **Rate Limiting**
- Login attempts limited
- Booking submissions limited
- DDoS protection

✅ **HTTP Security**
- Helmet.js for secure headers
- CORS protection
- Content Security Policy

## API Endpoints

### Public Endpoints
- `GET /api/portfolio` - Get all portfolio images
- `POST /api/bookings` - Submit a booking request

### Protected Endpoints (Admin)
- `GET /api/bookings` - Get all bookings (requires auth token)
- `POST /api/portfolio` - Add portfolio image (requires auth)
- `PUT /api/portfolio/:id` - Update portfolio image (requires auth)
- `DELETE /api/portfolio/:id` - Delete portfolio image (requires auth)
- `GET /api/admin/profile` - Get admin profile (requires auth)
- `PUT /api/admin/profile` - Update admin profile (requires auth)

### Auth Endpoints
- `POST /api/auth/login` - Login with email/password

## File Structure

```
Photography/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── lib/                # Utilities (API calls, etc)
│   ├── hooks/              # Custom React hooks
│   ├── index.css           # Global styles
│   └── main.tsx            # Entry point
├── server/
│   ├── index.js            # Express server
│   ├── data/               # JSON data storage
│   └── uploads/            # Uploaded files
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS config
└── tsconfig.json           # TypeScript config
```

## Deployment

### Vercel (Frontend)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Railway/Heroku (Backend)
1. Push to GitHub
2. Connect to Railway/Heroku
3. Set environment variables
4. Deploy

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

This project is private and confidential.

## Support

For support, email: machariaallan881@gmail.com
Phone/WhatsApp: +254 708399142
