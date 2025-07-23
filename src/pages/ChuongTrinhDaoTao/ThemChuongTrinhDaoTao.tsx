import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ArrowLeft,
  Plus,
  BarChart3,

  ClipboardCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,

  Cell,
} from "recharts";

// Components
import PageHeader from "../../components/PageHeader";

import DeleteModal from "../../components/modals/DeleteModal";
import ErrorMessageModal from "../../components/modals/ErrorMessageModal";
import SuccessMessageModal from "../../components/modals/SuccessMessageModal";
import AddHocPhanToCTDTModal from "../../components/modals/AddHocPhanToCTDTModal"; // Placeholder

// Hooks
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";

// Types
import type { Nganh } from "../../types/Nganh";
import type { Khoa } from "../../types/Khoa";
import type { HocPhan } from "../../types/HocPhan";
import type { HocPhanTuChon } from "../../types/HocPhanTuChon";

// API endpoints
import { HOCPHAN_SERVICE, PROFILE_SERVICE } from "../../api/apiEndPoints";
import Loading from "../../components/Loading";
import { CollapsibleCourseTable } from "../../components/table/CollapsibleCourseTable";

// Interface for the main data structure
interface ChuongTrinhDaoTao {
  id: number | null;
  khoaHoc: string;
  nganh: Nganh | null;
  hocPhanList: HocPhan[];
  nhomHocPhanTuChon: HocPhanTuChon[];
  tongSoTinChi: number;
  tongSoTinChiTuChon: number;
}

// Interface for credit statistics by course type
interface CreditStatData {
  name: string;
  soTinChi: number;
  color: string;
}

