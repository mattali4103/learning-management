/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import type { HocPhan } from "../../types/HocPhan";
import { KHHT_SERVICE } from "../../api/apiEndPoints";
import { ArrowUpDown, CirclePlus, RotateCw, Trash2 } from "lucide-react";
import Loading from "../Loading";
import Error from "../Error";
import type { KeHoachHocTap } from "../../types/KeHoachHoctap";
import ErrorMesssageModal from "../modals/ErrorMessageModal";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";

const namHoc: any[] = [
  { id: 1, tenNamHoc: "2021-2022" },
  { id: 2, tenNamHoc: "2022-2023" },
  { id: 3, tenNamHoc: "2023-2024" }, // Fixed duplicate id
];

const hocKy: any[] = [
  { id: 1, tenHocky: "Học kỳ 1", namHocId: 1 },
  { id: 2, tenHocky: "Học kỳ 2", namHocId: 1 },
  { id: 3, tenHocky: "Học kỳ 3", namHocId: 1 },
  { id: 4, tenHocky: "Học kỳ 1", namHocId: 2 },
  { id: 5, tenHocky: "Học kỳ 2", namHocId: 2 },
  { id: 6, tenHocky: "Học kỳ 3", namHocId: 2 },
  { id: 7, tenHocky: "Học kỳ 1", namHocId: 3 },
  { id: 8, tenHocky: "Học kỳ 2", namHocId: 3 },
  { id: 9, tenHocky: "Học kỳ 3", namHocId: 3 },
];

