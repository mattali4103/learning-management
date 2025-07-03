import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Save,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Search,
  X,
  AlertCircle,
  Calendar,
  Users,
  Trash2Icon,
  Upload,
  UploadCloud,
  FileText,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { KeHoachHocTapTable } from "../../components/table/KeHoachHocTapTable";
import PageHeader from "../../components/PageHeader";
import StatisticsCard from "../../components/StatisticsCard";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  HOCPHAN_SERVICE,
  KHHT_SERVICE,
  PROFILE_SERVICE,
} from "../../api/apiEndPoints";
import useAuth from "../../hooks/useAuth";

import type { HocPhan } from "../../types/HocPhan";
import type { HocKy } from "../../types/HocKy";
import SuccessMessageModal from "../../components/modals/SuccessMessageModal";
import type { Nganh } from "../../types/Nganh";
import type { KeHoachHocTapDetail } from "../../types/KeHoachHocTapMau";
import type { Khoa } from "../../types/Khoa";


interface KHHTMauCreatePayload {
  khoaHoc: string;
  maNganh: string;
  maHocKy: number;
  maHocPhan: string;
}



const ThemKHHTMau = () => {
  const navigate = useNavigate();
  const params = useParams();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  // Check if this is edit mode
  const isEditMode = Boolean(params.maNganh && params.khoaHoc);
  const initialMaNganh = params.maNganh || "";
  const initialKhoaHoc = params.khoaHoc || "";

  // States
  const [loading, setLoading] = useState(false);
  const [danhSachNganh, setDanhSachNganh] = useState<Nganh[]>([]);
  const [selectedNganh, setSelectedNganh] = useState<string>(initialMaNganh);
  const [selectedKhoaHoc, setSelectedKhoaHoc] =
    useState<string>(initialKhoaHoc);
  const [selectedHocPhans, setSelectedHocPhans] = useState<
    KeHoachHocTapDetail[]
  >([]);
  const [availableHocPhans, setAvailableHocPhans] = useState<HocPhan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [danhSachHocKy, setDanhSachHocKy] = useState<HocKy[]>([]);
  const [saving, setSaving] = useState(false);
  const [khoaHocOptions, setKhoaHocOptions] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  // Modal state for import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importNganh, setImportNganh] = useState("");
  const [importKhoaHoc, setImportKhoaHoc] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState("");

  // Academic years data - created from danhSachHocKy (similar to NhapKeHoachHocTap.tsx)
  const availableNamHoc = useMemo(() => {
    const years = new Map<number, { id: number; tenNh: string }>();
    danhSachHocKy.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        years.set(hk.namHoc.id, {
          id: hk.namHoc.id,
          tenNh: `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`,
        });
      }
    });
    return Array.from(years.values()).sort((a, b) => a.id - b.id);
  }, [danhSachHocKy]);

  const maKhoa = auth.user?.maKhoa || "";
  const fetchKhoaHoc = useCallback(async () => {
    if (!selectedNganh) return;

    try {
      const response = await axiosPrivate.get<any>(
        HOCPHAN_SERVICE.CTDT_BY_NGANH.replace(":maNganh", selectedNganh)
      );
      if (response.data.code === 200 && response.data.data) {
        const khoaHocList = response.data.data.map((item: any) => item.khoaHoc);
        setKhoaHocOptions(khoaHocList);
        console.log("Filtered Khoa Hoc:", khoaHocList);
      }
    } catch (error) {
      console.error("Error fetching khoa hoc:", error);
      setKhoaHocOptions([]);
    }
  }, [axiosPrivate, selectedNganh]);
  // Fetch functions
  const fetchDanhSachNganh = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(
        PROFILE_SERVICE.GET_KHOA.replace(":maKhoa", maKhoa)
      );
      if (response.data.code === 200 && response.data.data) {
        const khoaData = response.data.data as Khoa;
        setDanhSachNganh(khoaData.dsnganh || []);
      }
    } catch (error) {
      console.error("Error fetching danh sach nganh:", error);
    }
  }, [axiosPrivate, maKhoa]);

  const fetchChuongTrinhDaoTao = useCallback(async () => {
    if (!selectedNganh || !selectedKhoaHoc) return;

    setLoading(true);
    try {
      const response = await axiosPrivate.get(
        HOCPHAN_SERVICE.CTDT_NGANH.replace(":khoaHoc", selectedKhoaHoc).replace(
          ":maNganh",
          selectedNganh
        )
      );
      console.log("Chương trình đào tạo response:", response.data);

      if (response.data.code === 200 && response.data.data) {
        const chuongTrinhData = response.data.data;
        // Assuming the API returns the curriculum data structure
        // If it's an array, take the first element, otherwise use directly
        const chuongTrinh = Array.isArray(chuongTrinhData)
          ? chuongTrinhData[0]
          : chuongTrinhData;

        if (chuongTrinh && chuongTrinh.hocPhanList) {
          setAvailableHocPhans(chuongTrinh.hocPhanList);
        } else {
          setAvailableHocPhans([]);
        }
      } else {
        setAvailableHocPhans([]);
      }
    } catch (error) {
      console.error("Error fetching chuong trinh dao tao:", error);
      setAvailableHocPhans([]);
    } finally {
      setLoading(false);
    }
  }, [selectedNganh, selectedKhoaHoc, axiosPrivate]);

  const fetchDanhSachHocKy = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(HOCPHAN_SERVICE.GET_ALL_HOCKY);
      if (response.data.code === 200 && response.data.data) {
        const result: HocKy[] = response.data.data.map((item: any) => ({
          maHocKy: item.maHocKy,
          tenHocKy: item.tenHocKy,
          ngayBatDau: item.ngayBatDau,
          ngayKetThuc: item.ngayKetThuc,
          namHoc: item.namHocDTO,
        }));
        result.sort((a, b) => a.maHocKy - b.maHocKy);
        setDanhSachHocKy(result);
      }
    } catch (error) {
      console.error("Error fetching danh sach hoc ky:", error);
    }
  }, [axiosPrivate]);

  // Handler functions
  const handleBack = () => {
    navigate("/giangvien/study-plans");
  };

  const handleAddHocPhan = useCallback((hocPhan: HocPhan, hocKy?: HocKy) => {
    const newKeHoach: KeHoachHocTapDetail = {
      id: `${hocPhan.maHp}-${hocKy?.maHocKy || "unassigned"}-${Date.now()}`,
      hocPhan,
      hocKy: hocKy || null,
      namHoc: undefined,
      hocPhanCaiThien: false,
    };

    setSelectedHocPhans((prev) => [...prev, newKeHoach]);
  }, []);

  const handleRemoveHocPhan = useCallback((id: string) => {
    setSelectedHocPhans((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleSave = async () => {
    if (!selectedNganh || !selectedKhoaHoc || selectedHocPhans.length === 0) {
      setError("Vui lòng điền đầy đủ thông tin và thêm ít nhất một học phần");
      return;
    }

    setError("");
    setSaving(true);
    try {
      // Transform selectedHocPhans to KHHTMauCreatePayload[]
      const payload: KHHTMauCreatePayload[] = selectedHocPhans
        .filter((item) => item.hocKy !== null) // Filter out items without semester
        .map((item) => ({
          khoaHoc: selectedKhoaHoc,
          maNganh: selectedNganh,
          maHocKy: item.hocKy!.maHocKy,
          maHocPhan: item.hocPhan.maHp,
        }));

      console.log("Saving payload:", payload);

      let response;
      if (isEditMode) {
        response = await axiosPrivate.put(
          KHHT_SERVICE.KHHT_MAU_UPDATE,
          payload
        );
      } else {
        response = await axiosPrivate.post(
          KHHT_SERVICE.KHHT_MAU_CREATES,
          payload
        );
      }

      if (response.data.code === 200) {
        alert(
          isEditMode
            ? "Cập nhật kế hoạch học tập mẫu thành công!"
            : "Lưu kế hoạch học tập mẫu thành công!"
        );
        navigate("/giangvien/study-plans");
      } else {
        setError(
          "Có lỗi xảy ra khi lưu kế hoạch học tập mẫu: " +
            (response.data.message || "Lỗi không xác định")
        );
      }
    } catch (error: any) {
      console.error("Error saving:", error);
      setError(
        "Có lỗi xảy ra khi lưu kế hoạch học tập mẫu: " +
          (error.response?.data?.message ||
            error.message ||
            "Lỗi không xác định")
      );
    } finally {
      setSaving(false);
    }
  };
  // Excel import handler
  const handleOpenImportModal = () => {
    setShowImportModal(true);
    setImportNganh("");
    setImportKhoaHoc("");
    // Fetch khoa hoc khi mo modal
    fetchImportKhoaHoc(""); // Truyền một giá trị rỗng ban đầu
    setImportFile(null);
    setImportError("");
  };
  const fetchImportKhoaHoc = useCallback(
    async (maNganh: string) => {
      if (!maNganh) {
        // Reset khoa hoc options neu maNganh khong co
        setKhoaHocOptions([]);
        return;
      }

      try {
        const response = await axiosPrivate.get<any>(
          HOCPHAN_SERVICE.CTDT_BY_NGANH.replace(":maNganh", maNganh)
        );
        if (response.data.code === 200 && response.data.data) {
          const khoaHocList = response.data.data.map(
            (item: any) => item.khoaHoc
          );
          setKhoaHocOptions(khoaHocList);
          console.log("Filtered Khoa Hoc for Import:", khoaHocList);
        }
      } catch (error) {
        console.error("Error fetching khoa hoc for import:", error);
        setKhoaHocOptions([]);
      }
    },
    [axiosPrivate]
  );
  useEffect(() => {
    if (showImportModal) {
      // Chỉ fetch khi modal đang mở
      fetchImportKhoaHoc(importNganh);
    }
  }, [importNganh, fetchImportKhoaHoc, showImportModal]);


  const handleCloseImportModal = () => {
    setShowImportModal(false);
  };

  const handleImport = async () => {
    if (!importFile || !importNganh || !importKhoaHoc) {
      setImportError("Vui lòng chọn đầy đủ thông tin và file Excel");
      return;
    }
    setImportError("");
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("maNganh", importNganh);
      formData.append("khoaHoc", importKhoaHoc);

      const response = await axiosPrivate.post(
        KHHT_SERVICE.KHHT_MAU_IMPORT,
        formData,
        {
          // withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.code === 200) {
        setShowSuccessModal(true);
        handleCloseImportModal();
        // Reset import form
        setImportNganh("");
        setImportKhoaHoc("");
        setImportFile(null);
        setImportError("");
        navigate(0);
      } else {
        setImportError(
          "Import không thành công: " +
            (response.data.message || "Lỗi không xác định")
        );
      }
    } catch (error: any) {
      console.error("Error importing:", error);
      setImportError(
        "Import không thành công: " +
          (error.response?.data?.message ||
            error.message ||
            "Lỗi không xác định")
      );
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  useEffect(() => {
    fetchDanhSachNganh();
    fetchDanhSachHocKy();
  }, [fetchDanhSachNganh, fetchDanhSachHocKy]);

  useEffect(() => {
    if (selectedNganh) {
      fetchKhoaHoc();
      // Reset selectedKhoaHoc when changing selectedNganh
      if (!isEditMode) {
        setSelectedKhoaHoc("");
      }
    } else {
      setKhoaHocOptions([]);
      setSelectedKhoaHoc("");
    }
  }, [selectedNganh, fetchKhoaHoc, isEditMode]);

  useEffect(() => {
    if (selectedNganh && selectedKhoaHoc) {
      fetchChuongTrinhDaoTao();
    }
  }, [selectedNganh, selectedKhoaHoc, fetchChuongTrinhDaoTao]);

  useEffect(() => {
    const fetchExistingPlan = async () => {
      if (isEditMode && selectedNganh && selectedKhoaHoc) {
        try {
          const response = await axiosPrivate.get(
            KHHT_SERVICE.KHHT_MAU_BY_KHOAHOC_MA_NGANH,
            {
              params: {
                khoaHoc: selectedKhoaHoc,
                maNganh: selectedNganh,
              },
            }
          );
          if (response.data && Array.isArray(response.data.data)) {
            // Đảm bảo mỗi học phần có trường namHoc và hocKy đúng
            setSelectedHocPhans(response.data.data.map((item : any) => ({
              ...item,
              namHoc: item.hocKy?.namHoc?.id,
              hocKy: item.hocKy,
            })));
          }
        } catch (err) {
          console.error("Lỗi khi tải kế hoạch học tập mẫu để chỉnh sửa", err);
        }
      }
    };
    fetchExistingPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, selectedNganh, selectedKhoaHoc]);

  // Filtered học phần: chỉ hiển thị các học phần chưa được thêm vào kế hoạch học tập mẫu
  const filteredHocPhans = useMemo(() => {
    let filtered = availableHocPhans.filter(
      (hp) => !selectedHocPhans.some((item) => item.hocPhan.maHp === hp.maHp)
    );
    if (searchTerm) {
      filtered = filtered.filter(
        (hp) =>
          hp.tenHp.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hp.maHp.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [availableHocPhans, searchTerm, selectedHocPhans]);

  // Statistics
  const statistics = useMemo(() => {
    const totalCredits = selectedHocPhans.reduce(
      (sum, item) => sum + item.hocPhan.tinChi,
      0
    );
    const semesterGroups = selectedHocPhans.reduce(
      (acc, item) => {
        if (item.hocKy) {
          const key = item.hocKy.tenHocKy;
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
        }
        return acc;
      },
      {} as Record<string, KeHoachHocTapDetail[]>
    );

    return {
      totalCredits,
      totalSubjects: selectedHocPhans.length,
      totalSemesters: Object.keys(semesterGroups).length,
      semesterGroups,
    };
  }, [selectedHocPhans]);

  // Table columns for available subjects
  const availableColumns = useMemo<ColumnDef<any>[]>(
    () => [
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
          const isAlreadySelected = selectedHocPhans.some(
            (item) => item.hocPhan.maHp === hocPhan.maHp
          );
          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleAddHocPhan(hocPhan)}
                disabled={isAlreadySelected}
                className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  isAlreadySelected
                    ? "Đã thêm vào kế hoạch"
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
    ],
    [selectedHocPhans, handleAddHocPhan]
  );

  // Handler for updating selected subject properties
  const handleUpdateSelectedHocPhan = useCallback(
    (detailId: string, updates: Partial<KeHoachHocTapDetail>) => {
      setSelectedHocPhans((prev) =>
        prev.map((item) =>
          item.id === detailId ? { ...item, ...updates } : item
        )
      );
    },
    []
  );

  // Table columns for selected subjects
  const selectedColumns = useMemo<ColumnDef<KeHoachHocTapDetail>[]>(
    () => [
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
        size: 250,
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
          const detail = row.original;
          return (
            <div className="text-center">
              <select
                value={detail.namHoc || ""}
                onChange={(e) => {
                  const newNamHocId = parseInt(e.target.value) || undefined;
                  // Reset semester when academic year changes
                  handleUpdateSelectedHocPhan(detail.id, {
                    namHoc: newNamHocId,
                    hocKy: null,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn năm học</option>
                {availableNamHoc.map((nh) => (
                  <option key={nh.id} value={nh.id}>
                    {nh.tenNh}
                  </option>
                ))}
              </select>
            </div>
          );
        },
        size: 140,
      },
      {
        id: "hocKy",
        header: "Học kỳ",
        cell: ({ row }) => {
          const detail = row.original;
          // Filter semesters based on selected academic year
          const filteredHocKy = danhSachHocKy.filter(
            (hk) => hk.namHoc?.id === detail.namHoc
          );

          return (
            <div className="text-center">
              <select
                value={detail.hocKy?.maHocKy || ""}
                onChange={(e) => {
                  const selectedHk = danhSachHocKy.find(
                    (hk) => hk.maHocKy === parseInt(e.target.value)
                  );
                  handleUpdateSelectedHocPhan(detail.id, {
                    hocKy: selectedHk || null,
                  });
                }}
                disabled={!detail.namHoc}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                title={
                  !detail.namHoc
                    ? "Vui lòng chọn năm học trước"
                    : filteredHocKy.length === 0
                      ? "Không có học kỳ nào cho năm học này"
                      : "Chọn học kỳ"
                }
              >
                <option value="">
                  {!detail.namHoc ? "Chọn năm học trước" : "Chọn học kỳ"}
                </option>
                {filteredHocKy.length === 0 && detail.namHoc ? (
                  <option disabled>Không có học kỳ nào</option>
                ) : (
                  filteredHocKy.map((hk) => (
                    <option key={hk.maHocKy} value={hk.maHocKy}>
                      {hk.tenHocKy}
                    </option>
                  ))
                )}
              </select>
            </div>
          );
        },
        size: 120,
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const detail = row.original;
          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleRemoveHocPhan(detail.id)}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200 hover:scale-105"
                title="Xóa khỏi kế hoạch"
              >
                <Trash2Icon className="w-4 h-4" />
              </button>
            </div>
          );
        },
        size: 140,
      },
    ],
    [
      handleRemoveHocPhan,
      handleUpdateSelectedHocPhan,
      availableNamHoc,
      danhSachHocKy,
    ]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <PageHeader
        title={
          isEditMode
            ? "Chỉnh sửa Kế hoạch Học tập Mẫu"
            : "Tạo Kế hoạch Học tập Mẫu"
        }
        description={
          isEditMode
            ? "Chỉnh sửa kế hoạch học tập mẫu cho chương trình đào tạo"
            : "Tạo kế hoạch học tập mẫu cho sinh viên theo chương trình đào tạo"
        }
        icon={BookOpen}
        iconColor="from-emerald-500 to-teal-600"
        descriptionIcon={GraduationCap}
        backButton={
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        }
        actions={
          <div className="flex items-center space-x-3">
            {/* Import from Excel button */}
            {!isEditMode && (
              <button
                onClick={handleOpenImportModal}
                className="flex items-center px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import từ Excel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || selectedHocPhans.length === 0}
              className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu kế hoạch
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Có lỗi xảy ra
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError("")}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  <span className="sr-only">Đóng</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Thông tin cơ bản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chọn ngành */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn ngành <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedNganh}
              onChange={(e) => setSelectedNganh(e.target.value)}
              disabled={isEditMode}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Chọn ngành --</option>
              {danhSachNganh.map((nganh) => (
                <option key={nganh.maNganh} value={nganh.maNganh}>
                  {nganh.tenNganh} ({nganh.maNganh})
                </option>
              ))}
            </select>
          </div>

          {/* Chọn khóa học */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn khóa học <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedKhoaHoc}
              onChange={(e) => setSelectedKhoaHoc(e.target.value)}
              disabled={isEditMode}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Chọn khóa học --</option>
              {khoaHocOptions.map((khoaHoc) => (
                <option key={khoaHoc} value={khoaHoc}>
                  Khóa {khoaHoc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {selectedHocPhans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatisticsCard
            title="Tổng số tín chỉ"
            value={statistics.totalCredits}
            subtitle="tín chỉ"
            icon={BookOpen}
            colorScheme="blue"
            size="md"
            style="modern"
          />
          <StatisticsCard
            title="Tổng số học phần"
            value={statistics.totalSubjects}
            subtitle="học phần"
            icon={GraduationCap}
            colorScheme="green"
            size="md"
            style="modern"
          />
          <StatisticsCard
            title="Số học kỳ"
            value={statistics.totalSemesters}
            subtitle="học kỳ"
            icon={Calendar}
            colorScheme="purple"
            size="md"
            style="modern"
          />
        </div>
      )}

      {/* Main Content - Single Column Grid */}
      <div className="space-y-6">
        {/* Available Subjects Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Học phần có thể thêm
                </h3>
                <p className="text-gray-600 mt-1">
                  {availableHocPhans.length} học phần trong chương trình đào tạo
                </p>
              </div>
              {/* Search */}
              <div className="relative w-64">
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
          </div>

          {/* Available Subjects Table */}
          <div className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-40 bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
              </div>
            ) : filteredHocPhans.length === 0 ? (
              <div className="p-16 text-center bg-gradient-to-br from-gray-50 to-emerald-50">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {searchTerm ? "Không tìm thấy học phần" : "Chưa có học phần"}
                </h3>
                <p className="text-gray-500">
                  {!selectedNganh || !selectedKhoaHoc
                    ? "Vui lòng chọn ngành và khóa học"
                    : searchTerm
                      ? "Thử tìm kiếm với từ khóa khác"
                      : "Chưa có học phần nào trong chương trình đào tạo"}
                </p>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* Selected Subjects Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Kế hoạch học tập mẫu
                </h3>
                <p className="text-gray-600 mt-1">
                  {selectedHocPhans.length} học phần đã được thêm vào kế hoạch
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Tổng tín chỉ: </span>
                <span className="text-blue-600 font-bold">
                  {statistics.totalCredits}
                </span>
              </div>
            </div>
          </div>

          {selectedHocPhans.length > 0 ? (
            <div className="overflow-hidden">
              <KeHoachHocTapTable
                name="Kế hoạch học tập mẫu"
                data={selectedHocPhans}
                columns={selectedColumns}
              />
            </div>
          ) : (
            <div className="p-16 text-center bg-gradient-to-br from-gray-50 to-blue-50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Chưa có học phần nào
              </h3>
              <p className="text-gray-500">
                Thêm học phần từ bảng phía trên để tạo kế hoạch học tập mẫu
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative transform transition-all duration-300 scale-95 animate-scale-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleCloseImportModal}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-100 rounded-full mb-4">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Import Kế hoạch học tập
              </h2>
              <p className="text-gray-500 mb-6">
                Tải lên file Excel để import dữ liệu một cách nhanh chóng.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chọn ngành
                  </label>
                  <select
                    value={importNganh}
                    onChange={(e) => setImportNganh(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">-- Chọn ngành --</option>
                    {danhSachNganh.map((nganh) => (
                      <option key={nganh.maNganh} value={nganh.maNganh}>
                        {nganh.tenNganh} ({nganh.maNganh})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chọn khóa học
                  </label>
                  <select
                    value={importKhoaHoc}
                    onChange={(e) => setImportKhoaHoc(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">-- Chọn khóa học --</option>
                    {khoaHocOptions.map((khoaHoc) => (
                      <option key={khoaHoc} value={khoaHoc}>
                        Khóa {khoaHoc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Excel
                </label>
                <div
                  className="mt-2"
                >
                  {importFile ? (
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="mt-2 font-semibold text-gray-700">
                        {importFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(importFile.size / 1024).toFixed(2)} KB
                      </p>
                      <button
                        onClick={() => setImportFile(null)}
                        className="mt-2 text-sm text-red-600 hover:underline"
                      >
                        Xóa file
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <input
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) =>
                          setImportFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <UploadCloud className="w-12 h-12 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-semibold text-blue-600">
                            Nhấn để tải lên
                          </span>{" "}
                          hoặc kéo thả
                        </p> 
                        <p className="text-xs text-gray-500 mt-1">
                          Hỗ trợ file .xlsx, .xls
                        </p>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {importError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{importError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCloseImportModal}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleImport}
                disabled={!importFile || !importNganh || !importKhoaHoc}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessMessageModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        message="Import kế hoạch học tập thành công!"
      />
    </div>
  );
};
export default ThemKHHTMau;
