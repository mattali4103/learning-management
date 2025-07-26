import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { GraduationCap } from "lucide-react";
import { useMemo } from "react";
import type { PreviewProfile } from "../../types/PreviewProfile";

interface CreditData {
  range: string;
  value: number;
  students: string[];
}

interface AccumulatedCreditBarChartProps {
  students: PreviewProfile[];
  onRangeClick?: (range: string) => void;
}

export default function AccumulatedCreditBarChart({
  students,
  onRangeClick,
}: AccumulatedCreditBarChartProps) {
  // Process students data into chart format
  const data: CreditData[] = useMemo(() => {
    if (!students.length) return [];

    // Define credit ranges for accumulated credits
    const ranges = [
      { range: "0-20 tín chỉ", min: 0, max: 20 },
      { range: "21-40 tín chỉ", min: 21, max: 40 },
      { range: "41-60 tín chỉ", min: 41, max: 60 },
      { range: "61-80 tín chỉ", min: 61, max: 80 },
      { range: "81-100 tín chỉ", min: 81, max: 100 },
      { range: "101-120 tín chỉ", min: 101, max: 120 },
      { range: ">120 tín chỉ", min: 121, max: Infinity },
    ];

    const creditMap = ranges.reduce((acc, range) => {
      acc[range.range] = {
        range: range.range,
        value: 0,
        students: [],
      };
      return acc;
    }, {} as { [key: string]: CreditData });

    students.forEach((student) => {
      const credits = student.soTinChiTichLuy || 0;
      
      for (const range of ranges) {
        if (credits >= range.min && credits <= range.max) {
          creditMap[range.range].value += 1;
          creditMap[range.range].students.push(`${student.hoTen} (${student.maSo}): ${credits} tín chỉ`);
          break;
        }
      }
    });

    return Object.values(creditMap);
  }, [students]);

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg max-w-md">
          <p className="font-bold text-gray-800 mb-2">{`${label}: ${data.value} sinh viên`}</p>
          <ul className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
            {data.students.map((student: string, index: number) => (
              <li key={index} className="truncate">{student}</li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  if (!data.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Phân bố tín chỉ tích luỹ
          </h2>
          <p className="text-gray-600">
            Thống kê số lượng sinh viên theo số tín chỉ tích luỹ
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="range"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: 'Số sinh viên', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomBarTooltip />} />
          <Bar
            dataKey="value"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            name="Số sinh viên"
            onClick={(payload) => {
              if (onRangeClick && payload) {
                onRangeClick(payload.range);
              }
            }}
            style={{ cursor: onRangeClick ? "pointer" : "default" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type { CreditData, PreviewProfile };
