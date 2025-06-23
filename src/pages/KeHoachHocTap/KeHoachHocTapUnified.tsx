import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import NavigationPanel from "../../components/navigation/NavigationPanel";
import Loading from "../../components/Loading";
import type { KeHoachHocTap } from "../../types/KeHoachHoctap";
import { type ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { KHHT_SERVICE } from "../../api/apiEndPoints";
import useAuth from "../../hooks/useAuth";
import { KeHoachHocTapTable } from "../../components/table/KeHoachHocTapTable";
import { SortableHeader } from "../../components/table/SortableHeader";
import DeleteModal from "../../components/modals/DeleteModal";
import type { HocKy } from "../../types/HocKy";

const KeHoachHocTapUnified = () => {
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
      try {
        const localData = localStorage.getItem("hocKy");
        if (localData) {
          setHocKyFromAPI(JSON.parse(localData));
          setError(null);
        }
      } catch (localError) {
        console.error("Lỗi khi parse dữ liệu học kỳ từ localStorage:", localError);
      }
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    if (maSo) {
      fetchHocKy(maSo);
    }
  }, [maSo, fetchHocKy]);
  
  const hocKyFromStorage: HocKy[] = useMemo(() => {
    return hocKyFromAPI;
  }, [hocKyFromAPI]);

  // Tạo danh sách năm học từ dữ liệu
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

  // Tạo dữ liệu học kỳ theo năm học
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

    if (namHocIdParam) {
      const namHocId = parseInt(namHocIdParam);
      if (namHocIdToName[namHocId]) {
        setSelectedNamHoc(namHocIdToName[namHocId]);
      }
    }

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
    setSelectedHocKy("");
    const newParams = new URLSearchParams(searchParams);
    if (namHoc === "Tất cả") {
      newParams.delete("namHocId");
    } else {
      const namHocId = namHocNameToId[namHoc];
      if (namHocId) {
        newParams.set("namHocId", namHocId.toString());
      }
    }
    newParams.delete("hocKyId");
    setSearchParams(newParams);
  };

  // Hàm để thay đổi học kỳ
  const handleHocKyChange = (hocKy: string) => {
    setSelectedHocKy(hocKy);
    const newParams = new URLSearchParams(searchParams);
    
    const hocKyId = hocKyNameToId[selectedNamHoc]?.[hocKy];
    if (hocKyId) {
      newParams.set("hocKyId", hocKyId.toString());
    }
    
    setSearchParams(newParams);
  };
  return (
    <div className="w-full space-y-4">
      {/* Thanh điều hướng luôn hiển thị */}
      <NavigationPanel
        namHocList={namHocList}
        selectedNamHoc={selectedNamHoc}
        selectedHocKy={selectedHocKy}
        hocKyData={hocKyData}
        onNamHocChange={handleNamHocChange}
        onHocKyChange={handleHocKyChange}
      />
        {/* Loading chỉ cho navigation data */}
      {loading ? (
        <Loading showOverlay={false} message="Đang tải dữ liệu học kỳ..." />
      ) : error ? (
        <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-lg">
          Lỗi: {error}
        </div>
      ) : (
        /* Nội dung hiển thị */
        <UnifiedContentDisplay
          selectedNamHoc={selectedNamHoc}
          selectedHocKy={selectedHocKy}
        />
      )}
    </div>
  );
};

interface UnifiedContentDisplayProps {
  selectedNamHoc: string;
  selectedHocKy: string;
}

