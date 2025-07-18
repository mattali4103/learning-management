const BASE_URL = "http://localhost"; // Base URL for the API
// const BASE_URL = "http://172.30.121.32"; // Base URL for the API
// const KONG_URL = "http://172.30.121.19"
// export const USER_SERIVCE_URL = "http://localhost:8088";
// export const KHHT_SERVICE_URL = "http://localhost:8087";
// export const HOCPHAN_SERVICE_URL = "http://localhost:8086";
// export const PROFILE_SERVICE_URL = "http://localhost:8083";
// export const KQHT_SERVICE_URL = "http://localhost:8089";

// export const USER_SERIVCE_URL = "http://172.30.121.19" + ":8088";

export const USER_SERIVCE_URL = BASE_URL + ":8088";

export const KHHT_SERVICE_URL = BASE_URL + ":8087";
export const HOCPHAN_SERVICE_URL = BASE_URL + ":8086";
export const PROFILE_SERVICE_URL = BASE_URL + ":8083";
export const KQHT_SERVICE_URL = BASE_URL + ":8089";
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
  GET_PREVIEW_PROFILE: PROFILE_SERVICE_URL + "/api/profile/lop/preview/:maLop", // Return Object
  UPDATE_SINHVIEN_PROFILE: PROFILE_SERVICE_URL + "/api/profile/sinhvien/update", // RequestBody: Sinh viên tự cập nhật
  UPDATE_AVATAR: PROFILE_SERVICE_URL + "/api/profile/sinhvien/update/avatar", // RequestBody: FormData
  THONGKE_LOP: PROFILE_SERVICE_URL + "/api/profile/lop/thongke", // Params, by maNganh
  GET_KHOA: PROFILE_SERVICE_URL + "/api/profile/khoa/id/:maKhoa", // Return Object
  GET_GIANGVIEN_PROFILE:
    PROFILE_SERVICE_URL + "/api/profile/giangvien/me/:maSo",
  GET_SINHVIEN_PROFILE: PROFILE_SERVICE_URL + "/api/profile/sinhvien/:maSo",
  GET_MY_PROFILE: PROFILE_SERVICE_URL + "/api/profile/sinhvien/me/:maSo",
  GET_ADMIN_PROFILE: PROFILE_SERVICE_URL + "/api/profile/admin/me/:maSo",
  UPDATE_PROFILE: PROFILE_SERVICE_URL + "/api/profile/update",
  GET_DS_LOP_BY_KHOA:
    PROFILE_SERVICE_URL + "/api/profile/lop/get_dslop_by_ma_khoa/:maKhoa", // Return List không có cấu trúc API
  GET_DS_SINH_VIEN_BY_LOP:
    PROFILE_SERVICE_URL + "/api/profile/lop/get_sinhvien_profile_in_lop/:maLop", // Return List không có cấu trúc API,
  // Endpoints cho Văn bằng, Chứng chỉ
  GET_CERTIFICATES: PROFILE_SERVICE_URL + "/api/profile/sinhvien/certificate/maso/:maSo", // Lấy danh sách văn bằng, chứng chỉ
  UPLOAD_CERTIFICATE: PROFILE_SERVICE_URL + "/api/profile/sinhvien/certificate/upload", // Upload văn bằng, chứng chỉ mới
  UPDATE_CERTIFICATE: PROFILE_SERVICE_URL + "/api/profile/sinhvien/certificate/update/:id", // Cập nhật thông tin văn bằng, chứng chỉ
  DELETE_CERTIFICATE: PROFILE_SERVICE_URL + "/api/profile/sinhvien/certificate/delete/:id", // Xóa văn bằng, chứng chỉ
};

export const HOCPHAN_SERVICE = {
  CTDT_BY_NGANH: HOCPHAN_SERVICE_URL + "/api/ctdt/get_by_ma_nganh/:maNganh", //PathVariable, hocphanlist = null
  GET_ALL_HOCKY: HOCPHAN_SERVICE_URL + "/api/hocky/list",
  CTDT_NGANH: HOCPHAN_SERVICE_URL + "/api/ctdt/get/:khoaHoc/:maNganh",
  CTDT_HOC_PHAN_TU_CHON_LIST: HOCPHAN_SERVICE_URL + "/api/hocphan/tuchon/list",
  CTDT_BY_LOAI_HP: HOCPHAN_SERVICE_URL + "/api/ctdt/hocphan/by_loai_hp", // RequestBody 
  HOCPHAN_TUCHON_BY_LOAI_HP: HOCPHAN_SERVICE_URL + "/api/hocphan/tuchon/by_loai_hp", // RequestBody
  HOCPHAN_THECHAT: HOCPHAN_SERVICE_URL + "/api/hocphan/tuchon/the_chat", // No Parameters, return list
};

