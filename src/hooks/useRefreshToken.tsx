import axios from "axios";
import { USER_SERVICE } from "../api/apiEndPoints";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { auth, setAuth } = useAuth();
  const refresh = async () => {
    const response = await axios.post(USER_SERVICE.REFRESH_TOKEN, {
        token: auth?.token,
    }, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    setAuth((prev: any) => {
      return {
        ...prev,
        token: response.data.token,
        user: {
          maSo: prev.user?.maSo,
          roles: prev.user?.roles,
        },
      };
    });
    return response.data.token;
  };
  return refresh;
};
export default useRefreshToken;
