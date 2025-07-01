import ThemHocPhanComponent from "./components/ThemHocPhanComponent";
import ChinhSuaHocPhanComponent from "./components/ChinhSuaHocPhanComponent";

const ChinhSuaKHHTMau = () => {
  // Tự động xác định chế độ dựa trên URL
  const isAddMode = window.location.pathname.includes("/add/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Page Title */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAddMode
              ? "Tạo kế hoạch học tập mẫu"
              : "Chỉnh sửa kế hoạch học tập mẫu"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isAddMode
              ? "Tạo mới kế hoạch học tập mẫu cho ngành và khóa học"
              : "Cập nhật kế hoạch học tập mẫu hiện có"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Main Content - Render component con phù hợp */}
        {isAddMode ? (
          <ThemHocPhanComponent />
        ) : (
          <ChinhSuaHocPhanComponent />
        )}
      </div>
    </div>
  );
};

export default ChinhSuaKHHTMau;
