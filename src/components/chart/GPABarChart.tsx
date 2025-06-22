import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  tenHocKy: string;
  namHoc: string;
  diemTBHocKy: number;
  diemTBTichLuy: number;
  soTinChi: number;
}

interface GPABarChartProps {
  data: ChartData[];
  height?: number;
}

export default function GPABarChart({ data, height = 400 }: GPABarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-lg font-medium">Chưa có dữ liệu</p>
          <p className="text-sm">Không có dữ liệu kết quả học tập để hiển thị biểu đồ</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
        maxBarSize={60} // Make bars narrower
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="tenHocKy" 
          angle={0} // Horizontal labels instead of rotated
          textAnchor="middle"
          height={60}
          fontSize={12}
          stroke="#6b7280"
          interval={0} // Show all labels
        />
        <YAxis 
          domain={[0, 4]}
          fontSize={12}
          stroke="#6b7280"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: any, name: string) => [
            typeof value === 'number' ? value.toFixed(2) : value,
            name === 'diemTBHocKy' ? 'Điểm TB Học kỳ' : 
            name === 'diemTBTichLuy' ? 'Điểm TB Tích lũy' : name
          ]}
          labelFormatter={(label) => `Học kỳ: ${label}`}
        />
        <Legend 
          formatter={(value) => 
            value === 'diemTBHocKy' ? 'Điểm TB Học kỳ' : 
            value === 'diemTBTichLuy' ? 'Điểm TB Tích lũy' : value
          }
        />
        <Bar 
          dataKey="diemTBHocKy" 
          fill="#3b82f6" 
          name="diemTBHocKy"
          radius={[4, 4, 0, 0]}
          maxBarSize={30} // Individual bar width control
        />
        <Bar 
          dataKey="diemTBTichLuy" 
          fill="#10b981" 
          name="diemTBTichLuy"
          radius={[4, 4, 0, 0]}
          maxBarSize={30} // Individual bar width control
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export type { ChartData };
