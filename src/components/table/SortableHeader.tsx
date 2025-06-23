import { ArrowUpDown } from "lucide-react";
import type { Column } from "@tanstack/react-table";

interface SortableHeaderProps {
  column: Column<any>;
  title: string;
  className?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  column,
  title,
  className = "ml-2"
}) => {
  return (
    <div className="flex items-center justify-center">
      {title}
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className={className}
      >
        <ArrowUpDown className="h-4 w-4" />
      </button>
    </div>
  );
};
