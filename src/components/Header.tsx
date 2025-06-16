const Header = () => {
  return (
      <div className="flex gap-2 text-gray-50 bg-[#042F6B] mb-1">
        <div className="w-16 h-16 flex items-center justify-center">
          <span>
            <img src="/logo-ctu.png" alt="CTU logo" />
          </span>
        </div>
        <div className="flex flex-col content-center justify-center">
          <span className="text-xl font-bold">ĐẠI HỌC CẦN THƠ</span>
          <span className="text-lg">Can Tho University</span>
        </div>
      </div>
  );
};
export default Header;
