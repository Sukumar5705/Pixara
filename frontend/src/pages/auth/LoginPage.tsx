import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, AlertCircle } from "lucide-react";
import { login } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";

import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { RightPanel } from "./RightPanel";

/* ─── Validation ─────────────────────────────────────────── */
const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

/* ─── Page ───────────────────────────────────────────────── */
export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      const res = await login(data.email, data.password);
      setAuth(res, res.token);
      navigate("/app/dashboard", { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setApiError(
        axiosErr.response?.data?.message ??
        "Invalid email or password. Please try again."
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F6F6F8]">
      {/* ─── LEFT: Form Area ────────────────────────────── */}
      <main className="left-glow flex w-full flex-col items-center justify-center p-6 sm:p-10 lg:w-[45%] lg:p-12">

        {/* Auth Card */}
        <div className="w-full max-w-[400px] rounded-3xl bg-white p-6 shadow-xl shadow-black/5 sm:p-8">

          {/* Logo (visible on all screens) */}
          <div className="mb-6 flex justify-center">
            <Link to="/" className="inline-flex items-center gap-2 text-[22px] font-extrabold tracking-tight text-[#111B33]">
              <span className="flex h-10 w-10 items-center justify-center">
                <img src="/image.png" alt="Pixara" className="h-full w-full object-contain" />
              </span>
              <span>Pixara</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-[26px] font-extrabold leading-tight tracking-tight sm:text-[28px]">
              Welcome <span className="text-[#1769FF]">back</span>
            </h1>
            <p className="mx-auto mt-1.5 max-w-[320px] text-[13px] leading-relaxed text-[#586982]">
              Sign in to your account to continue sharing and exploring beautiful moments.
            </p>
          </div>



          {apiError && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#DC4C4C]/30 bg-[#DC4C4C]/10 p-3 text-[13px] font-medium text-[#DC4C4C]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="Enter your Email Address"
              registration={register("email")}
              error={errors.email?.message}
              icon={<Mail size={16} />}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your Password"
              registration={register("password")}
              error={errors.password?.message}
            />

            <div className="mt-1">
              <Button type="submit" isLoading={isSubmitting} loadingText="Signing in...">
                Continue
              </Button>
            </div>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-[13px] text-[#586982]">
            Don’t have an account?{" "}
            <Link to="/register" className="font-bold text-[#1769FF] hover:text-[#0F5BE7]">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[12px] text-[#586982]">
          © {new Date().getFullYear()} Pixara. All rights reserved.
        </p>
      </main>

      {/* ─── RIGHT: Marketing Panel ─────────────────────── */}
      <RightPanel />
    </div>
  );
}
