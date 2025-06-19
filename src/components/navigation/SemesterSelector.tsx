interface SemesterSelectorProps {
  selectedNamHoc: string;
  selectedHocKy: string;
  hocKyList: string[];
  onHocKyChange: (hocKy: string) => void;
}

const SemesterSelector = ({
  selectedHocKy,
  hocKyList,
  onHocKyChange,
}: SemesterSelectorProps) => {
  return (
    <div className=" border-gray-200 bg-white">
      <div className="flex space-x-2">
        {/* Nút Tất cả học kỳ */}
        <button
          onClick={() => onHocKyChange("")}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedHocKy === ""
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Tất cả
        </button>
        {/* Các nút học kỳ cụ thể */}
        {hocKyList.map((hocKy) => (
          <button
            key={hocKy}
            onClick={() => onHocKyChange(hocKy)}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedHocKy === hocKy
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {hocKy}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SemesterSelector;
