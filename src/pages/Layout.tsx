import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Header />
      <div className="flex gap-3">
        <Sidebar />
        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </>
  );
};
export default Layout;
