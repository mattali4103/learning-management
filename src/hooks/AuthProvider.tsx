import { createContext, useState } from "react";
import { type ReactNode } from "react";
export interface AuthState {
  user?: {
    maSo: string;
    roles?: string;
  };
  token?: string;
}
interface AuthContextType {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
}
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({} as AuthState);
  return (
    <AuthContext.Provider value={{ auth, setAuth}}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
