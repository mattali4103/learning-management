import { Gauge, gaugeClasses } from "@mui/x-charts";
import { LineChart } from "@mui/x-charts";
const Dashboard = () => {
  interface DiemTBTichLuy {
    hocKy: string;
    namHoc: string;
    diemTB: number;
  }
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

  interface GridColumnProps {
    value: React.ReactNode;
    name: React.ReactNode;
    className?: string;
  }

  const GridColumn: React.FC<GridColumnProps> = ({ value, name, className }) => (
    <div className={`col-span-1 mt-2 h-24 bg-gray-50 rounded-lg shadow-md p-4 ${className}`}>
      <div className="text-2xl mb-2">{value}</div>
      <span>{name}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-4 p-4 m-5 gap-4">
      <div className="line-chart col-span-3 bg-gray-50 rounded-lg shadow-md">
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
        <GridColumn className="bg-green-300" value="50" name="Số tính chỉ tích luỹ"/>
        <GridColumn className="bg-yellow-400" value="105" name="Số tính chỉ còn lại" />
        <GridColumn className="bg-red-400" value="5" name="Số tính chỉ cần cải thiện" />
        <GridColumn className="bg-lime-600" value="1" name="Số tín chỉ đã cải thiện" />
    </div>
  );
};
export default Dashboard;
