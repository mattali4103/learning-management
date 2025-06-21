import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import NavigationPanel from "../../components/navigation/NavigationPanel";
import type { KeHoachHocTap } from "../../types/KeHoachHoctap";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash2 } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { KHHT_SERVICE } from "../../api/apiEndPoints";
import useAuth from "../../hooks/useAuth";
import { KeHoachHocTapTable } from "../../components/table/KeHoachHocTapTable";
import Loading from "../../components/Loading";
import type { HocKy } from "../../types/HocKy";

const KeHoachHocTapDetail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedNamHoc, setSelectedNamHoc] = useState<string>("Tất cả");
  const [selectedHocKy, setSelectedHocKy] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hocKyFromAPI, setHocKyFromAPI] = useState<HocKy[]>([]);
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const { maSo } = auth.user || {};
  // Fetch dữ liệu học kỳ từ API
  const fetchHocKy = useCallback(async (maSo: string) => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(
        KHHT_SERVICE.GET_HOCKY.replace(":maSo", maSo),
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      
      // Kiểm tra response code
      if (response.status === 200 && response.data?.code === 200) {
        const hocKyData = response.data.data;
        setHocKyFromAPI(hocKyData);
        localStorage.setItem("hocKy", JSON.stringify(hocKyData));
        setError(null);
      } else {
        throw new Error(`API returned code: ${response.data?.code || response.status}`);
      }
    } catch (error) {
      console.error("Error fetching hoc ky:", error);
      setError("Không thể lấy thông tin học kỳ. Vui lòng thử lại.");
      // Fallback to localStorage if API fails
      try {
        const localData = localStorage.getItem("hocKy");
        if (localData) {
          setHocKyFromAPI(JSON.parse(localData));
          setError(null); // Clear error if localStorage data is available
        }
      } catch (localError) {
        console.error("Lỗi khi parse dữ liệu học kỳ từ localStorage:", localError);
      }
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);
  // Lấy dữ liệu học kỳ từ API khi component mount
  useEffect(() => {
    if (maSo) {
      fetchHocKy(maSo);
    }
  }, [maSo, fetchHocKy]);
  
  // Lấy dữ liệu học kỳ từ state
  const hocKyFromStorage: HocKy[] = useMemo(() => {
    return hocKyFromAPI;
  }, [hocKyFromAPI]);

  // Tạo danh sách năm học từ dữ liệu localStorage
  const namHocList = useMemo(() => {
    const years = new Set<string>();
    hocKyFromStorage.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        years.add(`${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`);
      }
    });
    return ["Tất cả", ...Array.from(years).sort()];
  }, [hocKyFromStorage]);

  // Tạo mapping ID năm học -> tên năm học
  const namHocIdToName = useMemo(() => {
    const mapping: Record<number, string> = {};
    hocKyFromStorage.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.id && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        mapping[hk.namHoc.id] = `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`;
      }
    });
    return mapping;
  }, [hocKyFromStorage]);

  // Tạo mapping tên năm học -> ID năm học
  const namHocNameToId = useMemo(() => {
    const mapping: Record<string, number> = {};
    hocKyFromStorage.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.id && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        const namHoc = `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`;
        mapping[namHoc] = hk.namHoc.id;
      }
    });
    return mapping;
  }, [hocKyFromStorage]);

  // Tạo dữ liệu học kỳ theo năm học từ localStorage
  const hocKyData = useMemo(() => {
    const data: Record<string, string[]> = {};
    hocKyFromStorage.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        const namHoc = `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`;
        if (!data[namHoc]) {
          data[namHoc] = [];
        }
        if (hk.tenHocKy && !data[namHoc].includes(hk.tenHocKy)) {
          data[namHoc].push(hk.tenHocKy);
        }
      }
    });
    // Sắp xếp học kỳ theo thứ tự
    Object.keys(data).forEach((key) => {
      data[key].sort();
    });
    return data;
  }, [hocKyFromStorage]);

  // Tạo mapping ID học kỳ -> tên học kỳ
  const hocKyIdToName = useMemo(() => {
    const mapping: Record<number, string> = {};
    hocKyFromStorage.forEach((hk) => {
      if (hk.maHocKy && hk.tenHocKy) {
        mapping[hk.maHocKy] = hk.tenHocKy;
      }
    });
    return mapping;
  }, [hocKyFromStorage]);

  // Tạo mapping tên học kỳ -> ID học kỳ (theo năm học)
  const hocKyNameToId = useMemo(() => {
    const mapping: Record<string, Record<string, number>> = {};
    hocKyFromStorage.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.namBatDau && hk.namHoc.namKetThuc && hk.maHocKy && hk.tenHocKy) {
        const namHoc = `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`;
        if (!mapping[namHoc]) {
          mapping[namHoc] = {};
        }
        mapping[namHoc][hk.tenHocKy] = hk.maHocKy;
      }
    });
    return mapping;
  }, [hocKyFromStorage]);

  useEffect(() => {
    const namHocIdParam = searchParams.get("namHocId");
    const hocKyIdParam = searchParams.get("hocKyId");
    // Xử lý param năm học
    if (namHocIdParam) {
      const namHocId = parseInt(namHocIdParam);
      if (namHocIdToName[namHocId]) {
        setSelectedNamHoc(namHocIdToName[namHocId]);
      }
    }
    // Xử lý param học kỳ
    if (hocKyIdParam) {
      const hocKyId = parseInt(hocKyIdParam);
      if (hocKyIdToName[hocKyId]) {
        setSelectedHocKy(hocKyIdToName[hocKyId]);
      }
    }
  }, [searchParams, namHocIdToName, hocKyIdToName]);

  // Hàm để thay đổi năm học và cập nhật URL
  const handleNamHocChange = (namHoc: string) => {
    setSelectedNamHoc(namHoc);
    setSelectedHocKy(""); // Reset học kỳ khi thay đổi năm học
    const newParams = new URLSearchParams(searchParams);
    if (namHoc === "Tất cả") {
      newParams.delete("namHocId");
    } else {
      const namHocId = namHocNameToId[namHoc];
      if (namHocId) {
        newParams.set("namHocId", namHocId.toString());
      }
    }
    newParams.delete("hocKyId"); // Xóa param học kỳ khi thay đổi năm học
    setSearchParams(newParams);
  };  // Hàm để thay đổi học kỳ
  const handleHocKyChange = (hocKy: string) => {
    setSelectedHocKy(hocKy);
    const newParams = new URLSearchParams(searchParams);
    
    // Lấy ID học kỳ từ tên học kỳ và năm học hiện tại
    const hocKyId = hocKyNameToId[selectedNamHoc]?.[hocKy];
    if (hocKyId) {
      newParams.set("hocKyId", hocKyId.toString());
    }
    
    setSearchParams(newParams);
  };  return (
    <div className="w-full space-y-4">
      {loading && <Loading />}
      {error && (
        <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-lg">
          Lỗi: {error}
        </div>
      )}
      {!loading && !error && (
        <>
          {/* Thanh điều hướng */}
          <NavigationPanel
            namHocList={namHocList}
            selectedNamHoc={selectedNamHoc}
            selectedHocKy={selectedHocKy}
            hocKyData={hocKyData}
            onNamHocChange={handleNamHocChange}
            onHocKyChange={handleHocKyChange}
          />
          {/* Nội dung hiển thị */}
          <ContentDisplay
            selectedNamHoc={selectedNamHoc}
            selectedHocKy={selectedHocKy}
          />
        </>
      )}
    </div>
  );
};

