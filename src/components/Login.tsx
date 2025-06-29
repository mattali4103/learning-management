import { useState, type FormEvent } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import ErrorMesssageModal from "./modals/ErrorMessageModal";
import {
  KHHT_SERVICE,
  PROFILE_SERVICE,
  USER_SERVICE,
} from "../api/apiEndPoints";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import useAuth from "../hooks/useAuth";
import LoadingButton from "./LoadingButton";
const Login: React.FC = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  // const from = location.state?.from?.pathname || "/";
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [maSo, setMaSo] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  // Fetching hocKy data when the component mounts
  const fetchHocKy = async (maSo: string) => {
    try {
      const response = await axios.get(
        KHHT_SERVICE.GET_HOCKY.replace(":maSo", maSo),
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      localStorage.setItem("hocKy", JSON.stringify(response.data.data));
    } catch (error) {
      console.error("Error fetching hoc ky:", error);
      setError("Không thể lấy thông tin học kỳ. Vui lòng thử lại.");
    }
  };

  const handleFetchUserInfo = async (
    maSo: string,
    scope: string,
    token: string
  ) => {
    let url = PROFILE_SERVICE.GET_MY_PROFILE;
    if (scope === "GIANGVIEN") {
      url = PROFILE_SERVICE.GET_GIANGVIEN_PROFILE;
    }
    try {
      const response = await axios.get(url.replace(":maSo", maSo), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await axios.post(
        USER_SERVICE.LOGIN,
        {
          maSo: maSo,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.data) {
        const decodedToken: any = jwtDecode(response.data.token);
        if (!decodedToken) {
          setError("Token không hợp lệ. Vui lòng thử lại.");
          return;
        }

        const userInfo = await handleFetchUserInfo(
          decodedToken.sub,
          decodedToken.scope,
          response.data.token
        );
        console.log("User Info:", userInfo);
        if (!userInfo) {
          setError("Không thể lấy thông tin người dùng. Vui lòng thử lại.");
          return;
        }
        // Set the authentication state
        setAuth({
          token: response.data.token,
          user: {
            maSo: decodedToken?.sub,
            roles: decodedToken?.scope,
            khoaHoc: userInfo.khoaHoc,
            maNganh: userInfo.maNganh,
            maKhoa: userInfo.maKhoa,
          },
        });
        fetchHocKy(maSo);
        setMaSo("");
        setPassword("");
        if (decodedToken.scope === "GIANGVIEN") {
          navigate("/giangvien");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(err.response.data.message || "Đăng nhập không thành công.");
        } else if (err.request) {
          setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
        } else {
          setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
        }
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
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
                {loading ? (
                  <div className="bg-blue-500` flex items-center justify-center text-white p-3 rounded-lg transition-colors">
                    <LoadingButton
                      loading={true}
                      variant="primary"
                      className=""
                    >
                      Đang đăng nhập...
                    </LoadingButton>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Đăng Nhập
                  </button>
                )}
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
