import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ShippingManifest } from "@/modules/ShippingManifest/types/shipping-manifest.type";

interface OpenManifestConflictModalProps {
  manifest: ShippingManifest | null;
  isLoading?: boolean;
  onClose: () => void;
  onUseExisting: (manifest: ShippingManifest) => void;
  onCloseAndCreateNew: (manifest: ShippingManifest) => void;
}

export const OpenManifestConflictModal = ({
  manifest,
  isLoading = false,
  onClose,
  onUseExisting,
  onCloseAndCreateNew,
}: OpenManifestConflictModalProps) => {
  return (
    <Dialog 
      open={!!manifest} 
      onOpenChange={(open) => !open && !isLoading && onClose()}
    >
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-amber-50 px-6 py-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm mb-4">
            <AlertTriangle className="h-7 w-7 text-amber-500" />
          </div>
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Open Manifest Exists
            </DialogTitle>
            <DialogDescription className="text-slate-600 leading-relaxed">
              There is already an open shipping manifest for this collection.
              What would you like to do?
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="bg-white p-6 space-y-3">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-2 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Existing Code
              </span>
              <span className="font-mono text-sm font-bold text-violet-700">
                {manifest?.manifest_code}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Status
              </span>
              <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                Open
              </span>
            </div>
          </div>

          <Button
            className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-md transition-all active:scale-[0.98]"
            onClick={() => manifest && onUseExisting(manifest)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Use Existing Manifest"
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full h-11 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
            onClick={() => manifest && onCloseAndCreateNew(manifest)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Close and Create New"
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full h-10 text-slate-400 text-sm hover:text-slate-600 transition-all"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
