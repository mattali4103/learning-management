import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Plus, Pencil, Trash2 } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import type { Nganh } from "../../types/Nganh";
import type { Khoa } from "../../types/Khoa";
import Loading from "../../components/Loading";

import { fetchKhoaData } from "../../api/khoaService";
import useAuth from "../../hooks/useAuth";
import { HOCPHAN_SERVICE } from "../../api/apiEndPoints";
import type { HocPhan } from "../../types/HocPhan";
import DeleteModal from "../../components/modals/DeleteModal";

interface ChuongTrinhDaoTao {
  id: number;
  khoaHoc: string;
  tongSoTinChi: number;
  tongSoTinChiTuChon: number;
  nganh: Nganh;
  hocPhanList: HocPhan[];
  hocPhanTuChonList: HocPhan[];
}

const ChuongTrinhDaoTao = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [khoa, setKhoa] = useState<Khoa>();
  const [chuongTrinhDaoTao, setChuongTrinhDaoTao] = useState<
    ChuongTrinhDaoTao[]
  >([]);
  const [danhSachNganh, setDanhSachNganh] = useState<Nganh[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { auth } = useAuth();
  const maKhoa = auth.user?.maKhoa || "";
  const isTruongKhoa = auth.user?.roles?.includes("TRUONGKHOA");

  // Navigate to CTDT detail
  const handleViewDetail = (maNganh: string | number, khoaHoc: string) => {
    navigate(`/giangvien/ctdt/detail/${maNganh}/${khoaHoc}`);
  };

  // Navigate to Add CTDT page
  const handleAddCTDT = () => {
    navigate(`/giangvien/ctdt/them`);
  };

  // Navigate to Edit CTDT page
  const handleEditCTDT = (maNganh: string | number, khoaHoc: string) => {
    navigate(`/giangvien/ctdt/edit/${maNganh}/${khoaHoc}`);
  };

  // Confirm before delete
  const handleDeleteCTDT = (id: number) => {
    setShowDeleteConfirm(true);
    setDeleteTarget({ id });
  };

  // Thực hiện xoá
const confirmDeleteCTDT = async () => {
  if (!deleteTarget) return;
  try {
    setDeleting(true);
    await axiosPrivate.delete(
      HOCPHAN_SERVICE.CTDT_DELETE.replace(":id", deleteTarget.id.toString())
    );
    await fetchChuongTrinhDaoTao();
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  } catch (error) {
    console.error("Error deleting CTDT:", error);
    setError("Lỗi khi xoá chương trình đào tạo.");
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  } finally {
    setDeleting(false);
  }
};

  //Fetch Ngành trong khoa
  const fetchKhoaDataHandler = useCallback(async () => {
    try {
      setLoading(true);
      const khoaData = await fetchKhoaData(axiosPrivate, maKhoa);
      setKhoa(khoaData);
      setDanhSachNganh(khoaData.dsnganh || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, maKhoa]);

  //Fetch Chương trình đào tạo
  const fetchChuongTrinhDaoTao = useCallback(async () => {
    if (!khoa?.dsnganh || khoa.dsnganh.length === 0) return;
    try {
      setLoading(true);
      const requests = khoa.dsnganh.map((nganh: Nganh) =>
        axiosPrivate.get(
          HOCPHAN_SERVICE.CTDT_BY_NGANH.replace(
            ":maNganh",
            nganh.maNganh.toString()
          )
        )
      );
      const responses = await Promise.all(requests);
      const allChuongTrinh: ChuongTrinhDaoTao[] = [];
      responses.forEach((response, index) => {
        if (response.data && response.data.data) {
          const dataList = Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data];
          dataList.forEach((item: any) => {
            const nganhInfo = khoa.dsnganh[index];
            allChuongTrinh.push({
              id: item.id || 0,
              khoaHoc: item.khoaHoc || "",
              tongSoTinChi: item.tongSoTinChi || 0,
              tongSoTinChiTuChon: item.tongSoTinChiTuChon || 0,
              nganh: {
                maNganh: nganhInfo.maNganh,
                tenNganh: nganhInfo.tenNganh,
              },
              hocPhanList: item.hocPhanList || [],
              hocPhanTuChonList: item.hocPhanTuChonList || [],
            });
          });
        }
      });
      setChuongTrinhDaoTao(allChuongTrinh);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, khoa]);

  useEffect(() => {
    fetchKhoaDataHandler();
  }, [fetchKhoaDataHandler]);

  useEffect(() => {
    if (khoa?.dsnganh && khoa.dsnganh.length > 0) {
      fetchChuongTrinhDaoTao();
    }
  }, [fetchChuongTrinhDaoTao, khoa]);

  // Filter chương trình đào tạo - chỉ hiển thị ngành trong khoa
  const filteredChuongTrinhDaoTao = chuongTrinhDaoTao.filter((ctdt) => {
    const isNganhInKhoa = danhSachNganh.some(
      (nganh) => nganh.maNganh.toString() === ctdt.nganh?.maNganh?.toString()
    );

    const matchesSearch =
      searchTerm === "" ||
      ctdt.nganh?.tenNganh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ctdt.nganh?.maNganh
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      ctdt.khoaHoc?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMajor =
      selectedMajor === "all" ||
      ctdt.nganh?.maNganh?.toString() === selectedMajor;

    return isNganhInKhoa && matchesSearch && matchesMajor;
  });

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Chương trình Đào tạo - Khoa {khoa?.tenKhoa}
              </h1>
              <p className="text-gray-600">
                Xem thông tin chương trình đào tạo cho các ngành thuộc khoa
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Tổng chương trình đào tạo
              </p>
              <p className="text-3xl font-bold text-green-600">
                {chuongTrinhDaoTao.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm chương trình đào tạo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tất cả ngành</option>
                {danhSachNganh.map((nganh) => (
                  <option key={nganh.maNganh} value={nganh.maNganh}>
                    {nganh.tenNganh}
                  </option>
                ))}
              </select>
            </div>
            {isTruongKhoa && (
              <div className="flex gap-4">
                <button
                  onClick={handleAddCTDT}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Thêm chương trình đào tạo
                </button>
                <button
                  onClick={() => navigate("/giangvien/ctdt/import")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Nhập từ Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <div>
              {filteredChuongTrinhDaoTao.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    {searchTerm || selectedMajor !== "all"
                      ? "Không tìm thấy chương trình đào tạo phù hợp"
                      : "Chưa có chương trình đào tạo"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || selectedMajor !== "all"
                      ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                      : "Hiện tại chưa có chương trình đào tạo nào được tạo"}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <p className="text-gray-600">
                      Tìm thấy {filteredChuongTrinhDaoTao.length} chương trình
                      đào tạo
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredChuongTrinhDaoTao.map((ctdt, index) => (
                      <div
                        key={`${ctdt.id}-${index}`}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow relative"
                      >
                        {/* Nút chỉnh sửa và xoá */}
                        {isTruongKhoa && (
                          <div className="absolute top-4 right-4 flex gap-2 z-10">
                            <button
                              title="Chỉnh sửa"
                              onClick={() =>
                                handleEditCTDT(ctdt.nganh.maNganh, ctdt.khoaHoc)
                              }
                              className="p-2 rounded-full hover:bg-blue-100 transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              title="Xoá"
                              onClick={() =>
                                handleDeleteCTDT(
                                  ctdt.id
                                )
                              }
                              className="p-2 rounded-full hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-2">
                              {ctdt.nganh?.tenNganh || "Chưa có tên ngành"}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Mã ngành: {ctdt.nganh?.maNganh || "N/A"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Khóa học: {ctdt.khoaHoc || "Chưa xác định"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Số tín chỉ tự chọn:
                            </span>
                            <span className="font-medium text-green-600">
                              {ctdt.tongSoTinChiTuChon || 0} tín chỉ
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              Tổng số tín chỉ
                            </span>
                            <span className="font-semibold text-gray-800">
                              {ctdt.tongSoTinChi || 0} tín chỉ
                            </span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() =>
                              handleViewDetail(ctdt.nganh.maNganh, ctdt.khoaHoc)
                            }
                            className="w-full px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm delete dialog */}
      {showDeleteConfirm && (
        <DeleteModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            if (!deleting) {
              setShowDeleteConfirm(false);
              setDeleteTarget(null);
            }
          }}
          onConfirm={confirmDeleteCTDT}
          title="Xác nhận xoá"
          message="Bạn chắc chắn muốn xoá chương trình đào tạo này? Hành động này không thể hoàn tác."
          isLoading={deleting}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ChuongTrinhDaoTao;
