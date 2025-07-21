import type { HocPhan } from "./HocPhan";

export interface HocPhanTuChon {
  id: number;
  tenNhom: string;
  tinChiYeuCau: number;
  khoaHoc?: string;
  maNganh?: string | number;
  hocPhanTuChonList: HocPhan[];
}