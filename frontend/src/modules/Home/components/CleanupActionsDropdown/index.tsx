import { ChevronDownIcon, Trash2Icon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownButton } from "@/components/global/components/buttons/DropdownButton";

interface WaybillActionsDropdownProps {
  onNewClick: () => void;
  onCleanupClick: () => void;
}

export const WaybillActionsDropdown = ({
  onNewClick,
  onCleanupClick,
}: WaybillActionsDropdownProps) => {
  return (
    <DropdownButton>
      <DropdownButton.Trigger>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 w-full md:w-fit text-gray-700 hover:bg-gray-100"
        >
          <span>Actions</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownButton.Trigger>
      <DropdownButton.Content
        align="start"
        className="bg-white border-gray-200 w-[150px]"
      >
        {/* New Waybill Action */}
        <DropdownMenuItem
          onClick={onNewClick}
          className="p-0! transition-colors"
        >
          <Button
            asChild
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <div className="flex items-center justify-start gap-2">
              <PlusIcon className="h-4 w-4" />
              <span>New</span>
            </div>
          </Button>
        </DropdownMenuItem>

        {/* Cleanup Action */}
        <DropdownMenuItem
          onClick={onCleanupClick}
          className="p-0! transition-colors"
        >
          <Button
            asChild
            type="button"
            variant="ghost"
            size="sm"
            className="w-full hover:bg-red-50"
          >
            <div className="flex items-center justify-start gap-2">
              <Trash2Icon className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-600">Clean Waybills</span>
            </div>
          </Button>
        </DropdownMenuItem>
      </DropdownButton.Content>
    </DropdownButton>
  );
};
