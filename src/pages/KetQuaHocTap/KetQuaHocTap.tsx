import { useState, useEffect } from "react";
import Loading from "../../components/Loading";
import AreaChartComponent from "../../components/chart/Area";
import CustomPieChart from "../../components/chart/CustomPieChart";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { KQHT_SERVICE } from "../../api/apiEndPoints";
import type { HocKy } from "../../types/HocKy";
import type { NamHoc } from "../../types/NamHoc";

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

export interface KeHoachHocTapTableProps{
  id: number;
  maHp: string;
  tenHp: string;
  hocPhanCaiThien: boolean;
  soTinChi: number;
  hocKy: HocKy;
  namHoc: NamHoc;
}

export default function KetQuaHocTap() {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(true);
  const [yearTabIndex, setYearTabIndex] = useState<number>(0);
  const [hocKyList, setHocKyList] = useState<HocKy[]>([]);
  const [namHocData, setNamHocData] = useState<NamHoc[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHocKy = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(
          KQHT_SERVICE.GET_HOCKY.replace(":maSo", auth.user?.maSo || "")
        );
        const hocKyData = response.data.data || [];
        setHocKyList(hocKyData);
        
        // Extract unique namHoc data from hocKy
        const uniqueNamHoc = hocKyData.reduce((acc: NamHoc[], hocKy: HocKy) => {
          if (hocKy.namHoc && !acc.find(nh => nh.id === hocKy.namHoc.id)) {
            acc.push(hocKy.namHoc);
          }
          return acc;
        }, []);
        setNamHocData(uniqueNamHoc);
      } catch (error) {
        console.error("Error fetching hoc ky:", error);
        setError("Không thể tải dữ liệu học kỳ");
      } finally {
        setLoading(false);
      }
    };

    if (auth.user?.maSo) {
      fetchHocKy();
    }
  }, [axiosPrivate, auth.user?.maSo]);

  const yearTab = [
    { label: "Tất cả", index: 0 },
    ...namHocData.map((item: NamHoc) => ({
      label: `${item.namBatDau} - ${item.namKetThuc}`,
      index: item.id,
    })),
  ];

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

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
        {yearTabIndex === 0 && <KetQuaHocTapAll hocKyList={hocKyList} namHocData={namHocData} />}        {yearTabIndex !== 0 && (
          <div className="">
            <KetQuaHocTapByYear yearTabIndex={yearTabIndex} hocKyList={hocKyList} />
          </div>
        )}
      </div>
    </>
  );
}

interface KetQuaHocTapComponentProps {
  hocKyList: HocKy[];
  namHocData: NamHoc[];
}

interface KetQuaHocTapByYearProps {
  yearTabIndex: number;
  hocKyList: HocKy[];
}

