import type { Nganh } from "./Nganh";
import type { GiangVien } from "./GiangVien";

export interface Lop {
    maLop: string;
    tenLop: string;
    chuNhiem: GiangVien;
    siSo: number;
    siSoCon: number;
    nganh?: Nganh;
    dssinhVien?: any;
}