const ThemChuongTrinhDaoTao = () => {
  const navigate = useNavigate();
  const params = useParams();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const isEditMode = Boolean(
    params.maNganh && params.khoaHoc && location.pathname.includes("/edit/")
  );
  const isAddMode = Boolean(
    params.maNganh && params.khoaHoc && location.pathname.includes("/add/")
  );
  const initialMaNganh = params.maNganh || "";
  const initialKhoaHoc = params.khoaHoc || "";

  // States
  const [chuongTrinhDaoTao, setChuongTrinhDaoTao] = useState<ChuongTrinhDaoTao>({
    id: null,
    khoaHoc: initialKhoaHoc,
    nganh: null,
    hocPhanList: [],
    nhomHocPhanTuChon: [],
    tongSoTinChi: 0,
    tongSoTinChiTuChon: 0,
  });

  const [danhSachNganh, setDanhSachNganh] = useState<Nganh[]>([]);
  const [selectedNganh, setSelectedNganh] = useState<string>(initialMaNganh);
  const [selectedKhoaHoc, setSelectedKhoaHoc] = useState<string>(initialKhoaHoc);
  const [setKhoaHocOption, setKhoaHocOptions] = useState<string[]>([]);
  // UI States
  const [showAddHocPhanModal, setShowAddHocPhanModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'hocphan' | 'nhom', id: any} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const tableRef = useRef<HTMLDivElement>(null);

  const maKhoa = auth.user?.maKhoa || "";

  const handleChangeMode = ( async () =>{
    setIsEditMode(!isEditMode);
    await fetchChuongTrinhDaoTaoForEdit();
  })

  // Memoized statistics
  const creditStatistics = useMemo<CreditStatData[]>(() => {
    const stats = {
      "Đại cương": 0,
      "Cơ sở ngành": 0,
      "Chuyên ngành": 0,
      "Tự chọn": 0,
    };
    if (!chuongTrinhDaoTao.hocPhanList) return [];
    chuongTrinhDaoTao.hocPhanList.forEach(hp => {
      if (hp.loaiHp in stats) {
        stats[hp.loaiHp as keyof typeof stats] += hp.tinChi;
      }
    });
    chuongTrinhDaoTao.nhomHocPhanTuChon.forEach(nhom => {
        stats["Tự chọn"] += nhom.tinChiYeuCau;
    })

    return [
      { name: "Đại cương", soTinChi: stats["Đại cương"], color: "#3b82f6" },
      { name: "Cơ sở ngành", soTinChi: stats["Cơ sở ngành"], color: "#8b5cf6" },
      { name: "Chuyên ngành", soTinChi: stats["Chuyên ngành"], color: "#10b981" },
      { name: "Tự chọn", soTinChi: stats["Tự chọn"], color: "#f97316" },
    ];
  }, [chuongTrinhDaoTao]);

  const totalCredits = useMemo(() => {
    const required = chuongTrinhDaoTao.hocPhanList.reduce((sum, hp) => sum + hp.tinChi, 0);
    const elective = chuongTrinhDaoTao.nhomHocPhanTuChon.reduce((sum, nhom) => sum + nhom.tinChiYeuCau, 0);
    return required + elective;
  }, [chuongTrinhDaoTao]);

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

  const fetchKhoaHoc = useCallback(async () => {
    if (!selectedNganh) return;
    try {
      const response = await axiosPrivate.get<any>(
        HOCPHAN_SERVICE.CTDT_BY_NGANH.replace(":maNganh", selectedNganh)
      );
      if (response.data.code === 200 && response.data.data) {
        const khoaHocList = response.data.data.map((item: any) => item.khoaHoc);
        setKhoaHocOptions(khoaHocList);
      }
    } catch (error) {
      console.error("Error fetching khoa hoc:", error);
      setKhoaHocOptions([]);
    }
  }, [axiosPrivate, selectedNganh]);

  const fetchChuongTrinhDaoTaoForEdit = useCallback(async () => {
    if (!selectedNganh || !selectedKhoaHoc) return;
    setLoading(true);
    try {
      console.log(`Fetching CTDT for Ngành ${selectedNganh}`);
      const response = await axiosPrivate.get(HOCPHAN_SERVICE.CTDT_NGANH.replace(":maNganh", selectedNganh).replace(":khoaHoc", selectedKhoaHoc));
      if (response.data.code === 200 && response.data.data) {
        setChuongTrinhDaoTao(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching CTDT:", error);
      setErrorMessage("Không thể tải chương trình đào tạo. Vui lòng thử lại.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [selectedNganh, selectedKhoaHoc, axiosPrivate]);

  // Event Handlers
  const handleBack = () => navigate("/giangvien/ctdt");

  const handleSave = async () => {
    setLoading(true);
    try {
        console.log("Saving Chuong Trinh Dao Tao:", chuongTrinhDaoTao);
        setSuccessMessage("Lưu chương trình đào tạo thành công!");
        setShowSuccessModal(true);
        setTimeout(() => navigate('/giangvien/chuongtrinhdaotao'), 2000);
    } catch (error) {
        console.error("Error saving CTDT:", error);
        setErrorMessage("Lưu thất bại. Vui lòng thử lại.");
        setShowErrorModal(true);
    } finally {
        setLoading(false);
    }
  }

  const handleAddHocPhanSuccess = (newHocPhans: HocPhan[], newNhomHocPhans: HocPhanTuChon[]) => {
    setChuongTrinhDaoTao(prev => {
        const updatedHocPhanList = [...prev.hocPhanList];
        newHocPhans.forEach(hp => {
            if (!updatedHocPhanList.some(existing => existing.maHp === hp.maHp)) {
                updatedHocPhanList.push(hp);
            }
        });

        const updatedNhomHocPhanList = [...prev.nhomHocPhanTuChon];
        return {
            ...prev,
            hocPhanList: updatedHocPhanList,
            nhomHocPhanTuChon: updatedNhomHocPhanList,
        }
    });
  }

  const handleDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'hocphan') {
        setChuongTrinhDaoTao(prev => ({
            ...prev,
            hocPhanList: prev.hocPhanList.filter(hp => hp.maHp !== itemToDelete.id)
        }));
    } else if (itemToDelete.type === 'nhom') {
        setChuongTrinhDaoTao(prev => ({
            ...prev,
            nhomHocPhanTuChon: prev.nhomHocPhanTuChon.filter(nhom => nhom.id !== itemToDelete.id)
        }));
    }
    
    setSuccessMessage("Xóa thành công!");
    setShowSuccessModal(true);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  }

  // Effects
  useEffect(() => {
    fetchDanhSachNganh();
    fetchKhoaHoc();
  }, [fetchDanhSachNganh, fetchKhoaHoc]);


  // Loading screen for edit mode
  if (isEditMode && loading) {
    return <Loading />;
  }
  
  // Initial selection screen for add mode
  if (!isEditMode && danhSachNganh.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
        <PageHeader
          title="Tạo Chương trình Đào tạo"
          description="Chọn ngành và khóa học để bắt đầu"
          icon={BookOpen}
          iconColor="from-green-500 to-emerald-600"
          backButton={<button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>}
        />
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select value={selectedNganh} onChange={e => setSelectedNganh(e.target.value)} className="w-full p-3 border rounded-lg">
              <option value="">Chọn ngành</option>
              {danhSachNganh.map(n => <option key={n.maNganh} value={n.maNganh}>{n.tenNganh}</option>)}
            </select>
            <input type="text" value={selectedKhoaHoc} onChange={e => setSelectedKhoaHoc(e.target.value)} placeholder="Nhập khóa học (ví dụ: K47)" className="w-full p-3 border rounded-lg" />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                if (selectedNganh && selectedKhoaHoc) {
                  handleChangeMode();
                } else {
                  setErrorMessage("Vui lòng chọn ngành và nhập khóa học.");
                  setShowErrorModal(true);
                }
              }}
              disabled={!selectedNganh || !selectedKhoaHoc}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Tạo chương trình
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      <PageHeader
        title={isEditMode ? "Chỉnh sửa Chương trình Đào tạo" : "Tạo mới Chương trình Đào tạo"}
        description={`Ngành: ${chuongTrinhDaoTao.nganh?.tenNganh || 'N/A'} - Khóa: ${chuongTrinhDaoTao.khoaHoc}`}
        icon={BookOpen}
        iconColor="from-green-500 to-emerald-600"
        backButton={<button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>}
        actions={
            <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                {loading ? 'Đang lưu...' : 'Lưu chương trình'}
            </button>
        }
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-blue-600" />Thống kê tín chỉ</h3>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={creditStatistics} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="soTinChi" radius={[0, 4, 4, 0]}>
                            {creditStatistics.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-center">
            <div className="text-center">
                <p className="text-sm text-gray-600">Tổng số tín chỉ</p>
                <p className="text-4xl font-bold text-gray-800 my-2">{totalCredits}</p>
                <div className="flex justify-center space-x-4">
                    <div>
                        <p className="text-xs text-gray-500">Bắt buộc</p>
                        <p className="font-semibold text-blue-600">{creditStatistics.filter(c => c.name !== 'Tự chọn').reduce((s,c) => s + c.soTinChi, 0)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Tự chọn</p>
                        <p className="font-semibold text-orange-600">{creditStatistics.find(c => c.name === 'Tự chọn')?.soTinChi || 0}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Course List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6" ref={tableRef}>
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Danh sách học phần</h4>
                <button onClick={() => setShowAddHocPhanModal(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm học phần / Nhóm tự chọn
                </button>
            </div>
            <CollapsibleCourseTable
                activeTab="all"
                name="Chương trình đào tạo"
                requiredCourses={chuongTrinhDaoTao.hocPhanList}
                electiveGroups={chuongTrinhDaoTao.nhomHocPhanTuChon}
                loading={loading}
                emptyStateTitle="Chưa có học phần nào"
                emptyStateDescription="Nhấn nút 'Thêm học phần' để bắt đầu xây dựng chương trình."
            />
        </div>
      </div>

      {/* Modals */}
      {showAddHocPhanModal && (
        <AddHocPhanToCTDTModal // Placeholder Component
          isOpen={showAddHocPhanModal}
          onClose={() => setShowAddHocPhanModal(false)}
          onSave={handleAddHocPhanSuccess}
          currentCTDT={chuongTrinhDaoTao}
        />
      )}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa mục này khỏi chương trình đào tạo không? Hành động này không thể hoàn tác."
        isLoading={isDeleting}
      />
      <ErrorMessageModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} message={errorMessage} />
      <SuccessMessageModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={successMessage} />
    </div>
  );
};

export default ThemChuongTrinhDaoTao;

