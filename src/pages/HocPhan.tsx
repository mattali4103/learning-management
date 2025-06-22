import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import Loading from "../components/Loading";
import Error from "../components/Error";
import type { HocPhan } from "../types/HocPhan";



function createData(
  maHp: string,
  tenHp: string,
  tinChi: number,
  hocPhanTienQuyet: string,
  loaiHp: string
) {
  return { maHp, tenHp, tinChi, hocPhanTienQuyet, loaiHp };
}

export default function BasicTable() {
  const [hocPhanList, setHocPhanList] = useState<HocPhan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .post("http://localhost:8086/api/hocphan/list")
      .then((response) => {
        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setHocPhanList(data);
        setLoading(false);
      })
      .catch((error: AxiosError) => {
        const errorMessage =
          (error.response?.data as { message?: string })?.message ||
          "Đăng nhập thất bại. Vui lòng thử lại.";
        setError(errorMessage);
        setHocPhanList([]); 
        setLoading(false);
      });
  }, []);

  const rows = Array.isArray(hocPhanList)
    ? hocPhanList.map((hocPhan: HocPhan) =>
        createData(
          hocPhan.maHp,
          hocPhan.tenHp,
          hocPhan.tinChi,
          hocPhan.hocPhanTienQuyet,
          hocPhan.loaiHp
        )
      )
    : [];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error error={error} />;
  }
  return (
    <div className="max-w-7xl mx-auto my-8 px-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-6 py-3 text-center text-sm font-bold text-white uppercase tracking-wider">
                  Mã Học Phần
                </th>
                <th className="px-6 py-3 text-center text-sm font-bold text-white uppercase tracking-wider">
                  Tên Học Phần
                </th>
                <th className="px-6 py-3 text-center text-sm font-bold text-white uppercase tracking-wider">
                  Tín Chỉ
                </th>
                <th className="px-6 py-3 text-center text-sm font-bold text-white uppercase tracking-wider">
                  Học Phần Tiên Quyết
                </th>
                <th className="px-6 py-3 text-center text-sm font-bold text-white uppercase tracking-wider">
                  Loại Học Phần
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="text-lg">Không có dữ liệu học phần</div>
                  </td>
                </tr>
              )}
              {rows.map((row, index) => (
                <tr
                  key={row.maHp || index}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                    {row.maHp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {row.tenHp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {row.tinChi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {row.hocPhanTienQuyet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {row.loaiHp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
