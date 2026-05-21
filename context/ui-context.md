# UI Context

## Theme

The application uses a light, utilitarian warehouse-operations dashboard style. The interface prioritizes clarity, quick scanning, and safe operator actions over decorative branding. Pages sit on pale slate/gray backgrounds with white cards, thin slate borders, soft shadows, rounded panels, compact controls, and high-contrast slate text. Accent color is used sparingly for state, active navigation, manifest headers, scanner feedback, and destructive/primary actions.

The default UI is light mode. Dark tokens exist in `frontend/src/index.css` because the shared UI primitives support them, but the current app shell does not expose a dark-mode switch and page layouts are designed around light surfaces.

## Colors

Use Tailwind v4 theme tokens from `frontend/src/index.css` and Tailwind semantic utilities (`bg-background`, `text-foreground`, `bg-primary`, `border-border`, etc.) where possible. Feature-level status colors may use Tailwind palette utilities when they are tied to explicit operational states.

| Role | CSS Variable / Utility | Value / Usage |
| ---- | ---------------------- | ------------- |
| Page background | `--background` / `bg-background`, plus `bg-gray-50`, `bg-slate-50/50` | `oklch(1 0 0)` for app background; page shells commonly use pale gray/slate. |
| Primary text | `--foreground` / `text-foreground`, `text-slate-950`, `text-slate-900` | `oklch(0.147 0.004 49.25)`; dense operator text should stay dark and readable. |
| Muted text | `--muted-foreground` / `text-muted-foreground`, `text-slate-500`, `text-slate-600` | `oklch(0.553 0.013 58.071)`; use for metadata, helper copy, inactive nav, and counts. |
| Card/surface | `--card`, `--popover`, `bg-white` | `oklch(1 0 0)`; use white cards/panels over slate/gray page backgrounds. |
| Subtle surface | `--secondary`, `--muted`, `--accent`, `bg-slate-50`, `bg-gray-50` | `oklch(0.97 0.001 106.424)`; use for control groups, table hover, dialog footers, and inset panels. |
| Primary action | `--primary` / `bg-primary`, often `bg-slate-900` or `bg-slate-950` | `oklch(0.216 0.006 56.043)`; use for primary/active neutral actions. |
| Primary foreground | `--primary-foreground` / `text-primary-foreground`, `text-white` | `oklch(0.985 0.001 106.423)`; use on dark primary surfaces. |
| Border | `--border`, `--input`, `border-slate-200`, `border-gray-200` | `oklch(0.923 0.003 48.717)`; thin separators around cards, nav groups, inputs, and tables. |
| Focus ring | `--ring`, `focus-visible:ring-slate-400`, `focus-visible:ring-ring/50` | `oklch(0.709 0.01 56.259)`; preserve visible keyboard focus. |
| Destructive/error | `--destructive`, `text-red-*`, `bg-rose-*` where state-specific | `oklch(0.577 0.245 27.325)`; use for delete/error states. |
| Success/online | `bg-emerald-50`, `text-emerald-700`, `border-emerald-200`, `bg-emerald-400/500` | Used for completed/online scanner states. |
| Warning/pending | `bg-amber-50`, `text-amber-700`, `border-amber-200` | Used for pending/warning states. |
| Processing/info | `bg-blue-50`, `text-blue-700`, `border-blue-200`, `bg-sky-50`, `text-sky-700` | Used for processing/open informational states. |
| Manifest accent | `bg-violet-600`, `text-violet-700`, `from-slate-900 via-slate-800 to-violet-800` | Used for shipping manifest emphasis, scanner loading, and selected visual accents. |

Do not introduce arbitrary hex values. If a new color is needed, prefer an existing semantic token or an established Tailwind palette already used for operational status.

## Typography

| Role | Font | Variable / Utility |
| ---- | ---- | ------------------ |
| UI text | Tailwind default sans-serif/system stack | Use `font-sans` implicitly through Tailwind/base styles. |
| Code/mono | Tailwind default monospace stack | Use `font-mono` only for IDs, tracking numbers, vehicle plates, paths, or technical values. |

Typography conventions:

- Page titles use `text-xl` to `text-2xl`, `font-semibold`, and `text-slate-900`/`text-slate-950`.
- Section labels and eyebrow text use small uppercase tracking such as `text-xs font-medium uppercase tracking-[0.18em]` or `tracking-[0.24em]`.
- Table and control text is compact: `text-xs` to `text-sm`.
- Metadata/helper copy uses `text-sm text-slate-500` or `text-xs text-slate-400`.
- Avoid decorative display typography; the UI should remain fast to scan in warehouse/operator contexts.

