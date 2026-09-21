"use client";

import { Minus, Plus } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

export interface QuantityControlProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
  label?: string;
}

export function QuantityControl({ quantity, onDecrease, onIncrease, decreaseDisabled, increaseDisabled, label = "Количество товара" }: QuantityControlProps) {
  return (
    <div className="flex w-fit items-center rounded-[var(--radius-md)] border border-border bg-surface">
      <IconButton aria-label="Уменьшить количество" size="md" disabled={decreaseDisabled} onClick={onDecrease}><Minus size={18} aria-hidden="true" /></IconButton>
      <output aria-label={label} className="min-w-11 text-center font-bold">{quantity}</output>
      <IconButton aria-label="Увеличить количество" size="md" disabled={increaseDisabled} onClick={onIncrease}><Plus size={18} aria-hidden="true" /></IconButton>
    </div>
  );
}
