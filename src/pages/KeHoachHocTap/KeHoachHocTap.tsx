import { useEffect, useState, useMemo } from "react";
import { KeHoachHocTapTable } from "../../components/table/KeHoachHocTapTable";
import { KHHT_SERVICE } from "../../api/apiEndPoints";
import Loading from "../../components/Loading";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Outlet } from "react-router-dom";
import CustomBarChart from "../../components/chart/CustomBarChart";
import useAuth from "../../hooks/useAuth";
import { ArrowUpDown } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";

interface KHHTData {
  id: number;
  loaiHocPhan: string;
  hocPhanCaiThien: boolean;
  hocPhan: {
    maHp: string;
    tenHp: string;
    tinChi: number;
    hocPhanCaiThien: boolean;
  };
  hocKy: {
    maHocKy: number;
    tenHocKy: string;
  };
  namHoc: {
    id: number;
    namBatDau: number;
    namKetThuc: number;
  };
}

export const KeHoachHocTapPage = () => {
  const { auth } = useAuth();
  const [keHoachHocTap, setKeHoachHocTap] = useState<KHHTData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const axiosPrivate = useAxiosPrivate();
  const maSo = auth.user?.maSo || "";

  // Tạo columns definition cho bảng
  const columns = useMemo<ColumnDef<KHHTData>[]>(
    () => [
      {
        accessorKey: "id",
        header: () => <div className="text-center">ID</div>,
      },
      {
        accessorKey: "hocPhan.maHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Mã học phần
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
          <div className="px-5 py-1.5 text-center border-x-gray-300  ">
            {row.original.hocPhan?.maHp || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "hocPhan.tenHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
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
          <div className="text-left px-2">
            {row.original.hocPhan?.tenHp || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "hocPhan.tinChi",
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
        cell: ({ row }) => (
          <div className="text-center">
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {row.original.hocPhan?.tinChi || 0}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "loaiHocPhan",
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
        accessorKey: "hocKy.tenHocKy",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Học kỳ
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
          <div className="text-center">
            {row.original.hocKy?.tenHocKy || "N/A"}
          </div>
        ),
      },
      {
        id: "namHoc",
        accessorFn: (row) => `${row.namHoc.namBatDau}-${row.namHoc.namKetThuc}`,
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
          <div className="text-center">
            {row.original.namHoc
              ? `${row.original.namHoc.namBatDau}-${row.original.namHoc.namKetThuc}`
              : "N/A"}
          </div>
        ),
      },
    ],
    []
  );
  useEffect(() => {
    const fetchKeHoachHocTap = async () => {
      try {
        setLoading(true);
        const result = await axiosPrivate.get(
          KHHT_SERVICE.KHHT_SINHVIEN.replace(":maSo", maSo)
        );
        console.log("API Response:", result.data.data);
        setKeHoachHocTap(result.data.data || []);
      } catch (error) {
        setError(
          error instanceof Error ? `Lỗi: ${error.message}` : "Có lỗi xảy ra"
        );
        setKeHoachHocTap([]);
      } finally {
        setLoading(false);
      }
    };
    if (maSo) {
      fetchKeHoachHocTap();
    }
  }, [axiosPrivate, maSo]);
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Loading showOverlay={false} message="Đang tải kế hoạch học tập..." />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Biểu đồ tín chỉ */}
      <div className="bg-white shadow-lg rounded-lg p-4 mb-6">
        <p className="text-lg text-center font-bold uppercase mb-4">
          Số tín chỉ tích luỹ qua các học kỳ
        </p>
        <CustomBarChart data={keHoachHocTap} />
      </div>{" "}
      {/* Bảng kế hoạch học tập tổng hợp */}
      <div className="transition-all duration-300 hover:scale-[1.01]">
        {" "}
        <KeHoachHocTapTable
          name="Kế hoạch học tập"
          data={keHoachHocTap}
          columns={columns}
          loading={loading}
        />
      </div>
    </div>
  );
};

const KeHoachHocTap = () => {
  return (
    <>
      <Outlet />
    </>
  );
};
export default KeHoachHocTap;
