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
import { BookOpen } from "lucide-react";
import { useMemo } from "react";

interface CreditData {
  range: string;
  value: number;
  students: string[];
}

interface PreviewProfile {
  avatarUrl: string;
  maSo: string;
  hoTen: string;
  maLop: string;
  tenNganh: string;
  xepLoaiHocLuc: string;
  diemTrungBinhTichLuy: number;
  soTinChiTichLuy: number;
  soTinChiCaiThien: number;
  soTinChiDangKyHienTai: number;
  khoaHoc: string;
  maNganh: string;
  ngaySinh: Date;
  gioiTinh: boolean;
}

interface CreditImprovementBarChartProps {
  students: PreviewProfile[];
}

export default function CreditImprovementBarChart({ students }: CreditImprovementBarChartProps) {
  // Process students data into chart format
  const data: CreditData[] = useMemo(() => {
    if (!students.length) return [];

    // Define credit ranges
    const ranges = [
      { range: "0 tín chỉ", min: 0, max: 0 },
      { range: "1-5 tín chỉ", min: 1, max: 5 },
      { range: "6-10 tín chỉ", min: 6, max: 10 },
      { range: "11-15 tín chỉ", min: 11, max: 15 },
      { range: "16-20 tín chỉ", min: 16, max: 20 },
      { range: ">20 tín chỉ", min: 21, max: Infinity },
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
      const credits = student.soTinChiCaiThien || 0;
      
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
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Phân bố tín chỉ cải thiện
          </h2>
          <p className="text-gray-600">
            Thống kê số lượng sinh viên theo số tín chỉ cải thiện
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
            fill="#f97316"
            radius={[4, 4, 0, 0]}
            name="Số sinh viên"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export type { CreditData, PreviewProfile };
