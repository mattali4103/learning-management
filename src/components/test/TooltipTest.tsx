import React from "react";
import { Target } from "lucide-react";
import StatisticsCardWithTooltip from "../StatisticsCardWithTooltip";

// Test component để debug tooltip
const TooltipTest: React.FC = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Test Tooltip</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thẻ thường */}
        <StatisticsCardWithTooltip
          title="Thẻ bình thường"
          value={5}
          icon={Target}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          textColor="text-blue-100"
          iconColor="text-blue-200"
          subtitle="Không có tooltip"
        />
        
        {/* Thẻ có tooltip */}
        <StatisticsCardWithTooltip
          title="Có thể cải thiện"
          value={3}
          icon={Target}
          gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
          textColor="text-purple-100"
          iconColor="text-purple-200"
          subtitle="Có tooltip - hover để xem"
          enableHocPhanCaiThienTooltip={true}
        />
      </div>
      
      <div className="mt-8 p-4 bg-white rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Hướng dẫn test:</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Thẻ bên trái: Hover bình thường, không có tooltip</li>
          <li>Thẻ bên phải: Hover để hiện tooltip với danh sách học phần cải thiện</li>
          <li>Mở Console (F12) để xem debug logs</li>
        </ul>
      </div>
    </div>
  );
};

export default TooltipTest;
