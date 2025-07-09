export interface UserProfile {
  maSo: string;
  hoTen: string;
  ngaySinh: Date;
  gioiTinh: boolean;
  maLop: string;
  khoaHoc: string;
  tenNganh: string;
  avatar?: string;
  soDienThoai?: string;
  email?: string;
  diaChi?: string;
  queQuan?: string;
  danToc?: string;
  tonGiao?: string;
  cccd?: string;
  ngayCapCccd?: Date;
  noiCapCccd?: string;
}

export interface ProfileUpdateRequest {
  maSo: string;
  hoTen?: string;
  ngaySinh?: Date;
  gioiTinh?: boolean;
  soDienThoai?: string;
  email?: string;
  diaChi?: string;
  queQuan?: string;
  danToc?: string;
  tonGiao?: string;
  cccd?: string;
  ngayCapCccd?: Date;
  noiCapCccd?: string;
  avatar?: string;
}

export interface AvatarUploadResponse {
  code: number;
  message: string;
  data: {
    url: string;
    filename: string;
  };
}
