import { apiGet } from "./api-client";
import { KHHT_SERVICE,  } from "./apiEndPoints";

export const getCountTinChi = async (maSo: string, khoaHoc: string): Promise<any> => {
  try{
    const result = await apiGet<any[]>(KHHT_SERVICE.COUNT_TINCHI_IN_KHHT.replace(":khoaHoc", khoaHoc).replace(":maSo", maSo));
    if(result){
      return result;
    }
  } catch (error) {
    return (error as { message: string }).message;
  }
};
