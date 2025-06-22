import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  type TooltipProps,
} from "recharts";
import type { KetQuaHocTapTableProps } from "../../pages/KetQuaHocTap/KetQuaHocTap";

// Define specific colors for each grade
const GRADE_COLORS: { [key: string]: string } = {
  A: "#36A2EB", // Blue
  "B+": "#FFCE56", // Yellow
  B: "#4BC0C0", // Teal
  "C+": "#9966FF", // Purple
  C: "#FF9F40", // Orange
  "D+": "#FF6384", // Pink
  D: "#FF5555", // Red
  M: "#808080", // Gray (for failing grade)
  "Non-graded": "#C9CBCF", // Light gray (for non-graded courses)
};

interface PieProps {
  rowData: KetQuaHocTapTableProps[];
}

export default function CustomPieChart({ rowData }: PieProps) {
  const gradeDistributionData = rowData.reduce((acc, item) => {
    const grade = item.diemChu === "" ? "Non-graded" : item.diemChu;
    const existing = acc.find((entry: any) => entry.name === grade);
    if (existing) {
      existing.value += 1;
      existing.courses.push(item.tenHp);
    } else {
      acc.push({
        name: grade,
        value: 1,
        courses: [item.tenHp],
      });
    }
    return acc;
  }, [] as { name: string; value: number; courses: string[] }[]);

  // Custom tooltip to display grade and course names
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-100 p-2.5 border-1-solid border-1 border-r-4 border-white"
        >
          <p className="font-bold">{`${data.name}: ${data.value} môn`}</p>
          <ul className="m-0 pl-4">
            {data.courses.map((course: string, index: number) => (
              <li key={index}>{course}</li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-2.5 max-w-[1200px] mx-0 my-auto">
      <p>
        Thống Kê Kết Quả Học Tập
      </p>
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={gradeDistributionData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {gradeDistributionData.map((entry: any) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={GRADE_COLORS[entry.name] || "#D3D3D3"} // Fallback color
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}