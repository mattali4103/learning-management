import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface ThongKeTinChiData {
  tenHocKy: string;
  soTinChi: number;
  hocKyId: number;
  namHocId: number;
  namHoc: string;
}
interface ThongKeTinChiBarChartProps {
  statistics: { totalCredits: number };
  creditStatistics: ThongKeTinChiData[];
  onBarClick?: (data: any) => void;
}

const CreditChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ThongKeTinChiData;
    return (
      <div className="bg-white p-3 border border-blue-300 rounded-lg shadow-xl min-w-[180px] max-w-xs">
        <div className="font-bold text-blue-700 text-base mb-1">
          {data.tenHocKy}
        </div>
        <div className="text-gray-700 text-sm mb-1 truncate">
          Năm học: <span className="font-medium">{data.namHoc}</span>
        </div>
        <div className="text-blue-600 text-lg font-bold mb-1">
          {data.soTinChi} tín chỉ
        </div>
        <div className="text-gray-400 text-xs whitespace-nowrap">
          Nhấn để xem chi tiết
        </div>
      </div>
    );
  }
  return null;
};

const ThongKeTinChiBarChart: React.FC<ThongKeTinChiBarChartProps> = ({
  statistics,
  creditStatistics,
  onBarClick,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center mb-4">
        <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
        <h3 className="text-xl font-bold text-gray-800">
          Thống kê tín chỉ theo học kỳ ({statistics.totalCredits} tín chỉ)
        </h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {creditStatistics.length > 0 ? (
            <BarChart
              data={creditStatistics}
              onClick={onBarClick}
              style={{ cursor: "pointer" }}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barCategoryGap={30}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="tenHocKy"
                fontSize={12}
                stroke="#6b7280"
                label={{
                  value: "Học kỳ",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 13,
                  fill: "#374151",
                }}
              />
              <YAxis
                fontSize={12}
                stroke="#6b7280"
                label={{
                  value: "Số tín chỉ",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CreditChartTooltip />} />
              <Bar
                dataKey="soTinChi"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              >
                <LabelList
                  dataKey="soTinChi"
                  position="top"
                  fill="#2563eb"
                  fontSize={13}
                  fontWeight={700}
                  formatter={(value: number) => (value > 0 ? value : "")}
                />
              </Bar>
            </BarChart>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Chưa có dữ liệu
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ThongKeTinChiBarChart;
