import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ExternalLink } from "lucide-react";

interface GPAChartData {
  name: string;
  diem: number;
  hocKyId: number | null;
  namHocId: number | null;
}

interface GPAChartProps {
  data: GPAChartData[];
}

const GPAChart = ({ data }: GPAChartProps) => {
  const navigate = useNavigate();

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">
              Điểm trung bình tích lũy qua các học kỳ
            </h3>
          </div>
          <button
            onClick={() => navigate("/kqht/chitiet")}
            className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Chi tiết
          </button>
        </div>
        <div className="h-[250px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có dữ liệu điểm số</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if there are at least 2 semesters to show meaningful chart
  if (data.length < 2) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">
              Điểm trung bình tích lũy qua các học kỳ
            </h3>
          </div>
          <button
            onClick={() => navigate("/kqht/chitiet")}
            className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Chi tiết
          </button>
        </div>
        <div className="h-[250px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-lg font-medium">Dữ liệu chưa đủ để hiển thị biểu đồ</p>
            <p className="text-sm">
              Cần có ít nhất 2 học kỳ đã học để hiển thị biểu đồ thống kê
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Hiện tại: {data.length} học kỳ
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleChartClick = () => {
    navigate("/kqht/chitiet");
  };

  const handleDataPointClick = (data: any) => {
    if (!data?.activePayload?.[0]) {
      navigate('/kqht/chitiet');
      return;
    }

    const clickedData = data.activePayload[0].payload;
    const { hocKyId, namHocId } = clickedData;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (namHocId) params.append('namHocId', namHocId.toString());
    if (hocKyId) params.append('hocKyId', hocKyId.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/kqht/chitiet?${queryString}` : '/kqht/chitiet';
    
    navigate(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0]?.value;
      const grade = getGradeFromGPA(value);

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-blue-600">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Điểm TB tích lũy: {value?.toFixed(2)}
          </p>
          <p className="text-gray-600 text-sm">
            Xếp loại:{" "}
            <span className={`font-semibold ${getGradeColor(grade)}`}>
              {grade}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

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
      case "Yếu":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">
            Điểm trung bình tích lũy qua các học kỳ
          </h3>
        </div>
        <button
          onClick={handleChartClick}
          className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          title="Xem chi tiết kết quả học tập"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Chi tiết
        </button>
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onClick={handleDataPointClick}
            className="cursor-pointer"
          >
            <defs>
              <linearGradient id="colorGPA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <YAxis
              domain={[0, 4]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="diem"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGPA)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Điểm TB tích lũy</span>
          </div>
          {data.length > 0 && (
            <div className="text-gray-600">
              Hiện tại:{" "}
              <span className="font-semibold text-blue-600">
                {data[data.length - 1]?.diem?.toFixed(2) || "0.00"}
              </span>
            </div>
          )}
        </div>
        <span className="text-gray-500 text-xs">
          Nhấp vào điểm để xem chi tiết học kỳ
        </span>
      </div>
    </div>
  );
};

export default GPAChart;
