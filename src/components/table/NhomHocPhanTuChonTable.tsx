import { type ColumnDef } from "@tanstack/react-table";
import { CirclePlus } from "lucide-react";
import { KeHoachHocTapTable } from "./KeHoachHocTapTable";
import { SortableHeader } from "./SortableHeader";
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
}

const NhomHocPhanTuChonTable: React.FC<NhomHocPhanTuChonTableProps> = ({
  nhomHocPhanTuChon,
  selectedHocPhan,
  onAddHocPhan,
  getTinChiDaChonTrongNhom,
}) => {
  // Columns cho học phần tự chọn
  const createHocPhanTuChonColumns = (nhomId: number): ColumnDef<HocPhan>[] => [
    {
      accessorKey: "maHp",
      header: ({ column }) => (
        <SortableHeader column={column} title="Mã học phần" />
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("maHp")}</div>
      ),
    },
    {
      accessorKey: "tenHp",
      header: ({ column }) => (
        <SortableHeader column={column} title="Tên học phần" />
      ),
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("tenHp")}</div>
      ),
    },
    {
      accessorKey: "tinChi",
      header: ({ column }) => (
        <SortableHeader column={column} title="Tín chỉ" />
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("tinChi")}</div>
      ),
    },
    {
      accessorKey: "hocPhanTienQuyet",
      header: ({ column }) => (
        <SortableHeader column={column} title="Tiên quyết" />
      ),
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
        const isCompleted = tinChiDaChon >= nhom.tinChiYeuCau;
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
                  {tinChiDaChon > 0 && (
                    <p className="text-sm mt-1">
                      {tinChiDaChon < nhom.tinChiYeuCau && (
                        <span className="text-orange-600 font-medium">
                          ⚠️ Cần thêm {nhom.tinChiYeuCau - tinChiDaChon} tín chỉ để đạt yêu cầu
                        </span>
                      )}
                      {tinChiDaChon === nhom.tinChiYeuCau && (
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
                      ✓ Hoàn thành
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
            />
          </div>
        );
      })}
    </>
  );
};

export default NhomHocPhanTuChonTable;
