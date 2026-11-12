
import { useLayoutEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Link } from "react-router-dom";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import CosmicScene from "../experience/scenes/CosmicScene";

gsap.registerPlugin(ScrollTrigger);

export default function CosmicPreview() {
  const journeyRef = useRef(null);

  const approachSectionRef = useRef(null);

  const awakeningCopyRef = useRef(null);
  const approachCopyRef = useRef(null);
  const scrollCueRef = useRef(null);

  // Shared with the Three.js camera without React re-renders.
  const progressRef = useRef(0);

  useLayoutEffect(() => {
    const root = journeyRef.current;

    if (!root) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Smooth scroll and GSAP share one animation clock.
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
      // --------------------------------------
      // CAMERA PROGRESS
      // --------------------------------------

      const cameraState = {
        progress: 0,
      };

      gsap.to(cameraState, {
        progress: 1,
        ease: "none",

        onUpdate: () => {
          progressRef.current = cameraState.progress;
        },

        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: prefersReducedMotion ? true : 0.45,
          invalidateOnRefresh: true,
        },
      });

      // --------------------------------------
      // CHAPTER 001 — AWAKENING
      // --------------------------------------

      gsap.fromTo(
        awakeningCopyRef.current,
        {
          autoAlpha: 1,
          y: 0,
        },
        {
          autoAlpha: 0,
          y: -65,
          ease: "none",

          scrollTrigger: {
            trigger: approachSectionRef.current,
            start: "top bottom",
            end: "top 30%",
            scrub: true,
          },
        }
      );

      // --------------------------------------
      // CHAPTER 002 — THE APPROACH
      // --------------------------------------

      gsap.fromTo(
        approachCopyRef.current,
        {
          autoAlpha: 0,
          y: 65,
        },
        {
          autoAlpha: 1,
          y: 0,
          ease: "none",

          scrollTrigger: {
            trigger: approachSectionRef.current,
            start: "top 88%",
            end: "top 30%",
            scrub: true,
          },
        }
      );

      // Scroll instruction disappears naturally.
      gsap.to(scrollCueRef.current, {
        autoAlpha: 0,
        ease: "none",

        scrollTrigger: {
          trigger: approachSectionRef.current,
          start: "top bottom",
          end: "top 70%",
          scrub: true,
        },
      });

    }, root);

    ScrollTrigger.refresh();

    return () => {
      context.revert();

      if (lenis) {
        gsap.ticker.remove(updateLenis);
        lenis.destroy();
        gsap.ticker.lagSmoothing(500, 33);
      }

      progressRef.current = 0;
    };
  }, []);

  return (
    <main
      ref={journeyRef}
      className="relative isolate min-h-[300vh] w-full overflow-clip bg-[#02030a] text-white"
    >

      {/* ======================================
          FIXED 3D ENVIRONMENT
      ====================================== */}

      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-label="Animated deep-space environment"
      >
        <Canvas
          camera={{
            position: [0, 0, 5],
            fov: 65,
            near: 0.1,
            far: 500,
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
          <CosmicScene progressRef={progressRef} />
        </Canvas>
      </div>

      {/* ======================================
          ATMOSPHERIC OVERLAYS
      ====================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 bg-gradient-to-b from-[#02030a]/40 via-transparent to-[#02030a]/65"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(2,3,10,0.38)_100%)]"
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

        <div
          ref={awakeningCopyRef}
          className="relative z-20 max-w-3xl p-6 pb-14 sm:p-9 sm:pb-16 lg:p-12 lg:pb-20"
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

        {/* Scroll instruction */}
        <div
          ref={scrollCueRef}
          className="pointer-events-none absolute bottom-8 left-1/2 z-30 -translate-x-1/2 flex flex-col items-center gap-3"
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

      <section
        ref={approachSectionRef}
        className="relative min-h-[200vh]"
      >

        <div className="sticky top-0 flex min-h-screen items-center">

          <div
            ref={approachCopyRef}
            className="relative z-20 max-w-2xl px-6 sm:px-9 lg:px-12"
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

      </section>

      {/* ======================================
          ENVIRONMENT METADATA
      ====================================== */}

      <div className="pointer-events-none fixed bottom-8 right-8 z-30 hidden text-right md:block">

        <p className="font-mono text-[8px] tracking-[0.17em] text-[#718795]">
          COSMIC ENVIRONMENT
        </p>

        <p className="mt-3 font-mono text-[9px] text-[#a5dce5]">
          PROCEDURAL NEBULA
        </p>

        <p className="mt-1 font-mono text-[9px] text-[#718795]">
          3D PARTICLE ENVIRONMENT
        </p>

        <p className="mt-1 font-mono text-[9px] text-[#718795]">
          PLANETARY RECONSTRUCTION
        </p>

      </div>

      {/* Return navigation */}
      <Link
        to="/"
        className="fixed bottom-7 left-6 z-40 inline-flex items-center gap-3 rounded-full border border-cyan-200/25 bg-[#09131e]/70 px-4 py-3 font-mono text-[8px] tracking-[0.14em] text-[#a5edf5] backdrop-blur-md transition duration-300 hover:border-cyan-200/50 hover:bg-cyan-200/[0.12] sm:left-9 lg:left-12"
      >
        ← RETURN TO WORKSPACE
      </Link>

    </main>
  );
}
