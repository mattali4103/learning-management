import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
// @ts-expect-error: CSS this is not error
import 'react-circular-progressbar/dist/styles.css';
import { BookOpen } from 'lucide-react';

interface CreditProgressCardProps {
  currentCredits: number;
  totalCredits: number;
}

export default function CreditProgressCard({ currentCredits, totalCredits }: CreditProgressCardProps) {
  const progressPercent = totalCredits > 0 ? Math.min((currentCredits / totalCredits) * 100, 100) : 0;

  return (
    <div className="text-center">
      <div className="w-32 h-32 mx-auto mb-4">
        <CircularProgressbar
          value={progressPercent}
          text={`${currentCredits}`}
          styles={buildStyles({
            textColor: '#10b981',
            pathColor: '#10b981',
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
      <p className="text-xs text-green-600 font-medium">
        {progressPercent.toFixed(1)}% hoàn thành
      </p>
    </div>
  );
}
