interface ContentDisplayProps {
  selectedNamHoc: string;
  selectedHocKy: string;
}

const ContentDisplay = ({
  selectedNamHoc,
  selectedHocKy,
}: ContentDisplayProps) => {
  const renderContent = () => {
    if (selectedNamHoc === "Tất cả") {
      return (
        <div className="p-4">
          Hiển thị tất cả các năm học
          <div>
            <div>Khối kiến thức đại cương</div>
            <p>Khối kiến thức cơ sở</p>
            <p>Khối kiến thức chuyên ngành</p>
          </div>
        </div>
      );
    } else if (selectedHocKy) {
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">
            Dữ liệu {selectedHocKy} - Năm học {selectedNamHoc}
          </h3>
          <p className="text-gray-600">
            Hiển thị kế hoạch học tập chi tiết cho {selectedHocKy} của năm học{" "}
            {selectedNamHoc}
          </p>
          <div>
            <p>Khối kiến thức đại cương</p>
            <p>Khối kiến thức cơ sở</p>
            <p>Khối kiến thức chuyên ngành</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">
            Tất cả học kỳ - Năm học {selectedNamHoc}
          </h3>
          <p className="text-gray-600">
            Hiển thị tổng quan tất cả học kỳ của năm học {selectedNamHoc}. Chọn
            học kỳ cụ thể để xem chi tiết.
          </p>
          <div>
            <p>Khối kiến thức đại cương</p>
            <p>Khối kiến thức cơ sở</p>
            <p>Khối kiến thức chuyên ngành</p>
          </div>
        </div>
      );
    }
  };

  return <div className="bg-white rounded-lg shadow-sm">{renderContent()}</div>;
};

export default ContentDisplay;
