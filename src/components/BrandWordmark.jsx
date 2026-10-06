import { cn } from "@/lib/utils";
import logo from "@/assets/img/normal_2.png";

export default function BrandWordmark({ className = "", inverse = false }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center", inverse && "rounded-xl bg-white px-3 py-2", className)}
    >
      <img
        src={logo}
        alt="TreiOferte"
        width={866}
        height={288}
        className="block h-auto w-[168px] max-w-full sm:w-[184px] xl:w-[200px]"
      />
    </span>
  );
}
