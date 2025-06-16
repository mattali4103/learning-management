import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
    const navigate = useNavigate();
    const goBack = () => {
        navigate(-1);
    }
    return(
        <section>
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
                <div className="flex justify-content-center">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <h1 className="">403 - Forbidden</h1>
                        <p className="">Bạn không có quyền truy cập vào trang này.</p>
                        <button className="p-2 bg-green-300 " onClick={goBack}>Quay lại</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default Unauthorized;
