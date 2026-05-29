import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const RAW_ITEM_TABLE_COLUMNS = 9;

export const RawItemLoadingRows = ({ rows }: { rows: number }) =>
  Array.from({ length: rows }).map((_, rowIndex) => (
    <TableRow key={rowIndex} className="hover:bg-transparent">
      {Array.from({ length: RAW_ITEM_TABLE_COLUMNS }).map((__, cellIndex) => (
        <TableCell key={cellIndex} className="py-3.5">
          <Skeleton
            className={cn(
              "h-4 rounded",
              cellIndex === 0 ? "w-32" : cellIndex >= 5 ? "w-24" : "w-20",
            )}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
