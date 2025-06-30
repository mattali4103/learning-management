import type { HocKy } from "./HocKy";
import type { HocPhan } from "./HocPhan";

export interface KeHoachHocTapDetail {
  id: string;
  hocPhan: HocPhan;
  hocKy: HocKy | null;
  namHoc?: number;
  hocPhanCaiThien: boolean;
}
