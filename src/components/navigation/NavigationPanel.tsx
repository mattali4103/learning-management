import AcademicYearSelector from "./AcademicYearSelector";
import SemesterSelector from "./SemesterSelector";

interface NavigationPanelProps {
  namHocList: string[];
  selectedNamHoc: string;
  selectedHocKy: string;
  hocKyData: Record<string, string[]>;
  onNamHocChange: (namHoc: string) => void;
  onHocKyChange: (hocKy: string) => void;
}

const NavigationPanel = ({
  namHocList,
  selectedNamHoc,
  selectedHocKy,
  hocKyData,
  onNamHocChange,
  onHocKyChange,
}: NavigationPanelProps) => {
  return (
    <div className="bg-white flex p-4 gap-10 rounded-lg shadow-sm">
      {/* Thanh điều hướng năm học */}
      <AcademicYearSelector
        namHocList={namHocList}
        selectedNamHoc={selectedNamHoc}
        onNamHocChange={onNamHocChange}
      />
      {/* Thanh điều hướng học kỳ - chỉ hiển thị khi chọn năm học cụ thể */}
      {selectedNamHoc !== "Tất cả" && hocKyData[selectedNamHoc] && (
        <SemesterSelector
          selectedNamHoc={selectedNamHoc}
          selectedHocKy={selectedHocKy}
          hocKyList={hocKyData[selectedNamHoc]}
          onHocKyChange={onHocKyChange}
        />
      )}
    </div>
  );
};

export default NavigationPanel;
