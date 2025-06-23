import { FileText, TriangleAlert } from "lucide-react";

interface EmptyTableStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<any>;
  showWarningBadge?: boolean;
}

export const EmptyTableState: React.FC<EmptyTableStateProps> = ({
  title = "Chưa nhập kế hoạch học tập",
  description = "Không có dữ liệu để hiển thị cho mục này",
  icon: IconComponent = FileText,
  showWarningBadge = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-4">
      <div className="relative">
        <IconComponent className="w-16 h-16 text-gray-300" />
        {showWarningBadge && (
          <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 border-2 border-white">
            <TriangleAlert className="w-3 h-3 text-yellow-600" />
          </span>
        )}
      </div>
      <div className="text-center">
        <span className="text-lg font-semibold text-gray-600">
          {title}
        </span>
        <p className="text-sm text-gray-400 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
};
