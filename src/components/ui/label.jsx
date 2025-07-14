export function Label({ children, className = "" }) {
  return <label className={`font-semibold ${className}`}>{children}</label>;
}
