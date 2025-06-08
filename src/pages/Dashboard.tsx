import { Gauge, gaugeClasses } from "@mui/x-charts";
import { LineChart } from "@mui/x-charts";
import { useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import type { DiemTBTichLuy } from "../types/DiemTBTichLuy";
import GridColumn from "../components/GridCollum";

const Dashboard = () => {


  const [loading, setLoading] = useState<boolean>(true);
  // Simulate loading state
  setTimeout(() => {
    setLoading(false);
  }, 1000); // Giả lập thời gian tải dữ liệu 2 giây

//   Call API
  const diemTBTichLuy: DiemTBTichLuy[] = [
    { hocKy: "HK1", namHoc: "2021-2022", diemTB: 3.1 },
    { hocKy: "HK2", namHoc: "2021-2022", diemTB: 3.3 },
    { hocKy: "HK1", namHoc: "2022-2023", diemTB: 2.9 },
    { hocKy: "HK2", namHoc: "2022-2023", diemTB: 3.0 },
    { hocKy: "HK1", namHoc: "2023-2024", diemTB: 3.1 },
    { hocKy: "HK2", namHoc: "2023-2024", diemTB: 3.1 },
    { hocKy: "HK1", namHoc: "2024-2025", diemTB: 3.1 },
  ];



  if(loading) {
    return <Loading />;
  }

  return (
    <div className="grid grid-cols-4 p-4 m-5 gap-4">
      <div className="relative line-chart col-span-3 bg-gray-50 rounded-lg shadow-md">
        <Link to="/kqht" className="absolute top-2 right-2 text-blue-600 hover:underline">
          Xem chi tiết
        </Link>
        <LineChart
          xAxis={[
            {
              scaleType: "band",
              // Chuyển đổi dữ liệu xAxis thành chuỗi "Học Kỳ - Năm Học"
              data: diemTBTichLuy.map(
                (item) => `${item.hocKy} - ${item.namHoc}`
              ),
              label: "Học Kỳ - Năm Học",
            },
          ]}
          yAxis={[{ label: "Điểm Trung Bình Tích Lũy", min: 0, max: 4 }]}
          series={[
            {
              data: diemTBTichLuy.map((item) => item.diemTB),
              label: "Điểm TB Tích Lũy",
              color: "#1976d2", // Màu xanh đậm của Material UI
              area: true,
            },
          ]}
          height={300} // Tăng chiều cao để dễ nhìn hơn
          margin={{ top: 20, bottom: 60, left: 60, right: 20 }} // Thêm lề
          grid={{ vertical: false, horizontal: true }} // Thêm lưới ngang
        />
      </div>
      <div className="gauge-chart col-span-1 bg-gray-50 flex flex-col items-center justify-center rounded-lg shadow-md">
        <Gauge
          width={200}
          height={200}
          valueMax={4}
          startAngle={-110}
          endAngle={110}
          value={3.1}
          sx={(theme) => ({
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 30,
            },
            [`& .${gaugeClasses.valueArc}`]: {
              fill: "#52b202",
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: theme.palette.text.disabled,
            },
          })}
          text={({ value, valueMax }) => `${value} / ${valueMax}`}
        />
        <span className="text-lg">Điểm Trung Bình Tích Luỹ</span>
      </div>
        <GridColumn className="bg-green-300 col-span-1 mt-2 h-24 rounded-lg shadow-md p-4 " value="50" name="Số tính chỉ tích luỹ"/>
        <GridColumn className="bg-yellow-400 col-span-1 mt-2 h-24 rounded-lg shadow-md p-4 " value="105" name="Số tính chỉ còn lại" />
        <GridColumn className="bg-red-400 col-span-1 mt-2 h-24 rounded-lg shadow-md p-4 " value="5" name="Số tính chỉ cần cải thiện" />
        <GridColumn className="bg-lime-600 col-span-1 mt-2 h-24 rounded-lg shadow-md p-4 " value="1" name="Số tín chỉ đã cải thiện" />
    </div>
  );
};
export default Dashboard;
