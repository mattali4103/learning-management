import type { HocKy } from "./HocKy";
import type { HocPhan } from "./HocPhan";

// Interface for API request data used in both add and edit operations
export interface KeHoachHocTapDataRequest {
  id: number; // ID của bản ghi (0 nếu là tạo mới)
  khoaHoc: string; // Khóa học
  maNganh: number; // Mã ngành
  maHocKy: number; // Mã học kỳ
  maHocPhan: string; // Mã học phần
}

export interface KeHoachHocTapDetail {
  id: string;
  hocPhan: HocPhan;
  hocKy: HocKy | null;
  namHoc?: number;
  hocPhanCaiThien: boolean;
}
