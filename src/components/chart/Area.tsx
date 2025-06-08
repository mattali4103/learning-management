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

type AreaChartData = {
  name: string | null;
  diem: number | 0;
};

interface AreaChartComponentProps {
  data: AreaChartData[];
}

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
        >{`Điểm: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

interface AreaChartComponentProps {
    tableName: string;
    data: AreaChartData[];
}

export default function AreaChartComponent({ tableName, data }: AreaChartComponentProps) {
    return (
        <div className="p-2 bg-gray-100 rounded-lg shadow-md m-5">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
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
                        dataKey="diem"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.25}
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}