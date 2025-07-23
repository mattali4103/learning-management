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
  showSemesterGPA?: boolean;
  height?: number;
}

export default function MiniGPABarChartCompact({ 
  rawData, 
  title, 
  showCumulativeGPA = false,
  showSemesterGPA = false,
  height = 120 
}: MiniGPABarChartCompactProps) {
  
  // Determine if we're showing dual columns
  const showDualColumns = showCumulativeGPA && showSemesterGPA;
  
  // Process raw data into chart format with better error handling
  const chartData: ChartData[] = rawData
    .filter(item => item && item.hocKy) // Filter out invalid items
    .map((item, index) => ({
      tenHocKy: `HK${index + 1}`, // Sequential numbering
      diemTBHocKy: Number(item.diemTrungBinh) || 0,
      diemTBTichLuy: Number(item.diemTrungBinhTichLuy) || 0,
    }));

  // Add test data if no data available and in dual mode for debugging
  const finalChartData = chartData.length === 0 && showDualColumns ? [
    { tenHocKy: "HK1", diemTBHocKy: 3.2, diemTBTichLuy: 3.2 },
    { tenHocKy: "HK2", diemTBHocKy: 3.5, diemTBTichLuy: 3.35 },
    { tenHocKy: "HK3", diemTBHocKy: 3.0, diemTBTichLuy: 3.23 },
  ] : chartData.length > 0 ? chartData : [];

  // Calculate trend - fix for dual columns
  const getTrend = () => {
    if (finalChartData.length < 2) return "stable";
    // For dual columns, use cumulative GPA for trend
    const dataKey = showDualColumns || showCumulativeGPA ? "diemTBTichLuy" : "diemTBHocKy";
    const firstGPA = finalChartData[0][dataKey];
    const lastGPA = finalChartData[finalChartData.length - 1][dataKey];
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
  const currentCumulativeGPA = finalChartData.length > 0 ? finalChartData[finalChartData.length - 1].diemTBTichLuy : 0;
  const currentSemesterGPA = finalChartData.length > 0 ? finalChartData[finalChartData.length - 1].diemTBHocKy : 0;
  const currentGPA = showDualColumns 
    ? currentCumulativeGPA 
    : (showCumulativeGPA ? currentCumulativeGPA : currentSemesterGPA);
  const currentGrade = getGradeFromGPA(currentGPA);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-700">{label}</p>
          {showDualColumns ? (
            <>
              <p className="text-green-600">
                Điểm TB học kỳ: <span className="font-bold">{data.diemTBHocKy.toFixed(2)}</span>
              </p>
              <p className="text-blue-600">
                Điểm TB tích lũy: <span className="font-bold">{data.diemTBTichLuy.toFixed(2)}</span>
              </p>
              <p className={`font-semibold ${getGradeColor(getGradeFromGPA(data.diemTBTichLuy))}`}>
                Xếp loại: {getGradeFromGPA(data.diemTBTichLuy)}
              </p>
            </>
          ) : showCumulativeGPA ? (
            <>
              <p className="text-blue-600">
                Điểm TB tích lũy: <span className="font-bold">{data.diemTBTichLuy.toFixed(2)}</span>
              </p>
              <p className={`font-semibold ${getGradeColor(getGradeFromGPA(data.diemTBTichLuy))}`}>
                Xếp loại: {getGradeFromGPA(data.diemTBTichLuy)}
              </p>
            </>
          ) : (
            <>
              <p className="text-green-600">
                Điểm TB học kỳ: <span className="font-bold">{data.diemTBHocKy.toFixed(2)}</span>
              </p>
              <p className={`font-semibold ${getGradeColor(getGradeFromGPA(data.diemTBHocKy))}`}>
                Xếp loại: {getGradeFromGPA(data.diemTBHocKy)}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  if (!rawData || rawData.length === 0) {
    console.log('No raw data available for chart');
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

  // Check if chart data is valid
  if (finalChartData.length === 0) {
    console.log('Final chart data is empty after processing');
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
        <div className="flex items-center justify-center h-24 text-gray-500">
          <p className="text-sm">Không thể xử lý dữ liệu</p>
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
        {showDualColumns ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">HK:</span>
              <span className="text-sm font-bold text-green-600">
                {currentSemesterGPA.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600">TL:</span>
              <span className="text-lg font-bold text-blue-600">
                {currentCumulativeGPA.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-xs font-semibold ${getGradeColor(currentGrade)}`}>
                {currentGrade}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-800">
              {currentGPA.toFixed(2)}
            </span>
            <span className={`text-sm font-semibold ${getGradeColor(currentGrade)}`}>
              {currentGrade}
            </span>
          </div>
        )}
      </div>

      <div style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={finalChartData} 
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            barCategoryGap="20%"
            maxBarSize={60}
          >
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
            
            {/* Always render both bars when in dual column mode */}
            {showDualColumns ? (
              <>
                <Bar 
                  dataKey="diemTBHocKy"
                  name="diemTBHocKy"
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={25}
                />
                <Bar 
                  dataKey="diemTBTichLuy"
                  name="diemTBTichLuy"
                  fill="#3b82f6"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={25}
                />
              </>
            ) : (
              <Bar 
                dataKey={showCumulativeGPA ? "diemTBTichLuy" : "diemTBHocKy"}
                fill={showCumulativeGPA ? "#3b82f6" : "#10b981"}
                radius={[2, 2, 0, 0]}
                maxBarSize={40}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{finalChartData.length > 0 ? finalChartData[0].tenHocKy : ""}</span>
        <span>{finalChartData.length > 0 ? finalChartData[finalChartData.length - 1].tenHocKy : ""}</span>
      </div>
      
      {showDualColumns && (
        <div className="mt-2 flex justify-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
            <span className="text-gray-600">Học kỳ</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
            <span className="text-gray-600">Tích lũy</span>
          </div>
        </div>
      )}
    </div>
  );
}
