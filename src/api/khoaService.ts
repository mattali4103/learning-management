import type { AxiosInstance } from "axios";
import { PROFILE_SERVICE } from "./apiEndPoints";
import type { Khoa } from "../types/Khoa";

interface FetchKhoaResponse {
  code: number;
  data: Khoa;
}

/**
 * Service function to fetch Khoa data by maKhoa
 * @param axiosPrivate - Axios instance with authentication
 * @param maKhoa - Mã khoa to fetch data for
 * @returns Promise<Khoa> - Returns the Khoa data
 * @throws Error if the request fails or returns invalid data
 */
export const fetchKhoaData = async (
  axiosPrivate: AxiosInstance,
  maKhoa: string
): Promise<Khoa> => {
  try {
    const response = await axiosPrivate.get<FetchKhoaResponse>(
      PROFILE_SERVICE.GET_KHOA.replace(":maKhoa", maKhoa)
    );
    
    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(`API returned error code: ${response.data.code}`);
    }
  } catch (error) {
    console.error("Error fetching khoa data:", error);
    throw error instanceof Error ? error : new Error("Lỗi không xác định khi tải dữ liệu khoa");
  }
};
