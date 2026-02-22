import React from "react";

export function ManualView({ manual }: { manual: any }) {
  return (
    <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, overflow: "auto" }}>
      {JSON.stringify(manual, null, 2)}
    </pre>
  );
}