import Image from "next/image";
import logoBoard from "@/ico/ico.png";

export function BrandLogo({ className = "" }: { className?: string }) {
  return <span className={`relative block h-[42px] w-[180px] overflow-hidden ${className}`}><Image src={logoBoard} alt="Remaro Group" priority className="absolute -left-[222px] -top-[74px] h-auto w-[426px] max-w-none" sizes="180px" /></span>;
}
