
import { AlertCircle } from "lucide-react";

interface ErrorProps {
  error: string | null;
}

export default function Error({ error }: ErrorProps): React.ReactElement {
  return (
    <div className="flex items-center justify-center my-8 px-4">
      <div className="flex items-center space-x-3 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-center text-sm font-medium">{error}</p>
      </div>
    </div>
  );
}