## Border Radius

The global radius token is `--radius: 0.625rem`, with Tailwind v4 mapped radii in `@theme inline`:

| Context | Class / Token |
| ------- | ------------- |
| Small controls, inputs, badges | `rounded-md`, `rounded-lg`, `--radius-md` |
| Buttons and compact nav items | `rounded-md`, `rounded-lg`, `rounded-xl` |
| Status pills | `rounded-full` |
| Cards / control groups / tab containers | `rounded-xl`, `rounded-2xl` |
| Large hero/detail panels | `rounded-3xl` |
| Dialogs / overlays | `rounded-lg`; dialog footers may use `rounded-b-lg` |
| Brand/app icon blocks | `rounded-2xl` |

Use the existing radius scale. Do not create arbitrary custom radius values unless a component already establishes that exact shape.

## Component Library

The frontend uses shadcn/Radix-style primitives on top of Tailwind CSS. Shared primitives live in `frontend/src/components/ui/` and include button, badge, checkbox, dialog, dropdown menu, form, input, label, popover, select, skeleton, sonner, table, and tooltip.

Rules:

- Use `frontend/src/components/ui/` primitives for common interactive UI rather than rebuilding buttons, inputs, dialogs, selects, tables, and tooltips from scratch.
- Use global components from `frontend/src/components/global/components/` for app-level repeated patterns such as `TopNavbar`, `DataTable`, `SearchBoxInput`, `DialogHeader`, formatted dates, pagination, loaders, and shared buttons.
- Use `cn` from `frontend/src/lib/utils.ts` to merge conditional classes.
- Keep feature-specific UI inside its module under `frontend/src/modules/<Feature>/components/`.
- Treat `components/ui/` as shared library-style code. Do not alter primitives for a one-off feature need; compose them in the feature module instead.
- Use `sonner` toasts for operator feedback and keep the global `<Toaster position="top-right" />` pattern.

## Layout Patterns

- **App shell**: `main` uses `min-h-screen bg-gray-50`; `TopNavbar` is sticky at the top with a translucent white background, bottom border, and backdrop blur.
- **Content width**: Main operator pages use centered `mx-auto max-w-7xl` containers with `px-4 sm:px-6` and vertical spacing around `py-8`.
- **Navigation**: Top nav uses a compact pill group (`rounded-2xl border bg-slate-50 p-1`) with active items rendered as white pills with shadow/ring.
- **Dashboard table flow**: Waybill management is data-first: search/filter controls, bulk actions, table, pagination, status/action columns, and dialogs for destructive or hardware-affecting actions.
- **Cards and panels**: Use white backgrounds, `border border-slate-200`, `shadow-sm`, and `rounded-2xl`/`rounded-3xl`. Use `overflow-hidden` for header+content panels.
- **Manifest detail hero**: Details pages may use a dark slate-to-violet gradient header over a white card for strong context, followed by a grid of detail fields.
- **Tabs/segmented controls**: Use rounded card containers with active tabs in `bg-slate-900 text-white` and inactive tabs in slate text with hover slate backgrounds.
- **Dialogs**: Centered Radix dialog with `bg-background`, `rounded-lg`, border, shadow, black/50 overlay, and compact padded content. Confirmation dialogs use a shared header area and gray footer action bar.
- **Scanner flows**: Scanner pages use a hidden focused input for barcode capture and a fixed top-right scanner status pill. Scanner status uses emerald for online, violet for processing, and slate/gray for offline.
- **Status badges**: Use rounded pills with a small dot, pale background, colored text, and matching border. Keep one consistent mapping per domain status.
- **Responsive behavior**: Prefer stacked mobile layouts that become flex/grid layouts at `sm`, `md`, or `lg`; preserve horizontal table scrolling for dense tables.

## Icons

Use Lucide React icons. Icons are stroke-based and should match the existing simple operational style.

| Context | Size / Class |
| ------- | ------------ |
| Inline table/status icons | `h-3.5 w-3.5` or `size-3` |
| Standard controls/buttons | `h-4 w-4` or `size-4` |
| Navbar/app icon glyphs | `size-5` |
| Large feature icon containers | Icon `h-5 w-5` inside `h-10 w-10`/`size-10` rounded blocks |

Icon rules:

- Use `strokeWidth={2}` or `strokeWidth={2.2}` where a component already does so.
- Pair icons with text for primary navigation and important hardware actions.
- Use animated icons sparingly for real activity only, such as `RefreshCw` spinning while fetching or `Loader2` spinning while processing.
- Avoid mixing icon libraries; keep new icons from `lucide-react`.
