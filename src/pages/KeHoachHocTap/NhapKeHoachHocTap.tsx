
import { useEffect, useMemo, useState } from "react";
import { KeHoachHocTapTable } from "../../components/table/KeHoachHocTapTable";
import type { HocPhan } from "../../types/HocPhan";
import { KHHT_SERVICE } from "../../api/apiEndPoints";
import { ArrowUpDown, CirclePlus, Trash2 } from "lucide-react";
import Loading from "../../components/Loading";
import Error from "../../components/Error";
import type { KeHoachHocTap } from "../../types/KeHoachHoctap";
import ErrorMessageModal from "../../components/modals/ErrorMessageModal";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import type { ColumnDef } from "@tanstack/react-table";
import type { HocKy } from "../../types/HocKy";
import axios from "axios";

const NhapKeHoachHocTap: React.FC = () => {
  const { auth } = useAuth();
  const [availableHocPhan, setAvailableHocPhan] = useState<HocPhan[]>([]);
  const [selectedHocPhan, setSelectedHocPhan] = useState<KeHoachHocTap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [hocKyFromAPI, setHocKyFromAPI] = useState<HocKy[]>([]);
  const [hocKyLoading, setHocKyLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  const maSo = auth.user?.maSo || "";

  // Fetch học kỳ data from API
  const fetchHocKy = async (maSo: string) => {
    try {
      setHocKyLoading(true);
      const response = await axios.get(
        KHHT_SERVICE.GET_HOCKY.replace(":maSo", maSo),
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const hocKyData = response.data.data || [];
      setHocKyFromAPI(hocKyData);
    } catch (error) {
      console.error("Error fetching hoc ky:", error);
    } finally {
      setHocKyLoading(false);
    }
  };

  // Create academic year list from API data
  const namHocList = useMemo(() => {
    const years = new Map<number, { id: number; tenNamHoc: string }>();
    hocKyFromAPI.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        years.set(hk.namHoc.id, {
          id: hk.namHoc.id,
          tenNamHoc: `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`
        });
      }
    });
    return Array.from(years.values()).sort((a, b) => a.id - b.id);
  }, [hocKyFromAPI]);

  // Create semester list from API data
  const hocKyList = useMemo(() => {
    return hocKyFromAPI.map((hk) => ({
      id: hk.maHocKy,
      tenHocky: hk.tenHocKy,
      namHocId: hk.namHoc?.id || 0
    }));
  }, [hocKyFromAPI]);
  // Fetch available học phần
  const fetchAvailableHocPhan = async () => {
    setIsLoading(true);
    try {
      const response = await axiosPrivate.get(
        KHHT_SERVICE.CTDT_NOT_IN_KHHT.replace(":id", maSo).replace(":khoaHoc", "K50")
      );
      setAvailableHocPhan(response.data.data || []);
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (maSo) {
      fetchHocKy(maSo);
      fetchAvailableHocPhan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maSo]);

  // Filter available học phần (exclude selected ones)
  const filteredAvailableHocPhan = useMemo(() => {
    return availableHocPhan.filter(
      (hocPhan) => !selectedHocPhan?.some((selected) => selected.maHp === hocPhan.maHp)
    );
  }, [availableHocPhan, selectedHocPhan]);

  // Add học phần to selected list
  const addHocPhan = (hocPhan: HocPhan) => {
    setSelectedHocPhan((prev) => [
      ...prev,
      {
        maHp: hocPhan.maHp,
        tenHp: hocPhan.tenHp,
        tinChi: hocPhan.tinChi,
        loaiHp: hocPhan.loaiHp,
        hocPhanTienQuyet: hocPhan.hocPhanTienQuyet,
        maHocKy: 0,
        namHocId: 0,
      } as KeHoachHocTap,
    ]);
  };

  // Remove học phần from selected list
  const removeHocPhan = (maHp: string) => {
    setSelectedHocPhan((prev) => prev.filter((hocPhan) => hocPhan.maHp !== maHp));
  };

  // Save selected học phần
  const handleSaveKHHT = async () => {
    const filteredData = selectedHocPhan.map((hocPhan) => ({
      maSo: maSo,
      maHocKy: hocPhan.maHocKy,
      maHocPhan: hocPhan.maHp,
    }));

    if (filteredData.some((item) => item.maHocKy === 0 || item.maHocPhan === "")) {
      setError("Vui lòng chọn đầy đủ thông tin học phần trước khi lưu.");
      return;
    }

    try {
      setFetchLoading(true);
      await axiosPrivate.post(KHHT_SERVICE.CREATE, filteredData);
      setSuccess("Lưu kế hoạch học tập thành công!");
      setSelectedHocPhan([]);
      fetchAvailableHocPhan();
    } catch (err) {
      setError((err as { message: string }).message);
    } finally {
      setFetchLoading(false);
    }
  };

  // Available học phần columns
  const availableColumns = useMemo<ColumnDef<HocPhan>[]>(
    () => [
      {
        accessorKey: "maHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Mã học phần
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue("maHp")}</div>,
      },
      {
        accessorKey: "tenHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tên học phần
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => <div className="text-left">{row.getValue("tenHp")}</div>,
      },
      {
        accessorKey: "tinChi",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tín chỉ
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue("tinChi")}</div>,
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tiên quyết
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue("hocPhanTienQuyet") || "-"}</div>,
      },
      {
        accessorKey: "action",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              className="text-green-600 hover:text-green-700 p-2 rounded-lg transition-colors duration-200"
              onClick={() => addHocPhan(row.original)}
              title="Thêm vào kế hoạch"
            >
              <CirclePlus className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Selected học phần columns
  const selectedColumns = useMemo<ColumnDef<KeHoachHocTap>[]>(
    () => [
      {
        accessorKey: "maHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Mã học phần
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue("maHp")}</div>,
      },
      {
        accessorKey: "tenHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tên học phần
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => <div className="text-left">{row.getValue("tenHp")}</div>,
      },
      {
        accessorKey: "tinChi",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tín chỉ
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue("tinChi")}</div>,
      },
      {
        accessorKey: "namHocId",
        header: "Năm học",
        cell: ({ row }) => (
          <select
            value={row.original.namHocId}
            onChange={(e) => {
              const newNamHocId = Number(e.target.value);
              setSelectedHocPhan((prev) =>
                prev.map((hocPhan) =>
                  hocPhan.maHp === row.getValue("maHp")
                    ? { ...hocPhan, namHocId: newNamHocId, maHocKy: 0 }
                    : hocPhan
                )
              );
            }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
            <option value={0}>Chọn năm học</option>
            {namHocList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.tenNamHoc}
              </option>
            ))}
          </select>
        ),
      },
      {
        accessorKey: "maHocKy",
        header: "Học kỳ",
        cell: ({ row }) => (
          <select
            value={row.original.maHocKy}
            onChange={(e) => {
              const newHocKyId = Number(e.target.value);
              setSelectedHocPhan((prev) =>
                prev.map((hocPhan) =>
                  hocPhan.maHp === row.getValue("maHp")
                    ? { ...hocPhan, maHocKy: newHocKyId }
                    : hocPhan
                )
              );
            }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
            <option value={0}>Chọn học kỳ</option>
            {hocKyList
              .filter((hk) => hk.namHocId === (row.original.namHocId || (namHocList[0]?.id || 0)))
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.tenHocky}
                </option>
              ))}
          </select>
        ),
      },
      {
        accessorKey: "action",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              className="text-red-600 hover:text-red-800 p-2 rounded-lg transition-colors duration-200"
              onClick={() => removeHocPhan(row.getValue("maHp"))}
              title="Xóa khỏi kế hoạch"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    [namHocList, hocKyList]
  );
  if (isLoading || hocKyLoading) return <Loading />;
  if (error && !selectedHocPhan.length) return <Error error={error} />;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Available học phần table */}
      <KeHoachHocTapTable
        name="Danh sách học phần có thể thêm"
        data={filteredAvailableHocPhan}
        columns={availableColumns}
        initialExpanded={true}
      />

      {/* Selected học phần table */}
      {selectedHocPhan.length > 0 && (
        <>
          <KeHoachHocTapTable
            name="Học phần đã chọn"
            data={selectedHocPhan}
            columns={selectedColumns}
            initialExpanded={true}
          />
          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setSelectedHocPhan([])}
              className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Hủy
            </button>
            <button
              disabled={fetchLoading}
              onClick={handleSaveKHHT}
              className={`px-6 py-2 rounded-xl text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 ${
                fetchLoading
                  ? "cursor-not-allowed opacity-50 bg-gray-400"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {fetchLoading ? "Đang lưu..." : "Lưu kế hoạch học tập"}
            </button>
          </div>
        </>
      )}

      {/* Success/Error modals */}
      {success && (
        <ErrorMessageModal
          isOpen={!!success}
          onClose={() => setSuccess(null)}
          message={success}
        />
      )}
      <ErrorMessageModal
        isOpen={!!error}
        onClose={() => setError(null)}
        message={error || "Đã xảy ra lỗi. Vui lòng thử lại."}
      />
    </div>
  );
};

export default NhapKeHoachHocTap;