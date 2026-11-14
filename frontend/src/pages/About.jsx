import {
  ArrowUpRight,
  Bot,
  Compass,
  Database,
  Eye,
  Microscope,
  Orbit,
  Satellite,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const workflow = [
  {
    number: "01",
    title: "Locate a target",
    description: "Resolve a celestial object and establish its right ascension and declination.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Prepare observations",
    description: "Bring FITS observations into a common workflow and inspect the returned frames.",
    icon: Database,
  },
  {
    number: "03",
    title: "Investigate changes",
    description: "Compare aligned observations and examine possible differences with scientific care.",
    icon: Microscope,
  },
  {
    number: "04",
    title: "Understand the context",
    description: "Use astronomy-focused guidance to interpret concepts, observations and limitations.",
    icon: Bot,
  },
];

// These names and contribution summaries are taken from the project material
// supplied for this handoff; add or amend the roster when the team confirms it.
const team = [
  {
    initials: "S",
    name: "Sneha",
    role: "Team Leader · Backend Engineering",
    contribution: "Team leadership, FastAPI services, astronomical processing and backend deployment.",
  },
  {
    initials: "T",
    name: "Trina",
    role: "Frontend design & implementation",
    contribution: "Interface concepts, dashboard layouts and frontend interaction work.",
  },
  {
    initials: "D",
    name: "Debjyoti",
    role: "UI/UX & Frontend Engineering",
    contribution: "Product UI/UX direction, interface design and implementation, React application engineering, API integration, AstroBot interface and the immersive AstroShift experience.",
  },
  {
    initials: "S",
    name: "Saayantaan",
    role: "Scientific analytics",
    contribution: "Numerical workflows, image subtraction and anomaly-analysis methods.",
  },
  {
    initials: "P",
    name: "Pushpendu",
    role: "Science data & documentation",
    contribution: "Scientific datasets, FITS observations and research documentation.",
  },
];

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[9px] font-semibold tracking-[0.2em] text-[#8ce7f5]">{eyebrow}</p>
      <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-[#edf4f7] sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-7 text-[#91a4af]">{description}</p>}
    </div>
  );
}

export default function About() {
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-8 pb-10">
      <section className="relative isolate overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#0b1721] shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_18%,rgba(49,153,180,0.18),transparent_34%),radial-gradient(ellipse_at_5%_100%,rgba(164,132,74,0.09),transparent_42%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-40 -z-10 h-[460px] w-[460px] rounded-full border border-cyan-100/[0.07]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-5 -top-20 -z-10 h-[320px] w-[320px] rounded-full border border-cyan-100/[0.07]" />

        <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(270px,0.85fr)] lg:items-center lg:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/[0.16] bg-cyan-200/[0.07] px-3 py-1.5">
              <Orbit size={13} className="text-[#8ce7f5]" />
              <span className="font-mono text-[9px] font-semibold tracking-[0.19em] text-[#b5eaf1]">THE STORY BEHIND THE MISSION</span>
            </div>
            <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-[#8297a5]">NASA SPACE APPS CHALLENGE 2026 · TEAM EXPLORANGERS</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#f0f7fa] sm:text-5xl lg:text-[3.6rem]">
              A closer look at the sky.
              <br />
              <span className="bg-gradient-to-r from-[#9deaf4] via-[#75d8e8] to-[#d7c08b] bg-clip-text text-transparent">A clearer way to explore.</span>
            </h1>
            <p className="mt-6 max-w-[660px] text-sm leading-7 text-[#a0b1bc] sm:text-[15px]">
              AstroShift is a citizen-science project prototype by Team ExploRangers. It brings celestial target discovery, astronomical image workflows and science-aware guidance into one connected experience.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-200/15 bg-cyan-200/[0.05] px-3 py-1.5 font-mono text-[8px] tracking-[0.13em] text-[#a7dce5]">NASA SPACE APPS 2026</span>
              <span className="rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1.5 font-mono text-[8px] tracking-[0.13em] text-[#9aabb7]">PLANET X & SPHEREx</span>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#03070c]/90 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
              <img
                src="/brand/astroshift-project-lockup.webp"
                alt="AstroShift project logo with its orbital A symbol and Explore, Analyze, Discover tagline"
                className="mx-auto max-h-[280px] w-full object-contain"
                loading="eager"
              />
            </div>
            <div className="rounded-2xl border border-cyan-100/[0.11] bg-[#07111a]/80 p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-2 text-[#d7c08b]">
                <Satellite size={16} />
                <span className="font-mono text-[9px] font-semibold tracking-[0.18em]">CHALLENGE BRIEF</span>
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold text-[#edf4f7]">Planet X and SPHEREx</h2>
              <p className="mt-3 text-xs leading-6 text-[#91a4af]">
                The selected challenge theme that inspired AstroShift: make SPHEREx observations easier to explore and help people investigate how the infrared sky can be compared across observations.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <article className="rounded-2xl border border-white/[0.075] bg-[#0b141d] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/[0.12] bg-cyan-200/[0.055]">
              <Eye size={18} className="text-[#8ce7f5]" />
            </div>
            <p className="font-mono text-[9px] font-semibold tracking-[0.18em] text-[#8ce7f5]">01 / THE CHALLENGE</p>
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-[#edf4f7]">Make complex sky surveys more approachable.</h2>
          <p className="mt-4 text-sm leading-7 text-[#91a4af]">
            The selected Planet X and SPHEREx challenge asks teams to think about how people can discover, navigate and make sense of a large body of astronomical observations. AstroShift focuses on the human-facing workflow: finding a target, preparing observations and investigating possible changes over time.
          </p>
          <p className="mt-4 text-sm leading-7 text-[#91a4af]">
            The goal is not to turn every image difference into a discovery. It is to give users a clearer path from an interesting observation to a careful, evidence-led investigation.
          </p>
        </article>

        <article className="rounded-2xl border border-white/[0.075] bg-[linear-gradient(145deg,rgba(17,31,42,0.96),rgba(9,17,25,0.98))] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/[0.13] bg-amber-200/[0.05]">
              <Compass size={18} className="text-[#d7c08b]" />
            </div>
            <p className="font-mono text-[9px] font-semibold tracking-[0.18em] text-[#d7c08b]">02 / OUR RESPONSE</p>
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-[#edf4f7]">AstroShift</h2>
          <p className="mt-4 text-sm leading-7 text-[#91a4af]">
            A connected astronomy workspace designed around target resolution, FITS observation preparation, aligned-frame inspection, scientific analysis and an AI companion that helps explain astronomy concepts.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            {[
              ["TARGETS", "Celestial lookup"],
              ["OBSERVATORY", "FITS workflow"],
              ["SCIENCE LAB", "Difference analysis"],
              ["ASTROBOT", "Science guidance"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/[0.07] bg-black/15 p-3">
                <p className="font-mono text-[8px] tracking-[0.13em] text-[#8ce7f5]">{label}</p>
                <p className="mt-1 text-[11px] font-medium text-[#c7d5dc]">{value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="03 / THE ASTROSHIFT WORKFLOW"
          title="From a point in the sky to a question worth investigating."
          description="The intended journey connects target resolution, observation preparation, scientific investigation and astronomy-focused guidance."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {workflow.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.number} className="group relative overflow-hidden rounded-2xl border border-white/[0.075] bg-[#0b141d] p-5 transition hover:-translate-y-0.5 hover:border-cyan-200/20">
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-300/[0.07] to-transparent" />
                <div className="relative flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/[0.13] bg-cyan-200/[0.055]">
                    <Icon size={18} className="text-[#8ce7f5]" />
                  </div>
                  <span className="font-mono text-[10px] text-[#617987]">{step.number}</span>
                </div>
                <h3 className="relative mt-6 text-sm font-semibold text-[#e8f0f4]">{step.title}</h3>
                <p className="relative mt-2 text-xs leading-6 text-[#899ba7]">{step.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] lg:items-end">
          <SectionHeading
            eyebrow="04 / THE PEOPLE BEHIND THE PROJECT"
            title="Team ExploRangers"
            description="The project brings together frontend engineering, backend systems, scientific analytics and astronomy data work."
          />
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#03070c] p-3">
            <img
              src="/brand/explorangers-team-lockup.webp"
              alt="Official ExploRangers team logo with AstroShift project identity"
              className="mx-auto max-h-[180px] w-full object-contain"
              loading="lazy"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {team.map((member) => (
            <article key={member.name} className="relative isolate overflow-hidden rounded-2xl border border-white/[0.075] bg-[#0b141d] p-5">
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-cyan-300/[0.07] to-transparent" />
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-[#111e29] font-display text-lg font-semibold text-[#d9e8ed]">
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold text-[#edf4f7]">{member.name}</h3>
                  <p className="mt-1 font-mono text-[9px] tracking-[0.1em] text-[#8ce7f5]">{member.role.toUpperCase()}</p>
                </div>
              </div>
              <p className="mt-5 text-xs leading-6 text-[#91a4af]">{member.contribution}</p>
            </article>
          ))}
        </div>
        <p className="text-[10px] leading-5 text-[#657b87]">
          Team names and contribution summaries shown here reflect the project materials currently available for this frontend handoff. Confirm the final roster and wording with the team before public release.
        </p>
      </section>

      <section className="grid gap-4 rounded-2xl border border-emerald-200/10 bg-emerald-200/[0.025] p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200/10 bg-emerald-200/[0.05]">
            <ShieldCheck size={17} className="text-emerald-200" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-[#e3eee9]">Scientific care comes first.</h2>
            <p className="mt-2 max-w-3xl text-xs leading-6 text-[#91a49d]">
              AstroShift is a project prototype. A difference between observations is a candidate signal, not a confirmed discovery. Interpretation requires appropriate data checks, scientific validation and human review; the interface does not imply automatic NASA submission or endorsement.
            </p>
          </div>
        </div>
        <Link to="/targets" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-200/20 bg-cyan-200/[0.07] px-4 py-3 text-xs font-semibold text-[#b7edf4] transition hover:border-cyan-200/35 hover:bg-cyan-200/[0.11]">
          Explore a target <ArrowUpRight size={14} />
        </Link>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5 text-[10px] text-[#667d89]">
        <span className="font-mono tracking-[0.12em]">NASA SPACE APPS CHALLENGE 2026 · PLANET X AND SPHEREx</span>
        <Link to="/" className="inline-flex items-center gap-1.5 font-semibold text-[#91aab5] transition hover:text-[#8ce7f5]">
          Return to Mission Control <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  );
}
