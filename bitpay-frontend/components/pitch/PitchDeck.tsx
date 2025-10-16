"use client";

import { useState, useEffect, useCallback } from "react";
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
  Slide05Demo,
  slide05Notes
} from "./slides/Slide05Demo";
import {
  Slide06ValueProps,
  slide06Notes
} from "./slides/Slide06ValueProps";
import {
  Slide07TechStack,
  slide07Notes
} from "./slides/Slide07TechStack";
import {
  Slide08Traction,
  slide08Notes
} from "./slides/Slide08Traction";
import {
  Slide09Closing,
  slide09Notes
} from "./slides/Slide09Closing";

const slides = [
  { component: Slide01Title, notes: slide01Notes },
  { component: Slide02TwitterPitch, notes: slide02Notes },
  { component: Slide03Problem, notes: slide03Notes },
  { component: Slide04Solution, notes: slide04Notes },
  { component: Slide05Demo, notes: slide05Notes },
  { component: Slide06ValueProps, notes: slide06Notes },
  { component: Slide07TechStack, notes: slide07Notes },
  { component: Slide08Traction, notes: slide08Notes },
  { component: Slide09Closing, notes: slide09Notes },
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
    <div className="relative min-h-screen bg-white">
      {/* Current slide */}
      <div className="pb-20">
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