const AddKHHTTable = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const {auth} = useAuth();
  const [data, setData] = useState<HocPhan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHocPhan, setSelectedHocPhan] = useState<KeHoachHocTap[]>([]);
  const axiosPrivate = useAxiosPrivate();

  const maSo = auth.user?.maSo || "";
  // Fetch dữ liệu từ API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const respnose = await axiosPrivate.get(
        KHHT_SERVICE.CTDT_NOT_IN_KHHT.replace(":id", maSo).replace(
          ":khoaHoc",
          "K50"
        )
      );
      setData(respnose.data.data || []);
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleRefresh = () => {
    fetchData();
    table.setGlobalFilter("");
    table.resetSorting();
    table.resetRowSelection();
  };
  useEffect(() => {
    fetchData();
  }, []);
  const filteredData = useMemo(() => {
    return data.filter(
      (hocPhan) =>
        !selectedHocPhan?.some((selected) => selected.maHp === hocPhan.maHp)
    );
  }, [data, selectedHocPhan]);

  // Định nghĩa cột
  const columns = useMemo<ColumnDef<HocPhan>[]>(
    () => [
      {
        accessorKey: "maHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Học phần
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => <div>{row.getValue("maHp")}</div>,
      },
      {
        accessorKey: "tenHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tên học phần
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "tinChi",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tín chỉ
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "loaiHp",
        header: ({ column }) => (
          <div className="items-center justify-center">
            Loại học phần
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tiên quyết
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "action",
        size: 50,
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              className="text-green-600 hover:text-green-700 cursor-pointer py-1.5 rounded-lg"
              onClick={() => {
                setSelectedHocPhan((prev) => [
                  ...prev,
                  {
                    maHp: row.getValue("maHp"),
                    tenHp: row.getValue("tenHp"),
                    tinChi: row.getValue("tinChi"),
                    loaiHp: row.getValue("loaiHp"),
                    hocPhanTienQuyet: row.getValue("hocPhanTienQuyet"),
                    maHocKy: 0,
                    namHocId: 0,
                  } as KeHoachHocTap,
                ]);
              }}
            >
              <CirclePlus />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Khởi tạo table
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 6 } },
  });

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-1 flex justify-between">
        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Tìm kiếm..."
          className="w-full max-w-md p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="p-2" onClick={handleRefresh}>
          <RotateCw className="w-5 h-5 hover:animate-spin hover:cursor-pointer " />
        </button>
      </div>
      <div className="overflow-x-auto p-2 rounded-lg shadow-xl bg-gray-50">
        <table className="w-full border-collapse table-fixed">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-blue-400 text-white text-center"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-5 py-2 border-b border-gray-200 
                      ${header.id === "tenHp" ? "w-[30%]" : ""}
                      ${header.id === "maHp" ? "w-[10%]" : ""}
                      ${header.id === "tinChi" ? "w-[8%]" : ""}
                      ${header.id === "hocPhanTienQuyet" ? "w-[12%]" : ""}
                      ${header.id === "action" ? "w-[10%]" : ""}
                      ${header.id === "loaiHp" ? "hidden" : ""}
                      
                      `}
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
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-200 bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-5 py-1.5 border border-x-0 border-gray-200 truncate ${
                      cell.column.id === "tenHp" ? "text-left" : "text-center"
                    } ${cell.column.id === "loaiHp" ? "hidden" : ""}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SelectedHocPhanTable
        onSaveSuccess={fetchData}
        selectedHocPhan={selectedHocPhan}
        setSelectedHocPhan={setSelectedHocPhan}
        removeHocPhan={(maHp: string) => {
          setSelectedHocPhan((prev) =>
            prev.filter((hocPhan) => hocPhan.maHp !== maHp)
          );
        }}
      />
    </div>
  );
};

interface SelectedHocPhanTableProps {
  onSaveSuccess?: () => void;
  selectedHocPhan: KeHoachHocTap[];
  setSelectedHocPhan: React.Dispatch<React.SetStateAction<KeHoachHocTap[]>>;
  removeHocPhan: (maHp: string) => void;
}

const SelectedHocPhanTable = ({
  onSaveSuccess,
  selectedHocPhan,
  setSelectedHocPhan,
  removeHocPhan,
}: SelectedHocPhanTableProps) => {
  const axiosPrivate = useAxiosPrivate();

  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterdData, setFilterdData] = useState<
    { maSo: string; maHocKy: number; maHocPhan: string }[]
  >([]);
  useEffect(() => {
    if (selectedHocPhan && Array.isArray(selectedHocPhan)) {
      setFilterdData(
        selectedHocPhan.map((hocPhan) => ({
          maSo: "B2110946",
          maHocKy: hocPhan.maHocKy,
          maHocPhan: hocPhan.maHp,
        }))
      );
    }
  }, [selectedHocPhan]);

  const handleFetchKHHT = async () => {
    console.log("keHoachHocTap", filterdData);
    if (
      filterdData.some((item) => item.maHocKy === 0 || item.maHocPhan === "")
    ) {
      setError("Vui lòng chọn đầy đủ thông tin học phần trước khi lưu.");
      return;
    }
    try {
      setFetchLoading(true);
      const response = await axiosPrivate.post(KHHT_SERVICE.CREATE, filterdData);
      setSelectedHocPhan(response.data.data || []);
    } catch (err) {
      setError((err as { message: string }).message);
      setSelectedHocPhan([]);
      setSuccess("Lưu thành công");
      onSaveSuccess?.();
    } finally {
      setFetchLoading(false);
      window.location.reload();
    }
  };

  const columns = useMemo<ColumnDef<KeHoachHocTap>[]>(
    () => [
      {
        accessorKey: "maHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Học phần
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => <div>{row.getValue("maHp")}</div>,
      },
      {
        accessorKey: "tenHp",
        header: ({ column }) => (
          <div className="flex items-center justify-start">
            Tên học phần
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-left">{row.getValue("tenHp")}</div>
        ),
      },
      {
        accessorKey: "tinChi",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tín chỉ
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "loaiHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Loại học phần
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tiên quyết
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "namHocId",
        id: "namHocId",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Năm học
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <select
            value={row.original.namHocId}
            onChange={(e) => {
              const newNamHocId = Number(e.target.value);
              setSelectedHocPhan((prev) =>
                prev.map((hocPhan) =>
                  hocPhan.maHp === row.getValue("maHp")
                    ? { ...hocPhan, namHocId: newNamHocId, maHocKy: 0 }
                    : hocPhan
                )
              );
            }}
            className="border rounded px-2 py-1 w-full"
          >
            <option value={0}>Chọn năm học</option>
            {namHoc &&
              namHoc.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.tenNamHoc}
                </option>
              ))}
          </select>
        ),
      },
      {
        accessorKey: "maHocKy",
        id: "hocKyId",
        header: () => (
          <div className="flex items-center justify-center">Học kỳ</div>
        ),
        cell: ({ row }) => (
          <select
            value={row.original.maHocKy}
            onChange={(e) => {
              const newHocKyId = Number(e.target.value);
              setSelectedHocPhan((prev) =>
                prev.map((hocPhan) =>
                  hocPhan.maHp === row.getValue("maHp")
                    ? { ...hocPhan, maHocKy: newHocKyId }
                    : hocPhan
                )
              );
            }}
            className="border rounded px-2 py-1 w-full"
          >
            <option value={0}>Chọn học kỳ</option>
            {hocKy
              .filter(
                (hk) => hk.namHocId === (row.original.namHocId || namHoc[0].id)
              )
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.tenHocky}
                </option>
              ))}
          </select>
        ),
      },
      {
        accessorKey: "action",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-center space-x-2">
            <button
              className="text-red-600 hover:text-red-800 p-1 rounded"
              onClick={() => removeHocPhan(row.getValue("maHp"))}
              aria-label="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    [setSelectedHocPhan, removeHocPhan]
  );

  const table = useReactTable({
    data: selectedHocPhan ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 6 } },
  });

  if (selectedHocPhan?.length === 0) {
    return <></>;
  }

  return (
    <div className="container mx-auto mt-6 px-4">
      <div className="overflow-x-auto rounded-lg shadow-md ">
        <div className=" bg-blue-400 py-2 text-lg border-b-1 text-center text-white">
          Học phần đã chọn
        </div>
        <div className="overflow-x-auto p-2  max-h-[400px]">
          <table className="w-full border-collapse bg-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <>
                  <tr key={headerGroup.id} className="bg-blue-400 text-white">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`
                      p-2 border-b border-gray-200 
                      ${header.id === "tenHp" ? "w-[23%]" : ""}
                      ${header.id === "maHp" ? "w-[10%]" : ""}
                      ${header.id === "tinChi" ? "w-[10%]" : ""}
                      ${header.id === "loaiHp" ? "w-[12%]" : ""}
                      ${header.id === "hocPhanTienQuyet" ? "w-[12%]" : ""}
                      ${header.id === "namHocId" ? "w-[12%]" : ""}
                      ${header.id === "hocKyId" ? "w-[12%]" : ""}
                      ${header.id === "action" ? "w-[5%]" : ""}
                      ${header.id === "tenHp" ? "text-left" : "text-center"}
                    `}
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
                </>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-200 bg-gray-100 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`
                      px-5 py-1.5 border border-x-0 border-gray-200 truncate
                      ${cell.column.id === "tenHp" ? "text-left" : "text-center"}
                      ${cell.column.id === "loaiHp" ? "hidden sm:table-cell" : ""}
                    `}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end mt-4 gap-2 text-white   font-semibold">
        <button
          onClick={() => {
            setSelectedHocPhan([]);
          }}
          className="px-6 py-1.5 bg-gray-400 hover:bg-gray-500 rounded-xl"
        >
          Huỷ
        </button>
        <button
          disabled={fetchLoading}
          onClick={() => handleFetchKHHT()}
          className={`px-6 py-1.5 rounded-xl ${
            fetchLoading
              ? "cursor-not-allowed opacity-50"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {fetchLoading ? "Đang lưu..." : "Lưu kế hoạch học tập"}
        </button>
      </div>
      {success && (
        <ErrorMesssageModal
          isOpen={!!success}
          onClose={() => setSuccess(null)}
          message={success}
        />
      )}
      <ErrorMesssageModal
        isOpen={!!error}
        onClose={() => setError(null)}
        message={error || "Đã xảy ra lỗi. Vui lòng thử lại."}
      />
    </div>
  );
};

export default AddKHHTTable;
