import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
// @ts-expect-error: CSS this is not error
import 'react-circular-progressbar/dist/styles.css';
import { Award } from 'lucide-react';

interface GPAProgressCardProps {
  currentGPA: number;
  maxGPA?: number;
}

export default function GPAProgressCard({ currentGPA, maxGPA = 4.0 }: GPAProgressCardProps) {
  const progressPercent = Math.min((currentGPA / maxGPA) * 100, 100);

  return (
    <div className="text-center">
      <div className="w-32 h-32 mx-auto mb-4">
        <CircularProgressbar
          value={progressPercent}
          text={`${currentGPA.toFixed(2)}`}
          styles={buildStyles({
            textColor: '#3b82f6',
            pathColor: '#3b82f6',
            trailColor: '#e5e7eb',
            textSize: '16px',
          })}
        />
      </div>
      <div className="flex items-center justify-center mb-2">
        <Award className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="font-semibold text-gray-800">Điểm TB tích lũy</h3>
      </div>
      <p className="text-sm text-gray-600">{currentGPA.toFixed(2)}/{maxGPA.toFixed(1)}</p>
      <p className="text-xs text-blue-600 font-medium">Điểm trung bình</p>
    </div>
  );
}
