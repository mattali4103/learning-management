import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  type TooltipProps,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { useMemo } from "react";

interface GradeData {
  name: string;
  value: number;
  courses: string[];
}

interface RawGradeData {
  tenHp: string;
  diemChu: string;
}

interface GradeDistributionPieChartProps {
  rawData: RawGradeData[];
}

// Define specific colors for each grade - Blue > Green > Yellow > Orange > Red progression
const GRADE_COLORS: { [key: string]: string } = {
  A: "#3B82F6", // Blue - Excellent
  "B+": "#10B981", // Green - Very Good
  B: "#22C55E", // Light Green - Good
  "C+": "#EAB308", // Yellow - Above Average
  C: "#FBBF24", // Light Yellow - Average
  "D+": "#F97316", // Orange - Below Average
  D: "#FB923C", // Light Orange - Poor
  F: "#EF4444", // Red - Failing
  W: "#6B7280", // Gray - Withdrawn
  M: "#F59E0B", // Amber - Missing
  I: "#D97706", // Dark Amber - Incomplete
  "Non-graded": "#9CA3AF", // Gray - No grade
};

export default function GradeDistributionPieChart({ rawData }: GradeDistributionPieChartProps) {
  // Process raw data into chart format
  const data: GradeData[] = useMemo(() => {
    if (!rawData.length) return [];

    const validData = rawData.filter(
      (item) => item.diemChu !== "W" && item.diemChu !== "I" && item.diemChu !== ""
    );

    const gradeMap = validData.reduce(
      (acc, item) => {
        const grade = item.diemChu || "Non-graded";
        if (acc[grade]) {
          acc[grade].value += 1;
          acc[grade].courses.push(item.tenHp);
        } else {
          acc[grade] = {
            name: grade,
            value: 1,
            courses: [item.tenHp],
          };
        }
        return acc;
      },
      {} as {
        [key: string]: { name: string; value: number; courses: string[] };
      }
    );

    return Object.values(gradeMap).sort((a, b) => {
      const gradeOrder = [
        "A",
        "B+",
        "B",
        "C+",
        "C",
        "D+",
        "D",
        "F",
        "W",
        "M",
        "I",
        "Non-graded",
      ];
      return gradeOrder.indexOf(b.name) - gradeOrder.indexOf(a.name);
    });
  }, [rawData]);

  // Custom tooltip cho biểu đồ tròn
  const CustomPieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg max-w-md">
          <p className="font-bold text-gray-800 mb-2">{`Điểm ${data.name}: ${data.value} môn`}</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {data.courses.map((course: string, index: number) => (
              <li key={index} className="truncate">{course}</li>
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
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
          <PieChartIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Phân bố điểm chữ các môn đã học
          </h2>
          <p className="text-gray-600">
            Thống kê số lượng môn học theo từng loại điểm chữ
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            startAngle={90}
            endAngle={90 + 360}
            label={({ name, value, percent }) => 
              `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
            }
          >
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={GRADE_COLORS[entry.name] || "#9CA3AF"}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                Điểm {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export type { GradeData, RawGradeData };
