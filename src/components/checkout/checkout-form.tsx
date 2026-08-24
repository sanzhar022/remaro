"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkoutSchema } from "@/lib/checkout-schema";
import type { CheckoutFormData, DeliveryMethod } from "@/types/checkout";

export interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  onDeliveryMethodChange: (method: DeliveryMethod) => void;
  submitError?: string | null;
}

export function CheckoutForm({ onSubmit, onDeliveryMethodChange, submitError }: CheckoutFormProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "", lastName: "", phone: "", email: "",
      deliveryMethod: "delivery", city: "Алматы", address: "",
      apartment: "", entrance: "", floor: "", comment: "",
      paymentMethod: "cash", privacyAccepted: false,
    },
  });
  const deliveryMethod = useWatch({ control, name: "deliveryMethod" });
  const deliveryRegistration = register("deliveryMethod");

  const fieldClass = "rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-7";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <section aria-labelledby="contact-title" className={fieldClass}>
        <h2 id="contact-title" className="type-h2">Контактные данные</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Имя *" error={errors.firstName?.message}><Input autoComplete="given-name" error={Boolean(errors.firstName)} {...register("firstName")} /></Field>
          <Field label="Фамилия *" error={errors.lastName?.message}><Input autoComplete="family-name" error={Boolean(errors.lastName)} {...register("lastName")} /></Field>
          <Field label="Телефон *" error={errors.phone?.message}><Input type="tel" autoComplete="tel" placeholder="+7 777 123 45 67" error={Boolean(errors.phone)} {...register("phone")} /></Field>
          <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" placeholder="name@example.com" error={Boolean(errors.email)} {...register("email")} /></Field>
        </div>
      </section>

      <section aria-labelledby="delivery-title" className={fieldClass}>
        <h2 id="delivery-title" className="type-h2">Способ получения</h2>
        <fieldset className="mt-6">
          <legend className="sr-only">Выберите способ получения</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {[{ value: "delivery", title: "Доставка", text: "Привезём заказ по указанному адресу" }, { value: "pickup", title: "Самовывоз", text: "Заберите заказ из магазина Remaro" }].map((option) => (
              <label key={option.value} className={`cursor-pointer rounded-[var(--radius-md)] border p-4 transition ${deliveryMethod === option.value ? "border-primary bg-secondary" : "border-border hover:border-primary/40"}`}>
                <span className="flex items-start gap-3">
                  <input type="radio" value={option.value} checked={deliveryMethod === option.value} {...deliveryRegistration} onChange={(event) => { void deliveryRegistration.onChange(event); onDeliveryMethodChange(event.target.value as DeliveryMethod); }} className="mt-1 size-4 accent-primary" />
                  <span><span className="block font-bold">{option.title}</span><span className="type-small mt-1 block text-muted">{option.text}</span></span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {deliveryMethod === "delivery" ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Город *" error={errors.city?.message}><Input autoComplete="address-level2" error={Boolean(errors.city)} {...register("city")} /></Field>
            <Field label="Адрес *" error={errors.address?.message}><Input autoComplete="street-address" placeholder="Улица и номер дома" error={Boolean(errors.address)} {...register("address")} /></Field>
            <Field label="Квартира / офис"><Input {...register("apartment")} /></Field>
            <Field label="Подъезд"><Input {...register("entrance")} /></Field>
            <Field label="Этаж"><Input {...register("floor")} /></Field>
            <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold">Комментарий курьеру</span><textarea rows={3} className="w-full resize-y rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-foreground shadow-[var(--shadow-sm)] placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/15" {...register("comment")} /></label>
            <p className="type-small sm:col-span-2 text-muted">Доставка по Алматы: 2 000 ₸ · ориентировочно 1–2 дня.</p>
          </div>
        ) : (
          <div className="mt-6 rounded-[var(--radius-md)] bg-secondary p-5">
            <h3 className="type-h3">Remaro Алматы</h3><p className="mt-2 text-muted">ул. Примерная, 10</p><p className="type-small mt-1 text-muted">Ежедневно 09:00–20:00 · после подтверждения · 0 ₸</p>
          </div>
        )}
      </section>

      <section aria-labelledby="payment-title" className={fieldClass}>
        <h2 id="payment-title" className="type-h2">Способ оплаты</h2>
        <fieldset className="mt-6">
          <legend className="sr-only">Выберите способ оплаты</legend>
          <div className="space-y-3">
            {[{ value: "card", label: "Банковская карта", disabled: true }, { value: "kaspi", label: "Kaspi", disabled: true }, { value: "cash", label: "Оплата при получении", disabled: false }].map((option) => (
              <label key={option.value} className={`flex items-center gap-3 rounded-[var(--radius-md)] border border-border p-4 ${option.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary/40"}`}>
                <input type="radio" value={option.value} disabled={option.disabled} className="size-4 accent-primary" {...register("paymentMethod")} /><span className="font-semibold">{option.label}{option.disabled && " · Скоро"}</span>
              </label>
            ))}
          </div>
          <p className="type-small mt-3 text-muted">Онлайн-оплата временно недоступна. Менеджер свяжется с вами для подтверждения.</p>
        </fieldset>
      </section>

      <div className={fieldClass}>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" className="mt-1 size-4 accent-primary" {...register("privacyAccepted")} />
          <span className="text-sm">Я согласен с <Link href="#" className="font-semibold text-primary underline underline-offset-2">условиями обработки данных</Link></span>
        </label>
        {errors.privacyAccepted?.message && <p role="alert" className="type-small mt-2 text-destructive">{errors.privacyAccepted.message}</p>}
        {submitError && <p role="alert" className="mt-4 rounded-[var(--radius-md)] bg-red-50 p-3 text-sm font-medium text-destructive">{submitError}</p>}
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>{isSubmitting ? "Оформляем..." : "Оформить заказ"}</Button>
        <p className="type-small mt-3 text-center text-muted">Нажимая кнопку, вы подтверждаете введённые данные.</p>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label><span className="mb-1.5 block text-sm font-semibold">{label}</span>{children}{error && <span role="alert" className="type-small mt-1 block text-destructive">{error}</span>}</label>
  );
}
