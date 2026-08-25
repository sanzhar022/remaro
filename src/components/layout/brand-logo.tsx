import Image from "next/image";
import logoBoard from "@/ico/ico.png";

export function BrandLogo({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const frame = compact ? "h-[34px] w-[146px]" : "h-[46px] w-[197px]";
  const image = compact
    ? "-left-[524px] -top-[151px] w-[830px]"
    : "-left-[707px] -top-[204px] w-[1120px]";

  return (
    <span className={`relative block shrink-0 overflow-hidden ${frame} ${className}`}>
      <Image
        src={logoBoard}
        alt="Remaro Group"
        priority
        unoptimized
        className={`absolute h-auto max-w-none object-contain object-center ${image}`}
        sizes={compact ? "146px" : "197px"}
      />
    </span>
  );
}
