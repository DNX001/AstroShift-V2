import { useContext } from "react";

import ObservationContext from "./observationContext";

export function useObservation() {
  const context = useContext(ObservationContext);

  if (!context) {
    throw new Error(
      "useObservation must be used inside ObservationProvider."
    );
  }

  return context;
}
