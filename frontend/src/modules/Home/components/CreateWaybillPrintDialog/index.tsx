import { PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import PrimaryButton from "@/components/global/components/buttons/PrimaryButton";
import { DialogHeaderComponent } from "@/components/global/components/DialogHeader";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useCreateWaybillPrintForm } from "./useCreateWaybillPrintForm";
import { WaybillPrintForm } from "../WaybillPrintForm";

interface CreateWaybillPrintDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (invoiceNumber: string, url: string) => Promise<void>;
}

export const CreateWaybillPrintDialog = ({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSubmit,
}: CreateWaybillPrintDialogProps) => {
  const {
    open: internalOpen,
    handleOpenChange: internalHandleOpenChange,
    form,
    handleSubmit,
    isPending,
  } = useCreateWaybillPrintForm({ onSuccess: onSubmit });

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = (newOpen: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(newOpen);
    } else {
      internalHandleOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0" showCloseButton={false}>
        <DialogHeaderComponent
          icon={
            <PlusIcon strokeWidth={2} className="w-5 h-5 text-violet-600" />
          }
          title="Create Print Job"
          description="Fill in the details to create a new print job"
        />

        <div className="px-4 py-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-3"
            >
              <WaybillPrintForm isPending={isPending} isEditing={false} />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-end gap-2 w-full bg-gray-100 py-2 rounded-b-lg px-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <PrimaryButton
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create"}
            </PrimaryButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
