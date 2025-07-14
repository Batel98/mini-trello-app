import { useState } from "react";

export function Dialog({ children }) {
  return <div>{children}</div>;
}

export function DialogTrigger({ children }) {
  return children;
}

export function DialogContent({ children }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow w-96">{children}</div>
    </div>
  );
}
