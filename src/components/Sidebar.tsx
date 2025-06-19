import { NavLink, useLocation } from "react-router-dom";
import { createElement, useState } from "react";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ClassIcon from "@mui/icons-material/Class";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useSidebar } from "../hooks/UseSidebar";

interface SidebarItem {
  name: string;
  icon: React.ElementType;
  to: string;
  children?: { name: string; to: string }[];
}

export default function Sidebar() {
  const { isOpen, setIsOpen } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>({});
  const location = useLocation();
  
  const sidebarItems: SidebarItem[] = [
    { name: "Dashboard", icon: DashboardIcon, to: "/" },
    {
      name: "Kế Hoạch Học Tập",
      icon: MenuBookIcon,
      to: "/khht",
      children: [
        { name: "Tổng quan", to: "/khht/chung" },
        { name: "Xem chi tiết", to: "/khht/detail" },
        { name: "Nhập kế hoạch", to: "/khht/add" },
      ],
    },
    {
      name: "Kết Quả Học Tập",
      icon: ClassIcon,
      to: "/kqht",
      children: [
        { name: "Tổng quan", to: "/kqht/chung" },
        { name: "Xem chi tiết", to: "/kqht/chitiet" },
      ],
    },
  ];

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const isParentActive = (item: SidebarItem) => {
    if (item.children) {
      return item.to === location.pathname || 
             item.children.some((child) => child.to === location.pathname);
    }
    return item.to === location.pathname;
  };  return (
    <aside
      className={`bg-blue-600 border-r border-blue-700 min-h-[calc(100vh-64px)] ${
        isOpen ? "w-64" : "w-16"
      } transition-width duration-200 flex flex-col`}
    >
      {/* Header */}
      <div className={`p-4 border-b border-blue-500 ${isOpen ? "" : "flex justify-center"}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-blue-500 text-white hover:text-blue-100 transition-colors"
          aria-label={isOpen ? "Thu gọn menu" : "Mở rộng menu"}
          title={isOpen ? "Thu gọn menu" : "Mở rộng menu"}
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        {isOpen && (
          <div className="ml-3">
            <h2 className="text-sm font-semibold text-white">Menu</h2>
            <p className="text-xs text-blue-200">Quản lý học tập</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarItems.map((item, index) => {
          const hasChildren = item.children && isOpen;
          const isActive = isParentActive(item);
          const isExpanded = expandedItems[index];

          return (
            <div key={index}>
              {/* Main Item */}              {hasChildren ? (
                <button
                  onClick={() => toggleItem(index)}
                  className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg group transition-colors ${
                    isActive
                      ? "bg-blue-500 text-white border border-blue-400"
                      : "text-blue-100 hover:bg-blue-500 hover:text-white"
                  }`}
                  title={!isOpen ? item.name : ""}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    {createElement(item.icon, { 
                      className: `w-5 h-5 flex-shrink-0 ${
                        isActive ? "text-white" : "text-blue-200 group-hover:text-white"
                      }` 
                    })}
                    {isOpen && (
                      <span className="ml-3 text-sm font-medium truncate">
                        {item.name}
                      </span>
                    )}
                  </div>                  {isOpen && (
                    <div className="ml-auto">
                      {createElement(
                        isExpanded ? KeyboardArrowDownIcon : KeyboardArrowRightIcon,
                        { 
                          className: `w-4 h-4 transition-transform ${
                            isActive ? "text-white" : "text-blue-200"
                          }` 
                        }
                      )}
                    </div>
                  )}
                </button>
              ) : (                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg group transition-colors ${
                      isActive
                        ? "bg-blue-500 text-white border border-blue-400"
                        : "text-blue-100 hover:bg-blue-500 hover:text-white"
                    }`
                  }
                  title={!isOpen ? item.name : ""}
                >
                  {createElement(item.icon, { 
                    className: `w-5 h-5 flex-shrink-0 ${
                      isActive ? "text-white" : "text-blue-200 group-hover:text-white"
                    }` 
                  })}
                  {isOpen && (
                    <span className="ml-3 text-sm font-medium truncate">
                      {item.name}
                    </span>
                  )}
                </NavLink>
              )}

              {/* Sub Items */}
              {hasChildren && isExpanded && (
                <div className="mt-1 ml-4 space-y-1">
                  {item.children!.map((child, childIndex) => (                    <NavLink
                      key={childIndex}
                      to={child.to}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive
                            ? "bg-blue-400 text-white font-medium"
                            : "text-blue-200 hover:bg-blue-500 hover:text-white"
                        }`
                      }
                    >
                      <div className="w-1.5 h-1.5 bg-blue-300 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="truncate">{child.name}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>      {/* Footer */}
      {isOpen && (
        <div className="p-4 border-t border-blue-500">
          <div className="text-xs text-blue-200 text-center">
            <p>Learning Management</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      )}
    </aside>
  );
}