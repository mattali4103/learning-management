import { useState, useCallback, useMemo } from 'react';
import useAxiosPrivate from './useAxiosPrivate';
import useAuth from './useAuth';
import { HOCPHAN_SERVICE } from '../api/apiEndPoints';

// Types
interface NamHoc {
  id: number;
  namBatDau: string;
  namKetThuc: string;
}
//Api trả về namHocDTO nên cần mapping lại
interface HocKy {
  maHocKy: number;
  tenHocKy: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  namHoc: NamHoc;
}

interface HocKyListItem {
  id: number;
  tenHocky: string;
  namHocId: number;
}

interface NamHocListItem {
  id: number;
  tenNamHoc: string;
}

interface UseHocKyDataReturn {
  // Data
  hocKyFromAPI: HocKy[];
  namHocList: NamHocListItem[];
  hocKyList: HocKyListItem[];
  
  // States
  isLoading: boolean;
  error: string | null;
  
  // Methods
  fetchHocKy: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook để quản lý dữ liệu học kỳ và năm học
 * @param khoaHoc - Khóa học của sinh viên
 * @param maNganh - Mã ngành của sinh viên
 * @returns Object chứa dữ liệu và methods để quản lý học kỳ/năm học
 */
const useHocKyData = (khoaHoc?: string, maNganh?: string): UseHocKyDataReturn => {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  
  // States
  const [hocKyFromAPI, setHocKyFromApi] = useState<HocKy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch học kỳ data from API
  const fetchHocKy = useCallback(async () => {
    if (!khoaHoc || !maNganh) {
      setError('Thiếu thông tin khóa học hoặc mã ngành');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axiosPrivate.get(HOCPHAN_SERVICE.GET_ALL_HOCKY, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token || ''}`,
        },
        withCredentials: true,
      });
      if (response.data?.code === 200) {
        setHocKyFromApi(response.data.data.map((hk: any) => ({
            maHocKy: hk.maHocKy,
            tenHocKy: hk.tenHocKy,
            ngayBatDau: hk.ngayBatDau,
            ngayKetThuc: hk.ngayKetThuc,
            namHoc: {
                id: hk.namHocDTO?.id || 0,
                namBatDau: hk.namHocDTO?.namBatDau || '',
                namKetThuc: hk.namHocDTO?.namKetThuc || '',
            },
        })));
      } else {
        setError(
          `API returned code: ${response.data?.code || response.status}`
        );
      }
    } catch (err) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        setError('Có lỗi xảy ra khi tải dữ liệu học kỳ');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate, auth?.token, khoaHoc, maNganh]);

  // Create academic year list from API data
  const namHocList = useMemo<NamHocListItem[]>(() => {
    const years = new Map<number, NamHocListItem>();
    hocKyFromAPI.forEach((hk) => {
      if (hk.namHoc && hk.namHoc.id && hk.namHoc.namBatDau && hk.namHoc.namKetThuc) {
        years.set(hk.namHoc.id, {
          id: hk.namHoc.id,
          tenNamHoc: `${hk.namHoc.namBatDau}-${hk.namHoc.namKetThuc}`,
        });
      }
    });
    return Array.from(years.values()).sort((a, b) => a.id - b.id);
  }, [hocKyFromAPI]);

  // Create semester list from API data
  const hocKyList = useMemo<HocKyListItem[]>(() => {
    return hocKyFromAPI.map((hk) => ({
      id: hk.maHocKy,
      tenHocky: hk.tenHocKy,
      namHocId: hk.namHoc?.id || 0,
    }));
  }, [hocKyFromAPI]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    hocKyFromAPI,
    namHocList,
    hocKyList,
    
    // States
    isLoading,
    error,
    
    // Methods
    fetchHocKy,
    clearError,
  };
};

export default useHocKyData;

// Export types for use in other components
export type { HocKy, NamHocListItem, HocKyListItem, UseHocKyDataReturn };
