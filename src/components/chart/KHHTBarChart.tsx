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
    soTinChiDangKy?: number; // For credit statistics
    soTinChiCaiThien?: number; // For credit statistics
    hocKyId?: number;
    namHocId?: number;
}

interface KHHTBarChartProps {
    rawData: TinCharBarChartData[];
    height?: number;
}

export default function KHHTBarChart({ rawData, height = 400 }: KHHTBarChartProps) {
    const navigate = useNavigate();
    console.log("KHHTBarChart rawData:", rawData);

    // Convert raw data to chart data format
    const chartData: ChartData[] = rawData.map((item) => {
        const hocKy = item.hocKy;
        return {
            tenHocKy: hocKy.tenHocKy || `Học kỳ ${hocKy.maHocKy}`,
            tenNamHoc: `${hocKy.namHoc.namBatDau} - ${hocKy.namHoc.namKetThuc}`,
            soTinChiDangKy: item.soTinChiDangKy || 0,
            soTinChiCaiThien: item.soTinChiCaiThien || 0,
            hocKyId: hocKy.maHocKy,
            namHocId: hocKy.namHoc.id,
        };
    });    console.log("KHHTBarChart chartData:", chartData);

    // Check if there's any improvement credit data to show
    const hasImprovementData = chartData.some(item => (item.soTinChiCaiThien || 0) > 0);

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
            const url = `/khht/chitiet${params.toString() ? `?${params.toString()}` : ""}`;
            navigate(url);
        }
    }; if (!chartData || chartData.length === 0) {
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
    }    // Calculate optimal bar size and spacing based on data length
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
        barCategoryGap: isSmallDataset ? '40%' : '20%',
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
                        value: 'Số lượng',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                    }}
                />                <Tooltip
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
                    labelFormatter={(label) => `${label}`}
                    labelStyle={{ marginBottom: '4px', fontWeight: 'bold' }}
                />                {(hasImprovementData || chartData.some(item => (item.soTinChiDangKy || 0) > 0)) && (
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
                        wrapperStyle={{ paddingTop: '10px' }}
                    />
                )}
                <Bar
                    dataKey="soTinChiDangKy"
                    fill="#3b82f6"
                    name="soTinChiDangKy"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={isSmallDataset ? 40 : 35}
                />
                {hasImprovementData && (
                    <Bar
                        dataKey="soTinChiCaiThien"
                        fill="#10b981"
                        name="soTinChiCaiThien"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={isSmallDataset ? 40 : 35}
                    />
                )}
            </BarChart>
        </ResponsiveContainer>
    );
}
