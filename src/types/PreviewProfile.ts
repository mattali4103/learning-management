export interface PreviewProfile {
    canhBaoHocVu: CanhBaoHocVu;
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
    hoTenCha: string;
    hoTenMe: string;
    soDienThoaiNguoiThan: string;
    queQuan: string;
  }
  export interface CanhBaoHocVu{
    maSo: string;
    lyDo: string;
  }