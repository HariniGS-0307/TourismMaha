"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { registerSchema } from "@/lib/validators/auth";
import type { z } from "zod";

type FormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Unable to create account.");
      return;
    }

    setSuccess("Account created. You can sign in now.");
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
        <input {...register("name")} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
        {errors.name ? <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p> : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
        <input {...register("email")} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
        {errors.email ? <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p> : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
        <input {...register("password")} type="password" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
        {errors.password ? <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p> : null}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
      <button disabled={isSubmitting} type="submit" className="w-full rounded-2xl bg-teal-600 px-4 py-3 font-medium text-white">
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-500">
        Already have an account? <Link href="/login" className="text-teal-700">Sign in</Link>
      </p>
    </form>
  );
}
