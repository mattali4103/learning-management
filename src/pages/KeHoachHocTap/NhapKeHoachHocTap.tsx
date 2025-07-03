import { useEffect, useMemo, useState, useCallback } from "react";
import { KeHoachHocTapTable } from "../../components/table/KeHoachHocTapTable";
import { SortableHeader } from "../../components/table/SortableHeader";
import NhomHocPhanTuChonTable from "../../components/table/NhomHocPhanTuChonTable";
import type { HocPhan } from "../../types/HocPhan";
import {
  HOCPHAN_SERVICE,
  KHHT_SERVICE,
  KQHT_SERVICE,
} from "../../api/apiEndPoints";
import { CirclePlus, Trash2, Dumbbell, Users, BookOpen, SquareLibrary } from "lucide-react";
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
  tenNhom: string;
  tinChiYeuCau: number;
  hocPhanTuChonList: HocPhan[];
}

const NhapKeHoachHocTap: React.FC = () => {
  const { auth } = useAuth();
  const [availableHocPhan, setAvailableHocPhan] = useState<HocPhan[]>([]);
  const [NhomHocPhanTuChon, setNhomHocPhanTuChon] = useState<HocPhanTuChon[]>(
    []
  );
  const [hocPhanGoiY, setHocPhanGoiY] = useState<HocPhan[]>([]);
  const [maHocPhanInKHHT, setMaHocPhanInKHHT] = useState<string[]>([]);
  const [hocPhanCaiThien, setHocPhanCaiThien] = useState<HocPhanCaiThien[]>([]);
  const [selectedHocPhan, setSelectedHocPhan] = useState<KeHoachHocTap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [hocKyFromAPI, setHocKyFromApi] = useState<HocKy[]>([]);
  const [activeTab, setActiveTab] = useState<"select" | "selected" | "theChat" | "chuyenNganh" | "other">("select");
  const [completionStatus, setCompletionStatus] = useState<{
    completedGroups: string[];
    pendingGroups: string[];
    chuyenNganhGroups: Map<string, { completed: boolean; details: string[] }>;
  }>({
    completedGroups: [],
    pendingGroups: [],
    chuyenNganhGroups: new Map()
  });
  const axiosPrivate = useAxiosPrivate();
  const maSo = auth.user?.maSo || "";
  const khoaHoc = auth.user?.khoaHoc || "";
  const maNganh = auth.user?.maNganh || ""; // Assuming maNganh is available in auth.user

  const fetchMaHocPhanInKHHT = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(
        KHHT_SERVICE.GET_MAHP_IN_KHHT.replace(":maSo", maSo),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          withCredentials: true,
        }
      );
        const maHocPhanList = response.data || [];
        console.log("Ma Hoc Phan In KHHT:", maHocPhanList);
        setMaHocPhanInKHHT(maHocPhanList);
      
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        console.error(err);
      }
    }
  }, [axiosPrivate, maSo, auth.token]);
  // Fetch học kỳ data from API
  const fetchHocKy = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(KHHT_SERVICE.GET_HOCKY_MAU, {
        params: {
          khoaHoc: khoaHoc,
          maNganh: maNganh, // Assuming 6 is the ID for the desired major
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        withCredentials: true,
      });
      if (response.status === 200 && response.data?.code === 200) {
        setHocKyFromApi(response.data.data || []);
      } else {
        setError(
          `API returned code: ${response.data?.code || response.status}`
        );
      }
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate, auth.token, khoaHoc, maNganh]);

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
        KHHT_SERVICE.CTDT_NOT_IN_KHHT.replace(":id", maSo)
          .replace(":khoaHoc", khoaHoc)
          .replace(":maNganh", maNganh)
      );
      
      // Loại bỏ học phần trùng lặp dựa trên maHp
      const rawData = response.data.data || [];
      const uniqueHocPhan = rawData.filter((hocPhan: HocPhan, index: number, self: HocPhan[]) => 
        self.findIndex(hp => hp.maHp === hocPhan.maHp) === index
      );
      console.log("Available Hoc Phan:", uniqueHocPhan);
      setAvailableHocPhan(uniqueHocPhan);
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate, maSo, khoaHoc, maNganh]);

  // Fetch Nhóm học phần gợi ý
  const fetchHocPhanGoiY = useCallback(async () => {
    try {
      const response = await axiosPrivate.post(
        KHHT_SERVICE.GET_HOCPHAN_BY_GOIY,
        { maSo: maSo, khoaHoc: khoaHoc, maNganh: maNganh },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status !== 200 || response.data.code !== 200) {
        setError(`API returned code: ${response.data.code || response.status}`);
      }
      console.log("Hoc Phan Goi Y:", response.data.data);
      
      // Loại bỏ học phần trùng lặp dựa trên maHp
      const rawData = response.data.data || [];
      const uniqueHocPhanGoiY = rawData.filter((hocPhan: HocPhan, index: number, self: HocPhan[]) => 
        self.findIndex(hp => hp.maHp === hocPhan.maHp) === index
      );
      
      setHocPhanGoiY(uniqueHocPhanGoiY);
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        console.error(err);
      }
    }
  }, [axiosPrivate, khoaHoc, maNganh, maSo]);

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
      const filtedHocPhanCaiThien: HocPhanCaiThien[] = response.data.data.map(
        (item: any) => {
          return {
            id: item.id,
            maHp: item.hocPhan.maHp,
            tenHp: item.hocPhan.tenHp,
            diemChu: item.diemChu,
            diemSo: item.diemSo,
            soTinChi: item.hocPhan.tinChi,
          } as HocPhanCaiThien;
        }
      );

      // Loại bỏ học phần trùng lặp dựa trên maHp
      const uniqueHocPhanCaiThien = filtedHocPhanCaiThien.filter((hocPhan, index, self) => 
        self.findIndex(hp => hp.maHp === hocPhan.maHp) === index
      );

      setHocPhanCaiThien(uniqueHocPhanCaiThien);
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        console.error(err);
      }
    }
  }, [axiosPrivate, maSo]); // Fetch học phần cải thiện khi component mount

  // Fetch học phần tự chọn
  const fetchNhomHocPhanTuChon = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(
        HOCPHAN_SERVICE.CTDT_HOC_PHAN_TU_CHON_LIST,
        {
          params: {
            khoaHoc: khoaHoc,
            maNganh: maNganh, // Assuming 6 is the ID for the desired major
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      
      // Loại bỏ học phần trùng lặp trong từng nhóm học phần tự chọn
      const uniqueNhomHocPhanTuChon = (response.data.data || []).map((nhom: HocPhanTuChon) => ({
        ...nhom,
        hocPhanTuChonList: nhom.hocPhanTuChonList.filter((hocPhan, index, self) => 
          self.findIndex(hp => hp.maHp === hocPhan.maHp) === index
        )
      }));
      
      setNhomHocPhanTuChon(uniqueNhomHocPhanTuChon);
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        console.error(err);
      }
    }
  }, [axiosPrivate, khoaHoc, maNganh]);
  useEffect(() => {
    if (maSo) {
      fetchHocKy();
      fetchHocPhanCaiThien();
      fetchAvailableHocPhan();
      fetchNhomHocPhanTuChon();
      fetchHocPhanGoiY();
      fetchMaHocPhanInKHHT();
    }
  }, [
    maSo,
    fetchHocKy,
    fetchAvailableHocPhan,
    fetchNhomHocPhanTuChon,
    fetchHocPhanCaiThien,
    fetchHocPhanGoiY,
    fetchMaHocPhanInKHHT,
  ]);

  // Filter available học phần (exclude selected ones)
  const filteredAvailableHocPhan = useMemo(() => {
    return availableHocPhan.filter(
      (hocPhan) =>
        !selectedHocPhan?.some((selected) => selected.maHp === hocPhan.maHp)
    );
  }, [availableHocPhan, selectedHocPhan]);  // Helper function để tính tổng tín chỉ đã chọn cho một nhóm (bao gồm cả đã lưu và đang chọn)
  const getTinChiDaChonTrongNhom = useCallback(
    (nhom: HocPhanTuChon) => {
      // Tín chỉ từ học phần đã lưu trong KHHT
      const tinChiDaLuu = nhom.hocPhanTuChonList
        .filter(hp => maHocPhanInKHHT.includes(hp.maHp))
        .reduce((total, hp) => total + hp.tinChi, 0);
      
      // Tín chỉ từ học phần đang chọn (chưa lưu)
      const tinChiDangChon = selectedHocPhan
        .filter((selected) =>
          nhom.hocPhanTuChonList.some((hp) => hp.maHp === selected.maHp) &&
          !maHocPhanInKHHT.includes(selected.maHp) // Không đếm trùng
        )
        .reduce((total, selected) => total + selected.tinChi, 0);
      
      return tinChiDaLuu + tinChiDangChon;
    },
    [selectedHocPhan, maHocPhanInKHHT]
  );// Add học phần to selected list
  const addHocPhan = useCallback(
    (hocPhan: HocPhan, nhomId?: number) => {
      // Nếu có nhomId, hiển thị cảnh báo nếu sẽ vượt quá
      if (nhomId !== undefined) {
        const nhom = NhomHocPhanTuChon.find((n) => n.id === nhomId);
        if (nhom) {
          const tinChiDaChon = getTinChiDaChonTrongNhom(nhom);
          const tinChiSauKhiThem = tinChiDaChon + hocPhan.tinChi;

          // Hiển thị cảnh báo nếu sẽ vượt quá yêu cầu
          if (tinChiSauKhiThem > nhom.tinChiYeuCau) {
            setSuccess(
              `Đã thêm "${hocPhan.tenHp}". Lưu ý: Tổng tín chỉ nhóm sẽ là ${tinChiSauKhiThem}/${nhom.tinChiYeuCau} (vượt ${tinChiSauKhiThem - nhom.tinChiYeuCau} tín chỉ).`
            );
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
    },
    [NhomHocPhanTuChon, getTinChiDaChonTrongNhom]
  );

  // Remove học phần from selected list
  const removeHocPhan = useCallback((maHp: string) => {
    setSelectedHocPhan((prev) =>
      prev.filter((hocPhan) => hocPhan.maHp !== maHp)
    );
  }, []);

  // Helper function để kiểm tra học phần đã được thêm vào kế hoạch chưa
  const isHocPhanAlreadyAdded = useCallback(
    (maHp: string) => {
      // Kiểm tra trong maHocPhanInKHHT, nếu có thì đã được thêm
      return maHocPhanInKHHT.includes(maHp);
    },
    [maHocPhanInKHHT]
  );

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
      // Refresh cả available học phần và danh sách mã học phần trong KHHT
      fetchAvailableHocPhan();
      fetchMaHocPhanInKHHT();
    } catch (err) {
      setError((err as { message: string }).message);
    } finally {
      setFetchLoading(false);
    }
  };
  const availableColumns = useMemo<ColumnDef<HocPhan>[]>(
    () => [
      {
        accessorKey: "maHp",
        header: ({ column }) => (
          <SortableHeader column={column} title="Mã học phần" />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("maHp")}</div>
        ),
      },
      {
        accessorKey: "tenHp",
        header: ({ column }) => (
          <SortableHeader column={column} title="Tên học phần" />
        ),
        cell: ({ row }) => (
          <div className="text-left">{row.getValue("tenHp")}</div>
        ),
      },
      {
        accessorKey: "tinChi",
        header: ({ column }) => (
          <SortableHeader column={column} title="Tín chỉ" />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("tinChi")}</div>
        ),
      },
      {
        accessorKey: "hocPhanTienQuyet",
        header: ({ column }) => (
          <SortableHeader column={column} title="Tiên quyết" />
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
        cell: ({ row }) => {
          const hocPhan = row.original;
          const isAlreadyAdded = isHocPhanAlreadyAdded(hocPhan.maHp);
          const isCurrentlySelected = selectedHocPhan?.some((selected) => selected.maHp === hocPhan.maHp);
          
          if (isCurrentlySelected) {
            return (
              <div className="flex items-center justify-center">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Đã chọn
                </span>
              </div>
            );
          }
          
          if (isAlreadyAdded) {
            return (
              <div className="flex items-center justify-center">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  Đã thêm
                </span>
              </div>
            );
          }
          
          return (
            <div className="flex items-center justify-center">
              <button
                className="text-green-600 hover:text-green-700 p-2 rounded-lg transition-colors duration-200"
                onClick={() => addHocPhan(row.original)}
                title="Thêm vào kế hoạch"
              >
                <CirclePlus className="h-5 w-5" />
              </button>
            </div>
          );
        },
      },
    ],
    [addHocPhan, isHocPhanAlreadyAdded, selectedHocPhan]
  );

  // Columns cho học phần cải thiện
  const createHocPhanCaiThienColumns = (): ColumnDef<HocPhanCaiThien>[] => [
    {
      accessorKey: "maHp",
      header: ({ column }) => (
        <SortableHeader column={column} title="Mã học phần" />
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("maHp")}</div>
      ),
    },
    {
      accessorKey: "tenHp",
      header: ({ column }) => (
        <SortableHeader column={column} title="Tên học phần" />
      ),
      cell: ({ row }) => (
        <div className="text-left">{row.getValue("tenHp")}</div>
      ),
    },
    {
      accessorKey: "soTinChi",
      header: ({ column }) => (
        <SortableHeader column={column} title="Tín chỉ" />
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("soTinChi")}</div>
      ),
    },
    {
      accessorKey: "diemChu",
      header: ({ column }) => (
        <SortableHeader column={column} title="Điểm chữ" />
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
        <SortableHeader column={column} title="Điểm số" />
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

        const isAlreadyAdded = isHocPhanAlreadyAdded(hocPhanToAdd.maHp);
        const isCurrentlySelected = selectedHocPhan?.some((selected) => selected.maHp === hocPhanToAdd.maHp);
        
        if (isCurrentlySelected) {
          return (
            <div className="flex items-center justify-center">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Đã chọn
              </span>
            </div>
          );
        }
        
        if (isAlreadyAdded) {
          return (
            <div className="flex items-center justify-center">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                Đã thêm
              </span>
            </div>
          );
        }

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
          <SortableHeader column={column} title="Mã học phần" />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("maHp")}</div>
        ),
      },
      {
        accessorKey: "tenHp",
        header: ({ column }) => (
          <SortableHeader column={column} title="Tên học phần" />
        ),
        cell: ({ row }) => (
          <div className="text-left">{row.getValue("tenHp")}</div>
        ),
      },
      {
        accessorKey: "tinChi",
        header: ({ column }) => (
          <SortableHeader column={column} title="Tín chỉ" />
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
      },
    ],
    [namHocList, hocKyList, removeHocPhan]
  );

  // Tối ưu hóa filter logic với useMemo
  const filteredHocPhanGoiY = useMemo(() => {
    return hocPhanGoiY.filter(
      (hocPhan) =>
        !selectedHocPhan?.some((selected) => selected.maHp === hocPhan.maHp)
    );
  }, [hocPhanGoiY, selectedHocPhan]);

  const filteredHocPhanCaiThien = useMemo(() => {
    return hocPhanCaiThien.filter(
      (hocPhan) =>
        !selectedHocPhan?.some((selected) => selected.maHp === hocPhan.maHp)
    );
  }, [hocPhanCaiThien, selectedHocPhan]);

  // Helper function để phân loại nhóm học phần
  const categorizeNhomHocPhan = useMemo(() => {
    const theChat: HocPhanTuChon[] = [];
    const chuyenNganhGroups = new Map<string, HocPhanTuChon[]>();
    const other: HocPhanTuChon[] = [];

    NhomHocPhanTuChon.forEach(nhom => {
      const tenNhom = nhom.tenNhom?.toLowerCase() || '';
      
      // Kiểm tra nhóm thể chất
      if (tenNhom.includes('thể chất') || tenNhom.includes('the chat')) {
        theChat.push(nhom);
        return;
      }
      
      // Kiểm tra nhóm chuyên ngành (có dạng "Tên CN1", "Tên CN2", v.v.)
      const chuyenNganhMatch = nhom.tenNhom?.match(/^(.+\s+CN)\d+$/);
      if (chuyenNganhMatch) {
        const baseName = chuyenNganhMatch[1]; // Lấy phần "Tên CN"
        if (!chuyenNganhGroups.has(baseName)) {
          chuyenNganhGroups.set(baseName, []);
        }
        chuyenNganhGroups.get(baseName)!.push(nhom);
        return;
      }
      
      // Các nhóm khác
      other.push(nhom);
    });

    return {
      theChat,
      chuyenNganh: Array.from(chuyenNganhGroups.entries()),
      other
    };
  }, [NhomHocPhanTuChon]);

  // Helper function để kiểm tra và tính trạng thái hoàn thành cho nhóm chuyên ngành có đánh số
  const getChuyenNganhCompletionStatus = useCallback(
    (nhomList: HocPhanTuChon[]) => {
      const chuyenNganhGroups = new Map<string, HocPhanTuChon[]>();
      
      // Nhóm các chuyên ngành theo tên gốc (loại bỏ số đánh số cuối)
      nhomList.forEach(nhom => {
        const tenNhom = nhom.tenNhom || '';
        // Kiểm tra nếu tên nhóm có dạng "Tên CN1", "Tên CN2", v.v.
        const match = tenNhom.match(/^(.+\s+CN)\d+$/);
        if (match) {
          const baseName = match[1]; // Lấy phần "Tên CN"
          if (!chuyenNganhGroups.has(baseName)) {
            chuyenNganhGroups.set(baseName, []);
          }
          chuyenNganhGroups.get(baseName)!.push(nhom);
        }
      });

      // Tính trạng thái hoàn thành
      const completionStatus = new Map<number, boolean>();
      
      chuyenNganhGroups.forEach((relatedGroups) => {
        // Kiểm tra xem có nhóm nào đã hoàn thành không (dựa trên cả đã lưu và đang chọn)
        const hasCompletedGroup = relatedGroups.some(nhom => {
          const tinChiDaChon = getTinChiDaChonTrongNhom(nhom);
          return tinChiDaChon >= nhom.tinChiYeuCau;
        });

        // Nếu có ít nhất 1 nhóm hoàn thành, đánh dấu tất cả các nhóm liên quan là hoàn thành
        if (hasCompletedGroup) {
          relatedGroups.forEach(nhom => {
            completionStatus.set(nhom.id, true);
          });
        }
      });

      return completionStatus;
    },
    [getTinChiDaChonTrongNhom]
  );

  // Hàm kiểm tra trạng thái hoàn thành của tất cả các nhóm học phần khi vào trang
  const checkCompletionStatusForAllGroups = useCallback(() => {
    if (NhomHocPhanTuChon.length === 0 || maHocPhanInKHHT.length === 0) {
      return;
    }

    console.log("=== KIỂM TRA TRẠNG THÁI HOÀN THÀNH CÁC NHÓM HỌC PHẦN ===");
    
    const completedGroups: string[] = [];
    const pendingGroups: string[] = [];

    // Tạo map để theo dõi các nhóm chuyên ngành (có đánh số)
    const chuyenNganhGroupsMap = new Map<string, { 
      nhomList: HocPhanTuChon[]; 
      hasCompletedGroup: boolean; 
    }>();

    // Phân loại các nhóm có đánh số và nhóm thường
    const regularGroups: HocPhanTuChon[] = [];

    NhomHocPhanTuChon.forEach(nhom => {
      // Kiểm tra nếu nhóm có dạng "Tên CN1", "Tên CN2", v.v.
      const chuyenNganhMatch = nhom.tenNhom?.match(/^(.+\s+CN)\d+$/);
      if (chuyenNganhMatch) {
        const baseName = chuyenNganhMatch[1]; // Lấy phần "Tên CN"
        
        if (!chuyenNganhGroupsMap.has(baseName)) {
          chuyenNganhGroupsMap.set(baseName, {
            nhomList: [],
            hasCompletedGroup: false
          });
        }
        
        chuyenNganhGroupsMap.get(baseName)!.nhomList.push(nhom);
      } else {
        regularGroups.push(nhom);
      }
    });

    // Kiểm tra trạng thái hoàn thành cho các nhóm chuyên ngành (có đánh số)
    chuyenNganhGroupsMap.forEach((groupInfo, baseName) => {
      const hasCompletedGroup = groupInfo.nhomList.some(nhom => {
        const tinChiDaHoanThanh = nhom.hocPhanTuChonList
          .filter(hp => maHocPhanInKHHT.includes(hp.maHp))
          .reduce((total, hp) => total + hp.tinChi, 0);
        return tinChiDaHoanThanh >= nhom.tinChiYeuCau;
      });
      
      groupInfo.hasCompletedGroup = hasCompletedGroup;
      
      if (hasCompletedGroup) {
        // Nếu một trong các nhóm đã hoàn thành, đánh dấu toàn bộ nhóm base này là hoàn thành
        const completedSubgroup = groupInfo.nhomList.find(nhom => {
          const tinChiDaHoanThanh = nhom.hocPhanTuChonList
            .filter(hp => maHocPhanInKHHT.includes(hp.maHp))
            .reduce((total, hp) => total + hp.tinChi, 0);
          return tinChiDaHoanThanh >= nhom.tinChiYeuCau;
        });
        
        if (completedSubgroup) {
          const tinChiDaHoanThanh = completedSubgroup.hocPhanTuChonList
            .filter(hp => maHocPhanInKHHT.includes(hp.maHp))
            .reduce((total, hp) => total + hp.tinChi, 0);
          completedGroups.push(`${baseName} (hoàn thành qua ${completedSubgroup.tenNhom}: ${tinChiDaHoanThanh}/${completedSubgroup.tinChiYeuCau} tín chỉ)`);
        }
      } else {
        // Nếu chưa có nhóm nào hoàn thành, hiển thị tiến độ của tất cả các nhóm con
        const progressDetails = groupInfo.nhomList.map(nhom => {
          const tinChiDaHoanThanh = nhom.hocPhanTuChonList
            .filter(hp => maHocPhanInKHHT.includes(hp.maHp))
            .reduce((total, hp) => total + hp.tinChi, 0);
          return `${nhom.tenNhom}: ${tinChiDaHoanThanh}/${nhom.tinChiYeuCau}`;
        }).join(', ');
        
        pendingGroups.push(`${baseName} (${progressDetails})`);
      }
    });

    // Kiểm tra các nhóm thường (không có đánh số)
    regularGroups.forEach(nhom => {
      const tinChiDaHoanThanh = nhom.hocPhanTuChonList
        .filter(hp => maHocPhanInKHHT.includes(hp.maHp))
        .reduce((total, hp) => total + hp.tinChi, 0);

      const isCompleted = tinChiDaHoanThanh >= nhom.tinChiYeuCau;
      
      if (isCompleted) {
        completedGroups.push(`${nhom.tenNhom} (${tinChiDaHoanThanh}/${nhom.tinChiYeuCau} tín chỉ)`);
      } else {
        pendingGroups.push(`${nhom.tenNhom} (${tinChiDaHoanThanh}/${nhom.tinChiYeuCau} tín chỉ)`);
      }
    });

    // Tạo chuyenNganhGroups cho UI display
    const chuyenNganhGroups = new Map<string, { completed: boolean; details: string[] }>();
    
    chuyenNganhGroupsMap.forEach((groupInfo, baseName) => {
      const details = groupInfo.nhomList.map(nhom => {
        const tinChiDaHoanThanh = nhom.hocPhanTuChonList
          .filter(hp => maHocPhanInKHHT.includes(hp.maHp))
          .reduce((total, hp) => total + hp.tinChi, 0);
        const status = tinChiDaHoanThanh >= nhom.tinChiYeuCau ? "✅" : "⏳";
        return `  ${status} ${nhom.tenNhom}: ${tinChiDaHoanThanh}/${nhom.tinChiYeuCau} tín chỉ`;
      });

      chuyenNganhGroups.set(baseName, {
        completed: groupInfo.hasCompletedGroup,
        details
      });
    });

    // Cập nhật state để hiển thị trên UI
    setCompletionStatus({
      completedGroups,
      pendingGroups,
      chuyenNganhGroups
    });

    // Log kết quả
    console.log("\n📊 TỔNG KẾT TRẠNG THÁI:");
    console.log(`✅ Nhóm đã hoàn thành: ${completedGroups.length}`);
    console.log(`⏳ Nhóm chưa hoàn thành: ${pendingGroups.length}`);
    
    if (completedGroups.length > 0) {
      console.log("\n✅ CÁC NHÓM ĐÃ HOÀN THÀNH:");
      completedGroups.forEach(group => console.log(`  ${group}`));
    }
    
    if (pendingGroups.length > 0) {
      console.log("\n⏳ CÁC NHÓM CHƯA HOÀN THÀNH:");
      pendingGroups.forEach(group => console.log(`  ${group}`));
    }

    if (chuyenNganhGroups.size > 0) {
      console.log("\n🎓 NHÓM CHUYÊN NGÀNH (chỉ cần hoàn thành 1 trong các nhóm cùng tên):");
      chuyenNganhGroups.forEach((info, baseName) => {
        const status = info.completed ? "✅ ĐÃ HOÀN THÀNH" : "⏳ CHƯA HOÀN THÀNH";
        console.log(`${baseName}: ${status}`);
        info.details.forEach(detail => console.log(detail));
      });
    }

    console.log("=== KẾT THÚC KIỂM TRA ===\n");
  }, [NhomHocPhanTuChon, maHocPhanInKHHT]);

  // Thêm useEffect để kiểm tra trạng thái hoàn thành khi vào trang hoặc khi có thay đổi
  useEffect(() => {
    // Chỉ kiểm tra khi đã có đầy đủ dữ liệu
    if (NhomHocPhanTuChon.length > 0 && maHocPhanInKHHT.length >= 0) {
      checkCompletionStatusForAllGroups();
    }
  }, [NhomHocPhanTuChon, maHocPhanInKHHT, selectedHocPhan, checkCompletionStatusForAllGroups]);

  if (error && !selectedHocPhan.length) return <Error error={error} />;

  const TabButton = ({ 
    tab, 
    isActive, 
    children, 
    icon, 
    count 
  }: { 
    tab: "select" | "selected" | "theChat" | "chuyenNganh" | "other"; 
    isActive: boolean; 
    children: React.ReactNode; 
    icon: React.ReactNode;
    count?: number;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? "bg-blue-500 text-white shadow-lg"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {icon}
      <span>{children}</span>
      {count !== undefined && count > 0 && (
        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
          isActive 
            ? "bg-white text-blue-500" 
            : "bg-blue-500 text-white"
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      {isLoading ? (
        <Loading showOverlay={false} message="Đang tải dữ liệu học phần..." />
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-between items-start gap-2 mb-6">
            {/* Left side tabs */}
            <div className="flex flex-wrap gap-2">
              <TabButton 
                tab="select" 
                isActive={activeTab === "select"}
                icon={<CirclePlus className="h-5 w-5" />}
              >
                Chọn học phần
              </TabButton>
              
              {/* Tab nhóm thể chất */}
              {categorizeNhomHocPhan.theChat.length > 0 && (
                <TabButton 
                  tab="theChat" 
                  isActive={activeTab === "theChat"}
                  icon={<Dumbbell className="h-5 w-5" />}
                >
                  Thể chất
                </TabButton>
              )}
              
              {/* Tab nhóm chuyên ngành */}
              {categorizeNhomHocPhan.chuyenNganh.length > 0 && (
                <TabButton 
                  tab="chuyenNganh" 
                  isActive={activeTab === "chuyenNganh"}
                  icon={<Users className="h-5 w-5" />}
                >
                  Chuyên ngành
                </TabButton>
              )}
              
              {/* Tab nhóm khác */}
              {categorizeNhomHocPhan.other.length > 0 && (
                <TabButton 
                  tab="other" 
                  isActive={activeTab === "other"}
                  icon={<BookOpen className="h-5 w-5" />}
                >
                  Nhóm khác
                </TabButton>
              )}
            </div>
            
            {/* Right side tab */}
            <div className="flex">
              <TabButton 
                tab="selected" 
                isActive={activeTab === "selected"}
                icon={<SquareLibrary className="h-5 w-5" />}
                count={selectedHocPhan.length}
              >
                Học phần đã chọn
              </TabButton>
            </div>
          </div>

          {/* Hiển thị trạng thái hoàn thành */}
          {(completionStatus.completedGroups.length > 0 || completionStatus.pendingGroups.length > 0 || completionStatus.chuyenNganhGroups.size > 0) && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tình trạng hoàn thành các nhóm học phần
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Nhóm đã hoàn thành */}
                  {completionStatus.completedGroups.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Đã hoàn thành ({completionStatus.completedGroups.length})
                      </h4>
                      <div className="space-y-1">
                        {completionStatus.completedGroups.map((group, index) => (
                          <div key={index} className="text-sm text-green-700 bg-green-100 rounded px-2 py-1">
                            {group}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nhóm chưa hoàn thành */}
                  {completionStatus.pendingGroups.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Chưa hoàn thành ({completionStatus.pendingGroups.length})
                      </h4>
                      <div className="space-y-1">
                        {completionStatus.pendingGroups.map((group, index) => (
                          <div key={index} className="text-sm text-orange-700 bg-orange-100 rounded px-2 py-1">
                            {group}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nhóm chuyên ngành */}
                  {completionStatus.chuyenNganhGroups.size > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Nhóm chuyên ngành
                      </h4>
                      <div className="space-y-2">
                        {Array.from(completionStatus.chuyenNganhGroups.entries()).map(([baseName, info]) => (
                          <div key={baseName} className={`text-sm rounded px-2 py-1 ${
                            info.completed 
                              ? "bg-green-100 text-green-700" 
                              : "bg-orange-100 text-orange-700"
                          }`}>
                            <div className="font-medium flex items-center">
                              {info.completed ? (
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              {baseName}
                            </div>
                            <div className="text-xs mt-1 opacity-80">
                              {info.completed ? "Đã hoàn thành" : "Chưa hoàn thành"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tổng kết */}
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-green-700 font-medium">
                      ✅ Hoàn thành: {completionStatus.completedGroups.length}
                    </span>
                    <span className="text-orange-700 font-medium">
                      ⏳ Chưa hoàn thành: {completionStatus.pendingGroups.length}
                    </span>
                    <span className="text-blue-700 font-medium">
                      📊 Tổng nhóm: {completionStatus.completedGroups.length + completionStatus.pendingGroups.length}
                    </span>
                    {completionStatus.chuyenNganhGroups.size > 0 && (
                      <span className="text-purple-700 font-medium">
                        🎓 Nhóm chuyên ngành: {Array.from(completionStatus.chuyenNganhGroups.values()).filter(g => g.completed).length}/{completionStatus.chuyenNganhGroups.size}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === "select" ? (
            <div className="space-y-6">
              {/* Available học phần table */}
              <KeHoachHocTapTable
                name="Danh sách học phần có thể thêm"
                data={filteredAvailableHocPhan}
                columns={availableColumns}
                initialExpanded={true}
                loading={false}
              />
              
              {/* Bảng học phần gợi ý */}
              {filteredHocPhanGoiY && filteredHocPhanGoiY.length > 0 && (
                <div className="space-y-2">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-800 mb-1">
                          Học phần gợi ý
                        </h3>
                        <p className="text-emerald-600 text-sm">
                          Các học phần phù hợp với tiến độ học tập của bạn
                          {filteredHocPhanGoiY.length > 0 && (
                            <span className="ml-2 text-emerald-700">
                              - Có{" "}
                              <span className="font-medium">
                                {filteredHocPhanGoiY.length}
                              </span>{" "}
                              môn được gợi ý
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                          {filteredHocPhanGoiY.length} môn học
                        </div>
                        <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                          Được gợi ý
                        </div>
                      </div>
                    </div>
                  </div>
                  <KeHoachHocTapTable
                    name="Học phần được gợi ý"
                    data={filteredHocPhanGoiY}
                    columns={availableColumns}
                    initialExpanded={false}
                    loading={false}
                  />
                </div>
              )}

              {/* Bảng học phần cải thiện */}
              {filteredHocPhanCaiThien && filteredHocPhanCaiThien.length > 0 && (
                <div className="space-y-2">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-orange-800 mb-1">
                          Học phần cải thiện
                        </h3>
                        <p className="text-orange-600 text-sm">
                          Các học phần có điểm chưa đạt cần cải thiện
                          {filteredHocPhanCaiThien.length > 0 && (
                            <span className="ml-2 text-orange-700">
                              - Có{" "}
                              <span className="font-medium">
                                {filteredHocPhanCaiThien.length}
                              </span>{" "}
                              môn có thể cải thiện
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                          {filteredHocPhanCaiThien.length} môn học
                        </div>
                        <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                          Cần cải thiện
                        </div>
                      </div>
                    </div>
                  </div>
                  <KeHoachHocTapTable
                    name="Học phần cần cải thiện"
                    data={filteredHocPhanCaiThien}
                    columns={createHocPhanCaiThienColumns()}
                    initialExpanded={false}
                    loading={false}
                  />
                </div>
              )}
            </div>
          ) : activeTab === "theChat" ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 mb-1">
                      Nhóm học phần thể chất
                    </h3>
                    <p className="text-green-600 text-sm">
                      Các môn thể chất cần thiết cho chương trình đào tạo
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Dumbbell className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
              
              <NhomHocPhanTuChonTable
                nhomHocPhanTuChon={categorizeNhomHocPhan.theChat}
                selectedHocPhan={selectedHocPhan}
                onAddHocPhan={addHocPhan}
                getTinChiDaChonTrongNhom={getTinChiDaChonTrongNhom}
                getChuyenNganhCompletionStatus={getChuyenNganhCompletionStatus}
                isHocPhanAlreadyAdded={isHocPhanAlreadyAdded}
              />
            </div>
          ) : activeTab === "chuyenNganh" ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-800 mb-1">
                      Nhóm học phần chuyên ngành
                    </h3>
                    <p className="text-purple-600 text-sm">
                      Các nhóm học phần chuyên ngành theo từng lĩnh vực
                    </p>
                    <div className="mt-2 p-2 bg-purple-100 rounded-lg">
                      <p className="text-xs text-purple-700 font-medium">
                        💡 <strong>Lưu ý quan trọng:</strong> Đối với các nhóm có đánh số (ví dụ: CN1, CN2, CN3...), 
                        bạn chỉ cần hoàn thành <strong>một trong các nhóm</strong> là đủ. 
                        Khi một nhóm đã hoàn thành, toàn bộ nhóm chuyên ngành đó sẽ được đánh dấu là hoàn thành.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
              
              {categorizeNhomHocPhan.chuyenNganh.map(([baseName, nhomList]) => {
                // Tính trạng thái hoàn thành cho nhóm chuyên ngành này dựa trên maHocPhanInKHHT
                // Chỉ cần 1 trong các nhóm con (CN1, CN2, ...) hoàn thành là đủ
                const hasCompletedGroup = nhomList.some(nhom => {
                  const tinChiDaHoanThanh = nhom.hocPhanTuChonList
                    .filter(hp => maHocPhanInKHHT.includes(hp.maHp))
                    .reduce((total, hp) => total + hp.tinChi, 0);
                  return tinChiDaHoanThanh >= nhom.tinChiYeuCau;
                });

                // Tìm nhóm con đã hoàn thành (nếu có)
                const completedSubgroup = nhomList.find(nhom => {
                  const tinChiDaHoanThanh = nhom.hocPhanTuChonList
                    .filter(hp => maHocPhanInKHHT.includes(hp.maHp))
                    .reduce((total, hp) => total + hp.tinChi, 0);
                  return tinChiDaHoanThanh >= nhom.tinChiYeuCau;
                });

                return (
                  <div key={baseName} className="space-y-2">
                    <div className={`bg-gradient-to-r border rounded-lg p-3 ${
                      hasCompletedGroup 
                        ? "from-green-50 to-emerald-50 border-green-200" 
                        : "from-violet-50 to-purple-50 border-violet-200"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`text-md font-semibold ${
                            hasCompletedGroup ? "text-green-800" : "text-violet-800"
                          }`}>
                            {baseName}
                          </h4>
                          <p className={`text-sm ${
                            hasCompletedGroup ? "text-green-600" : "text-violet-600"
                          }`}>
                            {hasCompletedGroup 
                              ? `Đã hoàn thành qua ${completedSubgroup?.tenNhom} - Bạn có thể chọn thêm môn khác hoặc để như vậy`
                              : "Chọn một trong các nhóm sau (chỉ cần hoàn thành 1 nhóm)"
                            }
                          </p>
                        </div>
                        {hasCompletedGroup && (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Đã hoàn thành
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <NhomHocPhanTuChonTable
                      nhomHocPhanTuChon={nhomList}
                      selectedHocPhan={selectedHocPhan}
                      onAddHocPhan={addHocPhan}
                      getTinChiDaChonTrongNhom={getTinChiDaChonTrongNhom}
                      getChuyenNganhCompletionStatus={getChuyenNganhCompletionStatus}
                      isHocPhanAlreadyAdded={isHocPhanAlreadyAdded}
                    />
                  </div>
                );
              })}
            </div>
          ) : activeTab === "other" ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      Các nhóm học phần khác
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Các nhóm học phần tự chọn khác trong chương trình đào tạo
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-8 w-8 text-gray-600" />
                  </div>
                </div>
              </div>
              
              <NhomHocPhanTuChonTable
                nhomHocPhanTuChon={categorizeNhomHocPhan.other}
                selectedHocPhan={selectedHocPhan}
                onAddHocPhan={addHocPhan}
                getTinChiDaChonTrongNhom={getTinChiDaChonTrongNhom}
                getChuyenNganhCompletionStatus={getChuyenNganhCompletionStatus}
                isHocPhanAlreadyAdded={isHocPhanAlreadyAdded}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected học phần table */}
              {selectedHocPhan.length > 0 ? (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800 mb-1">
                          Kế hoạch học tập
                        </h3>
                        <p className="text-blue-600 text-sm">
                          Bạn đã chọn {selectedHocPhan.length} học phần
                          <span className="ml-2 text-blue-700">
                            - Tổng tín chỉ:{" "}
                            <span className="font-medium">
                              {selectedHocPhan.reduce((total, hp) => total + hp.tinChi, 0)}
                            </span>
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {selectedHocPhan.length} môn học
                        </div>
                        <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                          {selectedHocPhan.reduce((total, hp) => total + hp.tinChi, 0)} tín chỉ
                        </div>
                      </div>
                    </div>
                  </div>
                  
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
                      Hủy tất cả
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
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <CirclePlus className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có học phần nào được chọn
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Hãy chuyển sang tab "Chọn học phần" để thêm các môn học vào kế hoạch
                  </p>
                  <button
                    onClick={() => setActiveTab("select")}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <CirclePlus className="h-4 w-4 mr-2" />
                    Chọn học phần
                  </button>
                </div>
              )}
            </div>
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
