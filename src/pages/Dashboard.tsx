import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import GridColumn from "../components/GridCollum";
import AreaChartComponent from "../components/chart/Area";
import { diemTBTichLuyData, namHocData } from "../types/utils";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { PROFILE_SERVICE } from "../api/apiEndPoints";

interface UserInfo {
  maSo: string;
  hoTen: string;
  maLop: string;
  khoaHoc: string;
  tenNganh: string;
}
const Dashboard = () => {
  // Custom hook to handle private axios requests
  const axiosPrivate = useAxiosPrivate();
  // State to manage user information and loading/error states
  const [error, setError] = useState<string | null>(null);
  // State to hold user information
  const [useInfo, setUserInfo] = useState<UserInfo | null>(null);
  // Get user info from auth context
  const { auth } = useAuth();
  // Function to fetch user information
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(
        PROFILE_SERVICE.GET_MY_PROFILE.replace(":maSo", auth.user?.maSo || ""),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          withCredentials: true,
        }
      );
      if (response.data) {
        const userInfo: UserInfo = response.data.data;
        setUserInfo(userInfo);
        console.log("User Info:", userInfo);
      }
    } catch (error) {
      setError("Không thể lấy thông tin người dùng. Vui lòng thử lại.");
      console.error("Error fetching user info:", error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch user information when the component mounts
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // State to manage loading state
  const [loading, setLoading] = useState<boolean>(true);
  if (loading) {
    return <Loading />;
  }
  // If there's an error, display it
  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 grid-rows-2 p-4 m-5 gap-4">
      <div className="col-span-2 row-span-2 bg-gray-50">
        <h2 className="text-center text-lg p-3 uppercase font-bold">
          Thông tin sinh viên
        </h2>
        <div className="grid gap-4 p-4">
          <div className="grid grid-cols-4 justify-center content-center border-y-gray-400 border-b-1">
            <span className="p-2 mb-1.5 bg-gray-200">Mã số sinh viên:</span>
            <p className="font-semibold p-2 mb-1 col-span-3">{useInfo?.maSo}</p>
          </div>
          <div className="grid grid-cols-4 justify-center content-center border-y-gray-400 border-b-1">
            <span className="p-2 mb-1.5 bg-gray-200">Họ và tên:</span>
            <p className="font-semibold p-2 mb-1 col-span-3">{useInfo?.hoTen}</p>
            <p>{useInfo?.hoTen}</p>
          </div>
          <div className="grid grid-cols-4 justify-center content-center border-y-gray-400 border-b-1">
            <span className="p-2 mb-1.5 bg-gray-200">Lớp</span>
            <p className="font-semibold p-2 mb-1 col-span-3">{useInfo?.maLop}</p>
          </div>
          <div className="grid grid-cols-4 justify-center content-center border-y-gray-400 border-b-1">
            <span className="p-2 mb-1.5 bg-gray-200">Khóa học:</span>
            <p className="font-semibold p-2 mb-1 col-span-3">{useInfo?.khoaHoc}</p>
          </div>
          <div className="grid grid-cols-4 justify-center content-center border-y-gray-400 border-b-1">
            <span className="p-2 mb-1.5 bg-gray-200">Ngành học:</span>
            <p className="font-semibold p-2 mb-1 col-span-3">{useInfo?.tenNganh}</p>
          </div>
        </div>
      </div>
      <div className="relative col-span-1 row-span-1 bg-gray-50 rounded-lg shadow-md p-1.5">
          
      </div>
      <div className="relative col-span-1 row-span-1 bg-gray-50 rounded-lg shadow-md p-1.5">

      </div>
      <div className="relative col-span-2 row-span-1 bg-gray-50 rounded-lg shadow-md p-1.5">
        <p className="uppercase font-bold text-lg text-center">
          Điểm trung bình tích luỹ
        </p>
        <AreaChartComponent
          data={diemTBTichLuyData.map((item) => ({
            name: `${item.hocKy.tenHocky} - ${namHocData.find((namHoc) => namHoc.id === item.hocKy.namHocId)?.namBatDau} - ${namHocData.find((namHoc) => namHoc.id === item.hocKy.namHocId)?.namKetThuc}`,
            diem: item.diemTB,
          }))}
          tableName=""
        />
      </div>
      <GridColumn
        className="bg-green-300 col-span-1 mt-2 h-24 rounded-lg shadow-md p-4 "
        value="50"
        name="Số tính chỉ tích luỹ"
      />
      <GridColumn
        className="bg-yellow-400 col-span-1 mt-2 h-24 rounded-lg shadow-md p-4 "
        value="105"
        name="Số tính chỉ còn lại"
      />
      <GridColumn
        className="bg-red-400 col-span-1 mt-2 h-24 rounded-lg shadow-md p-4 "
        value="5"
        name="Số tính chỉ cần cải thiện"
      />
      <GridColumn
        className="bg-lime-600 col-span-1 mt-2 h-24 rounded-lg shadow-md p-4 "
        value="1"
        name="Số tín chỉ đã cải thiện"
      />
    </div>
  );
};
export default Dashboard;
