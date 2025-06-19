import { useEffect, useState } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
// @ts-expect-error @ts-ignore
import "react-circular-progressbar/dist/styles.css";

interface CustomGaugeProps {
  current: number;
}
const color = {
  red: "#ff0000",
  yellow: "#fffc00",
  green: "#41ff00"
};

export const CustomGauge = ({
  current,
}: CustomGaugeProps) => {

  const [colorStatus, setColorStatus] = useState<string>("");
  useEffect(() =>{
    if(current < 2){
      setColorStatus(color.red);
    }
    else if(current >= 2 && current <= 2.8){
      setColorStatus(color.yellow);
    }
    else{
      setColorStatus(color.green);
    }
  },[current])

  return (
    <CircularProgressbar
      text={`${current}`}
      value={current}
      circleRatio={0.5}
      maxValue={4}
      strokeWidth={12}
      styles={buildStyles({
        rotation: 0.75,
        pathColor: `${colorStatus}`,
        textColor: "#000",
        trailColor: "#E5E7EB",
      })}
    />
  );
};
