import { useNavigate } from "react-router-dom";
import type { TooltipProps } from "recharts";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createKeHoachHocTapNavigationUrl } from "../../utils/navigationUtils";

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#ffffff",
          opacity: 0.95,
          padding: "8px 12px",
          borderRadius: "6px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          border: "1px solid #d1d5db",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          color: "#1f2937",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: "4px" }}>{label}</p>
        <p
          style={{ color: "#8884d8", fontWeight: 500 }}
        >{`Tích luỹ: ${payload[0].value}`}</p>
        <p
          style={{ color: "#3b32eb", fontWeight: 500 }}
        >{`Cải thiện: ${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};
interface AreaChartData {
  name: string | null;
  tinChiTichLuy: number | 0;
  tinChiCaiThien: number | 0;
}

interface DiemChartProps {
  tableName: string;
  data: AreaChartData[];
}
export const CustomAreaChartByDiem = ({ tableName, data }: DiemChartProps) => {
  const navigate = useNavigate();
  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedData = data.activePayload[0].payload;

      // Điều hướng với ID năm học và học kỳ nếu có
      const navigationUrl = createKeHoachHocTapNavigationUrl(
        clickedData.namHocId,
        clickedData.hocKyId
      );
      navigate(navigationUrl);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart
        onClick={handleClick}
        data={data}
        style={{ cursor: "pointer" }}
      >
        <CartesianGrid
          stroke="#e5e7eb"
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          stroke="#1f2937"
          fontSize={12}
          tickMargin={15}
          tick={{ fill: "#374151" }}
        />
        <YAxis
          domain={[0, 4]}
          stroke="#1f2937"
          fontSize={12}
          tickMargin={15}
          tick={{ fill: "#374151" }}
          label={{
            value: `${tableName}`,
            position: "insideBottomLeft",
            offset: 5,
            angle: -90,
            fill: "#1f2937",
            fontSize: 16,
            fontWeight: 600,
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="tinChiTichLuy"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="tinChiCaiThien"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CustomAreaChartByDiem;
