import useAuth from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router";

function AuthLayout() {
  const { loggedInUser } = useAuth();

  if (loggedInUser?.token) {
    return <Navigate to="/dashboard" replace/>;
  }

  return <Outlet />;
}

export default AuthLayout;
