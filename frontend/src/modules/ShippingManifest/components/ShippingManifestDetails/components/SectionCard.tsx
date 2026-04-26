import type { ComponentType, ReactNode } from "react";

interface SectionCardProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: ReactNode;
}

export const SectionCard = ({
  icon: Icon,
  title,
  description,
  children,
}: SectionCardProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </div>
    <div className="grid gap-3 p-5 sm:grid-cols-2">{children}</div>
  </section>
);
