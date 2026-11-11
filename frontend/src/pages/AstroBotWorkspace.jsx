
import {
  Bot,
  Orbit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function AstroBotWorkspace() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-8">

      {/* Page introduction */}
      <section className="relative isolate overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1721] p-6 sm:p-9 lg:p-12">

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-32 -z-10 h-[390px] w-[390px] rounded-full border border-cyan-200/[0.08]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-20 -z-10 h-[290px] w-[290px] rounded-full border border-cyan-200/[0.09]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-28 top-20 h-2 w-2 rounded-full bg-cyan-200/70 shadow-[0_0_24px_5px_rgba(140,231,245,0.25)]"
        />

        <div className="relative max-w-3xl">

          <div className="inline-flex items-center gap-2 rounded-md border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-2">
            <Orbit size={13} className="text-[#8ce7f5]" />

            <span className="font-mono text-[9px] font-medium tracking-[0.19em] text-[#a5dce5]">
              ASTROSHIFT / ASTROBOT
            </span>
          </div>

          <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-[#8297a5]">
            YOUR SCIENTIFIC COMPANION
          </p>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-[#edf4f7] sm:text-5xl lg:text-6xl">
            Ask the universe.
            <br />

            <span className="text-[#8ce7f5]">
              Understand the science.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-[#9aabb7] sm:text-base">
            Meet AstroBot, your AI astronomy companion.
            Explore SPHEREx, understand astronomical
            concepts and navigate the AstroShift mission
            through natural conversation.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">

            <span className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-[#a6b7c2]">
              <Sparkles size={14} className="text-[#8ce7f5]" />
              AI-powered assistance
            </span>

            <span className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-[#a6b7c2]">
              <ShieldCheck size={14} className="text-[#8ce7f5]" />
              Scientific guidance
            </span>

          </div>

        </div>
      </section>

      {/* Conversation heading */}
      <section>

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/[0.12] bg-cyan-200/[0.055]">
              <Bot size={20} className="text-[#8ce7f5]" />
            </div>

            <div>
              <p className="font-mono text-[9px] tracking-[0.16em] text-[#718795]">
                MISSION ASSISTANT
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold text-[#edf4f7]">
                Your conversation
              </h2>
            </div>

          </div>

          <span className="rounded-md border border-cyan-200/15 bg-cyan-200/[0.045] px-3 py-2 font-mono text-[9px] tracking-wider text-[#a5dce5]">
            ASTROBOT V2
          </span>

        </div>

      </section>

    </div>
  );
}
