import { Trash2Icon } from "lucide-react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DialogHeaderComponent } from "@/components/global/components/DialogHeader";
import DangerButton from "@/components/global/components/buttons/DangerButton";
import { useCleanupWaybillsForm } from "./useCleanupWaybillsForm";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface CleanupWaybillsDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => Promise<void>;
}

export const CleanupWaybillsDialog = ({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}: CleanupWaybillsDialogProps) => {
  const {
    open: internalOpen,
    handleOpenChange: internalHandleOpenChange,
    form,
    handleSubmit,
    isPending,
  } = useCleanupWaybillsForm({
    onSuccess: async () => {
      if (onSuccess) {
        await onSuccess();
      }
      // Close dialog if controlled
      if (controlledOnOpenChange) {
        controlledOnOpenChange(false);
      }
    },
  });

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
          icon={<Trash2Icon strokeWidth={2} className="w-5 h-5 text-red-600" />}
          title="Clean Up Waybills"
          description="Select a date range to clean up waybills and their associated files"
          variant="danger"
        />

        <div className="px-4 py-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        From Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          disabled={isPending}
                          className="h-8 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        To Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          disabled={isPending}
                          className="h-8 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-xs text-red-700">
                  <strong>Warning:</strong> This action will permanently delete
                  waybills and their associated files within the selected date
                  range. This action cannot be undone.
                </p>
              </div>
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
            <DangerButton
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isPending}
              type="button"
            >
              {isPending ? "Cleaning..." : "Clean Up"}
            </DangerButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
