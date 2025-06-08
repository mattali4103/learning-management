
import { Typography } from "@mui/material";

interface ErrorProps {
  error: string | null;
}

export default function Error({ error }: ErrorProps): React.ReactElement {
    return (
      <Typography variant="h6" align="center" color="error" sx={{ my: 4 }}>
        {error}
      </Typography>
    );
}