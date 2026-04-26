import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  onBack: () => void;
}

export const ErrorState = ({ onBack }: ErrorStateProps) => (
  <div className="rounded-2xl border border-rose-200 bg-white px-6 py-10 text-center shadow-sm">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
      <AlertCircle className="h-6 w-6 text-rose-500" />
    </div>
    <h2 className="mt-4 text-lg font-semibold text-slate-900">
      Manifest not available
    </h2>
    <p className="mt-2 text-sm text-slate-500">
      The shipping manifest could not be loaded or may no longer exist.
    </p>
    <Button className="mt-5" variant="outline" onClick={onBack}>
      Back to manifests
    </Button>
  </div>
);
