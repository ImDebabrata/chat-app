import { Navigate, Route, Routes } from "react-router";
import AuthLayout from "../app/(auth)/AuthLayout";
import SigninScreen from "../app/(auth)/signin/SigninScreen";
import SignupScreen from "../app/(auth)/signup/SignupScreen";
import AppLayout from "../app/(app)/AppLayout";
import DashboardScreen from "../app/(app)/dashboard/DashboardScreen";
import { useQueryClient } from "@tanstack/react-query";
import { LoggedInUserInterface } from "@/types/user.types";



const lsData = localStorage.getItem("loggedInUser");
const loggedInUserData = lsData
  ? (JSON.parse(lsData) as LoggedInUserInterface)
  : null;



function Navigator() {
  const queryClient = useQueryClient();


    if (loggedInUserData) {
      queryClient.setQueryData(["auth"], loggedInUserData); // Store token & user in React Query
    }


  return (
    <>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<SigninScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to={"/dashboard"} replace/>} />
          <Route path="/dashboard" element={<DashboardScreen />} />
        </Route>
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </>
  );
}

export default Navigator;
