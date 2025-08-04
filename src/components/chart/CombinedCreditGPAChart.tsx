import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface HocKy {
  maHocKy: number;
  tenHocKy: string;
  namHoc: {
    id: number;
    namBatDau: string;
    namKetThuc: string;
  };
}

interface DataItem {
  hocKy: HocKy | null;
  name: string; // e.g. "Học kỳ 1"
  soTinChiRot: number; // số tín chỉ rớt (failed credits)
  soTinChiTichLuy: number; // số tín chỉ tích lũy (accumulated credits)
  diemTrungBinhTichLuy: number; // điểm trung bình tích lũy (cumulative GPA)
  diemTrungBinh: number; // điểm trung bình học kỳ (semester GPA)
}

interface Props {
  data: DataItem[];
  height?: number;
  title?: string;
}

const CombinedCreditGPAChart: React.FC<Props> = ({
  data,
  height = 300,
  title = "Biểu đồ tín chỉ và điểm trung bình",
}) => {
  // Check if data is empty or all values are zero
  const hasValidData = data && data.length > 0 && data.some(item => 
    item.soTinChiTichLuy > 0 || item.soTinChiRot > 0 || 
    item.diemTrungBinhTichLuy > 0 || item.diemTrungBinh > 0
  );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {!hasValidData ? (
        <div 
          className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
          style={{ height: height }}
        >
          <BarChart3 className="w-12 h-12 text-gray-400 mb-3" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">
            Chưa có dữ liệu biểu đồ
          </h4>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Hiện tại chưa có thông tin về tín chỉ và điểm số của sinh viên. 
            Dữ liệu sẽ được hiển thị khi có kết quả học tập.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickFormatter={(value: string) => {
                // Extract number from "Học kỳ X"
                const match = value.match(/(\d+)/);
                return match ? match[1] : value;
              }}
              label={{ value: "Học kỳ", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              domain={[0, 4]}
              tickCount={6}
              label={{ value: "Điểm", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, "dataMax"]}
              label={{ value: "Số tín chỉ", angle: 90, position: "insideRight" }}
            />
            <Tooltip />
            <Legend
              verticalAlign="top"
              height={60}
              wrapperStyle={{ top: 0, marginBottom: 10 }}
            />
            {/* Bar for số tín chỉ tích lũy (accumulated credits) in green */}
            <Bar
              yAxisId="right"
              dataKey="soTinChiTichLuy"
              name="Số tín chỉ tích lũy"
              stackId="a"
              fill="#50C878"
              maxBarSize={30}
            >
              
            </Bar>
            {/* Bar for số tín chỉ rớt (failed credits) in red */}
            <Bar
              yAxisId="right"
              dataKey="soTinChiRot"
              name="Số tín chỉ rớt"
              stackId="a"
              fill="#ff4d4f"
              maxBarSize={30}
            >
              {/* <LabelList dataKey="soTinChiRot" position="top" /> */}
            </Bar>
            {/* Line for điểm trung bình tích lũy (cumulative GPA) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="diemTrungBinhTichLuy"
              name="Điểm TB tích lũy"
              stroke="#1890ff"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              label={false}
            />
            {/* Line for điểm trung bình học kỳ (semester GPA) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="diemTrungBinh"
              name="Điểm TB học kỳ"
              stroke="#faad14"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              label={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CombinedCreditGPAChart;
