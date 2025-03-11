import useAuth from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router";

function AppLayout() {
  const { loggedInUser } = useAuth();

  if (!loggedInUser?.token) {
    return <Navigate to="/signin" replace />;
  }
  
  return <Outlet />;
}

export default AppLayout;
