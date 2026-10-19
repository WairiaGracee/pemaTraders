import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  image: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; to: string };
}

// Swap the picsum URLs for your own photos, e.g. "/images/hero/living-room.jpg"
const slides: Slide[] = [
  {
    image: "/images/hero/Living-Room.jpg",
    eyebrow: "Living room",
    title: "Everything for a home you love.",
    text: "Sofas, wall units and TV stands, delivered to your door.",
    cta: { label: "Shop furniture", to: "/category/furniture" },
  },
  {
    image: "/images/hero/bedroom.jpg",
    eyebrow: "Bedroom",
    title: "Sleep better, wake up happier.",
    text: "Soft duvets, sheets and pillows at honest prices.",
    cta: { label: "Shop bedding", to: "/category/bedding" },
  },
  {
    image: "/images/hero/electronics.jpg",
    eyebrow: "Electronics",
    title: "Big screens. Big savings.",
    text: "Smart TVs, soundbars and home appliances.",
    cta: { label: "Shop electronics", to: "/category/electronics" },
  },
  {
    image: "/images/hero/carpets.jpg",
    eyebrow: "Carpets & rugs",
    title: "Warm up every room.",
    text: "Turkish, Persian and shaggy rugs in every size.",
    cta: { label: "Shop carpets", to: "/category/carpets" },
  },
];

const INTERVAL = 5000;

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    []
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [paused, next, current]); // `current` resets the timer after manual clicks

  return (
    <section
      className="relative h-[70vh] min-h-[480px] max-h-[760px] overflow-hidden bg-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      {slides.map((s, i) => {
        const active = i === current;
        return (
          <div
            key={s.image}
            aria-hidden={!active}
            className={`absolute inset-0 ${active ? "z-10" : "pointer-events-none z-0"}`}
          >
            {/* Background image: fades in, slowly zooms */}
            <img
              src={s.image}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? "scale(1.08)" : "scale(1)",
                transition: "opacity 1000ms ease, transform 6000ms ease-out",
              }}
            />
            {/* Dark overlay keeps text readable on any photo */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

            {/* Slide text */}
            <div
              className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 700ms ease 250ms, transform 700ms ease 250ms",
              }}
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand">
                {s.eyebrow}
              </p>
              <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                {s.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-neutral-200">{s.text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={s.cta.to}
                  tabIndex={active ? 0 : -1}
                  className="rounded-full bg-brand px-7 py-3 font-semibold text-ink transition hover:bg-white"
                >
                  {s.cta.label}
                </Link>
                <Link
                  to="/category/electronics"
                  tabIndex={active ? 0 : -1}
                  className="rounded-full border border-white/40 px-7 py-3 font-semibold transition hover:bg-white/10"
                >
                  View deals
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/30 p-2 backdrop-blur transition hover:bg-brand hover:text-ink sm:block"
      >
        <ChevronLeft size={26} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/30 p-2 backdrop-blur transition hover:bg-brand hover:text-ink sm:block"
      >
        <ChevronRight size={26} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              i === current ? "w-8 bg-brand" : "w-2.5 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}