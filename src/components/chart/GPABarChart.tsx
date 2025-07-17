import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";

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
  namHoc: string;
  diemTBHocKy: number;
  diemTBTichLuy: number;
  soTinChi: number;
  hocKyId?: number | undefined; // Optional for navigation
  namHocId?: number | undefined; // Optional for navigation
}

interface GPABarChartProps {
  rawData: RawSemesterData[];
  height?: number;
}

export default function GPABarChart({ rawData, height = 400 }: GPABarChartProps) {
  const navigate = useNavigate();

  // Process raw data into chart format
  const chartData: ChartData[] = rawData.map((item, index) => ({
    tenHocKy: `Học kỳ ${index + 1}`, // Sequential numbering instead of actual semester name
    namHoc: `${item.hocKy?.namHoc?.namBatDau || ""}-${item.hocKy?.namHoc?.namKetThuc || ""}`,
    diemTBHocKy: item.diemTrungBinh
      ? Math.round(item.diemTrungBinh * 100) / 100
      : 0,
    diemTBTichLuy: item.diemTrungBinhTichLuy
      ? Math.round(item.diemTrungBinhTichLuy * 100) / 100
      : 0,
    soTinChi: item.soTinChi || 0,    hocKyId: item.hocKy?.maHocKy || undefined, // Add for navigation
    namHocId: item.hocKy?.namHoc?.id || undefined, // Add for navigation
  }));

  // Handle click on chart bars
  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload;

      // Create URL params for navigation
      const params = new URLSearchParams();
      if (clickedData.namHocId) {
        params.set("namHocId", clickedData.namHocId.toString());
      }
      if (clickedData.hocKyId) {
        params.set("hocKyId", clickedData.hocKyId.toString());
      }

      // Navigate to detail page with parameters
      const url = `/kqht/chitiet${params.toString() ? `?${params.toString()}` : ""}`;
      navigate(url);
    }
  };  if (!rawData || rawData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium">Chưa có dữ liệu</p>
          <p className="text-sm">
            Không có dữ liệu kết quả học tập để hiển thị biểu đồ
          </p>
        </div>
      </div>
    );
  }

  // Check if there are at least 2 semesters to show meaningful chart
  if (rawData.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-lg font-medium">Dữ liệu chưa đủ để hiển thị biểu đồ</p>
          <p className="text-sm">
            Cần có ít nhất 2 học kỳ đã học để hiển thị biểu đồ thống kê
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Hiện tại: {rawData.length} học kỳ
          </p>
        </div>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: -50,
          bottom: 20,
        }}
        maxBarSize={60} // Make bars narrower
        onClick={handleBarClick} // Add click handler
        style={{ cursor: "pointer" }} // Show pointer cursor
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="tenHocKy"
          angle={0} // Horizontal labels instead of rotated
          textAnchor="middle"
          height={60}
          fontSize={12}
          stroke="#6b7280"
          interval={0} // Show all labels
        />
        <YAxis domain={[0, 4]} fontSize={12} stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value: any, name: string) => [
            typeof value === "number" ? value.toFixed(2) : value,
            name === "diemTBHocKy"
              ? "Điểm TB Học kỳ"
              : name === "diemTBTichLuy"
                ? "Điểm TB Tích lũy"
                : name,
          ]}
          labelFormatter={(label) => `Học kỳ: ${label}`}
        />
        <Legend
          formatter={(value) =>
            value === "diemTBHocKy"
              ? "Điểm TB Học kỳ"
              : value === "diemTBTichLuy"
                ? "Điểm TB Tích lũy"
                : value
          }
        />
        <Bar
          dataKey="diemTBHocKy"
          fill="#3b82f6"
          name="diemTBHocKy"
          radius={[4, 4, 0, 0]}
          maxBarSize={30} // Individual bar width control
        />
        <Bar
          dataKey="diemTBTichLuy"
          fill="#10b981"
          name="diemTBTichLuy"
          radius={[4, 4, 0, 0]}
          maxBarSize={30} // Individual bar width control
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export type { RawSemesterData };
