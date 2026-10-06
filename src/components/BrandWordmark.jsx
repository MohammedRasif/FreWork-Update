import { cn } from "@/lib/utils";

export default function BrandWordmark({ className = "", inverse = false }) {
  return (
    <span
      role="img"
      aria-label="TreiOferte"
      className={cn("inline-flex items-baseline whitespace-nowrap font-display text-2xl font-extrabold leading-none tracking-tight", className)}
    >
      <span aria-hidden="true" className={inverse ? "text-white" : "text-[#113b6d]"}>Trei</span>
      <span aria-hidden="true" className="text-[#c88f2a]">Oferte</span>
    </span>
  );
}
