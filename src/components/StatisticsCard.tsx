import type { LucideIcon } from "lucide-react";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  textColor: string;
  iconColor: string;
  subtitle?: string;
  subtitleIcon?: LucideIcon;
}

export default function StatisticsCard({
  title,
  value,
  icon: Icon,
  gradient,
  textColor,
  iconColor,
  subtitle,
  subtitleIcon: SubtitleIcon,
}: StatisticsCardProps) {
  return (
    <div className={`${gradient} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${textColor} text-sm font-medium`}>
            {title}
          </p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon className={`w-12 h-12 ${iconColor}`} />
      </div>
      {subtitle && (
        <div className="mt-4 flex items-center">
          {SubtitleIcon && <SubtitleIcon className="w-4 h-4 mr-1" />}
          <span className="text-sm">{subtitle}</span>
        </div>
      )}
    </div>
  );
}
