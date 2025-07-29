import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Flag, Timer, Trophy, Zap, UserPlus } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/Card";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { useRegister } from "../hooks/useAuth";
import { useStats } from "../hooks/useAuth";

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const registerMutation = useRegister();
  const { error: authError } = registerMutation;
  const { data: statsData } = useStats();

  const stats = statsData || {
    totalUsers: 0,
    totalRecords: 0,
    bestTime: null,
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-primary/20 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iNyIgY3k9IjciIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>

      <div className="w-full max-w-md relative">
        {/* Main Card */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Logo and Icons */}
            <div className="flex justify-center items-center space-x-3 mb-2">
              <div className="p-2 bg-primary/20 rounded-full">
                <Flag className="w-8 h-8 text-primary" />
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-full">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="p-2 bg-green-500/20 rounded-full">
                <Timer className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="space-y-3">
              <CardTitle className="text-4xl font-black text-white">
                <span className="bg-gradient-to-r from-primary via-yellow-400 to-green-400 bg-clip-text text-transparent">
                  TrackMania
                </span>
                <br />
                <span className="text-2xl font-bold text-white/90">
                  Scoreboard
                </span>
              </CardTitle>
              <p className="text-white/70 text-lg font-medium">
                🏁 Join the race and start tracking your times!
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-white/60">
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>Live Rankings</span>
                </div>
                <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <Timer className="w-4 h-4" />
                  <span>Best Times</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Error Display */}
              {authError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-sm font-medium">
                      {authError.message ||
                        "Registration failed. Please try again."}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  {...register("username")}
                  type="text"
                  label="Username"
                  placeholder="Choose your racing name"
                  error={errors.username?.message}
                  autoComplete="username"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-primary/50 focus:ring-primary/20"
                />

                <Input
                  {...register("email")}
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  error={errors.email?.message}
                  autoComplete="email"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-primary/50 focus:ring-primary/20"
                />

                <Input
                  {...register("password")}
                  type="password"
                  label="Password"
                  placeholder="Create a strong password"
                  error={errors.password?.message}
                  autoComplete="new-password"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-primary/50 focus:ring-primary/20"
                />

                <Input
                  {...register("confirmPassword")}
                  type="password"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  error={errors.confirmPassword?.message}
                  autoComplete="new-password"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-primary/50 focus:ring-primary/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-bold text-lg shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                isLoading={isSubmitting || registerMutation.isPending}
              >
                {isSubmitting || registerMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5" />
                    <span>Join the Race</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="space-y-4 pt-6">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="flex flex-col items-center space-y-3">
              <div className="text-center">
                <span className="text-white/60 text-sm">
                  Already have an account?{" "}
                </span>
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 font-semibold text-sm hover:underline transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Footer Stats - Centered */}
            <div className="flex justify-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-primary font-bold text-lg">
                  {stats.totalUsers}
                </div>
                <div className="text-white/50 text-xs">Racers</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-bold text-lg">
                  {stats.totalRecords}
                </div>
                <div className="text-white/50 text-xs">Records</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">
                  {stats.bestTime || "--"}
                </div>
                <div className="text-white/50 text-xs">Best Time</div>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Floating Elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-yellow-500/10 rounded-full animate-pulse delay-700"></div>
        <div className="absolute top-1/2 -left-8 w-4 h-4 bg-green-500/20 rounded-full animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};
