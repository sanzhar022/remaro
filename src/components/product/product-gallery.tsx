"use client";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export interface ProductGalleryProps {
  images: readonly string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const primaryImage = images[selected] ?? images[0];

  return (
    <div className="min-w-0">
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[var(--radius-xl)] border border-border bg-[#f3f4f6] text-[var(--navy-900)]/35 shadow-[var(--shadow-sm)]">
        {primaryImage ? (
          <Image src={primaryImage} alt={productName} fill preload={selected === 0} sizes="(min-width: 1440px) 42rem, (min-width: 1024px) 52vw, 100vw" unoptimized className="object-contain p-5 sm:p-8" />
        ) : (
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <ImageIcon className="size-20" strokeWidth={1.2} aria-hidden="true" />
            <p className="type-small max-w-xs text-muted">Изображение товара скоро появится</p>
          </div>
        )}
      </div>
      {images.length > 1 && <div className="mt-4 flex gap-3 overflow-x-auto pb-2" role="list" aria-label="Изображения товара">{images.map((src,index)=><button key={src} type="button" onClick={()=>setSelected(index)} aria-label={`Показать изображение ${index+1} из ${images.length}`} aria-pressed={index===selected} className={`relative size-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] border-2 bg-white transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 ${index===selected?"border-primary":"border-border hover:border-primary/45"}`}><Image src={src} alt="" fill sizes="80px" unoptimized className="object-contain p-1.5"/></button>)}</div>}
    </div>
  );
}
