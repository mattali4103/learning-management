import { useEffect, useState } from "react";
import KeHoachHocTapTables from "../../components/table/KeHoachHocTapTables";
import { KHHT_SERVICE } from "../../api/apiEndPoints";
import Loading from "../../components/Loading";
import CustomBarChart from "../../components/chart/CustomBarChart";
import { CustomPercentCircle } from "../../components/chart/CustomPercentCircle";
import { BookOpenCheck, CircleCheckBig, NotebookPen } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Outlet } from "react-router-dom";

interface KHHTData {
  id: number;
  loaiHp: string;
  hocPhanCaiThien: boolean;
  hocPhan: {
    maHp: string;
    tenHp: string;
    tinChi: number;
    hocPhanCaiThien: boolean;
  };
  hocKy: {
    maHocKy: number;
    tenHocKy: string;
  };
  namHoc: {
    id: number;
    namBatDau: number;
    namKetThuc: number;
  };
}

interface CountTinChi {
  tongSoTinChi: number;
  soTinChiTichLuy: number;
  soTinChiCaiThien: number;
}
export const KeHoachHocTapTable = () => {
  const [keHoachHocTap, setKeHoachHocTap] = useState<KHHTData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [countTinChi, setCountTinChi] = useState<CountTinChi | null>(null);
  const axiosPrivate = useAxiosPrivate();
  useEffect(() => {
    const fetchKeHoachHocTap = async () => {
      try {
        setLoading(true);
        const result = await axiosPrivate.get(
          KHHT_SERVICE.KHHT_SINHVIEN.replace(":maSo", "B2110946")
        );
        setKeHoachHocTap(result.data.data  || []);
      } catch (error) {
        setError(
          error instanceof Error ? `Lỗi: ${error.message}` : "Có lỗi xảy ra"
        );
        setKeHoachHocTap([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCountTinChi = async () => {
      try {
        const result = await axiosPrivate.get(
          KHHT_SERVICE.COUNT_TINCHI_IN_KHHT.replace(":khoaHoc", "K50").replace(
            ":maSo",
            "B2110946"
          )
        );
        setCountTinChi(result.data.data);
        console.log(result);
      } catch (error) {
        setError(
          error instanceof Error ? `Lỗi: ${error.message}` : "Có lỗi xảy ra"
        );
        setCountTinChi(null);
      }
    };
    fetchKeHoachHocTap();
    fetchCountTinChi();
  }, []);

  if (loading) return <Loading />;

  const { tongSoTinChi, soTinChiTichLuy, soTinChiCaiThien } = countTinChi || {
    tongSoTinChi: 0,
    soTinChiDaTichLuy: 0,
    soTinChiCaiThien: 0,
  };
  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 gap-2 px-2 ">
        <div className="col-span-1 grid gap-2 h-full">
          <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
            <div className="col-span-2 bg-gray-50 shadow-lg rounded-md flex items-center justify-center">
              <div className="grid grid-cols-3 gap-3 w-full h-full">
                <div className="border-r border-gray-300 flex items-center flex-col justify-evenly my-5">
                  <h2 className="text-xl font-semibold">HP Tích luỹ</h2>
                  <span className=" p-2 bg-[#D9E7FA] rounded-full">
                    <BookOpenCheck className="text-green-400 w-8 h-8 font-bold" />
                  </span>
                  <p className="text-4xl flex gap-2">{soTinChiTichLuy}</p>
                </div>
                <div className="border-r border-gray-300 flex items-center flex-col justify-evenly my-5">
                  <h2 className="text-xl font-semibold">HP cải thiện</h2>
                  <div className="p-2 bg-[#D9E7FA] rounded-full">
                    <NotebookPen className="text-green-400 w-8 h-8 font-bold" />
                  </div>
                  <p className="text-4xl flex gap-2">{soTinChiCaiThien}</p>
                </div>
                <div className="border-r border-gray-300 flex items-center flex-col justify-evenly my-5">
                  <h2 className="text-xl font-semibold">Trạng thái</h2>
                  <div className="p-2 bg-[#D9E7FA] rounded-full">
                    <CircleCheckBig className="text-green-400 w-8 h-8 font-bold" />
                  </div>
                  <p className="text-base flex gap-2">Bạn đang kịp tiến độ</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 shadow-lg rounded-md p-2 flex flex-col justify-between items-center h-full">
              <span className="text-xl">Tiến độ tốt nghiệp</span>
              <div className="w-1/2 mx-auto">
                <CustomPercentCircle
                  total={tongSoTinChi ?? 0}
                  current={soTinChiTichLuy ?? 0}
                />
              </div>
            </div>
            <div className="bg-gray-50 shadow-lg rounded-md p-2 flex flex-col justify-between items-center h-full">
              <span className="text-xl">Tín chỉ cải thiện</span>
              <div className="w-1/2 mx-auto">
                <CustomPercentCircle
                  total={tongSoTinChi}
                  current={soTinChiCaiThien}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1 bg-white shadow-lg rounded-md h-full">
          <CustomBarChart data={keHoachHocTap} />
        </div>
      </div>
      <KeHoachHocTapTables keHoachHocTap={keHoachHocTap} />
    </div>
  );
}


const KeHoachHocTap = () => {
  return(
    <>
      <Outlet />
    </>
  );
}
export default KeHoachHocTap;
