import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import NavigationPanel from "../../components/navigation/NavigationPanel";
import Loading from "../../components/Loading";
import KetQuaHocTapTable, {
  type KetQuaHocTapTableType,
} from "../../components/table/KetQuaHocTapTable";
import { KQHT_SERVICE } from "../../api/apiEndPoints";
import useAuth from "../../hooks/useAuth";
import type { HocKy } from "../../types/HocKy";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const KetQuaHocTapDetail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedNamHoc, setSelectedNamHoc] = useState<string>("Tất cả");
  const [selectedHocKy, setSelectedHocKy] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [navigationLoading, setNavigationLoading] = useState<boolean>(false);
  const [hocKyFromAPI, setHocKyFromAPI] = useState<HocKy[]>([]);
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const { maSo } = auth.user || {};  // Fetch dữ liệu học kỳ từ API
  const fetchHocKy = useCallback(async (maSo: string) => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(
        KQHT_SERVICE.GET_HOCKY.replace(":maSo", maSo),
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      
      // Kiểm tra response code
      if (response.status === 200 && response.data?.code === 200) {
        const hocKyData = response.data.data;
        setHocKyFromAPI(hocKyData);
        localStorage.setItem("hocKy", JSON.stringify(hocKyData));
        setError(null);
      } else {
        throw new Error(`API returned code: ${response.data?.code || response.status}`);
      }
    } catch (error) {
      console.error("Error fetching hoc ky:", error);
      setError("Không thể lấy thông tin học kỳ. Vui lòng thử lại.");
      // Fallback to localStorage or mock data if API fails
      try {
        const localData = localStorage.getItem("hocKy");
        if (localData) {
          setHocKyFromAPI(JSON.parse(localData));
          setError(null); // Clear error if localStorage data is available
        } else {
          // Nếu không có localStorage, hiển thị lỗi
          console.error("Không có dữ liệu học kỳ trong localStorage");
        }
      } catch (localError) {
        console.error(
          "Lỗi khi parse dữ liệu học kỳ từ localStorage:",
          localError
        );
      }
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);
  
  // Lấy dữ liệu học kỳ từ API khi component mount
  useEffect(() => {
    if (maSo) {
      fetchHocKy(maSo);
    } else {
      // Nếu không có maSo, hiển thị lỗi
      setError("Không tìm thấy mã số sinh viên");
      setLoading(false);
    }
  }, [maSo, fetchHocKy]);

  // Lấy dữ liệu học kỳ từ state
  const hocKyFromStorage: HocKy[] = useMemo(() => {
    return hocKyFromAPI;
  }, [hocKyFromAPI]);

  // Tạo danh sách năm học từ dữ liệu
  const namHocList = useMemo(() => {
    const years = new Set<string>();
    hocKyFromStorage.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        years.add(`${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`);
      }
    });
    return ["Tất cả", ...Array.from(years).sort()];
  }, [hocKyFromStorage]);

  // Tạo mapping ID năm học -> tên năm học
  const namHocIdToName = useMemo(() => {
    const mapping: Record<number, string> = {};
    hocKyFromStorage.forEach((hk) => {
      if (
        hk.namHoc &&
        hk.namHoc.id &&
        hk.namHoc.namBatDau &&
        hk.namHoc.namKetThuc
      ) {
        mapping[hk.namHoc.id] =
          `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`;
      }
    });
    return mapping;
  }, [hocKyFromStorage]);

  // Tạo mapping tên năm học -> ID năm học
  const namHocNameToId = useMemo(() => {
    const mapping: Record<string, number> = {};
    hocKyFromStorage.forEach((hk) => {
      if (
        hk.namHoc &&
        hk.namHoc.id &&
        hk.namHoc.namBatDau &&
        hk.namHoc.namKetThuc
      ) {
        const namHoc = `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`;
        mapping[namHoc] = hk.namHoc.id;
      }
    });
    return mapping;
  }, [hocKyFromStorage]);

  // Tạo dữ liệu học kỳ theo năm học
  const hocKyData = useMemo(() => {
    const data: Record<string, string[]> = {};
    hocKyFromStorage.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        const namHoc = `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`;
        if (!data[namHoc]) {
          data[namHoc] = [];
        }
        if (hk.tenHocKy && !data[namHoc].includes(hk.tenHocKy)) {
          data[namHoc].push(hk.tenHocKy);
        }
      }
    });
    // Sắp xếp học kỳ theo thứ tự
    Object.keys(data).forEach((key) => {
      data[key].sort();
    });
    return data;
  }, [hocKyFromStorage]);

  // Tạo mapping ID học kỳ -> tên học kỳ
  const hocKyIdToName = useMemo(() => {
    const mapping: Record<number, string> = {};
    hocKyFromStorage.forEach((hk) => {
      if (hk.maHocKy && hk.tenHocKy) {
        mapping[hk.maHocKy] = hk.tenHocKy;
      }
    });
    return mapping;
  }, [hocKyFromStorage]);

  // Tạo mapping tên học kỳ -> ID học kỳ (theo năm học)
  const hocKyNameToId = useMemo(() => {
    const mapping: Record<string, Record<string, number>> = {};
    hocKyFromStorage.forEach((hk) => {
      if (
        hk.namHoc &&
        hk.namHoc.namBatDau &&
        hk.namHoc.namKetThuc &&
        hk.maHocKy &&
        hk.tenHocKy
      ) {
        const namHoc = `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`;
        if (!mapping[namHoc]) {
          mapping[namHoc] = {};
        }
        mapping[namHoc][hk.tenHocKy] = hk.maHocKy;
      }
    });
    return mapping;
  }, [hocKyFromStorage]);

  useEffect(() => {
    const namHocIdParam = searchParams.get("namHocId");
    const hocKyIdParam = searchParams.get("hocKyId");

    // Xử lý param năm học
    if (namHocIdParam) {
      const namHocId = parseInt(namHocIdParam);
      if (namHocIdToName[namHocId]) {
        setSelectedNamHoc(namHocIdToName[namHocId]);
      }
    }

    // Xử lý param học kỳ
    if (hocKyIdParam) {
      const hocKyId = parseInt(hocKyIdParam);
      if (hocKyIdToName[hocKyId]) {
        setSelectedHocKy(hocKyIdToName[hocKyId]);
      }
    }
  }, [searchParams, namHocIdToName, hocKyIdToName]);   // Hàm để thay đổi năm học và cập nhật URL
  const handleNamHocChange = (namHoc: string) => {
    if (namHoc === selectedNamHoc) return; // Tránh gọi lại không cần thiết
    
    setNavigationLoading(true);
    setSelectedNamHoc(namHoc);
    setSelectedHocKy(""); // Reset học kỳ khi thay đổi năm học
    
    const newParams = new URLSearchParams(searchParams);
    if (namHoc === "Tất cả") {
      newParams.delete("namHocId");
    } else {
      const namHocId = namHocNameToId[namHoc];
      if (namHocId) {
        newParams.set("namHocId", namHocId.toString());
      }
    }
    newParams.delete("hocKyId"); // Xóa param học kỳ khi thay đổi năm học

    // Cập nhật URL và tắt loading
    setSearchParams(newParams);
    setTimeout(() => {
      setNavigationLoading(false);
    }, 300); // Giảm thời gian timeout để responsive hơn
  };

  // Hàm để thay đổi học kỳ
  const handleHocKyChange = (hocKy: string) => {
    if (hocKy === selectedHocKy) return; // Tránh gọi lại không cần thiết
    
    setNavigationLoading(true);
    setSelectedHocKy(hocKy);
    
    const newParams = new URLSearchParams(searchParams);
    // Lấy ID học kỳ từ tên học kỳ và năm học hiện tại
    const hocKyId = hocKyNameToId[selectedNamHoc]?.[hocKy];
    if (hocKyId) {
      newParams.set("hocKyId", hocKyId.toString());
    }

    // Cập nhật URL và tắt loading
    setSearchParams(newParams);
    setTimeout(() => {
      setNavigationLoading(false);
    }, 300); // Giảm thời gian timeout để responsive hơn
  };return (
    <div className="w-full space-y-4">
      {/* Thanh điều hướng luôn hiển thị */}
      <NavigationPanel
        namHocList={namHocList}
        selectedNamHoc={selectedNamHoc}
        selectedHocKy={selectedHocKy}
        hocKyData={hocKyData}
        onNamHocChange={handleNamHocChange}
        onHocKyChange={handleHocKyChange}
      />
      
      {/* Content area với loading states */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Loading showOverlay={false} message="Đang tải dữ liệu học kỳ..." />
        </div>
      ) : error ? (
        <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-lg">
          Lỗi: {error}
        </div>
      ) : navigationLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Loading showOverlay={false} message="Đang cập nhật dữ liệu..." />
        </div>
      ) : (
        /* Nội dung hiển thị */
        <ContentDisplay
          selectedNamHoc={selectedNamHoc}
          selectedHocKy={selectedHocKy}
        />
      )}
    </div>
  );
};

