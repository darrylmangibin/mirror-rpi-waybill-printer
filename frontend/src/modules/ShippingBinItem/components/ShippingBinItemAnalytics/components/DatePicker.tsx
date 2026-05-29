import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { parseDateOnly } from "../utils";

interface DatePickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const DatePicker = ({ id, label, value, onChange }: DatePickerProps) => {
  const selectedDate = parseDateOnly(value);

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "h-9 justify-start rounded-md border-slate-200 bg-white text-left font-normal shadow-xs",
              !value && "text-slate-400",
            )}
          >
            <CalendarIcon className="h-4 w-4 text-slate-500" />
            {value || "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) onChange(format(date, "yyyy-MM-dd"));
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
