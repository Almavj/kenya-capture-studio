import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, LogOut, Image as ImageIcon, Calendar, Trash2, Upload, Edit, X } from 'lucide-react';
import { api } from '@/lib/api';

interface PortfolioImage {
  id: string;
  src: string;
  alt: string;
  label: string;
  span: string;
}

interface AdminProfile {
  id: string | null;
  src: string | null;
  storage_path: string | null;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  location: string;
  message: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'images' | 'bookings'>('profile');
  const [editingImage, setEditingImage] = useState<PortfolioImage | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const { data: images = [], isLoading: loadingImages } = useQuery<PortfolioImage[]>({
    queryKey: ['portfolio'],
    queryFn: () => api.getPortfolio()
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: () => api.getBookings()
  });

  const { data: adminProfile = {} as AdminProfile, isLoading: loadingProfile } = useQuery<AdminProfile>({
    queryKey: ['adminProfile'],
    queryFn: () => api.getAdminProfile()
  });

  const addImageMutation = useMutation({
    mutationFn: api.addImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] })
  });

  const updateImageMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => 
      api.updateImage(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      setEditingImage(null);
    }
  });

  const deleteImageMutation = useMutation({
    mutationFn: api.deleteImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] })
  });

  const deleteBookingMutation = useMutation({
    mutationFn: api.deleteBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] })
  });

  const uploadProfileImageMutation = useMutation({
    mutationFn: api.uploadAdminProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
      setShowProfileModal(false);
    }
  });

  const deleteProfileImageMutation = useMutation({
    mutationFn: api.deleteAdminProfileImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminProfile'] })
  });

  const handleImageUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await addImageMutation.mutateAsync(formData);
    (e.target as HTMLFormElement).reset();
  };

  const handleImageUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingImage) return;
    const formData = new FormData(e.currentTarget);
    await updateImageMutation.mutateAsync({ id: editingImage.id, formData });
  };

  const handleDeleteImage = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      await deleteImageMutation.mutateAsync(id);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      await deleteBookingMutation.mutateAsync(id);
    }
  };

  const handleProfileImageUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await uploadProfileImageMutation.mutateAsync(formData);
    (e.target as HTMLFormElement).reset();
  };

  const handleDeleteProfileImage = async () => {
    if (confirm('Are you sure you want to delete your profile image?')) {
      await deleteProfileImageMutation.mutateAsync();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {localStorage.getItem('adminUser')}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              activeTab === 'profile' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            <Camera className="w-4 h-4" />
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              activeTab === 'images' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Portfolio Images
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              activeTab === 'bookings' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Bookings ({bookings.length})
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-card rounded-lg border p-8">
            <h2 className="text-2xl font-semibold mb-8">My Profile Image</h2>
            
            {loadingProfile ? (
              <p>Loading...</p>
            ) : (
              <div className="flex flex-col items-center gap-8">
                {adminProfile?.src ? (
                  <div className="relative group">
                    <img
                      src={adminProfile.src}
                      alt="Admin Profile"
                      className="w-48 h-48 rounded-full object-cover border-4 border-primary"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button
                        onClick={() => setShowProfileModal(true)}
                        className="p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleDeleteProfileImage}
                        disabled={deleteProfileImageMutation.isPending}
                        className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-full bg-muted border-4 border-dashed border-primary flex items-center justify-center">
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:opacity-90"
                >
                  <Upload className="w-4 h-4" />
                  {adminProfile?.src ? 'Change Image' : 'Upload Image'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'images' && (
          <div>
            <form onSubmit={handleImageUpload} className="bg-card rounded-lg border p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Add New Image</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  required
                  className="md:col-span-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer"
                />
                <input
                  type="text"
                  name="label"
                  placeholder="Label (e.g., Weddings)"
                  className="px-4 py-2 rounded-md border border-input bg-background"
                  required
                />
                <input
                  type="text"
                  name="alt"
                  placeholder="Alt text"
                  className="px-4 py-2 rounded-md border border-input bg-background"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <select
                  name="span"
                  className="px-4 py-2 rounded-md border border-input bg-background"
                >
                  <option value="">Normal Size</option>
                  <option value="md:row-span-2">Tall (2 rows)</option>
                  <option value="md:col-span-2">Wide (2 columns)</option>
                </select>
                <button
                  type="submit"
                  disabled={addImageMutation.isPending}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {addImageMutation.isPending ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </form>

            {loadingImages ? (
              <p>Loading images...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img: PortfolioImage) => (
                  <div key={img.id} className="relative group bg-card rounded-lg border overflow-hidden">
                <img
                  src={`${img.src}`}
                      alt={img.alt}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                      }}
                    />
                    <div className="p-3">
                      <p className="font-medium">{img.label}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingImage(img)}
                        className="p-2 bg-background rounded-md shadow hover:bg-muted"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="p-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            {loadingBookings ? (
              <p>Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <p className="text-muted-foreground">No bookings yet.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: Booking) => (
                  <div key={booking.id} className="bg-card rounded-lg border p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.name}</h3>
                        <p className="text-muted-foreground">{booking.email}</p>
                        <p className="text-muted-foreground">{booking.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {booking.service}
                        </span>
                        <p className="text-sm text-muted-foreground mt-2">
                          {new Date(booking.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p><strong>Location:</strong> {booking.location}</p>
                      <p><strong>Message:</strong> {booking.message}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Booked: {new Date(booking.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        disabled={deleteBookingMutation.isPending}
                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleteBookingMutation.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showProfileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upload Profile Image</h3>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleProfileImageUpload}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Image</label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      required
                      className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={uploadProfileImageMutation.isPending}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
                  >
                    {uploadProfileImageMutation.isPending ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 bg-muted px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingImage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit Image</h3>
              <form onSubmit={handleImageUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Replace Image (optional)</label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Label</label>
                    <input
                      type="text"
                      name="label"
                      defaultValue={editingImage.label}
                      className="w-full px-4 py-2 rounded-md border border-input bg-background"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Alt Text</label>
                    <input
                      type="text"
                      name="alt"
                      defaultValue={editingImage.alt}
                      className="w-full px-4 py-2 rounded-md border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Size</label>
                    <select
                      name="span"
                      defaultValue={editingImage.span}
                      className="w-full px-4 py-2 rounded-md border border-input bg-background"
                    >
                      <option value="">Normal</option>
                      <option value="md:row-span-2">Tall (2 rows)</option>
                      <option value="md:col-span-2">Wide (2 columns)</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={updateImageMutation.isPending}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
                  >
                    {updateImageMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingImage(null)}
                    className="flex-1 bg-muted px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
