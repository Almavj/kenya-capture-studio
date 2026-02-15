import { Camera, Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
          <div>
            <a href="#home" className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-primary" />
              <span className="font-display text-lg font-semibold text-background">
                Lens of Kenya
              </span>
            </a>
            <p className="font-sans text-sm text-background/60 max-w-sm leading-relaxed">
              Professional photography services across Kenya. Capturing weddings, portraits, events, and the natural beauty of our homeland.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-sans text-xs uppercase tracking-widest text-background/40 mb-2">Quick Links</p>
            {["Portfolio", "Services", "About", "Book Now"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(" ", "")}`}
                className="font-sans text-sm text-background/60 hover:text-background transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-sans text-xs uppercase tracking-widest text-background/40 mb-2">Connect</p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full border border-background/20 flex items-center justify-center hover:bg-background/10 transition-colors"
                >
                  <Icon className="w-4 h-4 text-background/60" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 text-center">
          <p className="font-sans text-xs text-background/40">
            © 2025 Lens of Kenya. All rights reserved. Based in Nairobi, Kenya.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
