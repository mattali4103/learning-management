import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
// @ts-expect-error: CSS this is not error
import 'react-circular-progressbar/dist/styles.css';
import { BookOpen, Trophy } from 'lucide-react';

interface CreditProgressCardProps {
  currentCredits: number;
  totalCredits: number;
}

export default function CreditProgressCard({ currentCredits, totalCredits }: CreditProgressCardProps) {
  const progressPercent = totalCredits > 0 ? Math.min((currentCredits / totalCredits) * 100, 100) : 0;
  const isCompleted = currentCredits >= totalCredits && totalCredits > 0;

  return (
    <div className="text-center">
      <div className="w-32 h-32 mx-auto mb-4">
        <CircularProgressbar
          value={progressPercent}
          text={`${currentCredits}`}
          styles={buildStyles({
            textColor: isCompleted ? '#10b981' : '#10b981',
            pathColor: isCompleted ? '#10b981' : '#10b981',
            trailColor: '#e5e7eb',
            textSize: '16px',
          })}
        />
      </div>
      <div className="flex items-center justify-center mb-2">
        <BookOpen className="w-5 h-5 text-green-600 mr-2" />
        <h3 className="font-semibold text-gray-800">Tín chỉ tích lũy</h3>
      </div>
      <p className="text-sm text-gray-600">{currentCredits}/{totalCredits} tín chỉ</p>
      
      {isCompleted ? (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Trophy className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-semibold text-green-800">
              Hoàn thành chương trình
            </span>
          </div>
          <p className="text-xs text-green-700">
            Chúc mừng! Bạn đã hoàn thành 100% chương trình học tập
          </p>
        </div>
      ) : (
        <p className="text-xs text-green-600 font-medium">
          {progressPercent.toFixed(1)}% hoàn thành
        </p>
      )}
    </div>
  );
}
