import { useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import GridColumn from "../components/GridCollum";
import AreaChartComponent from "../components/chart/Area";
import { diemTBTichLuyData, namHocData } from "../types/utils";

const Dashboard = () => {
  const [loading, setLoading] = useState<boolean>(true);
  // Simulate loading state
  setTimeout(() => {
    setLoading(false);
  }, 1000); // Giả lập thời gian tải dữ liệu 2 giây

  //   Call API

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="grid grid-cols-4 p-4 m-5 gap-4">
      <div className="relative line-chart col-span-4 bg-white rounded-lg shadow-md p-4">  
        <p className="uppercase font-bold text-lg text-center">Điểm trung bình tích luỹ</p>
        <Link
          to="/kqht"
          className="absolute top-2 right-2 text-blue-600 hover:underline"
        >
          Xem chi tiết
        </Link>
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