const UnifiedContentDisplay = ({
  selectedNamHoc,
  selectedHocKy,
}: UnifiedContentDisplayProps) => {
  const { auth } = useAuth();
  const { maSo, khoaHoc } = auth.user || {};  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [allData, setAllData] = useState<KeHoachHocTap[]>([]);

  // State cho delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hocPhanToDelete, setHocPhanToDelete] = useState<KeHoachHocTap | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hàm xử lý xóa học phần
  const fetchDeleteHocPhan = useCallback(async (id: number) => {
    try {
      setIsDeleting(true);
      const response = await axiosPrivate.delete(
        KHHT_SERVICE.DELETE.replace(":id", id.toString()),
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200 && response.data?.code === 200) {
        setError(null);
        // Reload trang sau khi xóa thành công
        window.location.reload();
      } else {
        throw new Error(
          `API returned code: ${response.data?.code || response.status}`
        );
      }
    } catch (error) {
      console.error("Error deleting hoc phan:", error);
      setError("Không thể xóa học phần. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  }, [axiosPrivate]);

  // Hàm mở modal xác nhận xóa
  const handleDeleteClick = useCallback((hocPhan: KeHoachHocTap) => {
    setHocPhanToDelete(hocPhan);
    setIsDeleteModalOpen(true);
  }, []);

  // Hàm xác nhận xóa
  const handleConfirmDelete = useCallback(() => {
    if (hocPhanToDelete && !isDeleting) {
      fetchDeleteHocPhan(hocPhanToDelete.id);
      setIsDeleteModalOpen(false);
      setHocPhanToDelete(null);
    }
  }, [hocPhanToDelete, isDeleting, fetchDeleteHocPhan]);

  // Hàm đóng modal
  const handleCloseModal = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setHocPhanToDelete(null);
    }
  }, [isDeleting]);

  const columns = useMemo<ColumnDef<KeHoachHocTap>[]>(
    () => [
      {
        accessorKey: "id",
        header: () => (
          <div className="items-center justify-center hidden">STT</div>
        ),
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      },      {
        accessorKey: "maHp",
        header: ({ column }) => (
          <SortableHeader column={column} title="Học phần" />
        ),
        cell: ({ row }) => <div>{row.getValue("maHp")}</div>,
      },
      {
        accessorKey: "tenHp",
        header: ({ column }) => (
          <SortableHeader column={column} title="Tên học phần" />
        ),
      },      {
        accessorKey: "tinChi",
        header: ({ column }) => (
          <SortableHeader column={column} title="Tín chỉ" />
        ),
      },
      {
        accessorKey: "loaiHp",
        header: ({ column }) => (
          <SortableHeader column={column} title="Loại học phần" />
        ),
        cell: ({ row }) => {
          const loaiHp = row.getValue("loaiHp") as string;
          const colorMap: Record<string, string> = {
            "Đại cương": "bg-blue-100 text-blue-800",
            "Cơ sở ngành": "bg-green-100 text-green-800", 
            "Chuyên ngành": "bg-purple-100 text-purple-800"
          };
          return (
            <div className="flex justify-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[loaiHp] || "bg-gray-100 text-gray-800"}`}>
                {loaiHp}
              </span>
            </div>
          );
        },
      },      {
        id: "maHocKy",
        accessorKey: "tenHocKy",
        header: ({ column }) => (
          <SortableHeader column={column} title="Học kỳ" />
        ),
      },
      {
        id: "namHocId",
        accessorKey: "namBdNamKt",
        header: ({ column }) => (
          <SortableHeader column={column} title="Năm học" className="ml-2 text-gray-600 hover:text-gray-800" />
        ),
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: ({ column }) => (
          <SortableHeader column={column} title="Tiên quyết" />
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
  );

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tất cả 3 loại học phần cùng lúc
        const [daiCuongResponse, coSoResponse, chuyenNganhResponse] = await Promise.all([
          axiosPrivate.post<any>(KHHT_SERVICE.KHHT_SINHVIEN_BY_LOAI_HP, {
            maSo: maSo,
            khoaHoc: khoaHoc,
            loaiHp: "Đại cương",
          }),
          axiosPrivate.post<any>(KHHT_SERVICE.KHHT_SINHVIEN_BY_LOAI_HP, {
            maSo: maSo,
            khoaHoc: khoaHoc,
            loaiHp: "Cơ sở ngành",
          }),
          axiosPrivate.post<any>(KHHT_SERVICE.KHHT_SINHVIEN_BY_LOAI_HP, {
            maSo: maSo,
            khoaHoc: khoaHoc,
            loaiHp: "Chuyên ngành",
          })
        ]);

        // Xử lý và gộp dữ liệu
        const processResponse = (response: any): KeHoachHocTap[] => {
          if (response.status === 200 && response.data?.code === 200) {
            return response.data.data.map((item: any) => ({
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
            }));
          }
          return [];
        };

        const allHocPhan = [
          ...processResponse(daiCuongResponse),
          ...processResponse(coSoResponse),
          ...processResponse(chuyenNganhResponse)
        ];

        setAllData(allHocPhan);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    if (maSo && khoaHoc) {
      fetchAllData();
    }
  }, [axiosPrivate, maSo, khoaHoc]);

  // Hàm để lọc dữ liệu theo năm học và học kỳ
  const filteredData = useMemo(() => {
    if (!allData || allData.length === 0) return [];
    
    let filtered = [...allData];
    
    // Lọc theo năm học nếu không phải "Tất cả"
    if (selectedNamHoc !== "Tất cả") {
      filtered = filtered.filter(item => item.namBdNamKt === selectedNamHoc);
    }
    
    // Lọc theo học kỳ nếu có chọn học kỳ cụ thể
    if (selectedHocKy) {
      filtered = filtered.filter(item => item.tenHocKy === selectedHocKy);
    }
    
    return filtered;
  }, [allData, selectedNamHoc, selectedHocKy]);  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <Loading showOverlay={false} message="Đang tải dữ liệu học phần..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-lg">
          Lỗi: {error}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <KeHoachHocTapTable
        name="Tất cả học phần trong kế hoạch học tập"
        data={filteredData}
        columns={columns}
        loading={loading}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseModal}
        title="Xác nhận xóa học phần"
        message={`Bạn có chắc chắn muốn xóa học phần "${hocPhanToDelete?.tenHp}" không? Hành động này không thể hoàn tác.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default KeHoachHocTapUnified;
