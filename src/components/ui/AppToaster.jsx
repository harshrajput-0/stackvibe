"use client";

import { Toaster } from "react-hot-toast";

/** App-wide toast host, styled to match the monochrome UI. */
export function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--gray-900)",
          color: "var(--white)",
          fontSize: "13px",
          fontWeight: 500,
          borderRadius: "var(--radius-md)",
          padding: "10px 14px",
        },
      }}
    />
  );
}
