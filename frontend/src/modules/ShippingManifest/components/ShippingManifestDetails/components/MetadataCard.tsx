import { FileCode2 } from "lucide-react";
import type { ShippingManifest } from "../../../types/shipping-manifest.type";

interface MetadataCardProps {
  manifest: ShippingManifest;
}

export const MetadataCard = ({ manifest }: MetadataCardProps) => {
  const metadata = manifest.meta_data
    ? JSON.stringify(manifest.meta_data, null, 2)
    : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <FileCode2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Metadata</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Raw manifest metadata returned by the API.
          </p>
        </div>
      </div>
      <div className="p-5">
        {metadata ? (
          <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            {metadata}
          </pre>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            No metadata available for this manifest.
          </div>
        )}
      </div>
    </section>
  );
};
