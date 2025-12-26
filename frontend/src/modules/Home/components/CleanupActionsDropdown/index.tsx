import { ChevronDownIcon, Trash2Icon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownButton } from "@/components/global/components/buttons/DropdownButton";

interface CleanupActionsDropdownProps {
  onNewClick: () => void;
  onCleanupClick: () => void;
}

export const CleanupActionsDropdown = ({
  onNewClick,
  onCleanupClick,
}: CleanupActionsDropdownProps) => {
  return (
    <DropdownButton>
      <DropdownButton.Trigger>
        <Button size="sm" variant="outline" className="gap-2 w-full md:w-fit">
          <span>Actions</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownButton.Trigger>
      <DropdownButton.Content
        align="start"
        className="bg-white border-gray-200 w-48"
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
            className="w-full hover:bg-blue-50"
          >
            <div className="flex items-center justify-start gap-2">
              <PlusIcon className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-600">New</span>
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
              <span className="text-xs text-red-600">Clean Up Waybills</span>
            </div>
          </Button>
        </DropdownMenuItem>
      </DropdownButton.Content>
    </DropdownButton>
  );
};
