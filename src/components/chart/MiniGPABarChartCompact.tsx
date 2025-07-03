import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Raw data interface from API
interface RawSemesterData {
  diemTrungBinh: number;
  diemTrungBinhTichLuy: number;
  soTinChi: number;
  hocKy: {
    maHocKy: number;
    tenHocKy: string;
    namHoc: {
      id: number;
      namBatDau: string;
      namKetThuc: string;
    };
  };
}

// Processed chart data interface
interface ChartData {
  tenHocKy: string;
  diemTBHocKy: number;
  diemTBTichLuy: number;
}

interface MiniGPABarChartCompactProps {
  rawData: RawSemesterData[];
  title: string;
  showCumulativeGPA?: boolean;
  height?: number;
}

export default function MiniGPABarChartCompact({ 
  rawData, 
  title, 
  showCumulativeGPA = false,
  height = 120 
}: MiniGPABarChartCompactProps) {
  
  // Process raw data into chart format
  const chartData: ChartData[] = rawData.map((item, index) => ({
    tenHocKy: `HK${index + 1}`, // Sequential numbering
    diemTBHocKy: item.diemTrungBinh ? Math.round(item.diemTrungBinh * 100) / 100 : 0,
    diemTBTichLuy: item.diemTrungBinhTichLuy ? Math.round(item.diemTrungBinhTichLuy * 100) / 100 : 0,
  }));

  // Calculate trend
  const getTrend = () => {
    if (chartData.length < 2) return "stable";
    const dataKey = showCumulativeGPA ? "diemTBTichLuy" : "diemTBHocKy";
    const firstGPA = chartData[0][dataKey];
    const lastGPA = chartData[chartData.length - 1][dataKey];
    const diff = lastGPA - firstGPA;
    
    if (diff > 0.1) return "up";
    if (diff < -0.1) return "down";
    return "stable";
  };

  const trend = getTrend();

  const getGradeFromGPA = (gpa: number): string => {
    if (gpa >= 3.6) return "Xuất sắc";
    if (gpa >= 3.2) return "Giỏi";
    if (gpa >= 2.5) return "Khá";
    if (gpa >= 2.0) return "Trung bình";
    return "Yếu";
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case "Xuất sắc":
        return "text-purple-600";
      case "Giỏi":
        return "text-green-600";
      case "Khá":
        return "text-blue-600";
      case "Trung bình":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  // Get current GPA
  const currentGPA = chartData.length > 0 
    ? (showCumulativeGPA 
        ? chartData[chartData.length - 1].diemTBTichLuy 
        : chartData[chartData.length - 1].diemTBHocKy)
    : 0;
  const currentGrade = getGradeFromGPA(currentGPA);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-700">{label}</p>
          {showCumulativeGPA ? (
            <p className="text-blue-600">
              Điểm TB tích lũy: <span className="font-bold">{data.diemTBTichLuy.toFixed(2)}</span>
            </p>
          ) : (
            <p className="text-green-600">
              Điểm TB học kỳ: <span className="font-bold">{data.diemTBHocKy.toFixed(2)}</span>
            </p>
          )}
          <p className={`font-semibold ${getGradeColor(getGradeFromGPA(showCumulativeGPA ? data.diemTBTichLuy : data.diemTBHocKy))}`}>
            Xếp loại: {getGradeFromGPA(showCumulativeGPA ? data.diemTBTichLuy : data.diemTBHocKy)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!rawData || rawData.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
        <div className="flex items-center justify-center h-24 text-gray-500">
          <p className="text-sm">Chưa có dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <div className="flex items-center space-x-2">
          {trend === "up" && (
            <div className="flex items-center text-green-600">
              <TrendingUp size={16} />
              <span className="text-xs ml-1">Tăng</span>
            </div>
          )}
          {trend === "down" && (
            <div className="flex items-center text-red-600">
              <TrendingDown size={16} />
              <span className="text-xs ml-1">Giảm</span>
            </div>
          )}
          {trend === "stable" && (
            <div className="flex items-center text-gray-600">
              <Minus size={16} />
              <span className="text-xs ml-1">Ổn định</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-800">
            {currentGPA.toFixed(2)}
          </span>
          <span className={`text-sm font-semibold ${getGradeColor(currentGrade)}`}>
            {currentGrade}
          </span>
        </div>
      </div>

      <div style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
            <XAxis 
              dataKey="tenHocKy" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
            />
            <YAxis 
              domain={[0, 4]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={showCumulativeGPA ? "diemTBTichLuy" : "diemTBHocKy"}
              fill={showCumulativeGPA ? "#3b82f6" : "#10b981"}
              radius={[2, 2, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{chartData.length > 0 ? chartData[0].tenHocKy : ""}</span>
        <span>{chartData.length > 0 ? chartData[chartData.length - 1].tenHocKy : ""}</span>
      </div>
    </div>
  );
}
