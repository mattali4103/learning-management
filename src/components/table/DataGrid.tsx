import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

import { GRID_LOCALE } from "../../types/gridLocalText";
import type { KetQuaHocTapTableProps } from "../../pages/KetQuaHocTap/KetQuaHocTap";

const columns: GridColDef<KetQuaHocTapTableProps>[] = [
  {
    field: "maHp",
    type: "number",
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
    field: "dieuKien",
    headerName: "Điều kiện",
    type: "boolean",
    width: 120,
    headerAlign: "center",
    align: "center",
    headerClassName: "!bg-blue-400 text-black",
  },
  {
    field: "nhomHp",
    headerName: "Nhóm học phần",
    width: 140,
    headerAlign: "center",
    align: "center",
    headerClassName: "!bg-blue-400 text-black",
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
    field: "diemChu",
    headerName: "Điểm chữ",
    width: 120,
    headerAlign: "center",
    align: "center",
    headerClassName: "!bg-blue-400 text-black",
  },
  {
    field: "diemSo",
    headerName: "Điểm số",
    type: "number",
    width: 120,
    headerAlign: "center",
    align: "center",
    headerClassName: "!bg-blue-400 text-black",
  },
];

interface DataGridComponentProps {
  dataRows: KetQuaHocTapTableProps[];
}

export default function DataGridComponent({
  dataRows,
}: DataGridComponentProps) {
  return (
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
  );
}
