export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-200">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-6 text-center">Đang tải...</h1>
                <p className="text-gray-700 text-center">Vui lòng đợi trong giây lát.</p>
            </div>
        </div>
    );
}