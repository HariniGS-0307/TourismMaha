"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/lib/validators/auth";
import type { z } from "zod";

type FormValues = z.infer<typeof loginSchema>;

const googleAuthEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const response = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl: "/dashboard/user",
    });

    if (response?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(response?.url ?? "/dashboard/user");
    router.refresh();
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          {...register("email")}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3"
        />
        {errors.email ? (
          <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          {...register("password")}
          type="password"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3"
        />
        {errors.password ? (
          <p className="mt-1 text-sm text-rose-600">
            {errors.password.message}
          </p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full rounded-2xl bg-teal-600 px-4 py-3 font-medium text-white"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      {googleAuthEnabled ? (
        <button
          type="button"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-700"
          onClick={() => signIn("google", { callbackUrl: "/dashboard/user" })}
        >
          Continue with Google
        </button>
      ) : null}
      <p className="text-center text-sm text-slate-500">
        New here?{" "}
        <Link href="/register" className="text-teal-700">
          Create an account
        </Link>
      </p>
    </form>
  );
}
