import useAuth from "../hooks/useAuth";

const Home = () => {  const { auth } = useAuth();
  console.log("Current user:", auth?.user);


  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="bg-blue-900 text-white py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png" // Replace with your logo path
              alt="Đại học Cần Thơ"
              className="h-10"
            />
            <span className="font-bold text-lg">Đại học Cần Thơ</span>
          </div>
          <div className="hidden md:flex gap-4 text-sm">
            <a href="#" className="hover:underline">
              TÂN SINH VIÊN
            </a>
            <a href="#" className="hover:underline">
              NGƯỜI HỌC
            </a>
            <a href="#" className="hover:underline">
              VIÊN CHỨC
            </a>
            <a href="#" className="hover:underline">
              CỰU SINH VIÊN
            </a>
            <a href="#" className="hover:underline">
              EN
            </a>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="bg-white shadow text-sm">
        <div className="container mx-auto px-4 py-2 flex gap-6">
          <a href="#" className="hover:underline font-semibold text-blue-800">
            Trang chủ
          </a>
          <a href="#" className="hover:underline">
            Giới thiệu
          </a>
          <a href="#" className="hover:underline">
            Tin tức
          </a>
          <a href="#" className="hover:underline">
            Đào tạo
          </a>
          <a href="#" className="hover:underline">
            Nghiên cứu
          </a>
          <a href="#" className="hover:underline">
            Hợp tác
          </a>
          <a href="#" className="hover:underline">
            Đơn vị trực thuộc
          </a>
          <a href="#" className="hover:underline">
            Tuyển sinh
          </a>
          <a href="#" className="hover:underline">
            Sự kiện
          </a>
        </div>
      </nav>

      {/* Banner slogan */}
      <div className="bg-yellow-300 text-center py-2 font-bold text-xl text-black">
        Đồng thuận – Tận tâm – Chuẩn mực – Sáng tạo
      </div>
    </div>
  );
};

export default Home;