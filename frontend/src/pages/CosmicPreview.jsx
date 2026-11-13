
import { useLayoutEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Link } from "react-router-dom";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import CosmicScene from "../experience/scenes/CosmicScene";

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// REUSABLE CELESTIAL TYPOGRAPHY AURA
// ==========================================

function CelestialAura({ auraRef }) {
  return (
    <div
      ref={auraRef}
      aria-hidden="true"
      className="pointer-events-none absolute -inset-x-24 -inset-y-20 z-0 opacity-0 mix-blend-screen"
    >
      {/* Emerald plasma cloud */}
      <div className="absolute inset-0 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(61,255,187,0.19)_0%,rgba(24,220,162,0.075)_42%,transparent_74%)] blur-2xl" />

      {/* Horizontal energy filament */}
      <div className="absolute left-[7%] right-[7%] top-1/2 h-px bg-gradient-to-r from-transparent via-emerald-200/65 to-transparent shadow-[0_0_20px_rgba(65,255,185,0.72)]" />

      {/* Plasma boundary */}
      <div className="absolute left-[18%] right-[18%] top-[13%] bottom-[13%] rounded-[48%] border border-emerald-300/15 blur-[2px]" />

      {/* Energy flare */}
      <div className="absolute left-[22%] top-[18%] h-3 w-3 rounded-full bg-emerald-200/25 blur-md shadow-[0_0_24px_rgba(65,255,185,0.8)]" />
    </div>
  );
}

