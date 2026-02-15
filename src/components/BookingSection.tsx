import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Send, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const serviceOptions = [
  "Wedding Photography",
  "Portrait Session",
  "Family Portraits",
  "Corporate & Events",
  "Safari & Travel",
  "Product Photography",
];

const BookingSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    location: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's date in YYYY-MM-DD format for min attribute
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side date validation
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error("Booking date cannot be in the past");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await api.submitBooking(formData);
      if (result && result.success) {
        if (result.email === false) {
          toast.warn("Booking saved but notification email failed to send. I'll still follow up.");
        } else {
          toast.success("Booking request sent! I'll get back to you within 24 hours.");
        }
        setFormData({ name: "", email: "", phone: "", service: "", date: "", location: "", message: "" });
      } else {
        toast.error(result?.message || "Failed to send booking. Please try again.");
      }
    } catch {
      toast.error("Failed to send booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="booking" className="py-24 px-6" style={{ background: "var(--section-gradient)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-sans text-sm uppercase tracking-[0.3em] text-primary mb-3">
            Book Now
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">
            Let's Create <span className="italic font-normal">Together</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 flex flex-col gap-8"
          >
            <p className="font-sans text-muted-foreground leading-relaxed">
              Ready to book your session? Fill in the form and I'll get back to you within 24 hours with availability and a detailed quote.
            </p>

            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-sans">Phone / WhatsApp</p>
                  <p className="text-sm font-semibold text-foreground font-sans">+254 708399142</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-sans">Email</p>
                  <p className="text-sm font-semibold text-foreground font-sans">machariaallan881@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-sans">Studio</p>
                  <p className="text-sm font-semibold text-foreground font-sans">Westlands, Nairobi, Kenya</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 bg-card rounded-lg p-8 border border-border"
            style={{ boxShadow: "var(--warm-glow)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone / WhatsApp"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>Select Service</option>
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()}
                required
                className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="text"
                name="location"
                placeholder="Preferred Location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <textarea
              name="message"
              placeholder="Tell me about your vision..."
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground font-sans text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-6 resize-none"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-md font-sans text-sm uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Booking Request
                </>
              )}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
