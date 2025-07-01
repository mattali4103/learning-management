import { useMemo, useState, useEffect } from "react";
import { Save, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { KeHoachHocTapTable } from "../../../components/table/KeHoachHocTapTable";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { HOCPHAN_SERVICE, KHHT_SERVICE } from "../../../api/apiEndPoints";
import SuccessMessageModal from "../../../components/modals/SuccessMessageModal";
import ErrorMessageModal from "../../../components/modals/ErrorMessageModal";
import Loading from "../../../components/Loading";
import type {
  KeHoachHocTapDetail,
  KeHoachHocTapDataRequest,
} from "../../../types/KeHoachHocTapMau";
import type { HocKy } from "../../../types/HocKy";
import FetchLoading from "../../../components/FetchLoading";

const ChinhSuaHocPhanComponent = () => {
  const { maNganh, khoaHoc } = useParams<{
    maNganh: string;
    khoaHoc: string;
  }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [selectedHocPhans, setSelectedHocPhans] = useState<
    KeHoachHocTapDetail[]
  >([]);
  const [allHocKy, setAllHocKy] = useState<HocKy[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Statistics
  const statistics = useMemo(() => {
    const totalCredits = selectedHocPhans.reduce(
      (total, item) => total + item.hocPhan.tinChi,
      0
    );
    const totalSubjects = selectedHocPhans.length;

    // Group by học kỳ
    const semesterGroups = selectedHocPhans.reduce(
      (groups, item) => {
        const key = `${item.hocKy?.namHoc?.namBatDau || ""}-${item.hocKy?.tenHocKy || ""}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(item);
        return groups;
      },
      {} as Record<string, KeHoachHocTapDetail[]>
    );

    const totalSemesters = Object.keys(semesterGroups).length;

    return {
      totalCredits,
      totalSubjects,
      totalSemesters,
      semesterGroups,
    };
  }, [selectedHocPhans]);

  // Create academic year list from API data
  const namHocList = useMemo(() => {
    console.log(
      "DEBUG - Creating namHocList from allHocKy:",
      allHocKy.length,
      "items"
    );
    const years = new Map<number, { id: number; tenNamHoc: string }>();
    allHocKy.forEach((hk, index) => {
      // Kiểm tra nhiều cấu trúc có thể (sử dụng any để tránh lỗi TypeScript)
      const hkAny = hk as any;
      const namHoc = hk.namHoc || hkAny.NamHoc || hkAny.namhoc;
      if (namHoc) {
        const namHocAny = namHoc as any;
        const namHocId =
          namHoc.id || namHocAny.Id || namHocAny.maId || index + 1;
        years.set(namHocId, {
          id: namHocId,
          tenNamHoc: `${namHoc.namBatDau}-${namHoc.namKetThuc}`,
        });
      }
    });

    const result = Array.from(years.values()).sort((a, b) => a.id - b.id);
    console.log("DEBUG - Final namHocList:", result);
    return result;
  }, [allHocKy]);

  // Create semester list from API data
  const hocKyList = useMemo(() => {
    console.log(
      "DEBUG - Creating hocKyList from allHocKy:",
      allHocKy.length,
      "items"
    );
    const result = allHocKy.map((hk, index) => {
      const hkAny = hk as any;
      const maHocKy = hk.maHocKy || hkAny.MaHocKy || hkAny.id || index + 1;
      const tenHocKy =
        hk.tenHocKy || hkAny.TenHocKy || hkAny.ten || `Học kỳ ${index + 1}`;
      const namHocId =
        hk.namHoc?.id ||
        (hkAny.namHoc as any)?.id ||
        (hkAny.NamHoc as any)?.id ||
        0;

      return {
        id: maHocKy,
        tenHocky: tenHocKy,
        namHocId: namHocId,
      };
    });
    console.log("DEBUG - Final hocKyList:", result);
    return result;
  }, [allHocKy]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const hocKyResponse = await axiosPrivate.get(
          HOCPHAN_SERVICE.GET_ALL_HOCKY
        );
        console.log("DEBUG - Raw API response:", hocKyResponse.data);
        const hocKyData: HocKy[] = hocKyResponse.data.data.map((item: any) => ({
          maHocKy: item.maHocKy,
          tenHocKy: item.tenHocKy,
          ngayBatDau: item.ngayBatDau,
          ngayKetThuc: item.ngayKetThuc,
          namHoc: item.namHocDTO,
        }));
        console.log("DEBUG - Processed hocKyData:", hocKyData);
        setAllHocKy(hocKyData);
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
          if (khhtResponse.data) {
            setSelectedHocPhans(khhtResponse.data.data);
          }
        } catch {
          console.log("Chưa có kế hoạch học tập mẫu cho ngành/khóa này");
        }
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

  // Lưu kế hoạch học tập mẫu
  const handleSave = async () => {
    if (selectedHocPhans.length === 0) {
      setErrorMessage("Vui lòng thêm ít nhất một học phần!");
      setShowErrorModal(true);
      return;
    }

    // Kiểm tra xem tất cả học phần đã có học kỳ chưa
    const invalidItems = selectedHocPhans.filter(
      (item) => !item.hocKy || !item.hocKy.maHocKy
    );
    if (invalidItems.length > 0) {
      setErrorMessage("Vui lòng chọn học kỳ cho tất cả học phần!");
      setShowErrorModal(true);
      return;
    }

    try {
      setIsSaving(true);

      // Chuyển đổi dữ liệu theo interface KeHoachHocTapDataRequest
      const keHoachDataList: KeHoachHocTapDataRequest[] = selectedHocPhans.map(
        (item) => ({
          id: parseInt(item.id) || 0, // Sử dụng id hiện có hoặc 0 cho mới
          khoaHoc: khoaHoc!,
          maNganh: parseInt(maNganh!),
          maHocKy: item.hocKy!.maHocKy,
          maHocPhan: item.hocPhan.maHp,
        })
      );

      const response = await axiosPrivate.put(
        KHHT_SERVICE.KHHT_MAU_UPDATE,
        keHoachDataList // Gửi array của KeHoachHocTapDataRequest
      );

      console.log("Save response:", response.data);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error saving:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật kế hoạch học tập mẫu!"
      );
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }
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
            disabled={isLoading || namHocList.length === 0}
          >
            <option value={0}>
              {isLoading ? "Đang tải..." : "Chọn năm học"}
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
              const selectedHocKy = allHocKy.find(
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
            disabled={isLoading || selectedNamHocId === 0}
          >
            <option value={0}>
              {isLoading ? "Đang tải..." : "Chọn học kỳ"}
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Actions */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
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
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Kế hoạch học tập mẫu
            </h3>
            <p className="text-gray-600 mt-1">
              {selectedHocPhans.length} học phần trong kế hoạch hiện tại
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

      {/* Loading overlay */}
      {isSaving && <FetchLoading></FetchLoading>}

      {/* Success Modal */}
      <SuccessMessageModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate(`/giangvien/study-plans/edit/${maNganh}/${khoaHoc}`, {
            replace: true,
          });
        }}
        message="Cập nhật kế hoạch học tập mẫu thành công!"
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

export default ChinhSuaHocPhanComponent;
