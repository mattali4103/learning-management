import { Box } from "@mui/material";
import type { KeHoachHocTapTableProps } from "../../pages/KetQuaHocTap/KetQuaHocTap";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { GRID_LOCALE } from "../../types/gridLocalText";
const columns: GridColDef<KeHoachHocTapTableProps>[] = [
  {
    field: "maHp",
    type: "string",
    headerName: "Mã học phần",
    width: 150,
    headerAlign: "center",
    align: "center",
    headerClassName: "!bg-blue-400 text-black",
  },
  {
    field: "tenHp",
    headerName: "Tên học phần",
    headerClassName: "!bg-blue-400 text-black",
    width: 600,
    headerAlign: "center",
  },
  {
    field: "soTinChi",
    headerName: "Tín chỉ",
    width: 120,
    headerAlign: "center",
    align: "center",
    headerClassName: "!bg-blue-400 text-black",
  },
  {
    field: "hocKy",
    headerName: "Học kỳ",
    width: 120,
    headerAlign: "center",
    align: "center",
    headerClassName: "!bg-blue-400 text-black",
  },
  {
    field: "namHoc",
    headerName: "Năm học",
    width: 150,
    headerAlign: "center",
    align: "center",
    headerClassName: "!bg-blue-400 text-black",
  },
  {
    field: "loaiHp",
    headerName: "Loại học phần",
    width: 150,
    headerAlign: "center",
    align: "center",
    headerClassName: "!bg-blue-400 text-black",
  },
];
interface KeHoachHocTapTableComponentProps {
  dataRows: KeHoachHocTapTableProps[];
}
export default function KeHoachHocTapTableComponent({
  dataRows,
}: KeHoachHocTapTableComponentProps) {
  return (
    <>
      <Box className="">
        <DataGrid
          rows={dataRows}
          columns={columns}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 25,
              },
            },
          }}
          pageSizeOptions={[25]}
          localeText={GRID_LOCALE}
        />
      </Box>
    </>
  );
}
