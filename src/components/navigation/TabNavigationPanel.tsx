interface TabNavigationPanelProps {
  namHocList: string[];
  selectedNamHoc: string;
  selectedHocKy: string;
  hocKyData: Record<string, string[]>;
  onNamHocChange: (namHoc: string) => void;
  onHocKyChange: (hocKy: string) => void;
  totalCount: number;
  getCountForNamHoc: (namHoc: string) => number;
}

const TabNavigationPanel = ({
  namHocList,
  selectedNamHoc,
  selectedHocKy,
  hocKyData,
  onNamHocChange,
  onHocKyChange,
  totalCount,
  getCountForNamHoc,
}: TabNavigationPanelProps) => {
  const handleAllTabClick = () => {
    onNamHocChange("Tất cả");
    onHocKyChange("");
  };

  const handleNamHocTabClick = (namHoc: string) => {
    if (selectedNamHoc === namHoc) {
      onNamHocChange("Tất cả");
      onHocKyChange("");
    } else {
      onNamHocChange(namHoc);
      onHocKyChange("");
    }
  };

  const handleHocKyTabClick = (hocKy: string) => {
    onHocKyChange(hocKy);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Academic Year Level Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex items-center px-6 py-3">
          <div className="flex space-x-6 overflow-x-auto">
            <button
              onClick={handleAllTabClick}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedNamHoc === "Tất cả"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tất cả ({totalCount})
            </button>

            {namHocList
              .filter((namHoc) => namHoc !== "Tất cả")
              .map((namHoc) => (
                <button
                  key={namHoc}
                  onClick={() => handleNamHocTabClick(namHoc)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedNamHoc === namHoc
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {namHoc} ({getCountForNamHoc(namHoc)})
                </button>
              ))}
          </div>
        </nav>
      </div>

      {/* Semester Level Navigation */}
      {selectedNamHoc !== "Tất cả" && hocKyData[selectedNamHoc] && (
        <div className="border-b border-gray-100 bg-gray-50">
          <nav className="flex items-center px-6 py-2">
            <div className="flex items-center space-x-1 text-xs text-gray-500 mr-4">
              <span>Học kỳ:</span>
            </div>
            <div className="flex space-x-3 overflow-x-auto">
              {hocKyData[selectedNamHoc].map((hocKy) => (
                <button
                  key={hocKy}
                  onClick={() => handleHocKyTabClick(hocKy)}
                  className={`whitespace-nowrap py-1 px-2 rounded text-xs font-medium transition-colors ${
                    selectedHocKy === hocKy
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {hocKy}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default TabNavigationPanel;
