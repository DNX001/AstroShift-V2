import { useCallback, useMemo, useState } from "react";

import ObservationContext from "./observationContext";

export function ObservationProvider({ children }) {
  const [observation, setObservation] = useState(null);

  const clearObservation = useCallback(() => {
    setObservation(null);
  }, []);

  const value = useMemo(
    () => ({ observation, setObservation, clearObservation }),
    [observation, clearObservation]
  );

  return (
    <ObservationContext.Provider value={value}>
      {children}
    </ObservationContext.Provider>
  );
}
