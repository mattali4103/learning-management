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
import { BarChart3, ExternalLink } from "lucide-react";

interface TinChiChartData {
  name: string;
  tinChiTichLuy: number;
  tinChiCaiThien: number;
  hocKyId: number | null;
  namHocId: number | null;
}

interface TinChiChartProps {
  data: TinChiChartData[];
}

const TinChiChart = ({ data }: TinChiChartProps) => {
  const navigate = useNavigate();
  
  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">
              Số tín chỉ tích lũy qua các học kỳ
            </h3>
          </div>
          <button
            onClick={() => navigate("/khht/detail")}
            className="flex items-center px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Chi tiết
          </button>
        </div>
        <div className="h-[250px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có dữ liệu tín chỉ</p>
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
            <BarChart3 className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">
              Số tín chỉ tích lũy qua các học kỳ
            </h3>
          </div>
          <button
            onClick={() => navigate("/khht/detail")}
            className="flex items-center px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Chi tiết
          </button>
        </div>
        <div className="h-[250px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-yellow-500" />
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
    navigate("/khht/detail");
  };

  const handleDataPointClick = (data: any) => {
    if (!data?.activePayload?.[0]) {
      navigate("/khht/detail");
      return;
    }

    const clickedData = data.activePayload[0].payload;
    const { hocKyId, namHocId } = clickedData;

    // Build query parameters
    const params = new URLSearchParams();
    if (namHocId) params.append("namHocId", namHocId.toString());
    if (hocKyId) params.append("hocKyId", hocKyId.toString());

    const queryString = params.toString();
    const url = queryString ? `/khht/detail?${queryString}` : "/khht/detail";    navigate(url);
  };

  // Check if there's any improvement credit data to show
  const hasImprovementData = data.some(item => (item.tinChiCaiThien || 0) > 0);
  
  // Calculate optimal chart properties based on data length
  const dataLength = data.length;
  const isSmallDataset = dataLength <= 3;
  
  // Adjust chart margins and dimensions for better display with few items
  const chartMargin = {
    top: 10,
    right: isSmallDataset ? 40 : 30,
    left: isSmallDataset ? 40 : 20,
    bottom: isSmallDataset ? 20 : 10,
  };
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-green-600">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Tín chỉ tích lũy: {payload[0]?.value}
          </p>
          {hasImprovementData && (
            <p className="text-purple-600">
              <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              Tín chỉ cải thiện: {payload[1]?.value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <BarChart3 className="w-6 h-6 text-green-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-800">
            Số tín chỉ tích lũy qua các học kỳ
          </h3>
        </div>
        <button
          onClick={handleChartClick}
          className="flex items-center px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200"
          title="Xem chi tiết kế hoạch học tập"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Chi tiết
        </button>
      </div>{" "}      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={chartMargin}
            onClick={handleDataPointClick}
            className="cursor-pointer"
          >
            <defs>
              <linearGradient
                id="colorTinChiTichLuy"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient
                id="colorTinChiCaiThien"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              angle={isSmallDataset ? 0 : -15}
              textAnchor={isSmallDataset ? "middle" : "end"}
              height={isSmallDataset ? 30 : 50}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <Tooltip content={<CustomTooltip />} />            <Area
              type="monotone"
              dataKey="tinChiTichLuy"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTinChiTichLuy)"
            />
            {hasImprovementData && (
              <Area
                type="monotone"
                dataKey="tinChiCaiThien"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTinChiCaiThien)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Tín chỉ tích lũy</span>
          </div>
          {hasImprovementData && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Tín chỉ cải thiện</span>
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

export default TinChiChart;
