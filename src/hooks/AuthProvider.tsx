import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import type { ReactNode } from "react";
export interface AuthState {
  user?: {
    maSo: string;
    roles: string;
    khoaHoc: string;
    maNganh: string; 
  };
  token?: string;
}
interface AuthContextType {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
}
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      // Attempt to retrieve and parse the auth state from localStorage
      const stored = localStorage.getItem("auth");
      // If no auth state is found, return an empty object
      if (!stored) return {};
      const parsed: AuthState = JSON.parse(stored);
      // Validate the token and decode it
      if (typeof parsed.token !== "string") throw new Error("Invalid token");
      const decoded: any = jwtDecode(parsed.token);
      // Check if the token has expired
      if (decoded.exp && decoded.exp * 1000 < Date.now())
        throw new Error("Token expired");
      // Return the auth state with user information
      return {
        token: parsed.token,
        user: {
          maSo: decoded.sub,
          roles: decoded.scope,
          khoaHoc: parsed.user?.khoaHoc || "",
          maNganh: parsed.user?.maNganh || "",
        },
      };
    } catch (error) {
      // If any error occurs, log it and return an empty object
      // This could be due to invalid JSON, expired token, or other issues
      console.warn("Auth state error:", error);
      localStorage.removeItem("auth");
      return {};
    }
  });
  useEffect(() => {
    localStorage.setItem("auth", JSON.stringify(auth));
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
