interface GridColumnProps {
  value: React.ReactNode;
  name: React.ReactNode;
  className?: string;
}
const GridColumn: React.FC<GridColumnProps> = ({ value, name, className }) => (
  <div
    className={`${className}`}
  >
    <div className="text-2xl mb-2">{value}</div>
    <span>{name}</span>
  </div>
);
export default GridColumn;
