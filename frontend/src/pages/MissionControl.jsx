import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, ArrowUpRight, Bot, CheckCircle2, ChevronRight,
  CircleAlert, Crosshair, Microscope, Orbit, RefreshCw, Satellite, Sparkles, Telescope,
} from "lucide-react";
import { checkBackendHealth } from "../services/astroshiftApi";

const workspaces = [
  { number: "01", title: "Target Explorer", description: "Resolve celestial objects, retrieve their coordinates and prepare a target for observation.", path: "/targets", icon: Crosshair, label: "TARGET RESOLUTION", accent: "from-cyan-300/15 to-transparent" },
  { number: "02", title: "Observatory", description: "Bring two FITS observations together and inspect the aligned image frames.", path: "/observatory", icon: Telescope, label: "OBSERVATION WORKFLOW", accent: "from-sky-300/15 to-transparent" },
  { number: "03", title: "Science Lab", description: "Investigate image differences and explore the scientific analysis workspace.", path: "/science", icon: Microscope, label: "SCIENTIFIC ANALYSIS", accent: "from-violet-300/15 to-transparent" },
  { number: "04", title: "AstroBot", description: "Ask astronomy questions and explore SPHEREx science with your AI companion.", path: "/astrobot", icon: Bot, label: "AI RESEARCH ASSISTANCE", accent: "from-emerald-300/15 to-transparent" },
];

const workflow = [
  { number: "01", title: "Locate a target", description: "Search an object and retrieve its celestial coordinates.", path: "/targets", action: "Open Target Explorer" },
  { number: "02", title: "Prepare observations", description: "Upload two FITS frames and request image registration.", path: "/observatory", action: "Open Observatory" },
  { number: "03", title: "Investigate changes", description: "Review aligned frames and continue into scientific analysis.", path: "/science", action: "Open Science Lab" },
];

function getHealthPresentation(health) {
  if (health.state === "checking") return { label: "Checking connection", description: "Contacting the AstroShift Core Engine.", color: "text-amber-200", dot: "bg-amber-300", Icon: Activity };
  if (health.state === "online") return { label: "Core API online", description: "The backend health endpoint is responding.", color: "text-emerald-200", dot: "bg-emerald-300", Icon: CheckCircle2 };
  if (health.state === "degraded") return { label: "Unexpected health response", description: "The backend responded, but its status was not healthy.", color: "text-amber-200", dot: "bg-amber-300", Icon: CircleAlert };
  return { label: "Core API unavailable", description: "The health endpoint could not be reached.", color: "text-rose-200", dot: "bg-rose-300", Icon: CircleAlert };
}

function createHealthState(data) {
  return { state: data?.status === "healthy" ? "online" : "degraded", system: typeof data?.system === "string" ? data.system : null, environment: typeof data?.environment === "string" ? data.environment : null, checkedAt: new Date(), error: null };
}

