import { LoggedInUserInterface } from "@/types/user.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

function useAuth() {
  const queryClient = useQueryClient();

  const { data: loggedInUser } = useQuery({
    queryKey: ["auth"],
    queryFn: (): LoggedInUserInterface =>
      JSON.parse(localStorage.getItem("loggedInUser") || ""),
    initialData: () => queryClient.getQueryData(["auth"]),
  });

  const handleSignOut = useCallback(() => {
    localStorage.removeItem("loggedInUser");
    queryClient.clear();
  }, [queryClient]);

  const handleSignin = useCallback(
    (userInfo: LoggedInUserInterface) => {
      localStorage.setItem("loggedInUser", JSON.stringify(userInfo));
      queryClient.setQueryData(["auth"], userInfo);
    },
    [queryClient]
  );


  return { loggedInUser, handleSignOut, handleSignin };
}

export default useAuth;
