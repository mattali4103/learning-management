import { useState } from "react";
import Loading from "../components/Loading";
import type { HocKy } from "../types/hocKy";
import type { NamHoc } from "../types/namHoc";

import AreaChartComponent from "../components/chart/Area";
import { diemTBTichLuyData, ketQuaHocTapData} from "../types/utils";
import DataGridComponent from "../components/table/DataGrid";
interface Tab {
  index: number;
  label: string;
}

export interface KetQuaHocTapTableProps {
  id: number;
  maHp: string;
  tenHp: string;
  dieuKien: boolean;
  nhomHp: string;
  soTinChi: number;
  diemChu: string;
  diemSo: number;
  hocKy: HocKy;
  namHoc: NamHoc;
}



export default function KetQuaHocTap() {
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState<number>(1);

  const tabs: Tab[] = [
    { index: 1, label: "Tất cả" },
    { index: 2, label: "Năm học" },
    { index: 3, label: "Học kỳ" },
  ];

  // Simulate loading state
  setTimeout(() => {
    setLoading(false);
  }, 1000);

  if (loading) return <Loading />;
  return (
    <>
      <div className="flex gap-2 my-4 items-center justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.index}
            className={`p-2 rounded-2xl font-semibold shadow-2xl ${tabIndex === tab.index ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-800"}`}
            onClick={() => setTabIndex(tab.index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="">
        {tabIndex === 1 && <KetQuaHocTapAll />}
        {tabIndex === 2 && <KetQuaHocTapByYear />}
        {tabIndex === 3 && <KetQuaHocTapByHocKy />}
      </div>
    </>
  );
}

const KetQuaHocTapAll: React.FC = () => {
  const data = diemTBTichLuyData.map((item) => ({
    name: `${item.hocKy} - ${item.namHoc}`,
    diem: item.diemTB,
  }));

const rows: KetQuaHocTapTableProps[] = ketQuaHocTapData.map((item, index) => ({
  id: index + 1,
  maHp: item.maHp,
  tenHp: item.tenHp,
  dieuKien: item.dieuKien,
  nhomHp: item.nhomHp,
  soTinChi: item.soTinChi,
  diemChu: item.diemChu,
  diemSo: item.diemSo,
  hocKy: item.hocKy,
  namHoc: item.namHoc,
}));

  return (
    <>
      <AreaChartComponent data={data} tableName="Điểm Trung Bình Tích Lũy" />
      <div className="p-4 bg-gray-50 font-medium text-gray-700 rounded-lg shadow-md m-5">
        <DataGridComponent dataRows={rows}/>
      </div>
    </>
  );
};
const KetQuaHocTapByYear: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(1);
  const data = diemTBTichLuyData
    .filter((item) => item.diemTB !== null)
    .map((item) => ({
      name: item.hocKy,
      namHoc: item.namHoc,
      hocKy: item.hocKy,
      diem: item.diemTB,
    }));
  const namHocTab: Tab[] = [
    { index: 1, label: "2021-2022" },
    { index: 2, label: "2022-2023" },
    { index: 3, label: "2023-2024" },
  ];

  const rows: KetQuaHocTapTableProps[] = ketQuaHocTapData
    .filter((item) => item.namHoc.namBatDau === "2021" && item.namHoc.namKetThuc ==="2022")
    .map((item, index) => ({
      id: index + 1,
      maHp: item.maHp,
      tenHp: item.tenHp,
      dieuKien: item.dieuKien,
      nhomHp: item.nhomHp,
      soTinChi: item.soTinChi,
      diemChu: item.diemChu,
      diemSo: item.diemSo,
      hocKy: item.hocKy,
      namHoc: item.namHoc,
    }));

  return (
    <>
      <div>
        <div className="flex gap-2 my-4 items-center justify-center">
          {namHocTab.map((tab) => (
            <button
              key={tab.index}
              className={`p-1.5 rounded-2xl font-semibold shadow-2xl ${tabIndex === tab.index ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => setTabIndex(tab.index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        {tabIndex === 1 && (
          <>
            <AreaChartComponent
              data={data.filter((item) => item.namHoc?.includes("2021-2022"))}
              tableName="Điểm Trung Bình Tích Lũy"
            />
            <div className="p-4 bg-gray-50 font-medium text-gray-700 rounded-lg shadow-md m-5">
              <DataGridComponent dataRows={rows}/>
            </div>
          </>
        )}
        {tabIndex === 2 && (
          <AreaChartComponent
            data={data.filter((item) => item.namHoc?.includes("2022-2023"))}
            tableName="Điểm Trung Bình Tích Lũy"
          />
        )}
        {tabIndex === 3 && (
          <AreaChartComponent
            data={data.filter((item) => item.namHoc?.includes("2023-2024"))}
            tableName="Điểm Trung Bình Tích Luỹ"
          />
        )}
      </div>
    </>
  );
};
const KetQuaHocTapByHocKy: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(1);
  const hocKyTab: Tab[] = [
    { index: 1, label: "Học Kỳ 1" },
    { index: 2, label: "Học Kỳ 2" },
    { index: 3, label: "Học Kỳ 3" },
  ];
  return (
    <>
      <div>
        <div className="flex gap-2 my-4 items-center justify-center">
          {hocKyTab.map((tab) => (
            <button
              key={tab.index}
              className={`p-1.5 rounded-2xl font-semibold shadow-2xl ${tabIndex === tab.index ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-800"}`}
              onClick={() => setTabIndex(tab.index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        {tabIndex === 1 && (
          <AreaChartComponent
            data={diemTBTichLuyData
              .filter((item) => item.hocKy === "HK1")
              .map((item) => ({
                name: `${item.hocKy} - ${item.namHoc}`,
                diem: item.diemTB,
              }))}
            tableName="Điểm Trung Bình Tích Lũy "
          />
        )}
        {tabIndex === 2 && (
          <AreaChartComponent
            data={diemTBTichLuyData
              .filter((item) => item.hocKy === "HK2")
              .map((item) => ({
                name: `${item.hocKy} - ${item.namHoc}`,
                diem: item.diemTB,
              }))}
            tableName="Điểm Trung Bình Tích Lũy"
          />
        )}
        {tabIndex === 3 && (
          <AreaChartComponent
            data={diemTBTichLuyData
              .filter((item) => item.hocKy === "HK3")
              .map((item) => ({
                name: `${item.hocKy} - ${item.namHoc}`,
                diem: item.diemTB,
              }))}
            tableName="Điểm Trung Bình Tích Lũy"
          />
        )}
      </div>
    </>
  );
};
