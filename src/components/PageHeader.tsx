import React from "react";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  descriptionIcon?: LucideIcon;
  actions?: React.ReactNode;
  backButton?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = "from-purple-500 to-indigo-600",
  descriptionIcon: DescriptionIcon,
  actions,
  backButton,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-4 border border-gray-100 ${className}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center space-x-3">
          {backButton}
          <div
            className={`w-10 h-10 bg-gradient-to-br ${iconColor} rounded-xl flex items-center justify-center`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
            <p className="text-gray-600 flex items-center text-sm">
              {DescriptionIcon && <DescriptionIcon className="w-4 h-4 mr-1" />}
              {description}
            </p>
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">{actions}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
