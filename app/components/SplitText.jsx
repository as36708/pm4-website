"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Cloudflare Workers evaluate the server bundle outside a request handler.
// Register browser-only GSAP plugins only after a browser runtime exists so
// their internal timers are never created during Worker module evaluation.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);
}

const SplitText = ({
  text,
  className = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "left",
  tag = "p",
  desktopOnly = true,
  onLetterAnimationComplete,
}) => {
  const ref = useRef(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    let active = true;
    document.fonts.ready.then(() => {
      if (active) setFontsLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const query = desktopOnly
      ? "(min-width: 1101px) and (prefers-reduced-motion: no-preference)"
      : "(prefers-reduced-motion: no-preference)";
    const media = window.matchMedia(query);
    const update = () => setAnimationEnabled(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [desktopOnly]);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded || !animationEnabled) return;
      if (animationCompletedRef.current) return;

      const el = ref.current;

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch {
          // The previous split may already have been reverted.
        }
        el._rbsplitInstance = null;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? Number.parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || "px" : "px";
      const sign =
        marginValue === 0
          ? ""
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      let targets;
      const assignTargets = (self) => {
        if (splitType.includes("chars") && self.chars.length) targets = self.chars;
        if (!targets && splitType.includes("words") && self.words.length) targets = self.words;
        if (!targets && splitType.includes("lines") && self.lines.length) targets = self.lines;
        if (!targets) targets = self.chars || self.words || self.lines;
      };

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === "lines",
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        reduceWhiteSpace: false,
        onSplit: (self) => {
          assignTargets(self);
          return gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: el,
                start,
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4,
              },
              onComplete: () => {
                animationCompletedRef.current = true;
                onCompleteRef.current?.();
              },
              willChange: "transform, opacity",
              force3D: true,
            },
          );
        },
      });

      el._rbsplitInstance = splitInstance;

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === el) trigger.kill();
        });
        try {
          splitInstance.revert();
        } catch {
          // The split may already have been reverted during responsive cleanup.
        }
        el._rbsplitInstance = null;
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
        animationEnabled,
      ],
      scope: ref,
    },
  );

  const Tag = tag || "p";
  const style = {
    textAlign,
    overflow: "hidden",
    display: "inline-block",
    whiteSpace: "normal",
    overflowWrap: "break-word",
    willChange: animationEnabled ? "transform, opacity" : "auto",
  };

  return (
    <Tag ref={ref} style={style} className={`split-parent ${className}`.trim()}>
      {text}
    </Tag>
  );
};

export default SplitText;
