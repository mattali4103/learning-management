interface AcademicYearSelectorProps {
  namHocList: string[];
  selectedNamHoc: string;
  onNamHocChange: (namHoc: string) => void;
}

const AcademicYearSelector = ({
  namHocList,
  selectedNamHoc,
  onNamHocChange,
}: AcademicYearSelectorProps) => {
  return (
    <div className="mb-4">
      <div className="flex space-x-2">
        {namHocList.map((namHoc) => (
          <button
            key={namHoc}
            onClick={() => onNamHocChange(namHoc)}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedNamHoc === namHoc
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {namHoc}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AcademicYearSelector;
