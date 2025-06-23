import { useEffect, useMemo, useState, useCallback } from "react";
import { KeHoachHocTapTable } from "../../components/table/KeHoachHocTapTable";
import type { HocPhan } from "../../types/HocPhan";
import { HOCPHAN_SERVICE, KHHT_SERVICE, KQHT_SERVICE } from "../../api/apiEndPoints";
import { ArrowUpDown, CirclePlus, Trash2 } from "lucide-react";
import Loading from "../../components/Loading";
import Error from "../../components/Error";
import type { KeHoachHocTap } from "../../types/KeHoachHoctap";
import ErrorMessageModal from "../../components/modals/ErrorMessageModal";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import type { ColumnDef } from "@tanstack/react-table";
import type { HocKy } from "../../types/HocKy";


interface HocPhanCaiThien {
  id: number;
  maHp: string;
  tenHp: string;
  diemChu: string;
  diemSo?: number;
  soTinChi: number;
}
interface HocPhanTuChon {
  id: number;
  tenNhom: string
  tinChiYeuCau: number;
  hocPhanTuChonList: HocPhan[];
}

const NhapKeHoachHocTap: React.FC = () => {
  const { auth } = useAuth();
  const [availableHocPhan, setAvailableHocPhan] = useState<HocPhan[]>([]);
  const [NhomHocPhanTuChon, setNhomHocPhanTuChon] = useState<HocPhanTuChon[]>([]);
  const [hocPhanCaiThien, setHocPhanCaiThien] = useState<HocPhanCaiThien[]>([]);
  const [selectedHocPhan, setSelectedHocPhan] = useState<KeHoachHocTap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [hocKyFromAPI] = useState<HocKy[]>([
    {
      maHocKy: 0,
      tenHocKy: "Chọn học kỳ",
      namHoc: {
        id: 0,
        namBatDau: "",
        namKetThuc: "",
      },
      ngayBatDau: "",
      ngayKetThuc: "",
    },
    {
      maHocKy: 1,
      tenHocKy: "Học kỳ 1",
      namHoc: {
        id: 1,
        namBatDau: "2021",
        namKetThuc: "2022",
      },
      ngayBatDau: "",
      ngayKetThuc: "",
    },
    {
      maHocKy: 2,
      tenHocKy: "Học kỳ 2",
      namHoc: {
        id: 1,
        namBatDau: "2021",
        namKetThuc: "2022",
      },
      ngayBatDau: "",
      ngayKetThuc: "",
    },
    {
      maHocKy: 3,
      tenHocKy: "Học kỳ 3",
      namHoc: {
        id: 1,
        namBatDau: "2021",
        namKetThuc: "2022",
      },
      ngayBatDau: "",
      ngayKetThuc: "",
    },
  ]);

  const axiosPrivate = useAxiosPrivate();
  const maSo = auth.user?.maSo || "";
  const khoaHoc = auth.user?.khoaHoc || "";

  // Create academic year list from API data
  const namHocList = useMemo(() => {
    const years = new Map<number, { id: number; tenNamHoc: string }>();
    hocKyFromAPI.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        years.set(hk.namHoc.id, {
          id: hk.namHoc.id,
          tenNamHoc: `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`,
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
      namHocId: hk.namHoc?.id || 0,
    }));
  }, [hocKyFromAPI]);
  // Fetch available học phần
  const fetchAvailableHocPhan = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosPrivate.get(
        KHHT_SERVICE.CTDT_NOT_IN_KHHT.replace(":id", maSo).replace(
          ":khoaHoc",
          khoaHoc
        )
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
  }, [axiosPrivate, maSo, khoaHoc]);

  //Fetch học phần cải thiện
  const fetchHocPhanCaiThien = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(
        KQHT_SERVICE.GET_HOC_PHAN_CAI_THIEN.replace(":maSo", maSo),
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const filtedHocPhanCaiThien: HocPhanCaiThien[] = response.data.data.map((item: any) => {
        return {
          id: item.id,
          maHp: item.hocPhan.maHp,
          tenHp: item.hocPhan.tenHp,
          diemChu: item.diemChu,
          diemSo: item.diemSo,
          soTinChi: item.hocPhan.tinChi,
        } as HocPhanCaiThien;
      })

      setHocPhanCaiThien(filtedHocPhanCaiThien || []);
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        console.error(err);
      }
    }
  }
    , [axiosPrivate, maSo]);  // Fetch học phần cải thiện khi component mount

  // Fetch học phần tự chọn
  const fetchNhomHocPhanTuChon = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(
        HOCPHAN_SERVICE.CDDT_HOC_PHAN_TU_CHON_LIST,
        {
          params: {
            khoaHoc: khoaHoc,
            maNganh: "6" // Assuming 6 is the ID for the desired major
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setNhomHocPhanTuChon(response.data.data || []);
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        console.error(err);
      }
    }
  }, [axiosPrivate, khoaHoc]); useEffect(() => {
    if (maSo) {
      fetchHocPhanCaiThien();
      fetchAvailableHocPhan();
      fetchNhomHocPhanTuChon();
    }
  }, [maSo, fetchAvailableHocPhan, fetchNhomHocPhanTuChon, fetchHocPhanCaiThien]);

  // Filter available học phần (exclude selected ones)
  const filteredAvailableHocPhan = useMemo(() => {
    return availableHocPhan.filter(
      (hocPhan) =>
        !selectedHocPhan?.some((selected) => selected.maHp === hocPhan.maHp)
    );
  }, [availableHocPhan, selectedHocPhan]);  // Helper function để tính tổng tín chỉ đã chọn cho một nhóm
  const getTinChiDaChonTrongNhom = useCallback((nhom: HocPhanTuChon) => {
    return selectedHocPhan
      .filter(selected =>
        nhom.hocPhanTuChonList.some(hp => hp.maHp === selected.maHp)
      )
      .reduce((total, selected) => total + selected.tinChi, 0);
  }, [selectedHocPhan]);  // Add học phần to selected list
  const addHocPhan = useCallback((hocPhan: HocPhan, nhomId?: number) => {
    // Nếu có nhomId, hiển thị cảnh báo nếu sẽ vượt quá
    if (nhomId !== undefined) {
      const nhom = NhomHocPhanTuChon.find(n => n.id === nhomId);
      if (nhom) {
        const tinChiDaChon = getTinChiDaChonTrongNhom(nhom);
        const tinChiSauKhiThem = tinChiDaChon + hocPhan.tinChi;

        // Hiển thị cảnh báo nếu sẽ vượt quá yêu cầu
        if (tinChiSauKhiThem > nhom.tinChiYeuCau) {
          setSuccess(`Đã thêm "${hocPhan.tenHp}". Lưu ý: Tổng tín chỉ nhóm sẽ là ${tinChiSauKhiThem}/${nhom.tinChiYeuCau} (vượt ${tinChiSauKhiThem - nhom.tinChiYeuCau} tín chỉ).`);
        }
      }
    }

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
  }, [NhomHocPhanTuChon, getTinChiDaChonTrongNhom]);

  // Remove học phần from selected list
  const removeHocPhan = useCallback((maHp: string) => {
    setSelectedHocPhan((prev) =>
      prev.filter((hocPhan) => hocPhan.maHp !== maHp)
    );
  }, []);

  // Save selected học phần
  const handleSaveKHHT = async () => {
    const filteredData = selectedHocPhan.map((hocPhan) => ({
      maSo: maSo,
      maHocKy: hocPhan.maHocKy,
      maHocPhan: hocPhan.maHp,
    }));

    if (
      filteredData.some((item) => item.maHocKy === 0 || item.maHocPhan === "")
    ) {
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
  console.log("hocphan", hocPhanCaiThien)
  // Available học phần columns
  const availableColumns = useMemo<ColumnDef<HocPhan>[]>(
    () => [
      {
        accessorKey: "maHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Mã học phần
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("maHp")}</div>
        ),
      },
      {
        accessorKey: "tenHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tên học phần
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-left">{row.getValue("tenHp")}</div>
        ),
      },
      {
        accessorKey: "tinChi",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tín chỉ
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("tinChi")}</div>
        ),
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tiên quyết
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.getValue("hocPhanTienQuyet") || "-"}
          </div>
        ),
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
    [addHocPhan]
  );  // Columns cho học phần tự chọn
  const createHocPhanTuChonColumns = (nhomId: number): ColumnDef<HocPhan>[] => [
    {
      accessorKey: "maHp",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          Mã học phần
          <button
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
            className="ml-2"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("maHp")}</div>
      ),
    },
    {
      accessorKey: "tenHp",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          Tên học phần
          <button
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
            className="ml-2"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("tenHp")}</div>
      ),
    },
    {
      accessorKey: "tinChi",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          Tín chỉ
          <button
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
            className="ml-2"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("tinChi")}</div>
      ),
    },
    {
      accessorKey: "hocPhanTienQuyet",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          Tiên quyết
          <button
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
            className="ml-2"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("hocPhanTienQuyet") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "", cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <button
              className="text-green-600 hover:text-green-700 p-2 rounded-lg transition-colors duration-200"
              onClick={() => addHocPhan(row.original, nhomId)}
              title="Thêm vào kế hoạch"
            >
              <CirclePlus className="h-5 w-5" />
            </button>
          </div>
        );
      },
    },
  ];
  // Columns cho học phần cải thiện
  const createHocPhanCaiThienColumns = (): ColumnDef<HocPhanCaiThien>[] => [
    {
      accessorKey: "maHp",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          Mã học phần
          <button
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
            className="ml-2"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("maHp")}</div>
      ),
    },
    {
      accessorKey: "tenHp",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          Tên học phần
          <button
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
            className="ml-2"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("tenHp")}</div>
      ),
    },
    {
      accessorKey: "soTinChi",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          Tín chỉ
          <button
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
            className="ml-2"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("soTinChi")}</div>
      ),
    },    {
      accessorKey: "diemChu",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          Điểm chữ
          <button
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
            className="ml-2"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {row.getValue("diemChu")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "diemSo",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          Điểm số
          <button
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
            className="ml-2"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
            {row.getValue("diemSo") || "-"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => {
        // Tạo học phần object từ dữ liệu cải thiện để có thể thêm vào kế hoạch
        const hocPhanToAdd: HocPhan = {
          maHp: row.original.maHp,
          tenHp: row.original.tenHp,
          tinChi: row.original.soTinChi,
          loaiHp: "Cải thiện",
          hocPhanTienQuyet: "",
        };

        return (
          <div className="flex items-center justify-center">
            <button
              className="text-blue-600 hover:text-blue-700 p-2 rounded-lg transition-colors duration-200"
              onClick={() => addHocPhan(hocPhanToAdd)}
              title="Thêm vào kế hoạch cải thiện"
            >
              <CirclePlus className="h-5 w-5" />
            </button>
          </div>
        );
      },
    },
  ];

  // Selected học phần columns
  const selectedColumns = useMemo<ColumnDef<KeHoachHocTap>[]>(
    () => [
      {
        accessorKey: "maHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Mã học phần
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("maHp")}</div>
        ),
      },
      {
        accessorKey: "tenHp",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tên học phần
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-left">{row.getValue("tenHp")}</div>
        ),
      },
      {
        accessorKey: "tinChi",
        header: ({ column }) => (
          <div className="flex items-center justify-center">
            Tín chỉ
            <button
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="ml-2"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("tinChi")}</div>
        ),
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
              .filter(
                (hk) =>
                  hk.namHocId ===
                  (row.original.namHocId || namHocList[0]?.id || 0)
              )
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
      },],
    [namHocList, hocKyList, removeHocPhan]
  );

  if (error && !selectedHocPhan.length) return <Error error={error} />;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {isLoading ? (
        <Loading showOverlay={false} message="Đang tải dữ liệu học phần..." />
      ) : (
        <>
          {/* Available học phần table */}
          <KeHoachHocTapTable
            name="Danh sách học phần có thể thêm"
            data={filteredAvailableHocPhan}
            columns={availableColumns}
            initialExpanded={true}
            loading={false}
          />
          {/* Nhóm học phần tự chọn tables */}
          {NhomHocPhanTuChon.map((nhom, index) => {
            // Tính tổng tín chỉ đã chọn trong nhóm này
            const tinChiDaChon = getTinChiDaChonTrongNhom(nhom);
            const isCompleted = tinChiDaChon >= nhom.tinChiYeuCau;
            const isExceeded = tinChiDaChon > nhom.tinChiYeuCau;

            return (
              <div key={nhom.id} className="space-y-2">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-800 mb-1">
                        {nhom.tenNhom || `Nhóm học phần tự chọn ${index + 1}`}
                      </h3>
                      <p className="text-purple-600 text-sm">
                        Yêu cầu: <span className="font-medium">{nhom.tinChiYeuCau} tín chỉ</span>
                        {tinChiDaChon > 0 && (
                          <span className="ml-2 text-purple-700">
                            - Đã chọn: <span className="font-medium">{tinChiDaChon} tín chỉ</span>
                          </span>
                        )}
                      </p>
                      {/* Hiển thị trạng thái chi tiết */}
                      {tinChiDaChon > 0 && (
                        <p className="text-sm mt-1">
                          {tinChiDaChon < nhom.tinChiYeuCau && (
                            <span className="text-orange-600 font-medium">
                              ⚠️ Cần thêm {nhom.tinChiYeuCau - tinChiDaChon} tín chỉ để đạt yêu cầu
                            </span>
                          )}
                          {tinChiDaChon === nhom.tinChiYeuCau && (
                            <span className="text-green-600 font-medium">
                              ✅ Đã đạt đủ yêu cầu tín chỉ
                            </span>
                          )}
                          {tinChiDaChon > nhom.tinChiYeuCau && (
                            <span className="text-blue-600 font-medium">
                              ℹ️ Vượt {tinChiDaChon - nhom.tinChiYeuCau} tín chỉ so với yêu cầu
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {nhom.hocPhanTuChonList.length} môn học
                      </div>
                      {isCompleted && !isExceeded && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          ✓ Hoàn thành
                        </div>
                      )}
                      {isExceeded && (
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          + Vượt yêu cầu
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <KeHoachHocTapTable
                  name={nhom.tenNhom || `Học phần tự chọn - Nhóm ${index + 1}`}
                  data={nhom.hocPhanTuChonList.filter(
                    (hocPhan) =>
                      !selectedHocPhan?.some((selected) => selected.maHp === hocPhan.maHp)
                  )}
                  columns={createHocPhanTuChonColumns(nhom.id)}
                  initialExpanded={false}
                  loading={false}
                />
              </div>
            );
          })}

          {/* Bảng học phần cải thiện */}
          {hocPhanCaiThien && hocPhanCaiThien.length > 0 && (
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-orange-800 mb-1">
                      Học phần cải thiện
                    </h3>
                    <p className="text-orange-600 text-sm">
                      Các học phần có điểm chưa đạt cần cải thiện
                      {hocPhanCaiThien.length > 0 && (
                        <span className="ml-2 text-orange-700">
                          - Có <span className="font-medium">{hocPhanCaiThien.length}</span> môn có thể cải thiện
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      {hocPhanCaiThien.length} môn học
                    </div>
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      Cần cải thiện
                    </div>
                  </div>
                </div>
              </div>
              <KeHoachHocTapTable
                name="Học phần cần cải thiện"
                data={hocPhanCaiThien} // Giới hạn 3 dòng
                columns={createHocPhanCaiThienColumns()}
                initialExpanded={false}
                loading={false}
              />
            </div>
          )}

          {/* Selected học phần table */}
          {selectedHocPhan.length > 0 && (
            <>
              <KeHoachHocTapTable
                name="Học phần đã chọn"
                data={selectedHocPhan}
                columns={selectedColumns}
                initialExpanded={true}
                loading={false}
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
                  className={`px-6 py-2 rounded-xl text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 ${fetchLoading
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
        </>
      )}
    </div>
  );
};

export default NhapKeHoachHocTap;
