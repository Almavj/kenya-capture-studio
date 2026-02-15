import { motion } from "framer-motion";
import heroImage from "@/assets/hero.jpg";

const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Kenyan couple at golden hour on the savanna"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-sans text-sm uppercase tracking-[0.3em] text-primary-foreground/80 mb-4"
        >
          Nairobi · Mombasa · Maasai Mara · All of Kenya
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-primary-foreground leading-tight mb-6"
        >
          Capturing Kenya's
          <br />
          <span className="italic font-normal">Beautiful Moments</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-sans text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10"
        >
          Professional photography that tells your story — from intimate portraits to grand celebrations across Kenya's most stunning locations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#booking"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-md font-sans text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Book a Session
          </a>
          <a
            href="#portfolio"
            className="inline-block border border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-md font-sans text-sm uppercase tracking-widest hover:bg-primary-foreground/10 transition-colors"
          >
            View Portfolio
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-primary-foreground/40 rounded-full flex items-start justify-center p-1"
        >
          <div className="w-1.5 h-3 bg-primary-foreground/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