interface ContentDisplayProps {
  selectedNamHoc: string;
  selectedHocKy: string;
}

const ContentDisplay = ({
  selectedNamHoc,
  selectedHocKy,
}: ContentDisplayProps) => {
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ketQuaData, setKetQuaData] = useState<KetQuaHocTapTableType[]>([]);
  const [searchParams] = useSearchParams();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalElements: 0,
  });
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const { maSo } = auth.user || {}; // Fetch dữ liệu kết quả học tập từ API với phân trang
  const fetchKetQuaHocTap = useCallback(
    async (
      maSo: string,
      hocKyId?: number,
      page: number = 1,
      size: number = 10
    ) => {
      try {
        setTableLoading(true);
        setError(null);

        let url: string;
        let params: Record<string, string>;

        if (hocKyId) {
          // Sử dụng API không phân trang khi có học kỳ cụ thể
          url = KQHT_SERVICE.GET_KETQUA_BY_HOCKY;
          params = {
            maSo: maSo,
            maHocKy: hocKyId.toString(),
          };
        } else {
          // Sử dụng API phân trang khi lấy tất cả
          url = KQHT_SERVICE.GET_KETQUA;
          params = {
            maSo: maSo,
            page: page.toString(), // API sử dụng 1-based indexing (bắt đầu từ 1)
            size: size.toString(),
          };
        }        const response = await axiosPrivate.get(url, {
          params,
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        // Kiểm tra response code trước khi xử lý data
        if (response.status !== 200 || response.data?.code !== 200) {
          throw new Error(`API returned code: ${response.data?.code || response.status} - ${response.data?.message || 'Unknown error'}`);
        }

        // Xử lý response từ API
        const responseData = response.data.data;

        let data: any[] = [];

        if (hocKyId) {
          // Không có phân trang, data từ ketQuaHocTapList
          data = Array.isArray(responseData?.ketQuaHocTapList)
            ? responseData.ketQuaHocTapList
            : [];
          setPagination({
            currentPage: 1,
            totalPages: 1,
            pageSize: data.length,
            totalElements: data.length,
          });
        } else {
          // Có phân trang, lấy từ responseData.data
          data = Array.isArray(responseData?.data) ? responseData.data : [];
          setPagination({
            currentPage: responseData?.currentPage || 1,
            totalPages: responseData?.totalPages || 1,
            pageSize: responseData?.pageSize || size,
            totalElements: responseData?.totalElements || 0,
          });
        }

        // Kiểm tra data có phải là array không trước khi transform
        if (!Array.isArray(data)) {
          console.error("API response data is not an array:", data);
          setKetQuaData([]);
          return;
        } // Transform API data to match KetQuaHocTapTableType
        const transformedData: KetQuaHocTapTableType[] = data.map(
          (item: any) => {
            // For semester-specific data, use the top-level hocKy info
            const hocKyInfo =
              hocKyId && responseData?.hocKy ? responseData.hocKy : item.hocKy;

            return {
              id: item.id,
              maHp: item.hocPhan?.maHp || "",
              tenHp: item.hocPhan?.tenHp || "",
              dieuKien: item.dieuKien || false,
              nhomHp: item.hocPhan?.loaiHp || "",
              soTinChi: item.soTinChi || item.hocPhan?.tinChi || 0,
              diemChu: item.diemChu || "",
              diemSo: item.diemSo ? Math.round(item.diemSo * 10) / 10 : 0, // Làm tròn về 1 chữ số thập phân
              hocKy: {
                maHocKy: hocKyInfo?.maHocKy || 0,
                tenHocKy: hocKyInfo?.tenHocKy || "",
                ngayBatDau: hocKyInfo?.ngayBatDau || "",
                ngayKetThuc: hocKyInfo?.ngayKetThuc || "",
                namHoc: {
                  id: hocKyInfo?.namHoc?.id || 0,
                  namBatDau: hocKyInfo?.namHoc?.namBatDau || "",
                  namKetThuc: hocKyInfo?.namHoc?.namKetThuc || "",
                },
              },
              namHoc: {
                id: hocKyInfo?.namHoc?.id || 0,
                namBatDau: hocKyInfo?.namHoc?.namBatDau || "",
                namKetThuc: hocKyInfo?.namHoc?.namKetThuc || "",
              },
            };
          }
        );
        setKetQuaData(transformedData);
      } catch (error) {
        console.error("Error fetching ket qua hoc tap:", error);
        setError("Không thể lấy thông tin kết quả học tập. Vui lòng thử lại.");
        setKetQuaData([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          pageSize: 10,
          totalElements: 0,
        });
      } finally {
        setTableLoading(false);
      }
    },
    [axiosPrivate]
  );
  useEffect(() => {
    if (maSo) {
      // Lấy hocKyId từ URL params nếu có
      const hocKyIdParam = searchParams.get("hocKyId");
      const hocKyId = hocKyIdParam ? parseInt(hocKyIdParam) : undefined;

      fetchKetQuaHocTap(
        maSo,
        hocKyId,
        pagination.currentPage,
        pagination.pageSize
      );
    } else {
      setError("Không tìm thấy mã số sinh viên");
      setTableLoading(false);
    }
  }, [
    maSo,
    searchParams,
    pagination.currentPage,
    pagination.pageSize,
    fetchKetQuaHocTap,
  ]);  // Hàm xử lý thay đổi trang
  const handlePageChange = (newPage: number) => {
    if (newPage === pagination.currentPage) return; // Tránh gọi API không cần thiết
    
    setTableLoading(true);
    // Cập nhật pagination ngay lập tức để UX tốt hơn
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  // Hàm xử lý thay đổi kích thước trang
  const handlePageSizeChange = (newSize: number) => {
    if (newSize === pagination.pageSize) return; // Tránh gọi API không cần thiết
    
    setTableLoading(true);
    // Reset về trang 1 khi thay đổi page size
    setPagination((prev) => ({ 
      ...prev, 
      pageSize: newSize, 
      currentPage: 1 
    }));
  };

  // Hàm để lọc dữ liệu theo năm học và học kỳ (chỉ dùng cho client-side filter nếu cần)
  const filterDataByParams = (data: KetQuaHocTapTableType[]) => {
    if (!data || data.length === 0) return [];
    let filteredData = [...data];

    // Nếu đã fetch theo học kỳ cụ thể thì không cần filter thêm
    const hocKyIdParam = searchParams.get("hocKyId");
    if (hocKyIdParam) {
      return filteredData; // API đã filter theo học kỳ
    }

    // Lọc theo năm học nếu không phải "Tất cả"
    if (selectedNamHoc !== "Tất cả") {
      filteredData = filteredData.filter((item) => {
        const namHoc = `${item.namHoc.namBatDau}-${item.namHoc.namKetThuc}`;
        return namHoc === selectedNamHoc;
      });
    }

    // Lọc theo học kỳ nếu có chọn học kỳ cụ thể
    if (selectedHocKy) {
      filteredData = filteredData.filter(
        (item) => item.hocKy.tenHocKy === selectedHocKy
      );
    }

    return filteredData;
  }; // Tạo dữ liệu đã lọc
  const filteredData = filterDataByParams(ketQuaData);

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-lg">
        Lỗi: {error}
      </div>
    );
  }  const renderContent = () => {
    // Nếu đang loading lần đầu, hiển thị loading toàn bộ content area
    if (tableLoading && ketQuaData.length === 0) {
      return (
        <div className="p-6">
          <Loading showOverlay={false} message="Đang tải kết quả học tập..." />
        </div>
      );
    }

    return (
      <div className="p-4">
        <KetQuaHocTapTable
          name="Kết quả học tập"
          data={filteredData}
          enableServerPagination={!searchParams.get("hocKyId")} // Chỉ dùng server pagination khi không filter theo học kỳ
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          totalElements={pagination.totalElements}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          loading={tableLoading}
        />
      </div>
    );
  };

  return <div className="bg-white rounded-lg shadow-sm">{renderContent()}</div>;
};

export default KetQuaHocTapDetail;
