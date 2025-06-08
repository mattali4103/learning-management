import Box from "@mui/material/Box";
import { DataGrid, type GridColDef} from "@mui/x-data-grid";

import { GRID_LOCALE } from "../../types/gridLocalText";
import type { KetQuaHocTapTableProps } from "../../pages/KetQuaHocTap";




const columns: GridColDef<KetQuaHocTapTableProps>[] = [
  {
    field: "maHp",
    type: "number",
    headerName: "Mã học phần",
    width: 150,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "tenHp",
    headerName: "Tên học phần",
    width: 400,
    headerAlign: "center",
  },
  {
    field: "dieuKien",
    headerName: "Điều kiện",
    type: "boolean",
    width: 110,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "nhomHp",
    headerName: "Nhóm học phần",
    width: 160,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "soTinChi",
    headerName: "Tín chỉ",
    width: 100,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "diemChu",
    headerName: "Điểm chữ",
    width: 100,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "diemSo",
    headerName: "Điểm số",
    type: "number",
    width: 100,
    headerAlign: "center",
    align: "center",
  },
];



interface DataGridComponentProps{
  dataRows: KetQuaHocTapTableProps[];
}

export default function DataGridComponent({dataRows} : DataGridComponentProps) {
  return (
    <Box className="w-full h-full">
      <DataGrid
        rows={dataRows}
        columns={columns}
        disableRowSelectionOnClick
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[25]}
        localeText={GRID_LOCALE}
      />
    </Box>
  );
}
