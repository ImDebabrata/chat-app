import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { signin } from "@/app/api";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";

function SigninScreen() {
  const navigate = useNavigate();
  const { handleSignin } = useAuth();
  const mutation = useMutation({
    mutationFn: signin,
    onSuccess: (response) => {
      // console.log("Signin successful:", response.data);
      handleSignin(response.data);
      navigate("/dashboard");
      toast.success(response.message || "Success");
    },
    onError: (error) => {
      console.error("Signin error:", error);
      // Handle error (e.g., show an error message)
      toast.error(error.message || "Something went wrong");
    },
  });

  const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Check if all fields are filled
    if (!email || !password) {
      alert("All fields are required.");
      return;
    }

    mutation.mutate({ email, password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
      style={{ perspective: 1000 }}
    >
      <motion.div
        initial={{ rotateY: -90, opacity: 0, scale: 0.8 }}
        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
        exit={{ rotateY: 90, opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className="space-y-2">
                <Input id="email" name="email" placeholder="Email" required />
              </div>
              <div className="space-y-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                />
              </div>
              <Button
                className="w-full"
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="underline text-primary">
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default SigninScreen;