export const KHHT_SERVICE = {
  KHHT_MAU_UPDATE: KHHT_SERVICE_URL + "/api/khht/mau/updates", // PUTmapping
  KHHT_MAU_DELETE: KHHT_SERVICE_URL + "/api/khht/mau/delete", // Xoá một khht // Requestbody DELETEMAPPING
  KHHT_MAU_DELETE_BY_KHOAHOC:
    KHHT_SERVICE_URL + "/api/khht/mau/delete/by_khoa_hoc_and_ma_nganh", // Requestbody DELETEMAPPING
  KHHT_MAU_IMPORT: KHHT_SERVICE_URL + "/api/khht/mau/import", // import file excel
  KHHT_MAU_CREATES: KHHT_SERVICE_URL + "/api/khht/mau/creates", // tạo mẫu kế hoạch học tập - posts
  KHHT_MAU_BY_NGANH: KHHT_SERVICE_URL + "/api/khht/mau/group_by_khoa_hoc", // lấy khht mẫu group by khoa dựa theo mã ngành params
  KHHT_MAU_BY_KHOAHOC_MA_NGANH: KHHT_SERVICE_URL + "/api/khht/mau/by_ma_nganh", // lấy mẫu kế hoạch học tập theo mã ngành params
  GET_HOCPHAN_BY_GOIY: KHHT_SERVICE_URL + "/api/khht/sinhvien/goi_y", // lấy danh sách học phần gợi ý - posts
  GET_HOCKY_MAU: KHHT_SERVICE_URL + "/api/khht/mau/hocky", // lấy mẫu học kỳ - params
  GET_HOCKY: KHHT_SERVICE_URL + "/api/khht/hocky/sinhvien/:maSo",
  GET_MAHP_IN_KHHT:
    KHHT_SERVICE_URL + "/api/khht/sinhvien/hoc_phan_in_ke_hoach_by_ma_so/:maSo", // lấy mã học phần trong kế hoạch học tập
  CREATE: KHHT_SERVICE_URL + "/api/khht/creates",
  LIST: KHHT_SERVICE_URL + "/api/khht/list",
  KHHT_SINHVIEN: KHHT_SERVICE_URL + "/api/khht/sinhvien/detail/page", // phân trang: ?maSo=xxx&page=0&size=20
  KHHT_SINHVIEN_BY_LOAI_HP:
    KHHT_SERVICE_URL + "/api/khht/sinhvien/hocphan/by_loai_hp",
  CTDT_NOT_IN_KHHT:
    KHHT_SERVICE_URL +
    "/api/khht/sinhvien/hoc_phan_not_in_khht/:id/:khoaHoc/:maNganh",
  DELETE: KHHT_SERVICE_URL + "/api/khht/delete/:id",
  COUNT_TINCHI_IN_KHHT:
    KHHT_SERVICE_URL +
    "/api/khht/sinhvien/tinchi/count/:khoaHoc/:maNganh/:maSo",
  COUNT_TINCHI_GROUP_BY_HOCKY:
    KHHT_SERVICE_URL + "/api/khht/sinhvien/tinchi/count_by_hoc_ky/:maSo",
  COUNT_TINCHI_IN_LOP: KHHT_SERVICE_URL + "/api/khht/statistic/:maLop",
};

export const KQHT_SERVICE = {
  GET_HOCKY: KQHT_SERVICE_URL + "/api/kqht/hoc-ky/:maSo",
  GET_KETQUA: KQHT_SERVICE_URL + "/api/kqht/detail/page", // phân trang: ?maSo=xxx&page=0&size=20
  GET_KETQUA_BY_HOCKY: KQHT_SERVICE_URL + "/api/kqht/detail", // theo học kỳ: ?maSo=xxx&maHocKy=yyy
  GET_DIEM_TRUNG_BINH_BY_HOCKY:
    KQHT_SERVICE_URL + "/api/kqht/diem/trung_binh_hoc_ky/list",
  GET_HOC_PHAN_CAI_THIEN:
    KQHT_SERVICE_URL + "/api/kqht/private/hoc-phan-cai-thien/:maSo",
};
