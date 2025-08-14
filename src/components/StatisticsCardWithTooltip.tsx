import React, { useState, useRef, useEffect } from "react";
import StatisticsCard from "./StatisticsCard";
import HocPhanCaiThienTooltip from "./tooltips/HocPhanCaiThienTooltip";
import HocPhanDiemFTooltip from "./tooltips/HocPhanDiemFTooltip";
import type { LucideIcon } from "lucide-react";

interface StatisticsCardWithTooltipProps {
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
  enableHocPhanCaiThienTooltip?: boolean;
  enableHocPhanDiemFTooltip?: boolean;
}

const StatisticsCardWithTooltip: React.FC<StatisticsCardWithTooltipProps> = ({
  enableHocPhanCaiThienTooltip = false,
  enableHocPhanDiemFTooltip = false,
  ...props
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasTooltip = enableHocPhanCaiThienTooltip || enableHocPhanDiemFTooltip;

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (hasTooltip) {
      try {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPosition({
          x: rect.right + 10,
          y: rect.top + window.scrollY,
        });
        
        // Show tooltip immediately
        setShowTooltip(true);
      } catch (error) {
        console.error("Error in handleMouseEnter:", error);
      }
    }
  };

  const handleMouseLeave = () => {
    if (hasTooltip) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Add delay to allow moving to tooltip
      timeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
      }, 150);
    }
  };

  const handleCloseTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
  };

  const handleTooltipMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(true);
  };

  const handleTooltipMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 150);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={hasTooltip ? "cursor-pointer" : ""}
      >
        <StatisticsCard {...props} />
      </div>

      {enableHocPhanCaiThienTooltip && (
        <HocPhanCaiThienTooltip
          isVisible={showTooltip}
          position={tooltipPosition}
          onClose={handleCloseTooltip}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />
      )}

      {enableHocPhanDiemFTooltip && (
        <HocPhanDiemFTooltip
          isVisible={showTooltip}
          position={tooltipPosition}
          onClose={handleCloseTooltip}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />
      )}
    </>
  );
};

export default StatisticsCardWithTooltip;
