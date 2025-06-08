import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Error from "./Error";
import Loading from "./Loading";

interface HocPhan {
  maHp: string;
  tenHp: string;
  tinChi: number;
  hocPhanTienQuyet: string;
  loaiHp: string;
}

function createData(
  maHp: string,
  tenHp: string,
  tinChi: number,
  hocPhanTienQuyet: string,
  loaiHp: string
) {
  return { maHp, tenHp, tinChi, hocPhanTienQuyet, loaiHp };
}

export default function BasicTable() {
  const [hocPhanList, setHocPhanList] = useState<HocPhan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .post("http://localhost:8086/api/hocphan/list")
      .then((response) => {
        console.log("API Response:", response.data, "Data property:", response.data.data);
        // Ensure response.data.data is an array; fallback to empty array
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setHocPhanList(data);
        console.log("Unique maHp values:", new Set(data.map(item => item.maHp)));
        setLoading(false);
      })
      .catch((error: AxiosError) => {
        console.error("Error fetching hoc phan data:", error);
        setError("Không thể tải dữ liệu học phần");
        setHocPhanList([]); // Ensure array on error
        setLoading(false);
      });
  }, []);

  const rows = Array.isArray(hocPhanList)
    ? hocPhanList.map((hocPhan: HocPhan) =>
        createData(
          hocPhan.maHp,
          hocPhan.tenHp,
          hocPhan.tinChi,
          hocPhan.hocPhanTienQuyet,
          hocPhan.loaiHp
        )
      )
    : [];

  if (loading) {
    return (
      <Loading />
    );
  }

  if (error) {
    return (
      <Error error={error} />
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: 1400,
        mx: "auto",
        my: 4,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: 2,
        overflowX: "auto", 
      }}
    >
      <Table
        sx={{
          minWidth: 650,
          "& .MuiTableCell-root": {
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            py: 1.5, 
          },
        }}
        aria-label="Bảng học phần"
      >
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#1976d2",
              "& th": {
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1.1rem",
              },
            }}
          >
            <TableCell align="center">Mã Học Phần</TableCell>
            <TableCell align="center">Tên Học Phần</TableCell>
            <TableCell align="center">Tín Chỉ</TableCell>
            <TableCell align="center">Học Phần Tiên Quyết</TableCell>
            <TableCell align="center">Loại Học Phần</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                  Không có dữ liệu học phần
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {rows.map((row, index) => (
            <TableRow
              key={row.maHp || index}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)", 
                },
                backgroundColor: index % 2 === 0 ? "#f9fafb" : "#fff",
              }}
            >
              <TableCell component="th" scope="row" sx={{ fontWeight: "medium" }}>
                {row.maHp}
              </TableCell>
              <TableCell align="center">{row.tenHp}</TableCell>
              <TableCell align="center">{row.tinChi}</TableCell>
              <TableCell align="center">{row.hocPhanTienQuyet}</TableCell>
              <TableCell align="center">{row.loaiHp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}