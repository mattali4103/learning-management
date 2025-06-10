import { useState, type FormEvent } from "react";
import Header from "./Header";
import axios, { AxiosError } from "axios"; 

import { useAuth } from "../hooks/UseAuth";
import { useNavigate } from "react-router-dom";
import ErrorMesssageModal from "./modals/ErrorMessageModal";
import { USER_SERIVCE } from "../api/apiEndPoints";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [maSo, setMaSo] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios
      .post(USER_SERIVCE.LOGIN, { maSo, password })
      .then((response) => {
        console.log("Response:", response);
        if (response.status !== 200) {
          setError("Đăng nhập thất bại. Vui lòng thử lại.");
        } else {
          console.log(response.data.token);
          const token = response.data.token;
          login(token);
          navigate("/dashboard");
        }
      })
      .catch((error: AxiosError) => {
        const errorMessage =
          (error.response?.data as { message?: string })?.message ||
          "Đăng nhập thất bại. Vui lòng thử lại.";
        setError(errorMessage);
      });
  };
  return (
    <>
      <div className="min-h-screen background-image text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white/90 backdrop-blur-md text-blue-900 p-6 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold text-center mb-6">ĐĂNG NHẬP</h1>
              <form onSubmit={handleLogin}>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    value={maSo}
                    onChange={(e) => setMaSo(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mã số sinh viên"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Điền mật khẩu"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Đăng Nhập
                </button>
              </form>
              <p className="text-center mt-4 text-sm hover:underline cursor-pointer">
                Quên mật khẩu?
              </p>
            </div>
          </div>
        </div>
      </div>
      <ErrorMesssageModal
        message={error}
        isOpen={error === null ? false : true}
        onClose={() => setError(null)}
      />
    </>
  );
};
export default Login;
