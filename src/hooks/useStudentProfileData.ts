import { useEffect, useState } from "react";
import useAxiosPrivate from "./useAxiosPrivate";
import { PROFILE_SERVICE, KQHT_SERVICE } from "../api/apiEndPoints";
import type { PreviewProfile } from "../types/PreviewProfile";
import type { HocKy } from "../types/HocKy";

interface ThongKeTinChiByHocKy {
  hocKy: HocKy;
  soTinChiCaiThien?: number;
  soTinChiDangKy?: number;
  soTinChiRot?: number;
  soTinChiTichLuy?: number;
}

interface DiemTrungBinhHocKy {
  hocKy: HocKy;
  diemTrungBinh: number;
  diemTrungBinhTichLuy: number;
}

interface ProgressState {
  status: string;
  color: string;
  bg: string;
  avg?: number | null;
  totalCredits?: number;
  totalSemesters?: number;
}

interface UseStudentProfileDataProps {
  maSo: string | undefined;
}

interface UseStudentProfileDataReturn {
  userInfo: PreviewProfile | null;
  tinChiTichLuy: ThongKeTinChiByHocKy[];
  diemTrungBinhHocKy: DiemTrungBinhHocKy[];
  progressState: ProgressState;
  loading: boolean;
  error: string | null;
}

const useStudentProfileData = ({ 
  maSo 
}: UseStudentProfileDataProps): UseStudentProfileDataReturn => {
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [userInfo, setUserInfo] = useState<PreviewProfile | null>(null);
  const [tinChiTichLuy, setTinChiTichLuy] = useState<ThongKeTinChiByHocKy[]>([]);
  const [diemTrungBinhHocKy, setDiemTrungBinhHocKy] = useState<DiemTrungBinhHocKy[]>([]);

  // Progress Status State
  const [progressState, setProgressState] = useState<ProgressState>({
    status: "Chưa có dữ liệu",
    color: "text-gray-600",
    bg: "bg-gray-50",
    avg: null,
    totalCredits: 0,
    totalSemesters: 0,
  });

  // Update progress state based on fetched data
  useEffect(() => {
    let totalCredits = 0;
    let totalSemesters = 0;
    
    if (typeof userInfo?.soTinChiTichLuy === "number") {
      totalCredits = userInfo.soTinChiTichLuy;
    }

    if (Array.isArray(tinChiTichLuy)) {
      totalSemesters = tinChiTichLuy.length;
    }

    let status = "Chưa có dữ liệu";
    let color = "text-gray-600";
    let bg = "bg-gray-50";
    let avg: number | null = null;

    if (totalSemesters > 0) {
      avg = totalCredits / totalSemesters;
      if (avg < 10) {
        status = "Trễ tiến độ";
        color = "text-red-600";
        bg = "bg-red-50";
      } else if (avg > 20) {
        status = "Vượt tiến độ";
        color = "text-green-600";
        bg = "bg-green-50";
      } else {
        status = "Đúng tiến độ";
        color = "text-blue-600";
        bg = "bg-blue-50";
      }
    }

    setProgressState({ status, color, bg, avg, totalCredits, totalSemesters });
  }, [userInfo, tinChiTichLuy]);

  // Fetch student data
  useEffect(() => {
    if (!maSo) return;

    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [profileResponse, familyResponse, tinChiResponse, gpaResponse] = await Promise.all([
          axiosPrivate.get(
            PROFILE_SERVICE.GET_SINHVIEN_PREVIEW_PROFILE.replace(":maSo", maSo)
          ),
          axiosPrivate.get(
            PROFILE_SERVICE.GET_SINHVIEN_NGUOITHAN_PROFILE.replace(":maSo", maSo)
          ).catch(() => null), // Optional - don't fail if this fails
          axiosPrivate.get(
            KQHT_SERVICE.GET_THONGKE_TINCHI.replace(":maSo", maSo)
          ).catch(() => null), // Optional - don't fail if this fails
          axiosPrivate.post(KQHT_SERVICE.GET_DIEM_TRUNG_BINH_BY_HOCKY, {
            maSo: maSo,
          }).catch(() => null),
        ]);

        // Process Profile
        if (
          profileResponse.status === 200 &&
          profileResponse.data?.code === 200
        ) {
          console.log("Profile data received:", profileResponse.data.data);
          let profileData = profileResponse.data.data;
          
          // Merge family information if available
          if (familyResponse && familyResponse.status === 200 && familyResponse.data?.code === 200) {
            console.log("Family data received:", familyResponse.data.data);
            const familyData = familyResponse.data.data;
            profileData = {
              ...profileData,
              hoTenCha: familyData.hoTenCha || profileData.hoTenCha,
              hoTenMe: familyData.hoTenMe || profileData.hoTenMe,
              soDienThoaiNguoiThan: familyData.soDienThoaiNguoiThan || profileData.soDienThoaiNguoiThan,
              queQuan: familyData.queQuan || profileData.queQuan,
            };
          }
          
          setUserInfo(profileData);
        } else {
          throw new Error(
            `API returned code: ${profileResponse.data?.code || profileResponse.status}`
          );
        }

        // Process Credit Stats
        if (tinChiResponse && tinChiResponse.status === 200 && tinChiResponse.data?.code === 200) {
          setTinChiTichLuy(tinChiResponse.data.data);
        } else {
          console.warn("Could not fetch credit accumulation.");
        }

        // Process GPA Stats
        if (gpaResponse && gpaResponse.status === 200 && gpaResponse.data?.code === 200) {
          setDiemTrungBinhHocKy(gpaResponse.data.data);
        } else {
          console.warn("Could not fetch GPA data.");
        }
      } catch (error) {
        setError("Không thể lấy thông tin sinh viên. Vui lòng thử lại.");
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [axiosPrivate, maSo]);

  return {
    userInfo,
    tinChiTichLuy,
    diemTrungBinhHocKy,
    progressState,
    loading,
    error,
  };
};

export default useStudentProfileData;
export type {
  UseStudentProfileDataProps,
  UseStudentProfileDataReturn,
  ThongKeTinChiByHocKy,
  DiemTrungBinhHocKy,
  ProgressState,
};
