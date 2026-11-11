
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

function App() {
  return (
    <Routes>

      {/* Shared application layout */}
      <Route path="/" element={<AppShell />}>

        {/* Default workspace */}
        <Route
          index
          element={<MissionControl />}
        />

        {/* Scientific workspaces */}
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

        {/* Dedicated AI workspace */}
        <Route
          path="astrobot"
          element={<AstroBotWorkspace />}
        />

      </Route>

      {/* Unknown URLs return to Mission Control */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;
