
import { lazy, Suspense } from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppShell from "./components/layout/AppShell";

import MissionControl from "./pages/MissionControl";
import TargetExplorer from "./pages/TargetExplorer";
import Observatory from "./pages/Observatory";
import ScienceLab from "./pages/ScienceLab";
import AstroBotWorkspace from "./pages/AstroBotWorkspace";

// Load the heavy 3D environment only when requested.
const CosmicPreview = lazy(
  () => import("./pages/CosmicPreview")
);

function App() {
  return (
    <Routes>

      {/* Main scientific application */}
      <Route path="/" element={<AppShell />}>

        <Route
          index
          element={<MissionControl />}
        />

        <Route
          path="targets"
          element={<TargetExplorer />}
        />

        <Route
          path="observatory"
          element={<Observatory />}
        />

        <Route
          path="science"
          element={<ScienceLab />}
        />

        <Route
          path="astrobot"
          element={<AstroBotWorkspace />}
        />

      </Route>

      {/* Independent full-screen cosmic experience */}
      <Route
        path="/cosmos-preview"
        element={
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-[#02030a] font-mono text-xs tracking-[0.2em] text-[#8ce7f5]">
                INITIALIZING COSMOS ENGINE...
              </div>
            }
          >
            <CosmicPreview />
          </Suspense>
        }
      />

      {/* Unknown URLs */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;
