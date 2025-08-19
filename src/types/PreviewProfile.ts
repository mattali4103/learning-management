import type { Lop } from "./Lop";

export interface PreviewProfile {
    canhBaoHocVu: CanhBaoHocVu;
    lop: Lop;
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
    maNganh: number;
    ngaySinh: string;
    gioiTinh: boolean;
    hoTenCha?: string;
    hoTenMe?: string;
    soDienThoaiNguoiThan?: string;
    queQuan?: string;
  }
  export interface CanhBaoHocVu{
    maSo: string | null;
    lyDo: string | null;
  }