import { type ColumnDef } from "@tanstack/react-table";
import { CirclePlus } from "lucide-react";
import { KeHoachHocTapTable } from "./KeHoachHocTapTable";
import { SortableHeader } from "./SortableHeader";
import type { HocPhan } from "../../types/HocPhan";
import type { KeHoachHocTap } from "../../types/KeHoachHoctap";

interface HocPhanCaiThien {
  id: number;
  maHp: string;
  tenHp: string;
  diemChu: string;
  diemSo?: number;
  soTinChi: number;
}

interface HocPhanCaiThienTableProps {
  hocPhanCaiThien: HocPhanCaiThien[];
  selectedHocPhan: KeHoachHocTap[];
  onAddHocPhan: (hocPhan: HocPhan) => void;
}

const HocPhanCaiThienTable: React.FC<HocPhanCaiThienTableProps> = ({
  hocPhanCaiThien,
  selectedHocPhan,
  onAddHocPhan,
}) => {
  // Columns cho học phần cải thiện - không có logic "đã thêm"
  const hocPhanCaiThienColumns: ColumnDef<HocPhanCaiThien>[] = [
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
      accessorKey: "soTinChi",
      header: ({ column }) => (
        <SortableHeader column={column} title="Tín chỉ" />
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("soTinChi")}</div>
      ),
    },
    {
      accessorKey: "diemChu",
      header: ({ column }) => (
        <SortableHeader column={column} title="Điểm chữ" />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {row.getValue("diemChu")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "diemSo",
      header: ({ column }) => (
        <SortableHeader column={column} title="Điểm số" />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
            {row.getValue("diemSo") || "-"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => {
        // Tạo học phần object từ dữ liệu cải thiện để có thể thêm vào kế hoạch
        const hocPhanToAdd: HocPhan = {
          maHp: row.original.maHp,
          tenHp: row.original.tenHp,
          tinChi: row.original.soTinChi,
          loaiHp: "Cải thiện",
          hocPhanTienQuyet: "",
        };

        // Học phần cải thiện chỉ kiểm tra "đang được chọn", KHÔNG kiểm tra "đã thêm"
        const isCurrentlySelected = selectedHocPhan?.some(
          (selected) => selected.maHp === hocPhanToAdd.maHp
        );

        if (isCurrentlySelected) {
          return (
            <div className="flex items-center justify-center">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Đã chọn
              </span>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center">
            <button
              className="text-blue-600 hover:text-blue-700 p-2 rounded-lg transition-colors duration-200"
              onClick={() => onAddHocPhan(hocPhanToAdd)}
              title="Thêm vào kế hoạch cải thiện"
            >
              <CirclePlus className="h-5 w-5" />
            </button>
          </div>
        );
      },
    },
  ];

  // Filter dữ liệu - chỉ loại bỏ học phần đang được chọn trong session hiện tại
  const filteredHocPhanCaiThien = hocPhanCaiThien.filter(
    (hocPhan) =>
      !selectedHocPhan?.some((selected) => selected.maHp === hocPhan.maHp)
  );

  return (
    <div className="space-y-2">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-orange-800 mb-1">
              Học phần cải thiện
            </h3>
            <p className="text-orange-600 text-sm">
              Các học phần có điểm chưa đạt cần cải thiện. Có thể thêm lại nhiều lần để cải thiện điểm.
              {filteredHocPhanCaiThien.length > 0 && (
                <span className="ml-2 text-orange-700">
                  - Có{" "}
                  <span className="font-medium">
                    {filteredHocPhanCaiThien.length}
                  </span>{" "}
                  môn có thể cải thiện
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {filteredHocPhanCaiThien.length} môn học
            </div>
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              Cần cải thiện
            </div>
          </div>
        </div>
      </div>
      <KeHoachHocTapTable
        name="Học phần cải thiện"
        data={filteredHocPhanCaiThien}
        columns={hocPhanCaiThienColumns}
        initialExpanded={false}
        loading={false}
        emptyStateTitle="Không có học phần nào cần cải thiện"
      />
    </div>
  );
};

export default HocPhanCaiThienTable;
