import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const testData = [
  {
    tenHocKy: "HK1",
    diemTBHocKy: 3.2,
    diemTBTichLuy: 3.2,
  },
  {
    tenHocKy: "HK2", 
    diemTBHocKy: 3.5,
    diemTBTichLuy: 3.35,
  },
  {
    tenHocKy: "HK3",
    diemTBHocKy: 3.0,
    diemTBTichLuy: 3.23,
  },
];

export default function TestDualChart() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Dual Chart</h3>
      
      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={testData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e7" />
            <XAxis 
              dataKey="tenHocKy" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
            />
            <YAxis 
              domain={[0, 4]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              width={30}
            />
            <Tooltip />
            <Bar 
              dataKey="diemTBHocKy"
              name="Điểm TB học kỳ"
              fill="#10b981"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="diemTBTichLuy"
              name="Điểm TB tích lũy"
              fill="#3b82f6"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 flex justify-center space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
          <span className="text-gray-600">Học kỳ</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
          <span className="text-gray-600">Tích lũy</span>
        </div>
      </div>
    </div>
  );
}
