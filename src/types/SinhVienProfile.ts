export interface SinhVienProfile {
  maSo: string;
  hoTen: string;
  ngaySinh: Date | string;
  gioiTinh: boolean;
  maLop: string;
  khoaHoc: string;
  tenNganh: string;
  maNganh?: string;
  soDienThoai?: string;
  email?: string;
  diaChi?: string;
  queQuan?: string;
  danToc?: string;
  tonGiao?: string;
  cccd?: string;
  ngayCapCCCD?: Date | string;
  noiCapCCCD?: string;
  avatarUrl?: string;
  hoTenCha?: string;
  hoTenMe?: string;
  soDienThoaiNguoiThan?: string;
}