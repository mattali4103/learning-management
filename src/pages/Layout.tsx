import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../hooks/SidebarContext";

const Layout = () => {
  return (
    <SidebarProvider>
      <div className="relative bg-gray-200">
        <Header />
        <div className="flex min-h-[calc(100vh-64px)]">
          <Sidebar />
          <main className="w-full relative overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
export default Layout;
