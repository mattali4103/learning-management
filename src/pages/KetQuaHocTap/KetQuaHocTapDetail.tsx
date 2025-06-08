import { useEffect, useState } from "react";
import { hocKy, ketQuaHocTapData, namHocData } from "../../types/utils";
import type { NamHoc } from "../../types/namHoc";
import DataGridComponent from "../../components/table/DataGrid";


const yearTab = [
  { label: "Tất cả", index: 0 },
  ...namHocData.map((item: NamHoc) => ({
    label: `${item.namBatDau} - ${item.namKetThuc}`,
    index: item.id,
  })),
];



const hocKyTab = [
  { label: "Tất cả", index: 0, namHocId: null },
  ...hocKy.map((item) => ({
    label: item.tenHocky,
    index: item.id,
    namHocId: item.namHocId,
  })),
];

const hocKyData = ketQuaHocTapData.map((item) => ({
  id: item.id,
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

//   // Lọc dữ liệu theo năm học

export default function KetQuaHocTapDetail() {
  const [yearTabIndex, setYearTabIndex] = useState<number>(
    yearTab[yearTab.length - 1].index
  );

  const handleTabChange = (index: number) => {
    setYearTabIndex(index);
  };

  return (
    <>
      <div className="flex gap-2  items-center justify-center">
        {yearTab.map((tab) => (
          <button
            key={tab.index}
            className={`px-4 py-2 mt-2 text-sm font-medium rounded-lg ${yearTabIndex === tab.index ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-blue-100"}`}
            onClick={() => handleTabChange(tab.index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {yearTabIndex !== 0 && (
          <NamHocTabComponent yearTabIndex={yearTabIndex} />
        )}
        {yearTabIndex === 0 && (
          <div className="p-4 bg-white rounded-lg shadow-md">
            {/* Nội dung chi tiết kết quả học tập */}
            <h2 className="text-xl font-bold mb-4 text-center uppercase">
              Kết Quả Học Tập
            </h2>
            <DataGridComponent dataRows={hocKyData} />
          </div>
        )}
      </div>
    </>
  );
}

interface NamHocTabComponentProps {
  yearTabIndex: number;
}

const NamHocTabComponent: React.FC<NamHocTabComponentProps> = ({
  yearTabIndex,
}) => {
  const [hocKyTabIndex, setHocKyTabIndex] = useState<number>(0);
  const handleHocKyTabChange = (index: number) => {
    setHocKyTabIndex(index);
  };
  useEffect(() => {
    setHocKyTabIndex(0);
  }, [yearTabIndex]);
  return (
    <>
      <div className="flex gap-2 my-2 items-center justify-center">
        {hocKyTab
          .filter((item) => item.namHocId === yearTabIndex || item.index === 0)
          .map((tab) => (
            <button
              key={tab.index}
              className={`px-4 py-2 m-2 text-sm font-medium rounded-lg ${hocKyTabIndex === tab.index ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-blue-100"}`}
              onClick={() => handleHocKyTabChange(tab.index)}
            >
              {tab.label}
            </button>
          ))}
      </div>
      <div className="p-4 bg-white rounded-lg shadow-md">
        {hocKyTabIndex === 0 && (
          <DataGridComponent
            dataRows={hocKyData
              .filter((item) => item.namHoc.id === yearTabIndex)
              .map((item) => ({
                id: item.id,
                maHp: item.maHp,
                tenHp: item.tenHp,
                dieuKien: item.dieuKien,
                nhomHp: item.nhomHp,
                soTinChi: item.soTinChi,
                diemChu: item.diemChu,
                diemSo: item.diemSo,
                hocKy: item.hocKy,
                namHoc: item.namHoc,
              }))}
          />
        )}
        {hocKyTabIndex !== 0 && (
          <DataGridComponent
            dataRows={ketQuaHocTapData
              .filter(
                (item) =>
                  item.namHoc.id === yearTabIndex &&
                  item.hocKy.id === hocKyTabIndex
              )
              .map((item) => ({
                id: item.id,
                maHp: item.maHp,
                tenHp: item.tenHp,
                dieuKien: item.dieuKien,
                nhomHp: item.nhomHp,
                soTinChi: item.soTinChi,
                diemChu: item.diemChu,
                diemSo: item.diemSo,
                hocKy: item.hocKy,
                namHoc: item.namHoc,
              }))}
          />
        )}
      </div>
    </>
  );
};
