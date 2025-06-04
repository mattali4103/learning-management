
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Link } from "react-router-dom";
import { createElement, useState } from "react";
interface SidebarItem {
  name: string;
  icon: React.ElementType;
  to: string;
  active?: boolean;
}

export default function Sidebar() {
  const sidebarItems: SidebarItem[] = [
    { name: "My Dashboard", icon: DashboardIcon, to: "/" },
    { name: "My Home", icon: DashboardIcon , to: "/" },
    { name: "My Dashboard", icon: DashboardIcon, to: "/" },
  ];

  const [open, setOpen] = useState(true);



  return(
    <div className={`bg-[#0D47A1] min-h-screen mb-1 text-gray-100 duration-500 px-4 ${open ? "w-72" : "w-16"}`}>
      <div className="py-3 flex justify-end">
        <MenuIcon className="w-6 h-6 cursor-pointer" onClick={() => setOpen(!open)}/>
      </div>
      <div>
        {sidebarItems.map((item, index) => (
          <Link
            key={index}
            to={item.to}
            className={`flex items-center gap-2 p-2 rounded-md}`}
            >
            <div>{createElement(item.icon, {className : "text-white w-6 h-6"})}</div>
            <span className={`whitespace-pre duration-500 ${!open && "opacity-0 translate-x-28 overflow-hidden"}`}>{item.name}</span>
            </Link>
        ))}
      </div>
    </div>
  )
}
