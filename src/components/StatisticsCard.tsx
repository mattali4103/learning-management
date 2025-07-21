import type { LucideIcon } from "lucide-react";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: string;
  textColor?: string;
  iconColor?: string;
  subtitle?: string;
  subtitleIcon?: LucideIcon;
  colorScheme?: "blue" | "green" | "orange" | "purple" | "red";
  size?: "sm" | "md";
  style?: "modern" | "classic";
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
  colorScheme = "blue",
  size = "md",
  style = "modern",
}: StatisticsCardProps) {
  // Modern style color schemes
  const modernColorSchemes = {
    blue: {
      background: "from-white to-blue-50",
      border: "border-blue-100",
      titleColor: "text-blue-700",
      valueColor: "text-blue-800",
      subtitleColor: "text-blue-600",
      iconBackground: "from-blue-500 to-blue-600",
      decorationColor: "from-blue-200 to-indigo-200",
      decorationSecondary: "from-indigo-200 to-purple-200",
    },
    green: {
      background: "from-white to-green-50",
      border: "border-green-100",
      titleColor: "text-green-700",
      valueColor: "text-green-800",
      subtitleColor: "text-green-600",
      iconBackground: "from-green-500 to-green-600",
      decorationColor: "from-green-200 to-emerald-200",
      decorationSecondary: "from-emerald-200 to-teal-200",
    },
    orange: {
      background: "from-white to-orange-50",
      border: "border-orange-100",
      titleColor: "text-orange-700",
      valueColor: "text-orange-800",
      subtitleColor: "text-orange-600",
      iconBackground: "from-orange-500 to-orange-600",
      decorationColor: "from-orange-200 to-amber-200",
      decorationSecondary: "from-amber-200 to-yellow-200",
    },
    purple: {
      background: "from-white to-purple-50",
      border: "border-purple-100",
      titleColor: "text-purple-700",
      valueColor: "text-purple-800",
      subtitleColor: "text-purple-600",
      iconBackground: "from-purple-500 to-purple-600",
      decorationColor: "from-purple-200 to-indigo-200",
      decorationSecondary: "from-indigo-200 to-blue-200",
    },
    red: {
      background: "from-white to-red-50",
      border: "border-red-100",
      titleColor: "text-red-700",
      valueColor: "text-red-800",
      subtitleColor: "text-red-600",
      iconBackground: "from-red-500 to-red-600",
      decorationColor: "from-red-200 to-pink-200",
      decorationSecondary: "from-pink-200 to-rose-200",
    },
  };

  const sizes = {
    sm: {
      padding: "p-4",
      titleSize: "text-xs",
      valueSize: "text-2xl",
      subtitleSize: "text-xs",
      iconContainer: "w-10 h-10",
      iconSize: "w-5 h-5",
      decorationLarge: "w-16 h-16",
      decorationSmall: "w-12 h-12",
      decorationLargeOffset: "-translate-y-8 translate-x-8",
      decorationSmallOffset: "translate-y-6 -translate-x-6",
    },
    md: {
      padding: "p-6",
      titleSize: "text-sm",
      valueSize: "text-3xl",
      subtitleSize: "text-sm",
      iconContainer: "w-12 h-12",
      iconSize: "w-6 h-6",
      decorationLarge: "w-20 h-20",
      decorationSmall: "w-16 h-16",
      decorationLargeOffset: "-translate-y-10 translate-x-10",
      decorationSmallOffset: "translate-y-8 -translate-x-8",
    },
  };

  // Use classic style if gradient, textColor, and iconColor are provided
  if (style === "classic" || (gradient && textColor && iconColor)) {
    return (
      <div className={`${gradient || "bg-gradient-to-r from-blue-500 to-blue-600"} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-200`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`${textColor || "text-blue-100"} text-sm font-medium`}>
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <Icon className={`w-12 h-12 ${iconColor || "text-blue-200"}`} />
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

  // Modern style
  const colors = modernColorSchemes[colorScheme];
  const sizeConfig = sizes[size];

  return (
    <div className={`bg-gradient-to-br ${colors.background} rounded-2xl shadow-lg ${sizeConfig.padding} ${colors.border} relative overflow-hidden`}>
      {/* Background decorations */}
      <div className={`absolute top-0 right-0 ${sizeConfig.decorationLarge} bg-gradient-to-br ${colors.decorationColor} rounded-full ${sizeConfig.decorationLargeOffset} opacity-30`}></div>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className={`${sizeConfig.titleSize} font-semibold ${colors.titleColor} mb-2 uppercase tracking-wide`}>
            {title}
          </p>
          <p className={`${sizeConfig.valueSize} font-bold ${colors.valueColor} mb-1`}>
            {value}
          </p>
          {subtitle && (
            <p className={`${sizeConfig.subtitleSize} ${colors.subtitleColor}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`${sizeConfig.iconContainer} bg-gradient-to-br ${colors.iconBackground} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className={`${sizeConfig.iconSize} text-white`} />
        </div>
      </div>
    </div>
  );
}
