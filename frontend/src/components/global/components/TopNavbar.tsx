import { NavLink } from "react-router-dom";
import { FileText, Home, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    label: "Home",
    path: "/",
    icon: Home,
    end: true,
  },
  {
    label: "Shipping Manifest",
    path: "/shipping-manifests",
    icon: FileText,
    end: false,
  },
];

export const TopNavbar = () => (
  <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
          <PackageCheck className="size-5" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Komento
          </p>
          <h1 className="truncate text-base font-semibold text-slate-950 sm:text-lg">
            RPI Waybill Printer
          </h1>
        </div>
      </div>

      <nav
        aria-label="Primary navigation"
        className="flex w-full items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-inner lg:w-auto"
      >
        {navigationItems.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-200 lg:flex-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
                isActive
                  ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-950"
              )
            }
          >
            <Icon className="size-4" strokeWidth={2.2} />
            <span className="whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  </header>
);
