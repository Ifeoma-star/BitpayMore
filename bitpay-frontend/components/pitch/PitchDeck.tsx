"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { SlideNavigation } from "./SlideNavigation";
import { SpeakerNotes } from "./SpeakerNotes";
import {
  Slide01Title,
  slide01Notes
} from "./slides/Slide01Title";
import {
  Slide02TwitterPitch,
  slide02Notes
} from "./slides/Slide02TwitterPitch";
import {
  Slide03Problem,
  slide03Notes
} from "./slides/Slide03Problem";
import {
  Slide04Solution,
  slide04Notes
} from "./slides/Slide04Solution";
import {
  Slide05Proposition,
  slide05Notes as slide05PropNotes
} from "./slides/Slide05Proposition";
import {
  Slide05Demo as Slide06Demo,
  slide05Notes as slide06DemoNotes
} from "./slides/Slide06Demo";
import {
  Slide06ValueProps as Slide07ValueProps,
  slide06Notes as slide07ValueNotes
} from "./slides/Slide06ValueProps";
import {
  Slide07TechStack as Slide08TechStack,
  slide07Notes as slide08TechNotes
} from "./slides/Slide07TechStack";
import {
  Slide08Traction as Slide09Traction,
  slide08Notes as slide09TractionNotes
} from "./slides/Slide08Traction";
import {
  Slide09Closing as Slide10Closing,
  slide09Notes as slide10ClosingNotes
} from "./slides/Slide09Closing";

const slides = [
  { component: Slide01Title, notes: slide01Notes },
  { component: Slide02TwitterPitch, notes: slide02Notes },
  { component: Slide03Problem, notes: slide03Notes },
  { component: Slide04Solution, notes: slide04Notes },
  { component: Slide05Proposition, notes: slide05PropNotes },
  { component: Slide06Demo, notes: slide06DemoNotes },
  { component: Slide07ValueProps, notes: slide07ValueNotes },
  { component: Slide08TechStack, notes: slide08TechNotes },
  { component: Slide09Traction, notes: slide09TractionNotes },
  { component: Slide10Closing, notes: slide10ClosingNotes },
];

export function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const toggleNotes = useCallback(() => {
    setShowNotes((prev) => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          goToNext();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          goToPrevious();
          break;
        case "Home":
          e.preventDefault();
          goToSlide(0);
          break;
        case "End":
          e.preventDefault();
          goToSlide(slides.length - 1);
          break;
        case "n":
        case "N":
          e.preventDefault();
          toggleNotes();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "Escape":
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, goToSlide, toggleNotes, toggleFullscreen]);

  const CurrentSlideComponent = slides[currentSlide].component;
  const currentNotes = slides[currentSlide].notes;

  return (
    <div className="relative h-screen bg-white overflow-hidden">
      {/* Home button - appears on hover */}
      <Link
        href="/"
        className="group fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border-2 border-gray-200 opacity-0 hover:opacity-100 transition-all duration-300 hover:border-orange-300 hover:shadow-lg"
        title="Back to Home"
      >
        <Home className="w-5 h-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
        <span className="text-sm font-medium text-gray-600 group-hover:text-orange-600 transition-colors">
          Home
        </span>
      </Link>

      {/* Current slide */}
      <div className="h-full pb-16">
        <CurrentSlideComponent />
      </div>

      {/* Navigation */}
      <SlideNavigation
        currentSlide={currentSlide}
        totalSlides={slides.length}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onSlideChange={goToSlide}
        showNotes={showNotes}
        onToggleNotes={toggleNotes}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Speaker notes */}
      <SpeakerNotes
        isVisible={showNotes}
        notes={currentNotes.notes}
        timing={currentNotes.timing}
        onClose={() => setShowNotes(false)}
      />
    </div>
  );
}
