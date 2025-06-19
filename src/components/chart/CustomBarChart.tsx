import { useEffect, useMemo, useState } from "react";
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
import { useNavigate } from "react-router-dom";

interface KhhtStatistics {
  name: string;
  soTinChi: number;
  soTinChiCaiThien: number;
  namBatDau: number;
  maHocKy: number;
  namHocId: number;
  hocKyId: number;
}
export default function CustomBarChart({ data }: any) {
  // Default height for the chart
  const DEFAULT_HEIGHT: number = 350;
  const { isOpen } = useSidebar();
  const navigate = useNavigate();
  const [height, setHeight] = useState<number>(DEFAULT_HEIGHT);
  useEffect(() => {
    setHeight(isOpen ? DEFAULT_HEIGHT : 400);
  }, [isOpen]);  const statistics = useMemo<KhhtStatistics[]>(() => {
    const statsMap = new Map<
      string,
      {
        soTinChi: number;
        soTinChiCaiThien: number;
        namBatDau: number;
        maHocKy: number;
        namHocId: number;
        hocKyId: number;
      }
    >();

    data.forEach((item: any) => {
      const key = `${item.hocKy.tenHocKy} ${item.namHoc.namBatDau}-${item.namHoc.namKetThuc}`;
      const current = statsMap.get(key) || {
        soTinChi: 0,
        soTinChiCaiThien: 0,
        namBatDau: item.namHoc.namBatDau,
        maHocKy: item.hocKy.maHocKy,        namHocId: item.namHoc.id,
        hocKyId: item.hocKy.maHocKy, // Sử dụng maHocKy làm ID
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
      namHocId: stats.namHocId,
      hocKyId: stats.hocKyId,
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
  // Hàm xử lý click vào cột biểu đồ
  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedData = data.activePayload[0].payload as KhhtStatistics;
      const { namHocId, hocKyId } = clickedData;
      
      // Chuyển hướng đến trang chi tiết với params đúng format
      navigate(`/khht/detail?namHocId=${namHocId}&hocKyId=${hocKyId}`);
    }
  };return (
    <div className="bg-gray-50 p-2">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={statistics} onClick={handleBarClick}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Legend />
          <Tooltip 
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800 mb-2">{`${label}`}</p>
                    {payload.map((entry, index) => (
                      <p key={index} style={{ color: entry.color }} className="text-sm">
                        {`${entry.name}: ${entry.value} tín chỉ`}
                      </p>
                    ))}
                    <p className="text-xs text-gray-500 mt-2 italic">Nhấn để xem chi tiết</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="soTinChi"
            fill="#51A2FF"
            name="Số tín chỉ"
            stackId="a"
            barSize={30}
            style={{ cursor: 'pointer' }}
          />
          <Bar
            dataKey="soTinChiCaiThien"
            fill="#82ca9d"
            name="Số tín chỉ cải thiện"
            stackId="a"
            barSize={30}
            style={{ cursor: 'pointer' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
