import React from "react";
import { Link } from "react-router-dom";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ErrorMesssageModal from "./modals/ErrorMessageModal";


interface SidebarProps {
  name?: string;
  icon?: string;
  to?: string;
}

const SidebarItems: SidebarProps[] = [
  { name: "Tổng quan", icon: "DashboardIcon", to: "/dashboard" },
];


const SidebarItem: React.FC<SidebarProps> = ({ name, icon, to }) => {
return (
    <li>
      <Link
        to={to || "#"}
        className="flex items-center py-2.5 px-4 text-base font-normal text-dark-500 rounded-lg hover:bg-gray-200 bg-white shadow-lg shadow-gray-200 group transition-all duration-200"
      >
        <span className="inline-flex items-center justify-center w-6 h-6 text-gray-500">
          {icon === "DashboardIcon" ? (
            <DashboardIcon />
          ) : (
            <></>
          )}
        </span>
        <span className="flex-1 ml-3 whitespace-nowrap text-dark-500 text-sm font-light">{name}</span>
      </Link>
    </li>
  );
};

const Sidebar = () => {
  return (
    <>
      <aside
        id="sidebar"
        className="flex fixed top-0 left-0 z-20 flex-col flex-shrink-0 pt-16 w-64 h-full duration-200 lg:flex transition-width"
        aria-label="Sidebar"
      >
        <div className="flex relative flex-col flex-1 pt-0 min-h-0 bg-gray-50">
          <div className="flex overflow-y-auto flex-col flex-1 pt-8 pb-4">
            <div className="flex-1 px-3 bg-gray-50" id="sidebar-items">
              <ul className="pb-2 pt-1">
                {SidebarItems.map((item, index) => (
                  <SidebarItem
                    key={index}
                    name={item.name}
                    icon={item.icon}
                    to={item.to}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </aside>
      <ErrorMesssageModal
        isOpen={true} // This should be controlled by your application state
        message={"test message"} // This should be controlled by your application state

      />
    </>
  );
};
export default Sidebar;
