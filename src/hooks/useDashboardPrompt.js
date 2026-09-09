"use client";

import { useCallback, useState } from "react";

// Manages the dashboard textarea state and handles populating it from suggestion chips.
export function useDashboardPrompt() {
  const [value, setValue] = useState("");

  const fillFromChip = useCallback((promptText) => {
    setValue(promptText);
  }, []);

  return { value, setValue, fillFromChip };
}
