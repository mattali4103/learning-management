import type { HocPhan } from "./HocPhan";
import type { Nganh } from "./Nganh";

export interface ChuongTrinhDaoTao {
  id: number;
  khoaHoc: string;
  tongSoTinChi: number;
  tongSoTinChiTuChon: number;
  nganh: Nganh;
  hocPhanList: HocPhan[];
  hocPhanTuChonList: HocPhan[];
}