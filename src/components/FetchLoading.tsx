const FetchLoading = () =>{
  return (
    <div className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-lg font-medium text-gray-800">
            Đang cập nhật kế hoạch học tập mẫu...
          </span>
        </div>
      </div>
    </div>
  );
}
export default FetchLoading;