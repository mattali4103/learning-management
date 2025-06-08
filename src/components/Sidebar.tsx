import { NavLink } from "react-router-dom";
import { createElement, useState } from "react";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ClassIcon from "@mui/icons-material/Class";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface SidebarItem {
  name: string;
  icon: React.ElementType;
  to: string;
  children?: { name: string; to: string }[];
}

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>(
    {}
  );
  const sidebarItems: SidebarItem[] = [
    { name: "Tổng Quan", icon: DashboardIcon, to: "/" },
    {
      name: "Kế Hoạch Học Tập",
      icon: MenuBookIcon,
      to: "/khht",
      children: [
        { name: "Xem kế hoạch học tập", to: "/khht/sinhvien" },
        { name: "Nhập kế hoạch học tập ", to: "/khht/add" },
      ],
    },
    { name: "Kết Quả Học Tập", icon: ClassIcon, to: "/kqht", children: [
      { name: "Tổng quan", to: "/kqht/chung" },
      { name: "Xem chi tiết", to: "/kqht/chitiet" },
    ]
    },
  ];

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div
      className={`bg-[#0D47A1] min-h-screen text-gray-100 duration-500 px-4 ${
        open ? "w-72" : "w-16"
      }`}
    >
      <div className="py-3 flex justify-end">
        <MenuIcon
          className="w-6 h-6 cursor-pointer text-white"
          onClick={() => setOpen(!open)}
        />
      </div>
      <div className="space-y-2">
        {sidebarItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            onClick={(e) => {
              if (open) {
                e.preventDefault();
                toggleItem(index);
              }
            }}
            className={({ isActive }) =>
              `block p-2 rounded-lg transition-colors duration-300 ${
                isActive ? "bg-blue-900 shadow-md" : "hover:bg-blue-800"
              }`
            }
          >
            <div className="flex items-center gap-3">
              {createElement(item.icon, { className: "text-white w-6 h-6" })}
              <div className="flex items-center gap-2 flex-1">
                <span
                  className={`text-base font-medium truncate ${
                    !open ? "hidden" : "block"
                  }`}
                >
                  {item.name}
                </span>
                {item.children && open && (
                  <button
                    className="p-1 rounded-md transition-colors duration-200"
                  >
                    {createElement(
                      expandedItems[index] ? ExpandLessIcon : ExpandMoreIcon,
                      { className: "text-white w-5 h-5" }
                    )}
                  </button>
                )}
              </div>
            </div>
            {item.children && open && expandedItems[index] && (
              <div className="ml-6 mt-1 space-y-1 animate-slide-down">
                {item.children.map((child, childIndex) => (
                  <NavLink
                    key={childIndex}
                    to={child.to}
                    className={({ isActive }) =>
                      `block pl-4 py-1 rounded-md text-sm text-gray-300 transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-700 text-white font-semibold"
                          : "hover:bg-blue-800 hover:text-white"
                      }`
                    }
                  >
                    {child.name}
                  </NavLink>
                 
                ))}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}