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
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { signup } from "@/app/api";
import { toast } from "sonner";

function SignupScreen() {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: (response) => {
      navigate("/signin");
      toast.success(response.message||'Signup success')
    },
    onError: (error) => {
      console.error("Signup error:", error);
      toast.error(error.message||'Something went wrong')
      // Handle error (e.g., show an error message)
    },
  });

  const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Check if all fields are filled
    if (!name || !email || !password) {
      toast.error("All fields are required.");
      return;
    }

    mutation.mutate({ name, email, password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
      style={{ perspective: 1000 }}
    >
      <motion.div
        initial={{ rotateY: 90, opacity: 0, scale: 0.8 }}
        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
        exit={{ rotateY: -90, opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Start your journey with us</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className="space-y-2">
                <Input id="name" name="name" placeholder="Full Name" required />
              </div>
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
                {mutation.isPending ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/signin" className="underline text-primary">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default SignupScreen;
