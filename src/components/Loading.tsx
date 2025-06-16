import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-[calc(100vh-64px)] inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900 opacity-15 backdrop-blur-2xl" />
      <div className="relative z-10 bg-white opacity-80 p-6 rounded-2xl shadow-xl text-center">
        <div className="text-xl font-semibold flex gap-3">
          <LoaderCircle className="animate-spin"/>
          Đang tải
        </div>
      </div>
    </div>
  );
}