const KetQuaHocTapAll: React.FC<KetQuaHocTapComponentProps> = ({ hocKyList }) => {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [ketQuaHocTapData, setKetQuaHocTapData] = useState<KetQuaHocTapTableProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKetQuaHocTap = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(
          KQHT_SERVICE.GET_KETQUA.replace(":maSo", auth.user?.maSo || "")
        );
        setKetQuaHocTapData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching ket qua hoc tap:", error);
      } finally {
        setLoading(false);
      }
    };

    if (auth.user?.maSo) {
      fetchKetQuaHocTap();
    }
  }, [axiosPrivate, auth.user?.maSo]);

  const data = hocKyList.map((hocKy) => ({
    name: `${hocKy.tenHocKy} - ${hocKy.namHoc.namBatDau} - ${hocKy.namHoc.namKetThuc}`,
    diem: 7.5, // Placeholder - should calculate from actual grades
  }));

  const sortedKetQuaHocTap = [...ketQuaHocTapData].sort(
    (a, b) => a.diemSo - b.diemSo
  );
  const ketQuaHocTapSortedAndFiltered = sortedKetQuaHocTap.filter(
    (item) => item.diemSo !== 0 && item.diemSo !== undefined
  );

  if (loading) return <Loading />;

  return (
    <>
      <AreaChartComponent data={data} tableName="Điểm Trung Bình Tích Lũy" />
      <div className="flex gap-2 p-2 m-5">
          <div className="p-4 bg-gray-100 font-medium text-gray-700 rounded-lg shadow-md min-w-160 max-w-190 w-full">
          <CustomPieChart rowData={ketQuaHocTapData} />
        </div>
        <div className="font-medium  text-gray-700 rounded-lg shadow-md md:w-1/4 w-full flex flex-col content-center justify-items-center gap-4">
          <div className="h-1/2 bg-green-300 p-2 flex justify-center rounded-md flex-col ">
            <p className="font-semibold text-2xl text-center">
              Số Tín Chỉ Tích Luỹ
            </p>
            <p className="grade text-6xl text-center mt-2">
              {ketQuaHocTapData.reduce((total, item) => total + item.soTinChi, 0)}
            </p>
            <p className="text-xl text-center mt-2">Bạn đang đúng tiến độ</p>          </div>
          <div className="h-1/2 bg-green-300 p-2 flex justify-center rounded-md flex-col ">
            <p className="font-semibold text-2xl text-center">
              Điểm Trung Bình Tích Luỹ
            </p>
            <p className="grade text-6xl text-center mt-2">
              {ketQuaHocTapData.length > 0 
                ? (ketQuaHocTapData.reduce((total, item) => total + item.diemSo, 0) / ketQuaHocTapData.length).toFixed(2)
                : "0.00"
              }
            </p>
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

const KetQuaHocTapByYear: React.FC<KetQuaHocTapByYearProps> = ({
  yearTabIndex,
  hocKyList,
}) => {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [ketQuaHocTapData, setKetQuaHocTapData] = useState<KetQuaHocTapTableProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKetQuaHocTap = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(
          KQHT_SERVICE.GET_KETQUA.replace(":maSo", auth.user?.maSo || "")
        );
        const allData = response.data.data || [];
        // Filter by year
        const filteredData = allData.filter((item: KetQuaHocTapTableProps) => 
          item.namHoc.id === yearTabIndex
        );
        setKetQuaHocTapData(filteredData);
      } catch (error) {
        console.error("Error fetching ket qua hoc tap:", error);
      } finally {
        setLoading(false);
      }
    };

    if (auth.user?.maSo && yearTabIndex) {
      fetchKetQuaHocTap();
    }
  }, [axiosPrivate, auth.user?.maSo, yearTabIndex]);

  const filteredHocKy = hocKyList.filter(hocKy => hocKy.namHoc.id === yearTabIndex);
  
  const data = filteredHocKy.map((hocKy) => ({
    name: `${hocKy.tenHocKy} - ${hocKy.namHoc.namBatDau} - ${hocKy.namHoc.namKetThuc}`,
    diem: 7.5, // Placeholder - should calculate from actual grades
  }));

  const sortedKetQuaHocTap = [...ketQuaHocTapData].sort(
    (a, b) => a.diemSo - b.diemSo
  );
  const ketQuaHocTapSortedAndFiltered = sortedKetQuaHocTap.filter(
    (item) => item.diemSo !== 0 && item.diemSo !== undefined
  );

  if (loading) return <Loading />;

  return (
    <>
      <div>
        <AreaChartComponent
          data={data}
          tableName="Điểm Trung Bình Tích Lũy"
        />
        <div className="flex gap-2  p-2 m-5">
          <div className="p-4 bg-gray-100 font-medium text-gray-700 rounded-lg shadow-md min-w-160 max-w-190 w-full">
            <CustomPieChart rowData={ketQuaHocTapData} />
          </div>
          <div className="font-medium  text-gray-700 rounded-lg shadow-md md:w-1/4 w-full flex flex-col content-center justify-items-center gap-4">
            <div className="h-1/2 bg-green-300 p-2 flex justify-center rounded-md flex-col ">
              <p className="font-semibold text-2xl text-center">
                Số Tín Chỉ Tích Luỹ
              </p>
              <p className="grade text-6xl text-center mt-2">
                {ketQuaHocTapData.reduce((total, item) => total + item.soTinChi, 0)}
              </p>
              <p className="text-xl text-center mt-2">Bạn đang đúng tiến độ</p>
            </div>
            <div className="h-1/2 bg-green-300 p-2 flex justify-center rounded-md flex-col ">
              <p className="font-semibold text-2xl text-center">
                Điểm Trung Bình Tích Luỹ
              </p>
              <p className="grade text-6xl text-center mt-2">
                {ketQuaHocTapData.length > 0 
                  ? (ketQuaHocTapData.reduce((total, item) => total + item.diemSo, 0) / ketQuaHocTapData.length).toFixed(2)
                  : "0.00"
                }
              </p>
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
