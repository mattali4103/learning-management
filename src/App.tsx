import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Login from "./components/Login";
import Hello from "./components/Hello";
import Home from "./components/Home";
import { useAuth } from "./hooks/UseAuth";
import Sidebar from "./components/Sidebar";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>; 
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/hello" element={
          <ProtectedRoute>
            <Hello/>
          </ProtectedRoute>
        } />
        <Route path="/test" element={<Sidebar/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
