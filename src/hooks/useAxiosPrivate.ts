import { useEffect } from "react";

import useRefreshToken from "./useRefreshToken";
import axios from "axios";
import useAuth from "./useAuth";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            config =>{
                if(!config.headers['Authorization'] && auth.token) {
                    config.headers['Authorization'] = `Bearer ${auth.token}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );
        const responseInterceptor = axios.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 403 && !prevRequest.sent) {
                    prevRequest.sent = true;
                    const newToken = await refresh();
                    prevRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return axios(prevRequest);
                }
                return Promise.reject(error);
            }
        );
        return () =>{
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        }
    },[auth, refresh]);

    return axios;
}
export default useAxiosPrivate;