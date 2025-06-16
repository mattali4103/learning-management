import axios from "axios";
import {
  KHHT_SERVICE_URL,
  PROFILE_SERVICE_URL,
  USER_SERIVCE_URL,
} from "./apiEndPoints";
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
export const USER_SERIVCE = axios.create({
  baseURL: USER_SERIVCE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
export const PROFILE_SERVICE = axios.create({
  baseURL: PROFILE_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
    withCredentials: true,
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  },
});
export const KHHT_SERVICE = axios.create({
  baseURL: KHHT_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },

});
