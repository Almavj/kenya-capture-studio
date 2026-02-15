import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Camera } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Book Now", href: "#booking" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2 group">
          <Camera className="w-6 h-6 text-primary transition-transform group-hover:rotate-12" />
          <span className="font-display text-xl font-semibold text-foreground tracking-wide">
            Lens of Kenya
          </span>
        </a>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={`text-sm font-sans tracking-wide transition-colors ${
                  link.label === "Book Now"
                    ? "bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:opacity-90"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
          <a
            href="/admin/login"
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground"
            title="Admin"
          >
            Admin
          </a>
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-foreground"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <ul className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block text-base font-sans transition-colors ${
                      link.label === "Book Now"
                        ? "bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-center hover:opacity-90"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-xs text-muted-foreground/50 hover:text-muted-foreground"
                >
                  Admin
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
