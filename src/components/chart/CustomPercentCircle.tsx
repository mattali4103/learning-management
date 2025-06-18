import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
// @ts-expect-error @ts-ignore
import "react-circular-progressbar/dist/styles.css";
interface CustomPercentCircleProps {
  total: number;
  current: number;
}
export const CustomPercentCircle = ({
  total,
  current,
}: CustomPercentCircleProps) => {
  const percentage = (current / total) * 100;
  return (
    <CircularProgressbar
      text={`${percentage.toFixed(0)}%`}
      value={current}
      maxValue={total}
      strokeWidth={12}
      styles={buildStyles({
        pathColor: `#2F86FA`,
        textColor: "#000",
        trailColor: "#E5E7EB",
      })}
    />
  );
};
