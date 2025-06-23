import { useCallback, useEffect, useState } from "react";
import { KeHoachHocTapTable } from "../../components/table/KeHoachHocTapTable";
import { SortableHeader } from "../../components/table/SortableHeader";
import { KHHT_SERVICE } from "../../api/apiEndPoints";
import Loading from "../../components/Loading";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Outlet } from "react-router-dom";
import KHHTBarChart from "../../components/chart/KHHTBarChart";
import useAuth from "../../hooks/useAuth";
import type { ColumnDef } from "@tanstack/react-table";
import type { HocKy } from "../../types/HocKy";

// Sử dụng cấu trúc dữ liệu phẳng như trong KeHoachHocTapDetail
interface KHHTData {
  id: number;
  maHp: string;
  tenHp: string;
  tinChi: number;
  hocPhanTienQuyet: string;
  loaiHp: string;
  maHocKy: number;
  tenHocKy: string;
  namHocId: number;
  namBdNamKt: string;
}

// Interface cho dữ liệu biểu đồ từ API COUNT_TINCHI_GROUP_BY_HOCKY
interface TinChiThongKe {
  hocKy: HocKy;
  soTinChiDangKy: number;
  soTinChiCaiThien: number;
}

export const KeHoachHocTapPage = () => {
  const { auth } = useAuth();
  const [keHoachHocTap, setKeHoachHocTap] = useState<KHHTData[]>([]);
  const [tinChiThongKe, setTinChiThongKe] = useState<TinChiThongKe[]>([]); // Dữ liệu cho biểu đồ
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const axiosPrivate = useAxiosPrivate();
  const maSo = auth.user?.maSo || "";
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 10; // Fixed page size, không cho phép người dùng thay đổi
  const [totalElements, setTotalElements] = useState<number>(0);
  // Function fetch dữ liệu thống kê tín chỉ
  const fetchTinChiThongKe = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(
        KHHT_SERVICE.COUNT_TINCHI_GROUP_BY_HOCKY.replace(":maSo", maSo)
      );

      if (response.status === 200 && response.data?.code === 200) {
        const thongKeData: TinChiThongKe[] = response.data.data;
        setTinChiThongKe(thongKeData);
        return thongKeData;
      } else {
        throw new Error(`API returned code: ${response.data?.code || response.status}`);
      }
    } catch (error) {
      console.error("Error fetching tin chi thong ke:", error);
      setTinChiThongKe([]);
      return [];
    }
  }, [axiosPrivate, maSo]);

  // Function fetch dữ liệu kế hoạch học tập
  const fetchKeHoachHocTap = useCallback(async () => {
    try {     
       // Sử dụng server-side pagination
      const result = await axiosPrivate.get(KHHT_SERVICE.KHHT_SINHVIEN, {
        params: {
          maSo: maSo,
          page: currentPage, // Trang hiện tại (1-based index)
          size: pageSize, // Sử dụng pageSize từ state
        }
      });
      console.log("API Response:", result.data);

      // Xử lý response có cấu trúc phân trang và flatten dữ liệu như KeHoachHocTapDetail
      if (result.data && result.data.data) {
        const responseData = result.data.data; // data của API
        // Flatten dữ liệu theo cấu trúc của KeHoachHocTapDetail
        const khhtData: KHHTData[] = responseData.data.map((item: any) => ({
          id: item.id,
          maHp: item.hocPhan?.maHp || item.maHp || "",
          tenHp: item.hocPhan?.tenHp || item.tenHp || "",
          tinChi: item.hocPhan?.tinChi || item.tinChi || 0,
          hocPhanTienQuyet: item.hocPhan?.hocPhanTienQuyet || item.hocPhanTienQuyet || "",
          loaiHp: item.hocPhan?.loaiHp || item.loaiHocPhan || "",
          maHocKy: item.hocKy?.maHocKy || item.hocKy?.id || 0,
          tenHocKy: item.hocKy?.tenHocKy || "",
          namHocId: item.namHoc?.id || item.hocKy?.namHoc?.id || 0,
          namBdNamKt: item.namHoc
            ? `${item.namHoc.namBatDau}-${item.namHoc.namKetThuc}`
            : item.hocKy?.namHoc
              ? `${item.hocKy.namHoc.namBatDau}-${item.hocKy.namHoc.namKetThuc}`
              : "",
        }));          setKeHoachHocTap(khhtData);
        setTotalElements(responseData.totalElements || 0);
        // Tính toán totalPages nếu API không trả về hoặc trả về 0
        const calculatedTotalPages = responseData.totalPages || 
          Math.ceil((responseData.totalElements || khhtData.length) / pageSize);
        setTotalPages(Math.max(calculatedTotalPages, 1)); // Đảm bảo có ít nhất 1 trang
      
        
        return khhtData;
      } else {
        setKeHoachHocTap([]);
        setTotalElements(0);
        setTotalPages(0);
        return [];
      }
    } catch (error) {
      setError(
        error instanceof Error ? `Lỗi: ${error.message}` : "Có lỗi xảy ra"
      );
      setKeHoachHocTap([]);
      setTotalElements(0);
      setTotalPages(0);
      return [];
    }
  }, [axiosPrivate, maSo, currentPage, pageSize]);
  // Định nghĩa columns cho bảng kế hoạch học tập (sử dụng cấu trúc phẳng như KeHoachHocTapDetail)
  const columns: ColumnDef<KHHTData>[] = [
    {
      accessorKey: "id",
      header: () => (
        <div className="text-center hidden">STT</div>
      ),
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    },
    {
      accessorKey: "maHp",
      header: ({ column }) => (
        <SortableHeader column={column} title="Mã học phần" className="ml-2 hover:text-white/80 transition-colors" />
      ),
      cell: ({ row }) => <div>{row.getValue("maHp")}</div>,
    },
    {
      accessorKey: "tenHp",
      header: ({ column }) => (
        <SortableHeader column={column} title="Tên học phần" className="ml-2 hover:text-white/80 transition-colors" />
      ),
    },
    {
      accessorKey: "tinChi",
      header: ({ column }) => (
        <SortableHeader column={column} title="Tín chỉ" className="ml-2 hover:text-white/80 transition-colors" />
      ),
    },
    {
      accessorKey: "loaiHp",
      header: ({ column }) => (
        <SortableHeader column={column} title="Loại học phần" className="ml-2 hover:text-white/80 transition-colors" />
      ),
    },
    {
      id: "maHocKy",
      accessorKey: "tenHocKy",
      header: ({ column }) => (
        <SortableHeader column={column} title="Học kỳ" className="ml-2 hover:text-white/80 transition-colors" />
      ),
    },
    {
      id: "namHocId",
      accessorKey: "namBdNamKt",
      header: ({ column }) => (
        <SortableHeader column={column} title="Năm học" className="ml-2 hover:text-white/80 transition-colors" />
      ),
    },
    {
      accessorKey: "hocPhanTienQuyet",
      header: ({ column }) => (
        <SortableHeader column={column} title="Học phần tiên quyết" className="ml-2 hover:text-white/80 transition-colors" />
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!maSo) return;

      setLoading(true);
      try {
        // Fetch cả hai loại dữ liệu song song
        await Promise.all([
          fetchKeHoachHocTap(),
          fetchTinChiThongKe()
        ]);

      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? `Lỗi: ${error.message}` : "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };    fetchData();
  }, [maSo, currentPage, fetchKeHoachHocTap, fetchTinChiThongKe]); // Removed pageSize from dependency array

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
  // Hàm xử lý thay đổi trang cho server pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Biểu đồ tín chỉ và môn học theo học kỳ */}
      {tinChiThongKe.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-4 mb-6">
          <p className="text-lg text-center font-bold uppercase mb-4">
            Số tín chỉ đăng ký và cải thiện theo học kỳ
          </p>
          <KHHTBarChart
            rawData={tinChiThongKe}
            height={400}
          />
        </div>
      )}

      {/* Bảng kế hoạch học tập với server-side pagination */}
      <div className="transition-all duration-300 hover:scale-[1.01]">        <KeHoachHocTapTable
          name="Kế hoạch học tập"
          data={keHoachHocTap}
          columns={columns}
          loading={loading}
          initialExpanded={true}
          enableServerPagination={true}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalElements={totalElements}
          onPageChange={handlePageChange}
          emptyStateTitle="Chưa có kế hoạch học tập"
          emptyStateDescription="Hệ thống chưa có dữ liệu kế hoạch học tập của bạn"
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
