/* eslint-disable @typescript-eslint/no-explicit-any */
import {useEffect, useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
  BarChart,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSidebar } from "../../hooks/UseSidebar";

interface KhhtStatistics {
  name: string;
  soTinChi: number;
  soTinChiCaiThien: number;
  namBatDau: number;
  maHocKy: number;
}
export default function CustomBarChart({ data }: any) {
  const DEFAULT_HEIGHT : number = 350;  
  const {isOpen} = useSidebar();
  const [height, setHeight] = useState<number>(DEFAULT_HEIGHT);
  useEffect(() => {
    setHeight(isOpen ? DEFAULT_HEIGHT  : 400);
  }
  , [isOpen]);
  const statistics = useMemo<KhhtStatistics[]>(() => {
    const statsMap = new Map<
      string,
      {
        soTinChi: number;
        soTinChiCaiThien: number;
        namBatDau: number;
        maHocKy: number;
      }
    >();
    data.forEach((item: any) => {
      const key = `${item.hocKy.tenHocKy} ${item.namHoc.namBatDau}-${item.namHoc.namKetThuc}`;
      const current = statsMap.get(key) || {
        soTinChi: 0,
        soTinChiCaiThien: 0,
        namBatDau: item.namHoc.namBatDau,
        maHocKy: item.hocKy.maHocKy,
      };

      // Add total credits
      current.soTinChi += item.hocPhan.tinChi || 0;

      // Add improvement credits if hocPhanCaiThien is true
      if (item.hocPhan.hocPhanCaiThien) {
        current.soTinChiCaiThien += item.hocPhan.tinChi || 0;
      }

      statsMap.set(key, current);
    });

    // Convert map to array of KhhtStatistics and sort
    const statsArray = Array.from(statsMap.entries()).map(([name, stats]) => ({
      name,
      soTinChi: stats.soTinChi,
      soTinChiCaiThien: stats.soTinChiCaiThien,
      namBatDau: stats.namBatDau,
      maHocKy: stats.maHocKy,
    }));

    // Sort by namBatDau (ascending) then maHocKy (1, 2, 3)
    return statsArray.sort((a, b) => {
      // Sort by academic year first
      if (a.namBatDau !== b.namBatDau) {
        return a.namBatDau - b.namBatDau;
      }
      // Within same year, sort by maHocKy (Học kỳ 1, 2, 3)
      return a.maHocKy - b.maHocKy;
    });
  }, [data]);

  return (
    <div className="bg-gray-50 p-2"  >
      <ResponsiveContainer width="100%" height={height}>
      <BarChart data={statistics}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Legend />
        <Tooltip />
        <Bar
          dataKey="soTinChi"
          fill="#51A2FF"
          name="Số tín chỉ"
          stackId="a"
          barSize={30}
        />
        <Bar
          dataKey="soTinChiCaiThien"
          fill="#82ca9d"
          name="Số tín chỉ cải thiện"
          stackId="a"
          barSize={30}
        />
      </BarChart>
      </ResponsiveContainer>
        
    </div>
  );
}
