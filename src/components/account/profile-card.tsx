import { CalendarDays, Mail, Phone, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";

export interface ProfileCardProps {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  createdAt: Date;
}

export function ProfileCard({ firstName, lastName, email, phone, createdAt }: ProfileCardProps) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Пользователь Remaro";
  return (
    <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4"><span className="grid size-14 place-items-center rounded-full bg-secondary text-primary"><UserRound size={27} aria-hidden="true" /></span><div><h2 className="type-h3">{fullName}</h2><p className="type-small mt-1 text-muted">Профиль покупателя</p></div></div>
        <LogoutButton />
      </div>
      <dl className="mt-7 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
        <ProfileItem icon={Mail} label="Email" value={email} />
        <ProfileItem icon={Phone} label="Телефон" value={phone || "Не указан"} />
        <ProfileItem icon={CalendarDays} label="Дата регистрации" value={new Intl.DateTimeFormat("ru-KZ", { dateStyle: "long" }).format(createdAt)} />
      </dl>
    </section>
  );
}

function ProfileItem({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return <div className="min-w-0"><dt className="flex items-center gap-2 text-sm text-muted"><Icon size={16} aria-hidden="true" />{label}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>;
}
