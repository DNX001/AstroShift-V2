import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import MissionControl from "./pages/MissionControl";
import TargetExplorer from "./pages/TargetExplorer";
import Observatory from "./pages/Observatory";
import ScienceLab from "./pages/ScienceLab";
import AstroBotWorkspace from "./pages/AstroBotWorkspace";
import About from "./pages/About";

// Keep the heavyweight 3D experiences lazy-loaded and outside the workspace shell.
const CosmicPreview = lazy(() => import("./pages/CosmicPreview"));
const Astra01Preview = lazy(() => import("./pages/Astra01Preview"));

function ExperienceFallback({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020711] font-mono text-[10px] tracking-[0.2em] text-[#8ce7f5]">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<MissionControl />} />
        <Route path="targets" element={<TargetExplorer />} />
        <Route path="observatory" element={<Observatory />} />
        <Route path="science" element={<ScienceLab />} />
        <Route path="astrobot" element={<AstroBotWorkspace />} />
        <Route path="about" element={<About />} />
      </Route>

      <Route
        path="/cosmos-preview"
        element={
          <Suspense fallback={<ExperienceFallback>INITIALIZING COSMOS ENGINE...</ExperienceFallback>}>
            <CosmicPreview />
          </Suspense>
        }
      />

      <Route
        path="/astra-01-preview"
        element={
          <Suspense fallback={<ExperienceFallback>INITIALIZING ASTRA-01 MODEL...</ExperienceFallback>}>
            <Astra01Preview />
          </Suspense>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
