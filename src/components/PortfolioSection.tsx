import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL || '';

const PortfolioSection = () => {
  const { data: images = [], isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => api.getPortfolio(),
  });

  if (isLoading) {
    return (
      <section id="portfolio" className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-sans text-sm uppercase tracking-[0.3em] text-primary mb-3">
              Portfolio
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">
              Stories Through the <span className="italic font-normal">Lens</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[280px]">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-muted rounded-lg"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-sans text-sm uppercase tracking-[0.3em] text-primary mb-3">
            Portfolio
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">
            Stories Through the <span className="italic font-normal">Lens</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[280px]">
          {images.map((img: { id: string; src: string; alt: string; label: string; span: string }, i: number) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative group overflow-hidden rounded-lg cursor-pointer ${img.span}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 border-4 border-rose-500 bg-gray-100"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image";
                }}
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-500 flex items-end">
                <div className="p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <span className="font-display text-xl text-primary-foreground">
                    {img.label}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
