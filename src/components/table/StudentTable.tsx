import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, User } from "lucide-react";
import { KeHoachHocTapTable } from "./KeHoachHocTapTable";

interface PreviewProfile {
  avatarUrl: string;
  maSo: string;
  hoTen: string;
  maLop: string;
  tenNganh: string;
  xepLoaiHocLuc: string;
  diemTrungBinhTichLuy: number;
  soTinChiTichLuy: number;
  soTinChiCaiThien: number;
  soTinChiDangKyHienTai: number;
  khoaHoc: string;
  maNganh: string;
  ngaySinh: Date;
  gioiTinh: boolean;
}

interface StudentTableProps {
  data: PreviewProfile[];
  loading?: boolean;
  onViewProfile: (maSo: string) => void;
  // Pagination props
  enablePagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  data,
  loading = false,
  onViewProfile,
  // Pagination props
  enablePagination = false,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalElements = 0,
  onPageChange,
}) => {
  const columns: ColumnDef<PreviewProfile>[] = [
    {
      accessorKey: "maSo",
      header: "Mã số SV",
      cell: ({ row }) => (
        <div className="font-medium text-blue-600">{row.getValue("maSo")}</div>
      ),
      size: 150,
    },
    {
      accessorKey: "hoTen",
      header: "Họ và tên",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.getValue("hoTen")}
        </div>
      ),
      size: 250,
    },
    {
      accessorKey: "gioiTinh",
      header: "Giới tính",
      cell: ({ row }) => (
        <div className="text-center">
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            row.original.gioiTinh 
              ? "bg-blue-100 text-blue-800" 
              : "bg-pink-100 text-pink-800"
          }`}>
            {row.original.gioiTinh ? "Nam" : "Nữ"}
          </span>
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "ngaySinh",
      header: "Ngày sinh",
      cell: ({ row }) => (
        <div className="text-center text-sm">
          {new Date(row.getValue("ngaySinh")).toLocaleDateString("vi-VN")}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "diemTrungBinhTichLuy",
      header: "GPA",
      cell: ({ row }) => {
        const gpa = row.getValue("diemTrungBinhTichLuy") as number;
        const displayGpa = gpa || 0;
        return (
          <div className="text-center">
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                displayGpa >= 3.6
                  ? "bg-green-100 text-green-800"
                  : displayGpa >= 3.2
                    ? "bg-blue-100 text-blue-800"
                    : displayGpa >= 2.5
                      ? "bg-yellow-100 text-yellow-800"
                      : displayGpa >= 2.0
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
              }`}
            >
              {displayGpa.toFixed(2)}
            </span>
          </div>
        );
      },
      size: 100,
    },
    {
      accessorKey: "soTinChiTichLuy",
      header: "Tín chỉ TL",
      cell: ({ row }) => {
        const value = row.getValue("soTinChiTichLuy") as number;
        return (
          <div className="text-center">
            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {value || 0}
            </span>
          </div>
        );
      },
      size: 110,
    },
    {
      accessorKey: "soTinChiCaiThien",
      header: "Tín chỉ CT",
      cell: ({ row }) => {
        const value = row.getValue("soTinChiCaiThien") as number;
        return (
          <div className="text-center">
            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {value || 0}
            </span>
          </div>
        );
      },
      size: 110,
    },
    {
      accessorKey: "xepLoaiHocLuc",
      header: "Xếp loại",
      cell: ({ row }) => {
        const xepLoai = row.getValue("xepLoaiHocLuc") as string;
        return (
          <div className="text-center">
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                xepLoai === "Xuất sắc"
                  ? "bg-purple-100 text-purple-800"
                  : xepLoai === "Giỏi"
                    ? "bg-green-100 text-green-800"
                    : xepLoai === "Khá"
                      ? "bg-blue-100 text-blue-800"
                      : xepLoai === "Trung bình"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
              }`}
            >
              {xepLoai || "Chưa xác định"}
            </span>
          </div>
        );
      },
      size: 130,
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <button
            onClick={() => onViewProfile(row.original.maSo)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            title="Xem hồ sơ sinh viên"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
      size: 100,
    },
  ];

  return (
    <KeHoachHocTapTable
      name="Danh sách sinh viên"
      data={data}
      columns={columns}
      loading={loading}
      initialExpanded={true}
      enableServerPagination={enablePagination}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      totalElements={totalElements}
      onPageChange={onPageChange}
      emptyStateTitle="Chưa có sinh viên"
      emptyStateDescription="Lớp này chưa có sinh viên nào"
      emptyStateIcon={User}
      showEmptyStateWarningBadge={false}
    />
  );
};
