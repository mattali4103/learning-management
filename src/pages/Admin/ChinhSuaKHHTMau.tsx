import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Save,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Search,

  Calendar,
  Users,
  Trash2Icon,
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
import SuccessMessageModal from "../../components/modals/SuccessMessageModal";
import ErrorMessageModal from "../../components/modals/ErrorMessageModal";
import Loading from "../../components/Loading";

import type { HocPhan } from "../../types/HocPhan";
import type { HocKy } from "../../types/HocKy";
import type { KeHoachHocTapDetail } from "../../types/KeHoachHocTapMau";
import type { Nganh } from "../../types/Nganh";
import type { Khoa } from "../../types/Khoa";

interface KHHTMauCreatePayload {
  khoaHoc: string;
  maNganh: string;
  maHocKy: number;
  maHocPhan: string;
}

const ChinhSuaKHHTMau = () => {
  const navigate = useNavigate();
  const params = useParams();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  // Luôn ở trạng thái chỉnh sửa, không cần isEditMode
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


  // State cho học phần chuẩn bị thêm
  const [pendingHocPhans, setPendingHocPhans] = useState<KeHoachHocTapDetail[]>(
    []
  );

  // Modal states
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, selectedNganh]);
  // Fetch functions
  const fetchDanhSachNganh = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);

  // Handler functions
  const handleBack = () => {
    navigate(-1);
  };

  // Sửa callback thêm học phần: đưa vào pendingHocPhans thay vì selectedHocPhans
  const handleAddHocPhan = useCallback((hocPhan: HocPhan, hocKy?: HocKy) => {
    const newKeHoach: KeHoachHocTapDetail = {
      id: `${hocPhan.maHp}-${hocKy?.maHocKy || "unassigned"}-${Date.now()}`,
      hocPhan,
      hocKy: null,
      namHoc: undefined,
      hocPhanCaiThien: false,
    };
    setPendingHocPhans((prev) => [...prev, newKeHoach]);
  }, []);

  // Xóa học phần khỏi pending
  const handleRemovePendingHocPhan = useCallback((id: string) => {
    setPendingHocPhans((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Cập nhật năm học/học kỳ cho pending
  const handleUpdatePendingHocPhan = useCallback(
    (detailId: string, updates: Partial<KeHoachHocTapDetail>) => {
      setPendingHocPhans((prev) =>
        prev.map((item) => (item.id === detailId ? { ...item, ...updates } : item))
      );
    },
    []
  );

  // Xác nhận thêm: chuyển pending sang selected
  const handleConfirmAdd = () => {
    setSelectedHocPhans((prev) => [...prev, ...pendingHocPhans]);
    setPendingHocPhans([]);
  };

  // Khi lưu chỉ gọi PUT (chỉnh sửa)
  const handleSave = async () => {
    if (!selectedNganh || !selectedKhoaHoc || selectedHocPhans.length === 0) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin và thêm ít nhất một học phần");
      setErrorModalOpen(true);
      return;
    }
    setErrorMessage("");
    setSaving(true);
    try {
      const payload: KHHTMauCreatePayload[] = selectedHocPhans
        .filter((item) => item.hocKy !== null)
        .map((item) => ({
          khoaHoc: selectedKhoaHoc,
          maNganh: selectedNganh,
          maHocKy: item.hocKy!.maHocKy,
          maHocPhan: item.hocPhan.maHp,
        }));
      const response = await axiosPrivate.put(
        KHHT_SERVICE.KHHT_MAU_UPDATE,
        payload
      );
      if (response.data.code === 200) {
        setSuccessMessage("Cập nhật kế hoạch học tập mẫu thành công!");
        setSuccessModalOpen(true);
        // Điều hướng sau khi đóng modal
      } else {
        setErrorMessage(
          "Có lỗi xảy ra khi lưu kế hoạch học tập mẫu: " +
            (response.data.message || "Lỗi không xác định")
        );
        setErrorModalOpen(true);
      }
    } catch (error: any) {
      console.error("Error saving:", error);
      setErrorMessage(
        "Có lỗi xảy ra khi lưu kế hoạch học tập mẫu: " +
          (error.response?.data?.message ||
            error.message ||
            "Lỗi không xác định")
      );
      setErrorModalOpen(true);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchDanhSachNganh();
    fetchDanhSachHocKy();
  }, [fetchDanhSachNganh, fetchDanhSachHocKy]);

  useEffect(() => {
    if (selectedNganh) {
      fetchKhoaHoc();
      // Reset selectedKhoaHoc when changing selectedNganh
      setSelectedKhoaHoc("");
    } else {
      setKhoaHocOptions([]);
      setSelectedKhoaHoc("");
    }
  }, [selectedNganh, fetchKhoaHoc]);

  useEffect(() => {
    if (selectedNganh && selectedKhoaHoc) {
      fetchChuongTrinhDaoTao();
    }
  }, [selectedNganh, selectedKhoaHoc, fetchChuongTrinhDaoTao]);

  // Khi ở chế độ chỉnh sửa, tự động load các học phần đã có vào form, bao gồm cả năm học và học kỳ đã nhập trước đó
  useEffect(() => {
    const fetchExistingPlan = async () => {
      if (selectedNganh && selectedKhoaHoc) {
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
              namHoc: item.hocKy?.namHoc?.id || undefined,
              hocKy: item.hocKy || null,
            })));
          }
        } catch (err) {
          console.error("Lỗi khi tải kế hoạch học tập mẫu để chỉnh sửa", err);
        }
      }
    };
    fetchExistingPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNganh, selectedKhoaHoc]);

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

  // Table columns for available subjects (bảng học phần có thể thêm)
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
  ];

  // Table columns for selected subjects (bảng học phần đã thêm)
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
  ];

  // Columns cho bảng pending
  const pendingColumns: ColumnDef<KeHoachHocTapDetail>[] = [
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
                handleUpdatePendingHocPhan(detail.id, {
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
                handleUpdatePendingHocPhan(detail.id, {
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
              onClick={() => handleRemovePendingHocPhan(detail.id)}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200 hover:scale-105"
              title="Xóa khỏi danh sách chuẩn bị thêm"
            >
              <Trash2Icon className="w-4 h-4" />
            </button>
          </div>
        );
      },
      size: 140,
    },
  ];

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

  // Handler for removing a selected subject
  const handleRemoveHocPhan = useCallback((detailId: string) => {
    setSelectedHocPhans((prev) => prev.filter((item) => item.id !== detailId));
  }, []);

  return (
    <>
      {loading && <Loading message="Đang tải dữ liệu..." showOverlay={true} />}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
        {/* Success Modal */}
        {successModalOpen && successMessage && (
          <SuccessMessageModal
            isOpen={true}
            message={successMessage}
            onClose={() => {
              setSuccessModalOpen(false);
              navigate("/giangvien/study-plans");
            }}
          />
        )}
        {/* Error Modal */}
        {errorModalOpen && errorMessage && (
          <ErrorMessageModal
            isOpen={true}
            message={errorMessage}
            onClose={() => setErrorModalOpen(false)}
          />
        )}
        {/* Header */}
        <PageHeader
          title={
            "Chỉnh sửa Kế hoạch Học tập Mẫu"
          }
          description={
            "Chỉnh sửa kế hoạch học tập mẫu cho chương trình đào tạo"
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
                disabled
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
                disabled
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
          {/* Bảng 1: Học phần có thể thêm */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <h3 className="text-lg font-semibold text-gray-800">
                Học phần có thể thêm
              </h3>
              <p className="text-gray-600 mt-1">
                {availableHocPhans.length} học phần trong chương trình đào tạo
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
          {/* Bảng 2: Học phần chuẩn bị thêm */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Học phần chuẩn bị thêm
              </h3>
              <p className="text-gray-600 mt-1">
                {pendingHocPhans.length} học phần đang chờ xác nhận
              </p>
              {pendingHocPhans.length > 0 && (
                <button
                  onClick={handleConfirmAdd}
                  className="mt-4 px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-all shadow-lg"
                >
                  Xác nhận thêm vào kế hoạch
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <KeHoachHocTapTable
                name="Học phần chuẩn bị thêm"
                data={pendingHocPhans}
                columns={pendingColumns}
              />
            </div>
          </div>
          {/* Bảng 3: Kế hoạch học tập mẫu */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-semibold text-gray-800">
                Kế hoạch học tập mẫu
              </h3>
              <p className="text-gray-600 mt-1">
                {selectedHocPhans.length} học phần đã được thêm vào kế hoạch
              </p>
              <div className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Tổng tín chỉ: </span>
                <span className="text-blue-600 font-bold">
                  {statistics.totalCredits}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <KeHoachHocTapTable
                name="Kế hoạch học tập mẫu"
                data={selectedHocPhans}
                columns={selectedColumns}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ChinhSuaKHHTMau;
