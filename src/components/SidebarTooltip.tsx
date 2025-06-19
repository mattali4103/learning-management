interface SidebarTooltipProps {
  children: React.ReactNode;
  content: string;
  isVisible: boolean;
}

export default function SidebarTooltip({ children, content, isVisible }: SidebarTooltipProps) {
  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <div className="group relative">
      {children}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {content}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      </div>
    </div>
  );
}