export default function MissionControl() {
  const [health, setHealth] = useState({ state: "checking", system: null, environment: null, checkedAt: null, error: null });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;
    checkBackendHealth()
      .then((data) => { if (active) setHealth(createHealthState(data)); })
      .catch((error) => {
        if (!active) return;
        setHealth({ state: "offline", system: null, environment: null, checkedAt: new Date(), error: error instanceof Error ? error.message : "Backend health check failed." });
      });
    return () => { active = false; };
  }, []);

  async function refreshHealth() {
    setRefreshing(true);
    try {
      const data = await checkBackendHealth();
      setHealth(createHealthState(data));
    } catch (error) {
      setHealth({ state: "offline", system: null, environment: null, checkedAt: new Date(), error: error instanceof Error ? error.message : "Backend health check failed." });
    } finally {
      setRefreshing(false);
    }
  }

  const presentation = getHealthPresentation(health);
  const HealthIcon = presentation.Icon;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-8 pb-8">
      <section className="relative isolate overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#0b1721] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_30%,rgba(49,153,180,0.18),transparent_36%),radial-gradient(ellipse_at_8%_100%,rgba(37,87,118,0.16),transparent_45%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-52 -z-10 h-[560px] w-[560px] rounded-full border border-cyan-100/[0.07]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-28 -z-10 h-[390px] w-[390px] rounded-full border border-cyan-100/[0.08]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[13%] top-[22%] -z-10 h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_26px_7px_rgba(140,231,245,0.32)]" />

        <div className="grid gap-10 p-6 sm:p-9 lg:grid-cols-[minmax(0,1.2fr)_minmax(270px,0.8fr)] lg:items-center lg:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/[0.16] bg-cyan-200/[0.07] px-3 py-1.5">
              <Orbit size={13} className="text-[#8ce7f5]" />
              <span className="font-mono text-[9px] font-semibold tracking-[0.2em] text-[#b5eaf1]">ASTROSHIFT / MISSION CONTROL</span>
            </div>
            <p className="mt-8 font-mono text-[10px] font-medium tracking-[0.2em] text-[#8297a5]">DEEP-SKY RESEARCH WORKSPACE</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#f0f7fa] sm:text-5xl lg:text-[3.65rem]">
              Read the sky.<br />
              <span className="bg-gradient-to-r from-[#9deaf4] via-[#75d8e8] to-[#9bb9f4] bg-clip-text text-transparent">Find what changes.</span>
            </h1>
            <p className="mt-6 max-w-[590px] text-sm leading-7 text-[#a0b1bc] sm:text-[15px]">
              An astronomy intelligence workspace for locating celestial targets, preparing FITS observations and investigating changes between images with scientific context.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/observatory" className="group inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#8ce7f5] px-5 py-3 text-sm font-extrabold text-[#06131b] shadow-[0_8px_28px_rgba(80,204,225,0.16)] transition hover:-translate-y-0.5 hover:bg-[#b3f1f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8ce7f5]">
                Open Observatory
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link to="/targets" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/[0.13] bg-white/[0.035] px-5 py-3 text-sm font-semibold text-[#e7f0f4] transition hover:border-cyan-200/30 hover:bg-cyan-200/[0.06]">
                Explore Targets
                <ChevronRight size={15} className="text-[#8ce7f5]" />
              </Link>
            </div>
          </div>

          <aside className="relative mx-auto w-full max-w-[390px] lg:ml-auto">
            <div className="relative overflow-hidden rounded-2xl border border-cyan-100/[0.12] bg-[#07111a]/75 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2"><Satellite size={15} className="text-[#8ce7f5]" /><span className="font-mono text-[9px] font-semibold tracking-[0.18em] text-[#96aab7]">CORE SERVICE</span></div>
                <span className="font-mono text-[9px] text-[#617987]">LIVE CHECK</span>
              </div>
              <div className="mt-6 flex items-start gap-3">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]"><HealthIcon size={17} className={presentation.color} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${presentation.dot} ${health.state === "online" ? "shadow-[0_0_12px_rgba(110,231,183,0.55)]" : ""}`} /><h2 className={`text-sm font-semibold ${presentation.color}`} aria-live="polite">{presentation.label}</h2></div>
                  <p className="mt-1 text-xs leading-5 text-[#8298a5]">{presentation.description}</p>
                </div>
                <button type="button" onClick={refreshHealth} disabled={refreshing} aria-label="Refresh backend health" title="Refresh backend health" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-[#8199a7] transition hover:border-cyan-200/25 hover:text-[#8ce7f5] disabled:cursor-wait disabled:opacity-50">
                  <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                </button>
              </div>
              <div className="mt-6 space-y-3 border-t border-white/[0.07] pt-4">
                <div className="flex items-center justify-between gap-4 text-xs"><span className="text-[#718794]">Engine</span><span className="max-w-[65%] truncate text-right font-medium text-[#cbd9df]">{health.system ?? "Awaiting response"}</span></div>
                <div className="flex items-center justify-between gap-4 text-xs"><span className="text-[#718794]">Environment</span><span className="max-w-[65%] truncate text-right font-medium text-[#cbd9df]">{health.environment ?? "Not reported"}</span></div>
                <div className="flex items-center justify-between gap-4 text-xs"><span className="text-[#718794]">Last check</span><span className="text-right font-mono text-[10px] text-[#a6b7c0]">{health.checkedAt ? health.checkedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Pending"}</span></div>
              </div>
              {health.error && <p className="mt-3 break-words rounded-lg border border-rose-300/10 bg-rose-300/[0.05] p-2 text-[10px] leading-4 text-rose-200/80">{health.error}</p>}
            </div>
            <p className="mt-3 text-center font-mono text-[9px] tracking-[0.14em] text-[#647b88]">SERVICE HEALTH ONLY · AI PROVIDER STATUS IS SEPARATE</p>
          </aside>
        </div>
      </section>

      <section aria-labelledby="workspace-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] font-semibold tracking-[0.2em] text-[#718795]">PLATFORM DIRECTORY</p>
            <h2 id="workspace-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#edf4f7] sm:text-[1.7rem]">Research workspaces</h2>
            <p className="mt-2 text-sm text-[#8193a0]">Choose a workspace and continue your investigation.</p>
          </div>
          <span className="hidden rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[9px] tracking-[0.15em] text-[#728794] sm:inline-flex">04 WORKSPACES</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {workspaces.map((workspace) => {
            const Icon = workspace.icon;
            return (
              <Link key={workspace.path} to={workspace.path} className="group relative isolate flex min-h-[238px] flex-col overflow-hidden rounded-2xl border border-white/[0.075] bg-[#0b141d] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-200/25 hover:bg-[#0e1a24] hover:shadow-[0_18px_44px_rgba(0,0,0,0.2)] sm:p-6">
                <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b ${workspace.accent} opacity-70`} />
                <div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200/[0.13] bg-cyan-200/[0.055] transition group-hover:border-cyan-200/25 group-hover:bg-cyan-200/[0.09]"><Icon size={19} className="text-[#8ce7f5]" /></div><span className="font-mono text-[10px] tracking-[0.12em] text-[#526977]">{workspace.number}</span></div>
                <p className="mt-6 font-mono text-[8px] font-semibold tracking-[0.18em] text-[#718795]">{workspace.label}</p>
                <div className="mt-2 flex items-center justify-between gap-3"><h3 className="font-display text-lg font-semibold tracking-tight text-[#e8f0f4]">{workspace.title}</h3><ArrowUpRight size={17} className="shrink-0 text-[#718795] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#8ce7f5]" /></div>
                <p className="mt-3 text-xs leading-6 text-[#899ba7]">{workspace.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/[0.075] bg-[#0b141d]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/[0.12] bg-cyan-200/[0.055]"><Activity size={17} className="text-[#8ce7f5]" /></div><div><p className="font-mono text-[9px] font-semibold tracking-[0.17em] text-[#718795]">RESEARCH SEQUENCE</p><h2 className="mt-1 font-display text-lg font-semibold text-[#edf4f7]">From target to comparison</h2></div></div>
          <span className="font-mono text-[9px] tracking-[0.12em] text-[#647b88]">SUGGESTED WORKFLOW</span>
        </div>
        <div className="grid divide-y divide-white/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {workflow.map((step) => (
            <div key={step.number} className="group p-5 transition hover:bg-white/[0.02] sm:p-6">
              <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#8ce7f5]">STEP {step.number}</span>
              <h3 className="mt-3 text-sm font-semibold text-[#e3edf1]">{step.title}</h3>
              <p className="mt-2 min-h-[48px] max-w-xs text-xs leading-6 text-[#8294a0]">{step.description}</p>
              <Link to={step.path} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#a8eaf2] transition hover:text-white">{step.action}<ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" /></Link>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[linear-gradient(110deg,rgba(14,28,39,0.95),rgba(9,17,25,0.95))] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3"><div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035]"><Sparkles size={16} className="text-[#8ce7f5]" /></div><div><p className="font-mono text-[9px] font-semibold tracking-[0.17em] text-[#718795]">THE ASTROSHIFT JOURNEY</p><h2 className="mt-1 font-display text-base font-semibold text-[#e8f0f4]">Step beyond the workspace.</h2><p className="mt-1 max-w-xl text-xs leading-5 text-[#8294a0]">Explore the six-scene cinematic journey through the AstroShift cosmos.</p></div></div>
        <div className="flex flex-wrap gap-2">
          <Link to="/about" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-semibold text-[#d5e2e8] transition hover:border-white/20 hover:bg-white/[0.06]">About AstroShift<ArrowUpRight size={14} /></Link>
          <Link to="/cosmos-preview" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-200/20 bg-cyan-200/[0.06] px-4 py-2.5 text-xs font-semibold text-[#a8eaf2] transition hover:border-cyan-200/35 hover:bg-cyan-200/[0.1]">Launch experience<ArrowRight size={14} /></Link>
        </div>
      </section>
    </div>
  );
}
