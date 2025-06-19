// Hàm helper để tạo URL điều hướng với ID cho trang KeHoachHocTapDetail
export const createKeHoachHocTapNavigationUrl = (namHocId?: number, hocKyId?: number) => {
  const params = new URLSearchParams();
  if (namHocId) {
    params.set("namHocId", namHocId.toString());
  }
  if (hocKyId) {
    params.set("hocKyId", hocKyId.toString());
  }
  return `/khht/detail${params.toString() ? `?${params.toString()}` : ""}`;
};
