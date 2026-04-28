import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CloseManifestModalProps = {
  open: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const CloseManifestModal = ({
  open,
  isPending,
  onClose,
  onConfirm,
}: CloseManifestModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Manifest</DialogTitle>
          <DialogDescription>
            Are you sure you want to close this manifest? This action{" "}
            <span className="font-semibold text-destructive">
              cannot be undone
            </span>
            . Once closed, no further items can be added.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="outline"
            className="border-amber-300 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Closing..." : "Close Manifest"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