export default function CosmicPreview() {
  const journeyRef = useRef(null);

  // Chapter content
  const awakeningCopyRef = useRef(null);
  const approachCopyRef = useRef(null);
  const nebulaCopyRef = useRef(null);
  const spectralCopyRef = useRef(null);
  const chapterFiveCopyRef = useRef(null);
  const chapterSixIntroRef = useRef(null);
  const chapterSixFinalRef = useRef(null);
  const chapterSixFadeRef = useRef(null);
  const environmentMetaRef = useRef(null);
  const returnNavigationRef = useRef(null);

  // Chapter energy fields
  const awakeningAuraRef = useRef(null);
  const approachAuraRef = useRef(null);
  const nebulaAuraRef = useRef(null);
  const spectralAuraRef = useRef(null);
  const chapterFiveAuraRef = useRef(null);

  const scrollCueRef = useRef(null);
  const chapterFiveSectionRef = useRef(null);
  const chapterSixSectionRef = useRef(null);

  // Shared with the Three.js camera.
  const progressRef = useRef(0);
  const chapterFiveProgressRef = useRef(0);
  const chapterSixProgressRef = useRef(0);

  // Explicit ownership avoids falling back to the previous camera
  // path during the first frame of a chapter or at a chapter boundary.
  const chapterFiveActiveRef = useRef(false);
  const chapterSixActiveRef = useRef(false);

  // ======================================
  // LENIS + MASTER CINEMATIC TIMELINE
  // ======================================

  useLayoutEffect(() => {
    const root = journeyRef.current;

    if (!root) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const lenis = prefersReducedMotion
      ? null
      : new Lenis({
          autoRaf: false,
          lerp: 0.085,
          smoothWheel: true,
          syncTouch: false,
        });

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };

    const updateLenis = (time) => {
      lenis?.raf(time * 1000);
    };

    if (lenis) {
      lenis.on("scroll", onLenisScroll);

      gsap.ticker.add(updateLenis);
      gsap.ticker.lagSmoothing(0);
    }

    const context = gsap.context(() => {

      // ======================================
      // INITIAL CONTENT STATES
      // ======================================

      gsap.set(awakeningCopyRef.current, {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
      });

      gsap.set(awakeningAuraRef.current, {
        autoAlpha: 0.14,
        scale: 1,
        filter: "blur(18px)",
      });

      gsap.set(approachCopyRef.current, {
        autoAlpha: 0,
        y: 36,
        filter: "blur(12px)",
      });

      gsap.set(approachAuraRef.current, {
        autoAlpha: 0,
        scale: 0.84,
        filter: "blur(28px)",
      });

      gsap.set(nebulaCopyRef.current, {
        autoAlpha: 0,
        y: 38,
        filter: "blur(8px)",
      });

      gsap.set(nebulaAuraRef.current, {
        autoAlpha: 0,
        scale: 0.82,
        filter: "blur(28px)",
      });

      gsap.set(spectralCopyRef.current, {
        autoAlpha: 0,
        y: 40,
        filter: "blur(12px)",
      });

      gsap.set(spectralAuraRef.current, {
        autoAlpha: 0,
        scale: 0.80,
        filter: "blur(28px)",
      });

      gsap.set(chapterFiveCopyRef.current, {
        autoAlpha: 0,
        y: 42,
        filter: "blur(14px)",
      });

      gsap.set(chapterFiveAuraRef.current, {
        autoAlpha: 0,
        scale: 0.76,
        filter: "blur(32px)",
      });

      gsap.set(chapterSixIntroRef.current, {
        autoAlpha: 0,
        y: 38,
        filter: "blur(12px)",
      });

      gsap.set(chapterSixFinalRef.current, {
        autoAlpha: 0,
        y: 22,
        filter: "blur(10px)",
      });

      gsap.set(chapterSixFadeRef.current, {
        autoAlpha: 0,
      });

      // ======================================
      // MASTER SCROLL TIMELINE
      // ======================================

      const cameraState = {
        progress: 0,
      };

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          // Preserve the original 600vh scroll span for Chapters 001–004.
          end: () => "+=" + window.innerHeight * 6,
          scrub: prefersReducedMotion ? true : 0.45,
          invalidateOnRefresh: true,
        },
      });

      // Camera and typography share the same
      // continuous scroll progress.
      master.to(
        cameraState,
        {
          progress: 1,
          duration: 1,
          ease: "none",

          onUpdate: () => {
            progressRef.current =
              cameraState.progress;
          },
        },
        0
      );

      // ======================================
      // CHAPTER 001 — AWAKENING
      // ======================================

      master.to(
        awakeningCopyRef.current,
        {
          autoAlpha: 0,
          y: -36,
          filter: "blur(8px)",
          duration: 0.06,
          ease: "none",
        },
        0.11
      );

      master.to(
        awakeningAuraRef.current,
        {
          autoAlpha: 0.04,
          scale: 1.10,
          filter: "blur(26px)",
          duration: 0.09,
          ease: "none",
        },
        0.11
      );

      // ======================================
      // CHAPTER 002 — THE APPROACH
      // ======================================

      master.fromTo(
        approachAuraRef.current,
        {
          autoAlpha: 0,
          scale: 0.82,
          filter: "blur(26px)",
        },
        {
          autoAlpha: 0.19,
          scale: 1,
          filter: "blur(15px)",
          duration: 0.07,
          ease: "none",
          immediateRender: false,
        },
        0.17
      );

      master.fromTo(
        approachCopyRef.current,
        {
          autoAlpha: 0,
          y: 36,
          filter: "blur(12px)",
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.08,
          ease: "none",
          immediateRender: false,
        },
        0.21
      );

      master.to(
        approachCopyRef.current,
        {
          autoAlpha: 0,
          y: -34,
          filter: "blur(9px)",
          duration: 0.06,
          ease: "none",
        },
        0.41
      );

      master.to(
        approachAuraRef.current,
        {
          autoAlpha: 0.04,
          scale: 1.10,
          filter: "blur(25px)",
          duration: 0.08,
          ease: "none",
        },
        0.41
      );

      // ======================================
      // CHAPTER 003 — THROUGH THE NEBULA
      // ======================================

      // First, the emerald aura starts forming
      // while the distant nebula is emerging.
      master.fromTo(
        nebulaAuraRef.current,
        {
          autoAlpha: 0,
          scale: 0.78,
          filter: "blur(28px)",
        },
        {
          autoAlpha: 0.24,
          scale: 1,
          filter: "blur(15px)",
          duration: 0.065,
          ease: "none",
          immediateRender: false,
        },
        0.55
      );

      // Text arrives earlier than before.
      // Faster, sharper entrance so it settles properly.
      master.fromTo(
        nebulaCopyRef.current,
        {
          autoAlpha: 0,
          y: 32,
          filter: "blur(8px)",
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.045,
          ease: "none",
          immediateRender: false,
        },
        0.59
      );

      // IMPORTANT:
      // Keep the text fully visible through most of
      // the nebula chapter. It should not immediately
      // dissolve after appearing.
      master.to(
        nebulaCopyRef.current,
        {
          autoAlpha: 0,
          y: -34,
          filter: "blur(7px)",
          duration: 0.04,
          ease: "none",
        },
        0.81
      );

      // Its emerald energy field recedes more gradually.
      master.to(
        nebulaAuraRef.current,
        {
          autoAlpha: 0.035,
          scale: 1.13,
          filter: "blur(27px)",
          duration: 0.055,
          ease: "none",
        },
        0.805
      );

      // ======================================
      // CHAPTER 004 — BEYOND VISIBLE LIGHT
      // ======================================

      // Spectral aura starts as Chapter 003 dissolves.
      master.fromTo(
        spectralAuraRef.current,
        {
          autoAlpha: 0,
          scale: 0.78,
          filter: "blur(30px)",
        },
        {
          autoAlpha: 0.25,
          scale: 1,
          filter: "blur(15px)",
          duration: 0.08,
          ease: "none",
          immediateRender: false,
        },
        0.845
      );

      // Scene 004 typography appears while the
      // spectral curtains and celestial reveal continue.
      master.fromTo(
        spectralCopyRef.current,
        {
          autoAlpha: 0,
          y: 36,
          filter: "blur(10px)",
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.10,
          ease: "none",
          immediateRender: false,
        },
        0.88
      );

      // Opening scroll cue.
      master.to(
        scrollCueRef.current,
        {
          autoAlpha: 0,
          y: 12,
          duration: 0.06,
          ease: "none",
        },
        0.10
      );


      // ======================================
      // CHAPTER 005 — THE SKY REMEMBERS
      // ======================================

      // This independent controller starts after the original 700vh
      // four-chapter layout. The first timeline above keeps its original
      // 600vh scroll distance, so Chapters 001–004 are not retimed.
      const chapterFiveState = { progress: 0 };

      const chapterFiveTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: chapterFiveSectionRef.current,
          start: "top top",

          // Chapter 005 owns the complete 200vh section. Its sticky
          // copy exits during the second half while the camera continues
          // through the nebula toward the Chapter 006 hand-off.
          end: "bottom top",

          scrub: prefersReducedMotion ? true : 0.45,
          invalidateOnRefresh: true,

          onToggle: (self) => {
            chapterFiveActiveRef.current = self.isActive;
          },

          onRefresh: (self) => {
            chapterFiveActiveRef.current = self.isActive;
          },
        },
      });

      chapterFiveTimeline.to(
        chapterFiveState,
        {
          progress: 1,
          duration: 1,
          ease: "none",
          onUpdate: () => {
            chapterFiveProgressRef.current =
              chapterFiveState.progress;
          },
        },
        0
      );

      chapterFiveTimeline.fromTo(
        chapterFiveAuraRef.current,
        {
          autoAlpha: 0,
          scale: 0.76,
          filter: "blur(32px)",
        },
        {
          autoAlpha: 0.25,
          scale: 1,
          filter: "blur(16px)",
          duration: 0.15,
          ease: "none",
          immediateRender: false,
        },
        0.10
      );

      chapterFiveTimeline.fromTo(
        chapterFiveCopyRef.current,
        {
          autoAlpha: 0,
          y: 42,
          filter: "blur(14px)",
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.12,
          ease: "none",
          immediateRender: false,
        },
        0.22
      );

      chapterFiveTimeline.to(
        chapterFiveCopyRef.current,
        {
          autoAlpha: 0,
          y: -32,
          filter: "blur(9px)",
          duration: 0.075,
          ease: "none",
        },
        0.40
      );

      chapterFiveTimeline.to(
        chapterFiveAuraRef.current,
        {
          autoAlpha: 0.035,
          scale: 1.12,
          filter: "blur(29px)",
          duration: 0.085,
          ease: "none",
        },
        0.42
      );

      // ======================================
      // CHAPTER 006 — THE FINAL ORBIT
      // ======================================

      // Independent 200vh controller: Chapters 001–005 keep their
      // original timing while the final chapter receives its own camera path.
      const chapterSixState = { progress: 0 };

      const chapterSixTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: chapterSixSectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: prefersReducedMotion ? true : 0.45,
          invalidateOnRefresh: true,

          onToggle: (self) => {
            chapterSixActiveRef.current = self.isActive;
          },

          onRefresh: (self) => {
            chapterSixActiveRef.current = self.isActive;
          },
        },
      });

      chapterSixTimeline.to(
        chapterSixState,
        {
          progress: 1,
          duration: 1,
          ease: "none",
          onUpdate: () => {
            chapterSixProgressRef.current = chapterSixState.progress;
          },
        },
        0
      );

      chapterSixTimeline.fromTo(
        chapterSixIntroRef.current,
        {
          autoAlpha: 0,
          y: 38,
          filter: "blur(12px)",
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.12,
          ease: "none",
          immediateRender: false,
        },
        0.15
      );

      chapterSixTimeline.to(
        chapterSixIntroRef.current,
        {
          autoAlpha: 0,
          y: -26,
          filter: "blur(8px)",
          duration: 0.09,
          ease: "none",
        },
        0.66
      );

      // The final wide composition holds before the scene fades to black.
      // The closing title remains above the veil as the visual world disappears.
      chapterSixTimeline.to(
        chapterSixFadeRef.current,
        {
          autoAlpha: 1,
          duration: 0.10,
          ease: "none",
        },
        0.90
      );

      chapterSixTimeline.to(
        [environmentMetaRef.current, returnNavigationRef.current],
        {
          autoAlpha: 0,
          duration: 0.08,
          ease: "none",
        },
        0.90
      );

      chapterSixTimeline.fromTo(
        chapterSixFinalRef.current,
        {
          autoAlpha: 0,
          y: 22,
          filter: "blur(10px)",
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.08,
          ease: "none",
          immediateRender: false,
        },
        0.92
      );

    }, root);

    ScrollTrigger.refresh();

    return () => {
      context.revert();

      if (lenis) {
        gsap.ticker.remove(updateLenis);

        lenis.off("scroll", onLenisScroll);
        lenis.destroy();

        gsap.ticker.lagSmoothing(500, 33);
      }

      progressRef.current = 0;
      chapterFiveProgressRef.current = 0;
      chapterSixProgressRef.current = 0;

      chapterFiveActiveRef.current = false;
      chapterSixActiveRef.current = false;
    };
  }, []);

  return (
    <main
      ref={journeyRef}
      className="relative isolate min-h-[1200vh] w-full overflow-clip bg-[#02030a] text-white"
    >

      {/* ======================================
          FIXED THREE-DIMENSIONAL ENVIRONMENT
      ====================================== */}

      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-label="Immersive animated cosmic environment"
      >
        <Canvas
          camera={{
            position: [0, 0, 5],
            fov: 65,
            near: 0.1,
            far: 11000,
          }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#02030a] p-8 text-center">
              <p className="text-sm text-slate-400">
                This browser cannot render the real-time
                cosmic environment.
              </p>
            </div>
          }
        >
          <CosmicScene
            progressRef={progressRef}
            chapterFiveProgressRef={chapterFiveProgressRef}
            chapterSixProgressRef={chapterSixProgressRef}
            chapterFiveActiveRef={chapterFiveActiveRef}
            chapterSixActiveRef={chapterSixActiveRef}
          />
        </Canvas>
      </div>

      {/* ======================================
          ATMOSPHERIC OVERLAYS
      ====================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 bg-gradient-to-b from-[#02030a]/35 via-transparent to-[#02030a]/60"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(2,3,10,0.32)_100%)]"
      />

      {/* ======================================
          PERSISTENT HEADER
      ====================================== */}

      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between p-6 sm:p-9 lg:p-12">

        <div>
          <p className="font-display text-lg font-bold tracking-[0.24em] text-[#edf4f7] sm:text-xl">
            ASTROSHIFT
          </p>

          <p className="mt-2 font-mono text-[8px] tracking-[0.2em] text-[#91a8bc] sm:text-[9px]">
            BEYOND THE VISIBLE
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-cyan-200/15 bg-[#09131e]/50 px-3 py-2 backdrop-blur-md sm:px-4">

          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.7)]" />

          <span className="font-mono text-[8px] tracking-[0.14em] text-[#a5dce5] sm:text-[9px]">
            REAL-TIME 3D
          </span>

        </div>

      </header>

      {/* ======================================
          CHAPTER 001 — AWAKENING
      ====================================== */}

      <section className="relative flex min-h-screen items-end">

        <div className="pointer-events-none absolute left-6 top-28 z-20 sm:left-9 lg:left-12">

          <p className="font-mono text-[8px] tracking-[0.2em] text-[#718795]">
            ENVIRONMENT STUDY
          </p>

          <p className="mt-2 font-mono text-[10px] tracking-wider text-[#8ce7f5]">
            001 / AWAKENING
          </p>

        </div>

        <div className="relative z-20 max-w-3xl p-6 pb-14 sm:p-9 sm:pb-16 lg:p-12 lg:pb-20">

          <CelestialAura auraRef={awakeningAuraRef} />

          <div
            ref={awakeningCopyRef}
            className="relative z-10"
          >

            <p className="font-mono text-[9px] tracking-[0.2em] text-[#8ce7f5] sm:text-[10px]">
              COSMOS ENGINE / PROTOTYPE
            </p>

            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-8xl">
              Beyond
              <br />
              <span className="text-[#8ce7f5]">
                the visible.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-xs leading-7 text-[#a5b4c1] sm:text-sm sm:leading-8">
              Somewhere beyond the familiar, worlds are
              waiting to be discovered.
            </p>

          </div>

        </div>

        <div
          ref={scrollCueRef}
          className="pointer-events-none absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="font-mono text-[8px] tracking-[0.24em] text-[#9bb6c1]">
            SCROLL TO TRAVEL
          </span>

          <div className="flex h-9 w-5 justify-center rounded-full border border-cyan-100/30 p-1.5">
            <span className="h-1.5 w-1 rounded-full bg-[#8ce7f5] animate-bounce" />
          </div>

        </div>

      </section>

      {/* ======================================
          CHAPTER 002 — THE APPROACH
      ====================================== */}

      <section className="relative min-h-[200vh]">

        <div className="sticky top-0 flex min-h-screen items-center">

          <div className="relative z-20 max-w-2xl px-6 sm:px-9 lg:px-12">

            <CelestialAura auraRef={approachAuraRef} />

            <div
              ref={approachCopyRef}
              className="relative z-10"
            >

              <p className="font-mono text-[9px] tracking-[0.22em] text-[#8ce7f5] sm:text-[10px]">
                CHAPTER 002 / THE APPROACH
              </p>

              <h2 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                A world
                <br />
                emerges from
                <br />
                <span className="text-[#8ce7f5]">
                  the dark.
                </span>
              </h2>

              <p className="mt-7 max-w-md text-xs leading-7 text-[#a5b4c1] sm:text-sm sm:leading-8">
                We leave the distant starfield behind.
                A mysterious world grows larger with every
                passing moment.
              </p>

              <div className="mt-9 border-l border-cyan-200/35 pl-4">

                <p className="font-mono text-[8px] tracking-[0.17em] text-[#8ce7f5]">
                  DESTINATION / QUAOAR
                </p>

                <p className="mt-2 max-w-sm text-[10px] leading-6 text-[#8195a5]">
                  A distant Kuiper Belt world.
                  Its detailed surface in this experience
                  is an artistic reconstruction.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================
          CHAPTER 003 — THROUGH THE NEBULA
      ====================================== */}

      <section className="relative min-h-[200vh]">

        <div className="sticky top-0 flex min-h-screen items-center">

          <div className="relative z-20 max-w-2xl px-6 sm:px-9 lg:px-12">

            <CelestialAura auraRef={nebulaAuraRef} />

            <div
              ref={nebulaCopyRef}
              className="relative z-10"
            >

              <p className="font-mono text-[9px] tracking-[0.22em] text-[#8ce7f5] sm:text-[10px]">
                CHAPTER 003 / THROUGH THE NEBULA
              </p>

              <h2 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                Where stars
                <br />
                are born
                <br />
                <span className="text-[#8ce7f5]">
                  in light.
                </span>
              </h2>

              <p className="mt-7 max-w-md text-xs leading-7 text-[#a5b4c1] sm:text-sm sm:leading-8">
                We move through immense structures of
                interstellar gas and dust, exploring the
                environments in which stars form.
              </p>

              <div className="mt-9 border-l border-cyan-200/35 pl-4">

                <p className="font-mono text-[8px] tracking-[0.17em] text-[#8ce7f5]">
                  ENVIRONMENT / DEEP SPACE
                </p>

                <p className="mt-2 max-w-sm text-[10px] leading-6 text-[#8195a5]">
                  A panoramic artistic visualization of
                  interstellar gas, dust and distant stars,
                  created for the AstroShift cosmic journey.
                </p>

                <p className="mt-2 text-[9px] leading-5 text-[#607889]">
                  Artistic reconstruction — not a direct
                  astronomical observation.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================
          CHAPTER 004 — BEYOND VISIBLE LIGHT
      ====================================== */}

      <section className="relative min-h-[200vh]">

        <div className="sticky top-0 flex min-h-screen items-center">

          <div className="relative z-20 max-w-3xl px-6 sm:px-9 lg:px-12">

            <CelestialAura auraRef={spectralAuraRef} />

            <div
              ref={spectralCopyRef}
              className="relative z-10"
            >

              <p className="font-mono text-[9px] tracking-[0.22em] text-[#8ce7f5] sm:text-[10px]">
                CHAPTER 004 / BEYOND VISIBLE LIGHT
              </p>

              <h2 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                Light beyond
                <br />
                what we
                <br />
                <span className="text-[#8ce7f5]">
                  can see.
                </span>
              </h2>

              <p className="mt-7 max-w-lg text-xs leading-7 text-[#a5b4c1] sm:text-sm sm:leading-8">
                The universe carries information beyond
                the limits of human vision. By separating
                light into wavelengths, astronomers can
                uncover clues hidden within stars,
                galaxies and interstellar clouds.
              </p>

              <div className="mt-9 border-l border-cyan-200/35 pl-4">

                <p className="font-mono text-[8px] tracking-[0.17em] text-[#8ce7f5]">
                  MISSION / SPHEREx
                </p>

                <div className="mt-4 flex flex-wrap items-end gap-x-10 gap-y-4">

                  <div>
                    <p className="font-display text-4xl font-semibold text-white sm:text-5xl">
                      102
                    </p>

                    <p className="mt-1 font-mono text-[8px] tracking-[0.12em] text-[#8ce7f5]">
                      SPECTRAL CHANNELS
                    </p>
                  </div>

                  <div>
                    <p className="font-display text-3xl font-semibold text-white sm:text-4xl">
                      0.75–5.0
                    </p>

                    <p className="mt-1 font-mono text-[8px] tracking-[0.12em] text-[#8ce7f5]">
                      MICROMETRES
                    </p>
                  </div>

                </div>

                <div className="mt-6 h-1.5 w-full max-w-md rounded-full bg-gradient-to-r from-violet-500 via-blue-400 via-cyan-300 via-emerald-300 via-yellow-300 via-orange-400 to-rose-500" />

                <div className="mt-2 flex max-w-md justify-between font-mono text-[8px] text-[#8195a5]">
                  <span>0.75 μm</span>
                  <span>NEAR-INFRARED</span>
                  <span>5.0 μm</span>
                </div>

                <p className="mt-4 max-w-md text-[10px] leading-6 text-[#8195a5]">
                  Infrared wavelengths represented through
                  illustrative false colour. The spectral
                  visualization is artistic, not actual
                  SPHEREx instrument data.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================
          CHAPTER 005 — THE CHANGING SKY
      ====================================== */}

      <section
        ref={chapterFiveSectionRef}
        className="relative min-h-[200vh]"
      >

        <div className="sticky top-0 flex min-h-screen items-center">

          <div className="relative z-20 max-w-3xl px-6 sm:px-9 lg:px-12">

            <CelestialAura auraRef={chapterFiveAuraRef} />

            <div
              ref={chapterFiveCopyRef}
              className="relative z-10"
            >

              <p className="font-mono text-[9px] tracking-[0.22em] text-[#8ce7f5] sm:text-[10px]">
                CHAPTER 005 / THE CHANGING SKY
              </p>

              <p className="mt-3 font-mono text-[8px] tracking-[0.2em] text-[#b8a5ff]">
                TEMPORAL STUDY / THE SKY REMEMBERS
              </p>

              <h2 className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                The sky
                <br />
                remembers
                <br />
                <span className="text-[#b8dfff]">everything.</span>
              </h2>

              <p className="mt-7 max-w-lg text-xs leading-7 text-[#a5b4c1] sm:text-sm sm:leading-8">
                Across the dark, light leaves echoes of what came before.
                We move between luminous layers of memory, where every
                moment becomes another trace in the universe.
              </p>

              <div className="mt-9 border-l border-violet-200/35 pl-4">

                <p className="font-mono text-[8px] tracking-[0.17em] text-[#b8a5ff]">
                  EXPERIENCE / TEMPORAL ECHO FIELD
                </p>

                <p className="mt-2 max-w-sm text-[10px] leading-6 text-[#8195a5]">
                  PAST / PRESENT / ECHO
                </p>

                <p className="mt-2 max-w-md text-[10px] leading-6 text-[#8195a5]">
                  Artistic reconstruction — an imaginative visualization
                  of cosmic time, not an astronomical observation.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================
          CHAPTER 006 — THE FINAL ORBIT
      ====================================== */}

      <section
        ref={chapterSixSectionRef}
        className="relative min-h-[300vh]"
      >
        <div className="sticky top-0 flex min-h-screen items-center">
          <div
            ref={chapterSixFadeRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 bg-[#02030a] opacity-0"
          />

          <div className="relative z-20 w-full px-6 sm:px-9 lg:px-12">

            <div className="relative max-w-xl">
              <div
                ref={chapterSixIntroRef}
                className="relative z-10 max-w-lg"
              >
                <p className="font-mono text-[9px] tracking-[0.22em] text-[#8ce7f5] sm:text-[10px]">
                  CHAPTER 006 / THE FINAL ORBIT
                </p>

                <p className="mt-3 font-mono text-[8px] tracking-[0.2em] text-[#b8a5ff]">
                  ASTRA-01 / ORBITAL OBSERVATORY
                </p>

                <h2 className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                  A final view
                  <br />
                  <span className="text-[#a9dfff]">of Earth.</span>
                </h2>

                <p className="mt-7 max-w-md text-xs leading-7 text-[#b6c4d3] sm:text-sm sm:leading-8">
                  ASTRA-01 settles into its quiet orbit. The camera draws back,
                  and the journey comes gently to rest.
                </p>
              </div>
            </div>

            <div
              ref={chapterSixFinalRef}
              className="pointer-events-auto absolute inset-x-6 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center text-center sm:inset-x-12"
            >
              <p className="font-mono text-[9px] tracking-[0.28em] text-[#9edcf5]">
                ASTROSHIFT / MISSION LOG 006
              </p>

              <h2 className="mt-6 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                Look
                <br />
                <span className="text-[#b8dfff]">beyond.</span>
              </h2>

              <p className="mt-5 font-mono text-[9px] tracking-[0.2em] text-[#a5b4c1]">
                THE JOURNEY CONTINUES
              </p>

              <Link
                to="/"
                className="mt-9 inline-flex items-center gap-3 rounded-full border border-cyan-100/35 bg-[#07111e]/75 px-7 py-4 font-mono text-[9px] font-semibold tracking-[0.18em] text-[#d7f4ff] shadow-[0_0_36px_rgba(74,168,255,0.12)] backdrop-blur-xl transition duration-300 hover:border-cyan-100/70 hover:bg-cyan-100/[0.12] hover:shadow-[0_0_46px_rgba(74,168,255,0.25)]"
              >
                RETURN TO ASTROSHIFT
                <span aria-hidden="true">→</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================
          ENVIRONMENT METADATA
      ====================================== */}

      <div
        ref={environmentMetaRef}
        className="pointer-events-none fixed bottom-8 right-8 z-30 hidden text-right md:block"
      >

        <p className="font-mono text-[8px] tracking-[0.17em] text-[#718795]">
          COSMIC ENVIRONMENT
        </p>

        <p className="mt-3 font-mono text-[9px] text-[#a5dce5]">
          PERSISTENT STARFIELD
        </p>

        <p className="mt-1 font-mono text-[9px] text-[#718795]">
          SPECTRAL CHANNEL VISUALIZATION
        </p>

        <p className="mt-1 font-mono text-[9px] text-[#718795]">
          PROCEDURAL DUST &amp; GAS
        </p>

      </div>

      {/* RETURN NAVIGATION */}

      <Link
        ref={returnNavigationRef}
        to="/"
        className="fixed bottom-7 left-6 z-40 inline-flex items-center gap-3 rounded-full border border-cyan-200/25 bg-[#09131e]/70 px-4 py-3 font-mono text-[8px] tracking-[0.14em] text-[#a5edf5] backdrop-blur-md transition duration-300 hover:border-cyan-200/50 hover:bg-cyan-200/[0.12] sm:left-9 lg:left-12"
      >
        ← RETURN TO WORKSPACE
      </Link>

    </main>
  );
}
