import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { COLUMNS } from "../constants";

export const LoadingRows = ({ rows }: { rows: number }) =>
  Array.from({ length: rows }).map((_, index) => (
    <TableRow key={index} className="hover:bg-transparent">
      {Array.from({ length: COLUMNS }).map((__, cellIndex) => (
        <TableCell key={cellIndex} className="py-3.5">
          <Skeleton
            className={cn(
              "h-4 rounded",
              cellIndex === 0 ? "w-28" : cellIndex >= 4 ? "w-24" : "w-20",
            )}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
