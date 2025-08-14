import { type ColumnDef } from "@tanstack/react-table";
import { CirclePlus } from "lucide-react";
import { KeHoachHocTapTable } from "./KeHoachHocTapTable";
import type { HocPhan } from "../../types/HocPhan";
import type { KeHoachHocTap } from "../../types/KeHoachHoctap";

interface HocPhanTuChon {
  id: number;
  tenNhom: string;
  tinChiYeuCau: number;
  hocPhanTuChonList: HocPhan[];
}

interface NhomHocPhanTuChonTableProps {
  nhomHocPhanTuChon: HocPhanTuChon[];
  selectedHocPhan: KeHoachHocTap[];
  onAddHocPhan: (hocPhan: HocPhan, nhomId?: number) => void;
  getTinChiDaChonTrongNhom: (nhom: HocPhanTuChon) => number;
  getChuyenNganhCompletionStatus: (nhomList: HocPhanTuChon[]) => Map<number, boolean>;
  isHocPhanAlreadyAdded: (maHp: string) => boolean;
}

const NhomHocPhanTuChonTable: React.FC<NhomHocPhanTuChonTableProps> = ({
  nhomHocPhanTuChon,
  selectedHocPhan,
  onAddHocPhan,
  getTinChiDaChonTrongNhom,
  getChuyenNganhCompletionStatus,
  isHocPhanAlreadyAdded,
}) => {
  // Columns cho học phần tự chọn
  const createHocPhanTuChonColumns = (nhomId: number): ColumnDef<HocPhan>[] => [
    {
      accessorKey: "maHp",
      header: "Mã học phần",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("maHp")}</div>
      ),
    },
    {
      accessorKey: "tenHp",
      header: "Tên học phần",
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("tenHp")}</div>
      ),
    },
    {
      accessorKey: "tinChi",
      header: "Tín chỉ",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("tinChi")}</div>
      ),
    },
    {
      accessorKey: "hocPhanTienQuyet",
      header: "Tiên quyết",
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("hocPhanTienQuyet") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => {
        const hocPhan = row.original;
        const isAlreadyAdded = isHocPhanAlreadyAdded(hocPhan.maHp);
        const isCurrentlySelected = selectedHocPhan?.some((selected) => selected.maHp === hocPhan.maHp);
        
        if (isCurrentlySelected) {
          return (
            <div className="flex items-center justify-center">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Đã chọn
              </span>
            </div>
          );
        }
        
        if (isAlreadyAdded) {
          return (
            <div className="flex items-center justify-center">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                Đã thêm
              </span>
            </div>
          );
        }
        
        return (
          <div className="flex items-center justify-center">
            <button
              className="text-green-600 hover:text-green-700 p-2 rounded-lg transition-colors duration-200"
              onClick={() => onAddHocPhan(row.original, nhomId)}
              title="Thêm vào kế hoạch"
            >
              <CirclePlus className="h-5 w-5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {nhomHocPhanTuChon.map((nhom, index) => {
        // Tính tổng tín chỉ đã chọn trong nhóm này
        const tinChiDaChon = getTinChiDaChonTrongNhom(nhom);
        
        // Tính trạng thái hoàn thành cho nhóm chuyên ngành có đánh số
        const chuyenNganhCompletionStatus = getChuyenNganhCompletionStatus(nhomHocPhanTuChon);
        const isCompletedByGroup = chuyenNganhCompletionStatus.get(nhom.id) || false;
        
        // Kiểm tra hoàn thành: theo logic cũ HOẶC theo logic nhóm chuyên ngành
        const isCompleted = (tinChiDaChon >= nhom.tinChiYeuCau) || isCompletedByGroup;
        const isExceeded = tinChiDaChon > nhom.tinChiYeuCau;

        return (
          <div key={nhom.id} className="space-y-2">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-800 mb-1">
                    {nhom.tenNhom || `Nhóm học phần tự chọn ${index + 1}`}
                  </h3>
                  <p className="text-purple-600 text-sm">
                    Yêu cầu: <span className="font-medium">{nhom.tinChiYeuCau} tín chỉ</span>
                    {tinChiDaChon > 0 && (
                      <span className="ml-2 text-purple-700">
                        - Đã chọn: <span className="font-medium">{tinChiDaChon} tín chỉ</span>
                      </span>
                    )}
                  </p>
                  {/* Hiển thị trạng thái chi tiết */}
                  {(tinChiDaChon > 0 || isCompletedByGroup) && (
                    <p className="text-sm mt-1">
                      {/* Hiển thị trạng thái hoàn thành do nhóm chuyên ngành */}
                      {isCompletedByGroup && tinChiDaChon < nhom.tinChiYeuCau && (
                        <span className="text-green-600 font-medium">
                          ✅ Hoàn thành do chuyên ngành liên quan đã đạt yêu cầu
                        </span>
                      )}
                      {/* Trạng thái bình thường */}
                      {!isCompletedByGroup && tinChiDaChon < nhom.tinChiYeuCau && (
                        <span className="text-orange-600 font-medium">
                          ⚠️ Cần thêm {nhom.tinChiYeuCau - tinChiDaChon} tín chỉ để đạt yêu cầu
                        </span>
                      )}
                      {tinChiDaChon >= nhom.tinChiYeuCau && (
                        <span className="text-green-600 font-medium">
                          ✅ Đã đạt đủ yêu cầu tín chỉ
                        </span>
                      )}
                      {tinChiDaChon > nhom.tinChiYeuCau && (
                        <span className="text-blue-600 font-medium">
                          ℹ️ Vượt {tinChiDaChon - nhom.tinChiYeuCau} tín chỉ so với yêu cầu
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {nhom.hocPhanTuChonList.length} môn học
                  </div>
                  {isCompleted && !isExceeded && (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {isCompletedByGroup && tinChiDaChon < nhom.tinChiYeuCau ? 
                        "✓ Hoàn thành (nhóm liên quan)" : 
                        "✓ Hoàn thành"
                      }
                    </div>
                  )}
                  {isExceeded && (
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      + Vượt quá yêu cầu
                    </div>
                  )}
                </div>
              </div>
            </div>
            <KeHoachHocTapTable
              name={nhom.tenNhom || `Học phần tự chọn - Nhóm ${index + 1}`}
              data={nhom.hocPhanTuChonList.filter(
                (hocPhan) =>
                  !selectedHocPhan?.some((selected) => selected.maHp === hocPhan.maHp)
              )}
              columns={createHocPhanTuChonColumns(nhom.id)}
              initialExpanded={false}
              loading={false}
              emptyStateTitle="Bạn đã hoàn thành nhóm học phần này"
              
            />
          </div>
        );
      })}
    </>
  );
};

export default NhomHocPhanTuChonTable;
