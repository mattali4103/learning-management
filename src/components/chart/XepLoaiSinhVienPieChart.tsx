import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  type TooltipProps,
} from "recharts";
import { Award } from "lucide-react";
import { useMemo } from "react";

interface XepLoaiSinhVien {
  xepLoai: string;
  soLuong: number;
  sinhVien: string[];
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

interface XepLoaiSinhVienPieChartProps {
  students: PreviewProfile[];
}

// Define specific colors for each classification
const CLASSIFICATION_COLORS: { [key: string]: string } = {
  "Xuất sắc": "#8B5CF6", // Purple - Excellent
  "Giỏi": "#10B981", // Green - Good
  "Khá": "#3B82F6", // Blue - Fair
  "Trung bình": "#EAB308", // Yellow - Average
  "Yếu": "#F97316", // Orange - Weak
  "Kém": "#EF4444", // Red - Poor
  "Chưa xác định": "#9CA3AF", // Gray - Undetermined
};

export default function XepLoaiSinhVienPieChart({ students }: XepLoaiSinhVienPieChartProps) {
  // Process students data into chart format
  const data: XepLoaiSinhVien[] = useMemo(() => {
    if (!students.length) return [];

    const classificationMap = students.reduce(
      (acc, student) => {
        const classification = student.xepLoaiHocLuc || "Chưa xác định";
        if (acc[classification]) {
          acc[classification].soLuong += 1;
          acc[classification].sinhVien.push(`${student.hoTen} (${student.maSo})`);
        } else {
          acc[classification] = {
            xepLoai: classification,
            soLuong: 1,
            sinhVien: [`${student.hoTen} (${student.maSo})`],
          };
        }
        return acc;
      },
      {} as {
        [key: string]: { xepLoai: string; soLuong: number; sinhVien: string[] };
      }
    );

    return Object.values(classificationMap).sort((a, b) => {
      const classificationOrder = [
        "Xuất sắc",
        "Giỏi", 
        "Khá",
        "Trung bình",
        "Yếu",
        "Kém",
        "Chưa xác định",
      ];
      return classificationOrder.indexOf(a.xepLoai) - classificationOrder.indexOf(b.xepLoai);
    });
  }, [students]);

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg max-w-md">
          <p className="font-bold text-gray-800 mb-2">{`${data.xepLoai}: ${data.soLuong} sinh viên`}</p>
          <ul className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
            {data.sinhVien.map((student: string, index: number) => (
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
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Phân bố xếp loại học lực
          </h2>
          <p className="text-gray-600">
            Thống kê số lượng sinh viên theo từng loại xếp loại học lực
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="soLuong"
            nameKey="xepLoai"
            cx="50%"
            cy="50%"
            outerRadius={120}
            startAngle={90}
            endAngle={-270}
            label={({ xepLoai, soLuong, percent }) => 
              `${xepLoai}: ${soLuong} (${(percent * 100).toFixed(1)}%)`
            }
          >
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.xepLoai}`}
                fill={CLASSIFICATION_COLORS[entry.xepLoai] || "#9CA3AF"}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export type { XepLoaiSinhVien, PreviewProfile };
