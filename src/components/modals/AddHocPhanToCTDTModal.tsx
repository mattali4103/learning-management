import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Save } from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { HOCPHAN_SERVICE } from '../../api/apiEndPoints';
import type { HocPhan } from '../../types/HocPhan';
import type { HocPhanTuChon } from '../../types/HocPhanTuChon';

interface AddHocPhanToCTDTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newHocPhans: HocPhan[], newNhomHocPhans: HocPhanTuChon[]) => void;
  currentCTDT: any; // Simplified for placeholder
}

const AddHocPhanToCTDTModal = ({ isOpen, onClose, onSave, currentCTDT }: AddHocPhanToCTDTModalProps) => {
  const [allHocPhans, setAllHocPhans] = useState<HocPhan[]>([]);
  const [selectedHocPhans, setSelectedHocPhans] = useState<HocPhan[]>([]);
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const fetchAllHocPhans = useCallback(async () => {
    setLoading(true);
    try {
      // const response = await axiosPrivate.get(HOCPHAN_SERVICE.GET);

      setAllHocPhans(placeholderData);
    } catch (error) {
      console.error("Error fetching hoc phans:", error);
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    if (isOpen) {
      fetchAllHocPhans();
    }
  }, [isOpen, fetchAllHocPhans]);

  const handleToggleHocPhan = (hp: HocPhan) => {
    setSelectedHocPhans(prev =>
      prev.some(selected => selected.maHp === hp.maHp)
        ? prev.filter(selected => selected.maHp !== hp.maHp)
        : [...prev, hp]
    );
  };

  const handleSaveClick = () => {
    onSave(selectedHocPhans, []); // Placeholder for elective groups
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Thêm học phần vào Chương trình Đào tạo</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <p>Đang tải danh sách học phần...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allHocPhans.map(hp => {
                const isSelected = selectedHocPhans.some(s => s.maHp === hp.maHp);
                const isAlreadyInCTDT = currentCTDT.hocPhanList.some((h: HocPhan) => h.maHp === hp.maHp);
                return (
                  <div
                    key={hp.maHp}
                    onClick={() => !isAlreadyInCTDT && handleToggleHocPhan(hp)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isAlreadyInCTDT
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300'
                        : 'hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">{hp.tenHp}</p>
                    <p className="text-sm text-gray-600">{hp.maHp} - {hp.tinChi} tín chỉ</p>
                    <p className="text-xs text-gray-500">{hp.loaiHp}</p>
                    {isAlreadyInCTDT && <p className="text-xs text-green-600 font-semibold mt-1">Đã có trong chương trình</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 mt-auto bg-gray-50 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{selectedHocPhans.length} học phần đã chọn</p>
            </div>
            <button
              onClick={handleSaveClick}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={selectedHocPhans.length === 0}
            >
              <Save className="w-5 h-5 mr-2" />
              Lưu vào chương trình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHocPhanToCTDTModal;
