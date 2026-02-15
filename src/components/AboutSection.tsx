import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Award, Clock, MapPin } from "lucide-react";
import { api } from "@/lib/api";

interface AdminProfile {
  src: string | null;
}

const stats = [
  { icon: Clock, label: "8+ Years Experience" },
  { icon: Award, label: "500+ Happy Clients" },
  { icon: MapPin, label: "All 47 Counties" },
];

const AboutSection = () => {
  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: ['adminProfile'],
    queryFn: () => api.getAdminProfile()
  });

  return (
    <section id="about" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <img
              src={adminProfile?.src || '/placeholder.jpg'}
              alt="Professional photographer"
              className="rounded-lg w-full max-w-md mx-auto object-cover aspect-square"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.jpg';
              }}
            />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-primary rounded-lg -z-10 hidden lg:block" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-sans text-sm uppercase tracking-[0.3em] text-primary mb-3">
              About Me
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
              Hello, I'm <span className="italic font-normal">Eva Mwenda</span>
            </h2>
            <p className="font-sans text-muted-foreground leading-relaxed mb-4">
              Based in Nairobi, I've spent over 8 years capturing Kenya's most beautiful stories. From the golden savannas of the Maasai Mara to the vibrant streets of Mombasa, my lens finds beauty in every corner of our homeland.
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed mb-8">
              I blend natural and digital photography techniques to create images that are both authentic and timeless. Whether it's the raw emotion of a wedding day or the quiet dignity of a portrait, I believe every moment deserves to be preserved beautifully.
            </p>

            <div className="flex flex-wrap gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <span className="font-sans text-sm font-semibold text-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
