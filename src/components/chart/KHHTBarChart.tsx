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
import { useCallback, useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { HOCPHAN_SERVICE } from "../../api/apiEndPoints";
import type { HocKy } from "../../types/HocKy";

// Raw data interface from API
export interface TinCharBarChartData {
  hocKy: HocKy;
  soTinChiDangKy?: number;
  soTinChiCaiThien?: number;
}

// Processed chart data interface - updated to support credit statistics
interface ChartData {
  tenHocKy: string;
  tenNamHoc: string;
  soTinChiDangKy: number; // For credit statistics
  soTinChiCaiThien: number; // For credit statistics
  hocKyId: number;
  namHocId: number;
  hasData: boolean; // To distinguish between empty and filled semesters
}

interface KHHTBarChartProps {
  rawData: TinCharBarChartData[];
  height?: number;
}

export default function KHHTBarChart({
  rawData,
  height = 400,
}: KHHTBarChartProps) {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [allHocKyList, setAllHocKyList] = useState<HocKy[]>([]);
  const [isLoadingHocKy, setIsLoadingHocKy] = useState(true);

  // Fetch all semesters to fill gaps
  const fetchAllHocKy = useCallback(async () => {
    try {
      setIsLoadingHocKy(true);
      const response = await axiosPrivate.get(HOCPHAN_SERVICE.GET_ALL_HOCKY);
      if (response.data.code === 200 && response.data.data) {
        const result: HocKy[] = response.data.data.map((item: any) => ({
          maHocKy: item.maHocKy,
          tenHocKy: item.tenHocKy,
          ngayBatDau: item.ngayBatDau,
          ngayKetThuc: item.ngayKetThuc,
          namHoc: item.namHocDTO,
        }));
        result.sort((a, b) => a.maHocKy - b.maHocKy);
        setAllHocKyList(result);
      }
    } catch (error) {
      console.error("Error fetching all hoc ky:", error);
    } finally {
      setIsLoadingHocKy(false);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    fetchAllHocKy();
  }, [fetchAllHocKy]);

  // Convert raw data to chart data format with gaps filled
  const chartData: ChartData[] = (() => {
    if (isLoadingHocKy || allHocKyList.length === 0) {
      return [];
    }

    // Create a map of existing data
    const dataMap = new Map<number, TinCharBarChartData>();
    rawData.forEach(item => {
      dataMap.set(item.hocKy.maHocKy, item);
    });

    // Find the range of semesters to display
    const existingHocKyIds = rawData.map(item => item.hocKy.maHocKy);
    if (existingHocKyIds.length === 0) {
      return [];
    }

    const minHocKy = Math.min(...existingHocKyIds);
    const maxHocKy = Math.max(...existingHocKyIds);

    // Filter all semesters within the range and create chart data
    return allHocKyList
      .filter(hocKy => hocKy.maHocKy >= minHocKy && hocKy.maHocKy <= maxHocKy)
      .map(hocKy => {
        const existingData = dataMap.get(hocKy.maHocKy);
        return {
          tenHocKy: hocKy.tenHocKy || `Học kỳ ${hocKy.maHocKy}`,
          tenNamHoc: `${hocKy.namHoc.namBatDau} - ${hocKy.namHoc.namKetThuc}`,
          soTinChiDangKy: existingData?.soTinChiDangKy || 0,
          soTinChiCaiThien: existingData?.soTinChiCaiThien || 0,
          hocKyId: hocKy.maHocKy,
          namHocId: hocKy.namHoc.id,
          hasData: !!existingData,
        };
      });
  })();

  // Check if there's any improvement credit data to show
  const hasImprovementData = chartData.some(
    (item) => (item.soTinChiCaiThien || 0) > 0
  );

  // Handle click on chart bars
  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload as ChartData;

      // Create URL params for navigation
      const params = new URLSearchParams();
      if (clickedData.namHocId) {
        params.set("namHocId", clickedData.namHocId.toString());
      }
      if (clickedData.hocKyId) {
        params.set("hocKyId", clickedData.hocKyId.toString());
      }

      // Navigate to detail page with parameters
      const url = `/khht/chitiet${params.toString() ? `?${params.toString()}` : ""}`;
      navigate(url);
    }
  };

  if (isLoadingHocKy) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm">Đang tải dữ liệu học kỳ...</p>
        </div>
      </div>
    );
  }
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium">Chưa có dữ liệu</p>
          <p className="text-sm">
            Không có dữ liệu thống kê tín chỉ để hiển thị biểu đồ
          </p>
        </div>
      </div>
    );
  }

  // Check if there are at least 2 semesters to show meaningful chart
  if (chartData.length < 2) {
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
            Hiện tại: {chartData.length} học kỳ
          </p>
        </div>
      </div>
    );
  } // Calculate optimal bar size and spacing based on data length
  const dataLength = chartData.length;
  const isSmallDataset = dataLength <= 3;

  // Adjust bar chart properties for better display with few items
  const barChartProps = {
    maxBarSize: isSmallDataset ? Math.min(120, 400 / dataLength) : 80,
    margin: {
      top: 20,
      right: isSmallDataset ? 60 : 30,
      left: isSmallDataset ? 60 : 20,
      bottom: 60,
    },
    barCategoryGap: isSmallDataset ? "40%" : "20%",
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={barChartProps.margin}
        maxBarSize={barChartProps.maxBarSize}
        barCategoryGap={barChartProps.barCategoryGap}
        onClick={handleBarClick}
        style={{ cursor: "pointer" }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="tenHocKy"
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={11}
          stroke="#6b7280"
          interval={0}
        />
        <YAxis
          fontSize={12}
          stroke="#6b7280"
          label={{
            value: "Số lượng",
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle" },
          }}
        />{" "}
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          formatter={(value: any, name: string) => {
            // Only show improvement credits if there's data for it
            if (name === "soTinChiCaiThien" && !hasImprovementData) {
              return null;
            }
            return [
              value,
              name === "soTinChiDangKy"
                ? "Tín chỉ đăng ký"
                : name === "soTinChiCaiThien"
                  ? "Tín chỉ cải thiện"
                  : name,
            ];
          }}
          labelFormatter={(label, payload) => {
            if (payload && payload.length > 0) {
              const data = payload[0].payload as ChartData;
              return (
                <div>
                  <div className="font-bold text-gray-800">{label}</div>
                  <div className="text-sm text-gray-600">Năm học: {data.tenNamHoc}</div>
                  {!data.hasData && (
                    <div className="text-xs text-orange-500 mt-1">
                      (Không có dữ liệu cho học kỳ này)
                    </div>
                  )}
                  <div className="text-xs text-blue-500 mt-1">
                    Nhấn để xem chi tiết
                  </div>
                </div>
              );
            }
            return `${label}`;
          }}
          labelStyle={{ marginBottom: "4px", fontWeight: "bold" }}
        />{" "}
        {(hasImprovementData ||
          chartData.some((item) => (item.soTinChiDangKy || 0) > 0)) && (
          <Legend
            formatter={(value) => {
              // Only show legend items for data that exists
              if (value === "soTinChiCaiThien" && !hasImprovementData) {
                return null;
              }
              return value === "soTinChiDangKy"
                ? "Tín chỉ đăng ký"
                : value === "soTinChiCaiThien"
                  ? "Tín chỉ cải thiện"
                  : value;
            }}
            wrapperStyle={{ paddingTop: "10px" }}
          />
        )}
        <Bar
          dataKey="soTinChiDangKy"
          fill="#3b82f6"
          name="soTinChiDangKy"
          radius={[4, 4, 0, 0]}
          maxBarSize={isSmallDataset ? 40 : 35}
          shape={(props: any) => {
            const { payload, ...rest } = props;
            const fillColor = payload?.hasData ? "#3b82f6" : "#e5e7eb";
            return <rect {...rest} fill={fillColor} />;
          }}
        />
        {hasImprovementData && (
          <Bar
            dataKey="soTinChiCaiThien"
            fill="#10b981"
            name="soTinChiCaiThien"
            radius={[4, 4, 0, 0]}
            maxBarSize={isSmallDataset ? 40 : 35}
            shape={(props: any) => {
              const { payload, ...rest } = props;
              const fillColor = payload?.hasData ? "#10b981" : "#f3f4f6";
              return <rect {...rest} fill={fillColor} />;
            }}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
