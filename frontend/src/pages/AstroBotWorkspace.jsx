import {
  ArrowDown,
  BookOpen,
  Bot,
  BrainCircuit,
  CircleHelp,
  Database,
  MessageSquareText,
  Orbit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { useObservation } from "../context/useObservation";

const starterPrompts = [
  {
    icon: BookOpen,
    label: "SPHEREx essentials",
    description: "Understand the mission, its infrared survey and 102 spectral bands.",
    prompt:
      "Explain the SPHEREx mission, what its 102 infrared spectral bands allow scientists to study, and how that relates to AstroShift.",
  },
  {
    icon: Orbit,
    label: "Image registration",
    description: "Learn why two observations must be aligned before comparison.",
    prompt:
      "Explain astronomical image registration. What does aligning Frame B to Frame A actually correct, and what does it not correct?",
  },
  {
    icon: CircleHelp,
    label: "Investigate a change",
    description: "Know what to check before calling something an anomaly.",
    prompt:
      "What scientific checks should be performed before interpreting a visible difference between two astronomical observations as a real transient or anomaly?",
  },
  {
    icon: Database,
    label: "My current observation",
    description: "Discuss the metadata attached to the current Observatory session.",
    prompt:
      "Using the observation metadata attached to this conversation, summarize what is known about Frame A and Frame B. Separate direct observations from assumptions, and explain what cannot be concluded from the metadata alone.",
  },
];

export default function AstroBotWorkspace() {
  const { setAstroBotDraft } = useOutletContext();
  const { observation } = useObservation();
  const hasObservation = Boolean(observation?.data);

  function handlePromptSelect(prompt) {
    setAstroBotDraft(prompt);
    document.getElementById("astrobot-workspace-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    document.getElementById("astrobot-message-input")?.focus({
      preventScroll: true,
    });
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <section className="relative isolate overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0b1721] px-5 py-8 sm:px-8 sm:py-10 lg:px-11 lg:py-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-36 -z-10 h-[420px] w-[420px] rounded-full border border-cyan-200/[0.08]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-20 -z-10 h-[300px] w-[300px] rounded-full border border-cyan-200/[0.09]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[19%] top-14 -z-10 h-2 w-2 rounded-full bg-cyan-200/70 shadow-[0_0_28px_8px_rgba(140,231,245,0.24)]" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-2">
            <Bot size={14} className="text-[#8ce7f5]" />
            <span className="font-mono text-[9px] font-medium tracking-[0.19em] text-[#a5dce5]">ASTROSHIFT / ASTROBOT</span>
          </div>

          <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-[#8297a5]">YOUR SCIENTIFIC COMPANION</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-[#edf4f7] sm:text-5xl lg:text-6xl">
            Ask the universe.
            <br />
            <span className="text-[#8ce7f5]">Understand the science.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-[#a1b1bb] sm:text-base">
            Explore astronomy, understand SPHEREx observations and ask better questions about the changing sky. AstroBot is an educational research companion—not an autonomous discovery authority.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[11px] text-[#a6b7c2]">
              <BrainCircuit size={14} className="text-[#8ce7f5]" /> AI-assisted explanations
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[11px] text-[#a6b7c2]">
              <ShieldCheck size={14} className="text-[#8ce7f5]" /> Evidence-aware guidance
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[11px] text-[#a6b7c2]">
              <MessageSquareText size={14} className="text-[#8ce7f5]" /> Conversational learning
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c141d] p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] tracking-[0.17em] text-[#718795]">START A CONVERSATION</p>
              <h2 className="mt-1.5 font-display text-xl font-semibold text-[#edf4f7]">A few places to begin</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-[#8193a0]">
              <Sparkles size={12} className="text-[#8ce7f5]" /> Choose a prompt to prefill chat
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {starterPrompts.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handlePromptSelect(item.prompt)}
                  className="group rounded-xl border border-white/[0.07] bg-[#080f17] p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-200/25 hover:bg-cyan-200/[0.025] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-200/10 bg-cyan-200/[0.05] text-[#8ce7f5] transition group-hover:border-cyan-200/25">
                    <Icon size={17} />
                  </span>
                  <span className="mt-4 block text-sm font-semibold text-[#e1ebef]">{item.label}</span>
                  <span className="mt-1.5 block text-[11px] leading-5 text-[#8296a1]">{item.description}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-white/[0.07] pt-4 text-[10px] text-[#718795]">
            <ArrowDown size={13} className="text-[#8ce7f5]" />
            <span>Choose a prompt to place it in the message composer below. You can edit it before sending.</span>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/[0.08] bg-[#0c141d] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-[#8ce7f5]" />
              <p className="font-mono text-[9px] tracking-[0.16em] text-[#a5dce5]">OBSERVATION CONTEXT</p>
            </div>
            {hasObservation ? (
              <>
                <p className="mt-3 text-sm font-semibold text-[#e3edf1]">Session metadata is available</p>
                <p className="mt-2 text-xs leading-6 text-[#8fa2ad]">
                  AstroBot can receive the metadata returned for Frame A and Frame B, including target, observation date, instrument and coordinates when supplied.
                </p>
                <span className="mt-4 inline-flex rounded-md border border-emerald-300/15 bg-emerald-300/[0.045] px-2.5 py-1.5 font-mono text-[9px] tracking-[0.1em] text-emerald-200">
                  METADATA CONTEXT READY
                </span>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm font-semibold text-[#e3edf1]">No active observation attached</p>
                <p className="mt-2 text-xs leading-6 text-[#8fa2ad]">
                  AstroBot can still answer general astronomy and SPHEREx questions. Upload and register a pair in Observatory to attach its returned metadata to this session.
                </p>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-amber-200/12 bg-amber-200/[0.03] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-200" />
              <p className="font-mono text-[9px] tracking-[0.16em] text-amber-100">SCIENTIFIC TRANSPARENCY</p>
            </div>
            <p className="mt-3 text-xs leading-6 text-[#b8b2a1]">
              AstroBot receives observation metadata only. It does not receive the raw FITS pixel arrays or independently inspect the preview images through this chat connection. Treat its explanations as guidance, not a validation result.
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
