const API_URL = import.meta.env.VITE_API_URL ?? '';

// Helper to get auth token from localStorage securely
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('adminToken');
  } catch {
    return null;
  }
};

// Helper to validate input before sending
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  // Basic phone validation - allows +, -, (), and numbers
  const phoneRegex = /^[\d\s\-()+ ]{10,}$/;
  return phoneRegex.test(phone);
};

// Helper to add auth headers for protected routes
const getProtectedHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const api = {
  login: async (email: string, password: string) => {
    // Validate input
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Invalid password' };
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        throw new Error('Login failed');
      }
      
      return await res.json();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Login error' 
      };
    }
  },

  getPortfolio: async () => {
    try {
      const res = await fetch(`${API_URL}/api/portfolio`);
      if (!res.ok) throw new Error('Failed to fetch portfolio');
      return await res.json();
    } catch (error) {
      console.error('Portfolio fetch error:', error);
      return [];
    }
  },

  addImage: async (formData: FormData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/portfolio`, {
        method: 'POST',
        headers,
        body: formData
      });
      
      if (!res.ok) throw new Error('Failed to add image');
      return await res.json();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Image upload failed' 
      };
    }
  },

  updateImage: async (id: string, formData: FormData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return { success: false, message: 'Invalid image ID' };
      }

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/portfolio/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers,
        body: formData
      });
      
      if (!res.ok) throw new Error('Failed to update image');
      return await res.json();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Image update failed' 
      };
    }
  },

  deleteImage: async (id: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return { success: false, message: 'Invalid image ID' };
      }

      const res = await fetch(`${API_URL}/api/portfolio/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getProtectedHeaders()
      });
      
      if (!res.ok) throw new Error('Failed to delete image');
      return await res.json();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Image deletion failed' 
      };
    }
  },

  getBookings: async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated', bookings: [] };
      }

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'GET',
        headers: getProtectedHeaders()
      });
      
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return await res.json();
    } catch (error) {
      console.error('Bookings fetch error:', error);
      return { success: false, message: 'Failed to load bookings', bookings: [] };
    }
  },

  submitBooking: async (booking: {
    name: string;
    email: string;
    phone: string;
    service: string;
    date: string;
    location: string;
    message: string;
  }) => {
    // Validate all inputs
    if (!booking.name?.trim() || !booking.email?.trim() || !booking.phone?.trim() || 
        !booking.service?.trim() || !booking.date?.trim()) {
      return { success: false, message: 'All required fields must be filled' };
    }

    if (booking.name.length > 100 || booking.service.length > 100) {
      return { success: false, message: 'Some fields are too long' };
    }

    if (!validateEmail(booking.email)) {
      return { success: false, message: 'Invalid email address' };
    }

    if (!validatePhone(booking.phone)) {
      return { success: false, message: 'Invalid phone number' };
    }

    if (booking.message && booking.message.length > 1000) {
      return { success: false, message: 'Message is too long (max 1000 characters)' };
    }

    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: booking.name.trim(),
          email: booking.email.trim(),
          phone: booking.phone.trim(),
          service: booking.service.trim(),
          date: booking.date,
          location: booking.location?.trim() || '',
          message: booking.message?.trim() || ''
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Booking submission failed');
      }
      
      return await res.json();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Booking submission failed' 
      };
    }
  },

  deleteBooking: async (id: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      // Basic UUID validation
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return { success: false, message: 'Invalid booking ID' };
      }

      const res = await fetch(`${API_URL}/api/bookings/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getProtectedHeaders()
      });
      
      if (!res.ok) throw new Error('Failed to delete booking');
      return await res.json();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Booking deletion failed' 
      };
    }
  },

  getAdminProfile: async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/profile`);
      if (!res.ok) throw new Error('Failed to fetch admin profile');
      return await res.json();
    } catch (error) {
      console.error('Admin profile fetch error:', error);
      return { id: null, src: null, storage_path: null };
    }
  },

  uploadAdminProfileImage: async (formData: FormData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/admin/profile`, {
        method: 'POST',
        headers,
        body: formData
      });
      
      if (!res.ok) throw new Error('Failed to upload profile image');
      return await res.json();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Profile image upload failed' 
      };
    }
  },

  deleteAdminProfileImage: async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }

      const res = await fetch(`${API_URL}/api/admin/profile`, {
        method: 'DELETE',
        headers: getProtectedHeaders()
      });
      
      if (!res.ok) throw new Error('Failed to delete profile image');
      return await res.json();
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Profile image deletion failed' 
      };
    }
  }
};
