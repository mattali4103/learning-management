export interface Certificate {
  id: string;
  maSV: string;
  tenChungChi: string;
  noiCap: string;
  ngayCap: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  loai: 'CHUNG_CHI' | 'VAN_BANG';
  xepLoai?: string;
  diemSo?: number;
  ghiChu?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateRequest {
  maSV: string;
  tenChungChi: string;
  noiCap: string;
  ngayCap: string;
  loai: 'CHUNG_CHI' | 'VAN_BANG';
  xepLoai?: string;
  diemSo?: number;
  ghiChu?: string;
}

export interface CertificateUploadRequest extends CertificateRequest {
  file: File;
}

export interface CertificateUploadResponse {
  code: number;
  message: string;
  data: Certificate;
}

export interface CertificatesResponse {
  code: number;
  message: string;
  data: Certificate[];
}