interface ContentDisplayProps {
  selectedNamHoc: string;
  selectedHocKy: string;
}
const ContentDisplay = ({
  selectedNamHoc,
  selectedHocKy,
}: ContentDisplayProps) => {
  const { auth } = useAuth();
  const { maSo, khoaHoc } = auth.user || {};
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);  const [nhomCoSoData, setNhomCoSoData] = useState<KeHoachHocTap[]>([]);
  const [nhomDaiCuongData, setNhomDaiCuongData] = useState<KeHoachHocTap[]>([]);
  const [nhomChuyenNganhData, setNhomChuyenNganhData] = useState<KeHoachHocTap[]>([]);    // Hàm xử lý khi click xóa (removed for simplification)
  const handleDeleteClick = useCallback((hocPhan: KeHoachHocTap) => {
    console.log("Delete clicked for:", hocPhan);
    // TODO: Implement delete functionality if needed
  }, []);

  const columns = useMemo<ColumnDef<KeHoachHocTap>[]>(
    () => [
      {
        accessorKey: "id",
        header: () => (
          <div className="items-center justify-center hidden">STT</div>
        ),
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      },
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
          <div className="flex items-center justify-center">
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
        id: "maHocKy",
        accessorKey: "tenHocKy",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Học kỳ
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
        id: "namHocId",
        accessorKey: "namBdNamKt",
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
      },      {
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
        id: "actions",
        header: () => (
          <div className="text-center">
            Thao tác
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              onClick={() => handleDeleteClick(row.original)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200 group"
              title="Xóa học phần"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [handleDeleteClick]
  );useEffect(() => {    const fetchData = async (loaiHp: string) => {
      try {
        setLoading(true);
        const response = await axiosPrivate.post<any>(
          KHHT_SERVICE.KHHT_SINHVIEN_BY_LOAI_HP,
          {
            maSo: maSo,
            khoaHoc: khoaHoc,
            loaiHp: loaiHp,
          }
        );
        
        // Kiểm tra response code
        if (response.status === 200 && response.data?.code === 200) {
          const hocPhanData: KeHoachHocTap[] = response.data.data.map(
            (item: any) => ({
              id: item.id,
              maHp: item.hocPhan.maHp,
              tenHp: item.hocPhan.tenHp,
              tinChi: item.hocPhan.tinChi,
              hocPhanTienQuyet: item.hocPhan.hocPhanTienQuyet,
              loaiHp: item.hocPhan.loaiHp,
              maHocKy: item.hocKy.maHocKy,
              tenHocKy: item.hocKy.tenHocKy,
              namHocId: item.namHoc.id,
              namBdNamKt: item.namHoc.namBatDau + "-" + item.namHoc.namKetThuc,
            })
          ); 
          return hocPhanData || [];
        } else {
          throw new Error(`API returned code: ${response.data?.code || response.status} - ${response.data?.message || 'Unknown error'}`);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
        console.error("Lỗi khi lấy dữ liệu:", error);
        return [];
      } finally {
        setLoading(false);
      }
    };

    const loadData = async () => {
      const daiCuongData = await fetchData("Đại cương");
      const coSoData = await fetchData("Cơ sở ngành");
      const chuyenNganhData = await fetchData("Chuyên ngành");
      if (daiCuongData) setNhomDaiCuongData(daiCuongData);
      if (coSoData) setNhomCoSoData(coSoData);
      if (chuyenNganhData) setNhomChuyenNganhData(chuyenNganhData);
    };
    
    loadData();
  }, [axiosPrivate, maSo, khoaHoc]);

  // Hàm để lọc dữ liệu theo năm học và học kỳ
  const filterDataByParams = (data: KeHoachHocTap[]) => {
    if (!data || data.length === 0) return [];
    let filteredData = [...data];
    // Lọc theo năm học nếu không phải "Tất cả"
    if (selectedNamHoc !== "Tất cả") {
      filteredData = filteredData.filter(item => item.namBdNamKt === selectedNamHoc);
    }
    // Lọc theo học kỳ nếu có chọn học kỳ cụ thể
    if (selectedHocKy) {
      filteredData = filteredData.filter(item => item.tenHocKy === selectedHocKy);
    }
    return filteredData;
  };
  // Tạo dữ liệu đã lọc cho từng nhóm
  const filteredNhomDaiCuongData = filterDataByParams(nhomDaiCuongData);
  const filteredNhomCoSoData = filterDataByParams(nhomCoSoData);
  const filteredNhomChuyenNganhData = filterDataByParams(nhomChuyenNganhData);
  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <div className="p-4 text-red-500">Lỗi: {error}</div>;
  }

  const renderContent = () => {
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 gap-10">
          <div>
            <KeHoachHocTapTable
              name="Khối kiến thức đại cương"
              data={filteredNhomDaiCuongData}
              columns={columns}
            />
          </div>
          <div>
            <KeHoachHocTapTable
              name="Khối kiến thức cơ sở"
              data={filteredNhomCoSoData}
              columns={columns}
            />
          </div>
          <div>
            <KeHoachHocTapTable
              name="Khối kiến thức chuyên ngành"
              data={filteredNhomChuyenNganhData}
              columns={columns}
            />
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {renderContent()}
    </div>
  );
};

export default KeHoachHocTapDetail;
