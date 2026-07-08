import React from "react";
import { createRoot } from "react-dom/client";
import { MobileStandaloneTiptapEditor } from "@/components/MobileStandaloneTiptapEditor";

const root = document.getElementById("mobile-editor-root");

if (!root) {
  throw new Error("Mobile editor root not found");
}

createRoot(root).render(
  <React.StrictMode>
    <MobileStandaloneTiptapEditor />
  </React.StrictMode>
);
