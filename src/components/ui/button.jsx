export function Button({ children, onClick, size = "md", variant = "default" }) {
  const base = "rounded px-3 py-1 font-medium";
  const variants = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-blue-500 text-blue-500 hover:bg-blue-50",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizes = {
    sm: "text-sm py-1 px-2",
    md: "text-md py-2 px-3"
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]}`} onClick={onClick}>
      {children}
    </button>
  );
}
