import { useMemo, useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2Icon, Save, ArrowLeft} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { KeHoachHocTapTable } from "../../../components/table/KeHoachHocTapTable";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import {
  HOCPHAN_SERVICE,
  KHHT_SERVICE,
} from "../../../api/apiEndPoints";
import SuccessMessageModal from "../../../components/modals/SuccessMessageModal";
import ErrorMessageModal from "../../../components/modals/ErrorMessageModal";
import Loading from "../../../components/Loading";
import type { HocPhan } from "../../../types/HocPhan";
import type {
  KeHoachHocTapDetail,
  KeHoachHocTapDataRequest,
} from "../../../types/KeHoachHocTapMau";
import type { HocKy } from "../../../types/HocKy";
import FetchLoading from "../../../components/FetchLoading";

const ThemHocPhanComponent = () => {
  const { maNganh, khoaHoc } = useParams<{
    maNganh: string;
    khoaHoc: string;
  }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  // Internal state
  const [availableHocPhans, setAvailableHocPhans] = useState<HocPhan[]>([]);
  const [selectedHocPhans, setSelectedHocPhans] = useState<KeHoachHocTapDetail[]>([]);
  const [existingKHHTHocPhans, setExistingKHHTHocPhans] = useState<string[]>([]);
  const [danhSachHocKy, setDanhSachHocKy] = useState<HocKy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Create academic year list from API data
  const namHocList = useMemo(() => {
    const years = new Map<number, { id: number; tenNamHoc: string }>();
    danhSachHocKy.forEach((hk, index) => {
      if (hk.namHoc) {
        const namHocId = hk.namHoc.id || index + 1;
        years.set(namHocId, {
          id: namHocId,
          tenNamHoc: `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`,
        });
      }
    });

    const result = Array.from(years.values()).sort((a, b) => a.id - b.id);
    return result;
  }, [danhSachHocKy]);

  // Create semester list from API data
  const hocKyList = useMemo(() => {
    const result = danhSachHocKy.map((hk, index) => {
      const maHocKy = hk.maHocKy || index + 1;
      const tenHocKy = hk.tenHocKy || `Học kỳ ${index + 1}`;
      const namHocId = hk.namHoc?.id || 0;

      return {
        id: maHocKy,
        tenHocky: tenHocKy,
        namHocId: namHocId,
      };
    });
    return result;
  }, [danhSachHocKy]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [hocPhanResponse, hocKyResponse] = await Promise.all([
          axiosPrivate.get(HOCPHAN_SERVICE.CTDT_BY_NGANH.replace(":khoaHoc", khoaHoc!).replace(":maNganh", maNganh!)),
          axiosPrivate.get(HOCPHAN_SERVICE.GET_ALL_HOCKY),
        ]);
        const hocKyList = hocKyResponse.data.data || [];
        setDanhSachHocKy(
          hocKyList.map((hk: any) => ({
            maHocKy: hk.maHocKy,
            tenHocKy: hk.tenHocKy,
            namHoc: hk.namHocDTO
              ? {
                  id: hk.namHocDTO.id,
                  namBatDau: hk.namHocDTO.namBatDau,
                  namKetThuc: hk.namHocDTO.namKetThuc,
                }
              : null,
          }))
        );
        // Fetch existing KHHT mẫu để loại bỏ các học phần đã có
        let existingHocPhans: string[] = [];
        try {
          const khhtResponse = await axiosPrivate.get(
            KHHT_SERVICE.KHHT_MAU_BY_KHOAHOC_MA_NGANH,
            {
              params: {
                khoaHoc: khoaHoc,
                maNganh: maNganh,
              },
            }
          );
          if (khhtResponse.data && khhtResponse.data.data) {
            existingHocPhans = khhtResponse.data.data.map((item: KeHoachHocTapDetail) => item.hocPhan.maHp);
            console.log("Existing KHHT học phần:", existingHocPhans);
          }
        } catch {
          console.log("Chưa có kế hoạch học tập mẫu cho ngành/khóa này");
        }

        setExistingKHHTHocPhans(existingHocPhans);
        
        // Filter out học phần đã có trong KHHT mẫu
        const allHocPhans = hocPhanResponse.data.data.hocPhanList || [];
        const filteredHocPhans = allHocPhans.filter((hp: HocPhan) => !existingHocPhans.includes(hp.maHp));
        
        setAvailableHocPhans(filteredHocPhans);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Có lỗi xảy ra khi tải dữ liệu!");
        setShowErrorModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (maNganh && khoaHoc) {
      fetchData();
    }
  }, [maNganh, khoaHoc, axiosPrivate]);

  // Filter available học phần
  const filteredHocPhans = useMemo(() => {
    const allSelectedIds = new Set([
      ...selectedHocPhans.map((item) => item.hocPhan.maHp),
      ...existingKHHTHocPhans, // Loại bỏ các học phần đã có trong KHHT mẫu
    ]);

    let filtered = availableHocPhans.filter(
      (hp) => !allSelectedIds.has(hp.maHp)
    );

    if (searchTerm) {
      filtered = filtered.filter(
        (hp) =>
          hp.tenHp.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hp.maHp.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [availableHocPhans, searchTerm, selectedHocPhans, existingKHHTHocPhans]);

  // Thêm học phần trực tiếp vào selected list
  const handleAddHocPhan = useCallback(
    (hocPhan: HocPhan) => {
      const firstSemester = danhSachHocKy[0];
      if (!firstSemester) {
        setErrorMessage("Không có học kỳ nào để thêm học phần!");
        setShowErrorModal(true);
        return;
      }
      const newItem: KeHoachHocTapDetail = {
        id: `${hocPhan.maHp}-${Date.now()}`,
        hocPhan,
        hocKy: firstSemester,
        hocPhanCaiThien: false,
      };
      setSelectedHocPhans((prev) => [...prev, newItem]);
    },
    [danhSachHocKy]
  );

  // Xóa khỏi selected list
  const handleRemoveSelected = useCallback((maHp: string) => {
    setSelectedHocPhans((prev) =>
      prev.filter((item) => item.hocPhan.maHp !== maHp)
    );
  }, []);




  // Lưu kế hoạch học tập mẫu
  const handleSave = async () => {
    if (selectedHocPhans.length === 0) {
      setErrorMessage("Vui lòng thêm ít nhất một học phần!");
      setShowErrorModal(true);
      return;
    }

    // Kiểm tra xem tất cả học phần đã có học kỳ chưa
    const invalidItems = selectedHocPhans.filter(item => !item.hocKy || !item.hocKy.maHocKy);
    if (invalidItems.length > 0) {
      setErrorMessage("Vui lòng chọn học kỳ cho tất cả học phần!");
      setShowErrorModal(true);
      return;
    }

    try {
      setIsSaving(true);

      // Chuyển đổi dữ liệu theo interface KeHoachHocTapDataRequest
      const keHoachDataList: KeHoachHocTapDataRequest[] = selectedHocPhans.map((item) => ({
        id: 0, // ID null cho tạo mới
        khoaHoc: khoaHoc!, // Khóa học từ URL params
        maNganh: parseInt(maNganh!), // Convert string to number
        maHocKy: item.hocKy!.maHocKy,
        maHocPhan: item.hocPhan.maHp,
      }));

      console.log("Sending keHoachDataList:", keHoachDataList);

      await axiosPrivate.post(KHHT_SERVICE.KHHT_MAU_CREATES, keHoachDataList);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error saving:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tạo kế hoạch học tập mẫu!"
      );
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  const availableColumns: ColumnDef<any>[] = [
    {
      id: "stt",
      header: "STT",
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      size: 80,
    },
    {
      id: "maHp",
      accessorKey: "hocPhan.maHp",
      header: "Mã học phần",
      cell: ({ getValue }) => (
        <div className="text-center">{getValue() as string}</div>
      ),
      size: 140,
    },
    {
      id: "tenHp",
      accessorKey: "hocPhan.tenHp",
      header: "Tên học phần",
      cell: ({ getValue }) => (
        <div className="text-left">{getValue() as string}</div>
      ),
      size: 300,
    },
    {
      id: "soTinChi",
      accessorKey: "hocPhan.tinChi",
      header: "Tín chỉ",
      cell: ({ getValue }) => (
        <div className="text-center">{getValue() as number}</div>
      ),
      size: 100,
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const hocPhan = row.original.hocPhan;
        const isAlreadySelected = selectedHocPhans.some((item) => item.hocPhan.maHp === hocPhan.maHp);
        return (
          <div className="flex items-center justify-center">
            <button
              onClick={() => handleAddHocPhan(hocPhan)}
              disabled={isAlreadySelected}
              className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                isAlreadySelected
                  ? "Đã có trong kế hoạch"
                  : "Thêm vào kế hoạch"
              }
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        );
      },
      size: 140,
    },
  ];

  const selectedColumns: ColumnDef<KeHoachHocTapDetail>[] = [
    {
      id: "stt",
      header: "STT",
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      size: 80,
    },
    {
      id: "maHp",
      accessorKey: "hocPhan.maHp",
      header: "Mã học phần",
      cell: ({ getValue }) => (
        <div className="text-center">{getValue() as string}</div>
      ),
      size: 140,
    },
    {
      id: "tenHp",
      accessorKey: "hocPhan.tenHp",
      header: "Tên học phần",
      cell: ({ getValue }) => (
        <div className="text-left">{getValue() as string}</div>
      ),
      size: 300,
    },
    {
      id: "soTinChi",
      accessorKey: "hocPhan.tinChi",
      header: "Tín chỉ",
      cell: ({ getValue }) => (
        <div className="text-center">{getValue() as number}</div>
      ),
      size: 100,
    },
    {
      id: "namHoc",
      header: "Năm học",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <select
            value={item.hocKy?.namHoc?.id || 0}
            onChange={(e) => {
              const newNamHocId = Number(e.target.value);
              const selectedNamHoc = namHocList.find(
                (nh) => nh.id === newNamHocId
              );
              if (selectedNamHoc) {
                // Reset học kỳ khi thay đổi năm học
                setSelectedHocPhans((prev) =>
                  prev.map((hocPhan) =>
                    hocPhan.hocPhan.maHp === item.hocPhan.maHp
                      ? { ...hocPhan, hocKy: null }
                      : hocPhan
                  )
                );
              }
            }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            disabled={namHocList.length === 0}
          >
            <option value={0}>
              {"Chọn năm học"}
            </option>
            {namHocList.length > 0 ? (
              namHocList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.tenNamHoc}
                </option>
              ))
            ) : (
              <option value={0} disabled>
                Không có dữ liệu năm học
              </option>
            )}
          </select>
        );
      },
      size: 150,
    },
    {
      id: "hocKy",
      header: "Học kỳ",
      cell: ({ row }) => {
        const item = row.original;
        const selectedNamHocId = item.hocKy?.namHoc?.id || 0;

        return (
          <select
            value={item.hocKy?.maHocKy || 0}
            onChange={(e) => {
              const newHocKyId = Number(e.target.value);
              const selectedHocKy = danhSachHocKy.find(
                (hk) => hk.maHocKy === newHocKyId
              );
              if (selectedHocKy) {
                setSelectedHocPhans((prev) =>
                  prev.map((hocPhan) =>
                    hocPhan.hocPhan.maHp === item.hocPhan.maHp
                      ? { ...hocPhan, hocKy: selectedHocKy }
                      : hocPhan
                  )
                );
              }
            }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            disabled={selectedNamHocId === 0}
          >
            <option value={0}>
              {"Chọn học kỳ"}
            </option>
            {hocKyList.filter((hk) => hk.namHocId === selectedNamHocId).length >
            0 ? (
              hocKyList
                .filter((hk) => hk.namHocId === selectedNamHocId)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.tenHocky}
                  </option>
                ))
            ) : selectedNamHocId === 0 ? (
              <option value={0} disabled>
                Vui lòng chọn năm học trước
              </option>
            ) : (
              <option value={0} disabled>
                Không có học kỳ cho năm học này
              </option>
            )}
          </select>
        );
      },
      size: 150,
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleRemoveSelected(item.hocPhan.maHp)}
              className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-full transition-all duration-200 hover:scale-105"
              title="Xóa khỏi kế hoạch"
            >
              <Trash2Icon className="w-4 h-4" />
            </button>
          </div>
        );
      },
      size: 140,
    },
  ];


  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/giangvien/study-plans")}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>

          <div className="text-sm text-gray-600">
            <span className="font-medium">Ngành:</span> {maNganh} |{" "}
            <span className="font-medium">Khóa:</span> {khoaHoc}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || selectedHocPhans.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Đang lưu..." : "Tạo kế hoạch"}
        </button>
      </div>

      {/* Bảng 1: Học phần có thể thêm */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Học phần có thể thêm
          </h3>
          <p className="text-gray-600 mt-1">
            {availableHocPhans.length} học phần có thể thêm vào kế hoạch
            {existingKHHTHocPhans.length > 0 && (
              <span className="text-sm text-amber-600 block mt-1">
                (Đã loại bỏ {existingKHHTHocPhans.length} học phần có trong kế hoạch mẫu hiện tại)
              </span>
            )}
          </p>
          <div className="relative w-64 mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm học phần..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <KeHoachHocTapTable
            name="Học phần có thể thêm"
            data={filteredHocPhans.map((hp) => ({
              id: hp.maHp,
              hocPhan: hp,
              hocKy: null as any,
              hocPhanCaiThien: false,
              isAvailable: true,
            }))}
            columns={availableColumns}
          />
        </div>
      </div>

      {/* Bảng 2: Kế hoạch học tập mẫu */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <KeHoachHocTapTable
            name="Kế hoạch học tập mẫu"
            data={selectedHocPhans}
            columns={selectedColumns}
          />
        </div>
      </div>
      
      {/* Loading overlay */}
      {isSaving && (
        <FetchLoading />
      )}

      {/* Success Modal */}
      <SuccessMessageModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/giangvien/study-plans");
        }}
        message="Tạo kế hoạch học tập mẫu thành công!"
      />

      {/* Error Modal */}
      <ErrorMessageModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default ThemHocPhanComponent;
