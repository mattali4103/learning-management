export default function NotFound() {
    return(
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800">404</h1>
                <p className="mt-4 text-xl text-gray-600">Không tìm thấy đường dẫn</p>
                <p className="mt-2 text-gray-500">Trang này không tồn tại.</p>
            </div>
        </div>
    )
}