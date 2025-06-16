import { useEffect, useState } from "react";
import Loading from "../../components/Loading";

export default function KeHoachHocTap() {
    const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        // Simulate an API call
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }, []);

    if(loading){
        return <Loading />;
    }
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-blue-200">
        <h1 className="text-2xl font-bold text-blue-800">Kế hoạch học tập</h1>
        <p className="mt-4 text-lg text-blue-600">Chức năng này đang được phát triển.</p>
        </div>
    );
}