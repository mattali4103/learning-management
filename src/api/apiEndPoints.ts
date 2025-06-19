export const USER_SERIVCE_URL = "http://localhost:8088";
export const KHHT_SERVICE_URL = "http://localhost:8087";
export const HOCPHAN_SERVICE_URL = "http://localhost:8086";
export const PROFILE_SERVICE_URL = "http://localhost:8083";
// const PATH = "http://172.30.121.19:8088"
export const USER_SERVICE = {
  LOGIN: USER_SERIVCE_URL + "/api/auth/login",
  REGISTER: USER_SERIVCE_URL + "/api/auth/register",
  GET_USER: USER_SERIVCE_URL + "/api/user/:maSo",
  UPDATE_USER: USER_SERIVCE_URL + "/api/user/update",
  VALIDATE: USER_SERIVCE_URL + "/api/auth/validate",
  REFRESH_TOKEN: USER_SERIVCE_URL + "/api/auth/refresh",
  LOGOUT: USER_SERIVCE_URL + "/api/auth/logout",
};
export const PROFILE_SERVICE = {
  GET_SINHVIEN_PROFILE: PROFILE_SERVICE_URL + "/api/profile/sinhvien/:maSo",
  GET_MY_PROFILE: PROFILE_SERVICE_URL + "/api/profile/sinhvien/me/:maSo",
  UPDATE_PROFILE: PROFILE_SERVICE_URL + "/api/profile/update",
  CHANGE_PASSWORD: PROFILE_SERVICE_URL + "/api/profile/change-password",
  UPLOAD_AVATAR: PROFILE_SERVICE_URL + "/api/profile/upload-avatar",
  DELETE_AVATAR: PROFILE_SERVICE_URL + "/api/profile/delete-avatar",
}

export const HOCPHAN_SERVICE = {
  CTDT_NGANH: HOCPHAN_SERVICE_URL + "/api/ctdt/nganh/:id",
};

export const KHHT_SERVICE = {
  GET_HOCKY: KHHT_SERVICE_URL + "/api/khht/hocky/sinhvien/:maSo",
  CREATE: KHHT_SERVICE_URL + "/api/khht/creates",
  LIST: KHHT_SERVICE_URL + "/api/khht/list",
  KHHT_SINHVIEN: KHHT_SERVICE_URL + "/api/khht/sinhvien/detail/:maSo",
  KHHT_SINHVIEN_BY_LOAI_HP: KHHT_SERVICE_URL + "/api/khht/sinhvien/hocphan/by_loai_hp",
  CTDT_NOT_IN_KHHT: KHHT_SERVICE_URL + "/api/khht/sinhvien/hoc_phan_not_in_khht/:id/:khoaHoc",
  DELETE: KHHT_SERVICE_URL + "/api/khht/delete/:id",
  COUNT_TINCHI_IN_KHHT: KHHT_SERVICE_URL + "/api/khht/sinhvien/tinchi/count/:khoaHoc/:maSo",
  COUNT_TINCHI_GROUP_BY_HOCKY: KHHT_SERVICE_URL + "/api/khht/sinhvien/tinchi/count_by_hoc_ky/:maSo",
};
