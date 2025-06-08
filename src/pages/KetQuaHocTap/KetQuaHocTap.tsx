import { useState } from "react";
import Loading from "../../components/Loading";
import type { HocKy } from "../../types/hocKy";
import type { NamHoc } from "../../types/namHoc";

import AreaChartComponent from "../../components/chart/Area";
import {
  diemTBTichLuyData,
  ketQuaHocTapData,
  namHocData,
} from "../../types/utils";

import CustomPieChart from "../../components/chart/CustomPieChart";

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

const yearTab = [
  { label: "Tất cả", index: 0 },
  ...namHocData.map((item: NamHoc) => ({
    label: `${item.namBatDau} - ${item.namKetThuc}`,
    index: item.id,
  })),
];

export default function KetQuaHocTap() {
  const [loading, setLoading] = useState(true);
  const [yearTabIndex, setYearTabIndex] = useState<number>(0);
  setTimeout(() => {
    setLoading(false);
  }, 1000);
  if (loading) return <Loading />;
  return (
    <>
      <div className="flex gap-2 my-4 items-center justify-center">
        {yearTab.map((tab) => (
          <button
            key={tab.index}
            className={`px-4 py-2 mt-2 text-sm font-medium rounded-lg ${yearTabIndex === tab.index ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-blue-100"}`}
            onClick={() => setYearTabIndex(tab.index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="">
        {yearTabIndex === 0 && <KetQuaHocTapAll />}
        {yearTabIndex !== 0 && (
          <div className="">
            <KetQuaHocTapByYear yearTabIndex={yearTabIndex} />
          </div>
        )}
      </div>
    </>
  );
}

const KetQuaHocTapAll: React.FC = () => {
  const data = diemTBTichLuyData.map((item) => ({
    name: `${item.hocKy.tenHocky} - ${namHocData.find((namHoc) => namHoc.id === item.hocKy.namHocId)?.namBatDau} - ${namHocData.find((namHoc) => namHoc.id === item.hocKy.namHocId)?.namKetThuc}`,
    diem: item.diemTB,
  }));

  const sortedKetQuaHocTap = [...ketQuaHocTapData].sort(
    (a, b) => a.diemSo - b.diemSo
  );
  const ketQuaHocTapSortedAndFiltered = sortedKetQuaHocTap.filter(
    (item) => item.diemSo !== 0 && item.diemSo !== undefined
  );
  return (
    <>
      <AreaChartComponent data={data} tableName="Điểm Trung Bình Tích Lũy" />
      <div className="flex gap-2 flex-wrap p-2 m-5">
        <div className="p-4 bg-gray-100 font-medium text-gray-700 rounded-lg shadow-md md:w-165 w-full">
          <CustomPieChart rowData={ketQuaHocTapData} />
        </div>
        <div className="font-medium  text-gray-700 rounded-lg shadow-md md:w-1/4 w-full flex flex-col content-center justify-items-center gap-4">
          <div className="h-1/2 bg-green-300 p-2 flex justify-center rounded-md flex-col ">
            <p className="font-semibold text-2xl text-center">
              Số Tín Chỉ Tích Luỹ
            </p>
            <p className="grade text-6xl text-center mt-2">150</p>
            <p className="text-xl text-center mt-2">Bạn đang đúng tiến độ</p>
          </div>
          <div className="h-1/2 bg-green-300 p-2 flex justify-center rounded-md flex-col ">
            <p className="font-semibold text-2xl text-center">
              Điểm Trung Bình Tích Luỹ
            </p>
            <p className="grade text-6xl text-center mt-2">3.2</p>
            <p className="text-xl text-center mt-2">Xếp loại: Giỏi!</p>
          </div>
        </div>
        <div className="p-4 bg-yellow-200 font-medium text-gray-700 rounded-lg shadow-md md:w-1/4 w-full ">
          <p className="font-semibold text-lg text-center mb-2">
            Gợi ý cải thiện điểm
          </p>
          {ketQuaHocTapSortedAndFiltered.length > 0 && (
            <ul className="">
              {ketQuaHocTapSortedAndFiltered.slice(0, 5).map((item) => (
                <li key={item.id} className="mb-2 p-2 bg-[#FFA500] rounded-md">
                  <span className="font-semibold">{item.tenHp}</span> - Điểm số:{" "}
                  {item.diemChu}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};
interface KetQuaHocTapByYearProps {
  yearTabIndex: number;
}
const KetQuaHocTapByYear: React.FC<KetQuaHocTapByYearProps> = ({
  yearTabIndex,
}) => {

  const filteredKetQuaHocTapData = ketQuaHocTapData.filter(
    (item) => item.namHoc.id === yearTabIndex); 

  const sortedKetQuaHocTap = [...filteredKetQuaHocTapData].sort(
    (a, b) => a.diemSo - b.diemSo
  );
  const ketQuaHocTapSortedAndFiltered = sortedKetQuaHocTap.filter(
    (item) => item.diemSo !== 0 && item.diemSo !== undefined
  );
  return (
    <>
      <div>
        <AreaChartComponent
          data={diemTBTichLuyData
            .filter((item) => item.hocKy.namHocId === yearTabIndex)
            .map((item) => ({
              name: `${item.hocKy.tenHocky} - ${namHocData.find((namHoc) => namHoc.id === item.hocKy.namHocId)?.namBatDau} - ${namHocData.find((namHoc) => namHoc.id === item.hocKy.namHocId)?.namKetThuc}`,
              diem: item.diemTB,
            }))}
          tableName="Điểm Trung Bình Tích Lũy"
        />
        <div className="flex gap-2 flex-wrap p-2 m-5">
          <div className="p-4 bg-gray-100 font-medium text-gray-700 rounded-lg shadow-md md:w-165 w-full">
            <CustomPieChart rowData={filteredKetQuaHocTapData} />
          </div>
          <div className="font-medium  text-gray-700 rounded-lg shadow-md md:w-1/4 w-full flex flex-col content-center justify-items-center gap-4">
            <div className="h-1/2 bg-green-300 p-2 flex justify-center rounded-md flex-col ">
              <p className="font-semibold text-2xl text-center">
                Số Tín Chỉ Tích Luỹ
              </p>
              <p className="grade text-6xl text-center mt-2">150</p>
              <p className="text-xl text-center mt-2">Bạn đang đúng tiến độ</p>
            </div>
            <div className="h-1/2 bg-green-300 p-2 flex justify-center rounded-md flex-col ">
              <p className="font-semibold text-2xl text-center">
                Điểm Trung Bình Tích Luỹ
              </p>
              <p className="grade text-6xl text-center mt-2">3.2</p>
              <p className="text-xl text-center mt-2">Xếp loại: Giỏi!</p>
            </div>
          </div>
          <div className="p-4 bg-yellow-200 font-medium text-gray-700 rounded-lg shadow-md md:w-1/4 w-full ">
            <p className="font-semibold text-lg text-center mb-2">
              Gợi ý cải thiện điểm
            </p>
            {ketQuaHocTapSortedAndFiltered.length > 0 && (
              <ul className="">
                {ketQuaHocTapSortedAndFiltered.slice(0, 5).map((item) => (
                  <li
                    key={item.id}
                    className="mb-2 p-2 bg-[#FFA500] rounded-md"
                  >
                    <span className="font-semibold">{item.tenHp}</span> - Điểm
                    số: {item.diemChu}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

//   const [tabIndex, setTabIndex] = useState<number>(1);
//   return (
//     <>
//       <div>
//         <div className="flex gap-2 my-4 items-center justify-center">
//           {hocKyTab.map((tab) => (
//             <button
//               key={tab.index}
//               className={`p-1.5 rounded-2xl font-semibold shadow-2xl ${tabIndex === tab.index ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-800"}`}
//               onClick={() => setTabIndex(tab.index)}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>
//       </div>
//       <div>
//         {tabIndex === 1 && (
//           <>
//             <AreaChartComponent
//               data={diemTBTichLuyData
//                 .filter((item) => item.hocKy === "HK1")
//                 .map((item) => ({
//                   name: `${item.hocKy} - ${item.namHoc}`,
//                   diem: item.diemTB,
//                 }))}
//               tableName="Điểm Trung Bình Tích Lũy "
//             />
//           </>
//         )}
//         {tabIndex === 2 && (
//           <>
//             <AreaChartComponent
//               data={diemTBTichLuyData
//                 .filter((item) => item.hocKy === "HK2")
//                 .map((item) => ({
//                   name: `${item.hocKy} - ${item.namHoc}`,
//                   diem: item.diemTB,
//                 }))}
//               tableName="Điểm Trung Bình Tích Lũy"
//             />
//             <div className="p-4 bg-gray-50 font-medium text-gray-700 rounded-lg shadow-md m-5"></div>
//           </>
//         )}
//         {tabIndex === 3 && (
//           <>
//             <AreaChartComponent
//               data={diemTBTichLuyData
//                 .filter((item) => item.hocKy === "HK3")
//                 .map((item) => ({
//                   name: `${item.hocKy} - ${item.namHoc}`,
//                   diem: item.diemTB,
//                 }))}
//               tableName="Điểm Trung Bình Tích Lũy"
//             />
//             <div className="p-4 bg-gray-50 font-medium text-gray-700 rounded-lg shadow-md m-5">
//               <DataGridComponent
//                 dataRows={ketQuaHocTapData
//                   .filter((item) => item.hocKy.tenHocky === "HK3")
//                   .map((item) => ({
//                     id: item.id,
//                     maHp: item.maHp,
//                     tenHp: item.tenHp,
//                     dieuKien: item.dieuKien,
//                     nhomHp: item.nhomHp,
//                     soTinChi: item.soTinChi,
//                     diemChu: item.diemChu,
//                     diemSo: item.diemSo,
//                     hocKy: item.hocKy,
//                     namHoc: item.namHoc,
//                   }))}
//               />
//             </div>
//           </>
//         )}
//       </div>
//     </>
//   );
// };
