import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, User, Mail, AlertCircle } from "lucide-react";
import { register as registerApi } from "../../api/auth";

import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { RightPanel } from "./RightPanel";

/* ─── Validation ─────────────────────────────────────────── */
const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

/* ─── Page ───────────────────────────────────────────────── */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      await registerApi(data.name, data.email, data.password);
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 2200);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setApiError(
        axiosErr.response?.data?.message ??
        "Registration failed. Please check your details and try again."
      );
    }
  };

  /* ── Success state ── */
  if (done) {
    return (
      <div className="flex min-h-screen w-full bg-[#F6F6F8]">
        <main className="left-glow flex w-full flex-col items-center justify-center p-6 sm:p-10 lg:w-[45%] lg:p-12">
          <div className="w-full max-w-[400px] rounded-3xl bg-white p-6 shadow-xl shadow-black/5 sm:p-8">
            <div className="mb-6 flex justify-center">
              <Link to="/" className="inline-flex items-center gap-2 text-[22px] font-extrabold tracking-tight text-[#111B33]">
                <span className="flex h-10 w-10 items-center justify-center">
                  <img src="/image.png" alt="Pixara" className="h-full w-full object-contain" />
                </span>
                <span>Pixara</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-[#E4E8EE] bg-[#FAFAFA] p-8 text-center shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#20A66A]/12">
                <CheckCircle2 size={24} className="text-[#20A66A]" />
              </div>
              <div>
                <h2 className="text-[17px] font-extrabold text-[#111B33]">
                  Account created!
                </h2>
                <p className="mt-1.5 text-[12.5px] text-[#586982]">
                  Redirecting you to sign in…
                </p>
              </div>
              <div className="mt-3 w-full">
                <Button onClick={() => navigate("/login", { replace: true })}>
                  Sign in now
                </Button>
              </div>
            </div>
          </div>
        </main>
        <RightPanel />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#F6F6F8]">
      {/* ─── LEFT: Form Area ────────────────────────────── */}
      <main className="left-glow flex w-full flex-col items-center justify-center p-6 sm:p-10 lg:w-[50%] lg:p-12">

        {/* Auth Card */}
        <div className="w-full max-w-[450px] rounded-3xl bg-white p-6 shadow-xl shadow-black/5 sm:p-8">

          {/* Logo */}
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
              Build your <span className="text-[#1769FF]">workspace.</span>
            </h1>
            <p className="mx-auto mt-1.5 max-w-[320px] text-[13px] leading-relaxed text-[#586982]">
              Create an account to collaborate on events, organize photographs, and prepare customer-ready galleries.
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
              label="Full Name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              registration={register("name")}
              error={errors.name?.message}
              icon={<User size={16} />}
            />

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              registration={register("email")}
              error={errors.email?.message}
              icon={<Mail size={16} />}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 6 characters"
              registration={register("password")}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              registration={register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            <div className="mt-1">
              <Button type="submit" isLoading={isSubmitting} loadingText="Creating account...">
                Create account
              </Button>
            </div>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-[13px] text-[#586982]">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#1769FF] hover:text-[#0F5BE7]">
              Sign In
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
