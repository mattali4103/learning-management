import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { ArrowUp, FileText, TriangleAlert } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

interface KeHoachHocTapTableProps {
  name: string;
  data: any[];
  columns: ColumnDef<any>[];
  initialExpanded?: boolean;
}

// Custom global filter function to handle nested objects and Vietnamese text
// const globalFilterFn = (row: Row<any>, _columnId: string, value: string): boolean => {
//   if (!value) return true;
//   const search = value.toLowerCase().trim();
//   // Recursive function to extract all text from nested objects
//   const extractAllText = (obj: any): string => {
//     if (obj === null || obj === undefined) return '';

//     if (typeof obj === 'string' || typeof obj === 'number') {
//       return String(obj);
//     }

//     if (typeof obj === 'object') {
//       return Object.values(obj)
//         .map(extractAllText)
//         .filter(text => text.length > 0)
//         .join(' ');
//     }

//     return '';
//   };

//   // Get all searchable content from the row
//   const searchableContent = extractAllText(row.original).toLowerCase();

//   // Support multiple search terms (split by space)
//   const searchTerms = search.split(' ').filter(term => term.length > 0);

//   // All search terms must be found (AND logic)
//   return searchTerms.every(term => searchableContent.includes(term));
// };

export const KeHoachHocTapTable: React.FC<KeHoachHocTapTableProps> = ({
  name,
  data,
  columns,
  initialExpanded = true,
}) => {
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // State to manage the expanded state of the table
  // This allows the table to be collapsed or expanded
  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);

  // Sync state with prop changes
  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded]);

  // Memoize the data to prevent unnecessary re-renders
  const dataRow = useMemo(() => data, [data]);
  const table = useReactTable({
    data: dataRow,
    columns: columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <div className="overflow-x-auto rounded-lg shadow-xl bg-gray-200 transition-all duration-200 hover:shadow-2xl">
      <div className="text-center flex bg-gradient-to-r from-blue-400 to-blue-500 py-3 text-lg text-white relative">
        {" "}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tìm kiếm học phần..."
            className="border-none px-3 py-1.5 rounded-lg bg-white/90 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white text-sm placeholder-gray-500 transition-all duration-200 w-48"
          />
        </div>{" "}
        <div className="flex-1 flex justify-center items-center">
          <h3 className="font-bold uppercase tracking-wide">{name}</h3>
          {data.length > 0 && (
            <span className="ml-3 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
              {globalFilter
                ? `${table.getRowModel().rows.length}/${data.length}`
                : `${data.length}`}{" "}
              học phần
            </span>
          )}
        </div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
            aria-label={isExpanded ? "Ẩn bảng" : "Hiện bảng"}
            title={isExpanded ? "Ẩn bảng" : "Hiện bảng"}
          >
            <ArrowUp
              className={`w-5 h-5 text-white transition-all duration-300 group-hover:scale-110 ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-400 ease-in-out overflow-hidden ${
          isExpanded
            ? "max-h-[2000px] opacity-100 transform translate-y-0"
            : "max-h-0 opacity-0 transform -translate-y-2"
        }`}
      >
        <div
          className={`transition-all duration-200 ${isExpanded ? "delay-100" : ""}`}
        >
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="text-center">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-2 py-3 border-1 bg-gradient-to-b from-blue-400 to-blue-500 text-center text-lg font-medium text-white border-b transition-colors duration-200 hover:from-blue-500 hover:to-blue-600 ${
                        header.id === "id" ? "hidden" : ""
                      }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-200 bg-gray-50 ${
                      row.id === "id" ? "hidden" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`px-5 py-1.5 border-b-1 border-gray-200 text-center border-x-gray-300 border-x-1 ${
                          cell.column.id === "id" ? "hidden" : ""
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      table
                        .getHeaderGroups()[0]
                        ?.headers.filter((header) => header.id !== "id")
                        .length || columns.length
                    }
                    className="px-5 py-8 text-center text-gray-500 bg-gray-50 border-b-1 border-gray-200"
                  >
                    {" "}
                    <div className="flex flex-col items-center justify-center space-y-3 py-4">
                      <div className="relative">
                        <FileText className="w-16 h-16 text-gray-300" />
                        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 border-2 border-white">
                          <TriangleAlert className="w-3 h-3 text-yellow-600" />
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-semibold text-gray-600">
                          Chưa nhập kế hoạch học tập
                        </span>
                        <p className="text-sm text-gray-400 mt-1">
                          Không có dữ liệu để hiển thị cho mục này
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
