import type { SinhVienProfile } from "./SinhVienProfile";

// Interface cho văn bằng và chứng chỉ
export interface Certificate {
    id: number;
    tenChungChi: string;
    ngayCap: string; // ISO date string
    noiCap: string;
    imageUrl: string; // URL của hình ảnh chứng chỉ
    sinhVien: SinhVienProfile;
}

// Interface cho request thêm/sửa chứng chỉ
export interface CertificateRequest {
  tenChungChi: string;
  ngayCap: string;
  maSo: string; // mã số sinh viên
}

// Response từ API khi upload/update chứng chỉ
export interface CertificateUploadResponse {
  code: number;
  message: string;
  data: Certificate;
}

// Response từ API khi lấy danh sách chứng chỉ
export interface CertificatesResponse {
  code: number;
  message: string;
  data: Certificate[];
}

// Interface cho form thêm/sửa chứng chỉ (dùng trong component)
export interface CertificateForm {
  tenChungChi: string;
  ngayCap: string;
}
