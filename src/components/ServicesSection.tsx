import { motion } from "framer-motion";
import { Camera, Heart, Building2, Users, MapPin, Package } from "lucide-react";

const services = [
  {
    icon: Heart,
    title: "Wedding Photography",
    description: "Complete coverage of your special day — from ceremonies to receptions across Kenya's finest venues.",
    price: "From KES 80,000",
  },
  {
    icon: Camera,
    title: "Portrait Sessions",
    description: "Individual, couples, or graduation shoots in stunning Kenyan locations of your choice.",
    price: "From KES 15,000",
  },
  {
    icon: Users,
    title: "Family Portraits",
    description: "Capture precious family moments in parks, homes, or outdoor settings around Nairobi and beyond.",
    price: "From KES 25,000",
  },
  {
    icon: Building2,
    title: "Corporate & Events",
    description: "Professional headshots, conferences, product launches, and corporate event coverage.",
    price: "From KES 40,000",
  },
  {
    icon: MapPin,
    title: "Safari & Travel",
    description: "Adventure and travel photography across Maasai Mara, Amboseli, Diani Beach, and more.",
    price: "From KES 50,000",
  },
  {
    icon: Package,
    title: "Product Photography",
    description: "High-quality product shots for e-commerce, menus, catalogues, and brand marketing.",
    price: "From KES 20,000",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 px-6" style={{ background: "var(--section-gradient)" }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-sans text-sm uppercase tracking-[0.3em] text-primary mb-3">
            Services
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">
            What I <span className="italic font-normal">Offer</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-lg p-8 border border-border hover:shadow-lg transition-shadow duration-300 group"
              style={{ boxShadow: "var(--warm-glow)" }}
            >
              <service.icon className="w-8 h-8 text-primary mb-5 transition-transform group-hover:scale-110" />
              <h3 className="font-display text-xl font-semibold text-card-foreground mb-3">
                {service.title}
              </h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-5">
                {service.description}
              </p>
              <p className="font-display text-lg text-primary font-semibold">
                {service.price}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
