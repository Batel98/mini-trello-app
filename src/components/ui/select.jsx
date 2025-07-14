import { useState } from "react";

export function Select({ value, onValueChange, children }) {
  return <div className="relative">{children}</div>;
}

export function SelectTrigger({ children, className }) {
  return <button className={`border px-3 py-2 rounded w-full ${className}`}>{children}</button>;
}

export function SelectContent({ children }) {
  return <div className="absolute bg-white border rounded mt-1 z-10">{children}</div>;
}

export function SelectItem({ value, children, onClick }) {
  return (
    <div
      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
      onClick={() => onClick(value)}
    >
      {children}
    </div>
  );
}

export function SelectValue({ children }) {
  return <span>{children}</span>;
}
