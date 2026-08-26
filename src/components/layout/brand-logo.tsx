import Image from "next/image";
import logoBoard from "@/ico/ico.png";

export function BrandLogo({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const frame = compact ? "h-[36px] w-[126px]" : "h-[40px] w-[140px]";
  const image = compact
    ? "-left-[453px] -top-[131px] w-[717px]"
    : "-left-[503px] -top-[145px] w-[797px]";

  return (
    <span className={`relative block shrink-0 overflow-hidden ${frame} ${className}`}>
      <Image
        src={logoBoard}
        alt="Remaro Group"
        priority
        unoptimized
        className={`absolute h-auto max-w-none object-contain object-center ${image}`}
        sizes={compact ? "126px" : "140px"}
      />
    </span>
  );
}
