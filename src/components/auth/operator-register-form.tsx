"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { operatorRegisterSchema } from "@/lib/validators/auth";
import type { z } from "zod";

type FormValues = z.infer<typeof operatorRegisterSchema>;

export function OperatorRegisterForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(operatorRegisterSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setMessage(null);

    const response = await fetch("/api/operators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Unable to submit operator application.");
      return;
    }

    setMessage("Operator application submitted. An admin will verify your profile before publishing listings.");
  });

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
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
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Business name</label>
        <input {...register("businessName")} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
        <input {...register("phone")} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Verification document URL</label>
        <input {...register("verificationDocumentUrl")} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Cloudinary or document URL" />
      </div>
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-slate-700">Business description</label>
        <textarea {...register("description")} rows={5} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
        {errors.description ? <p className="mt-1 text-sm text-rose-600">{errors.description.message}</p> : null}
      </div>
      {error ? <p className="text-sm text-rose-600 md:col-span-2">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600 md:col-span-2">{message}</p> : null}
      <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-teal-600 px-4 py-3 font-medium text-white md:col-span-2">
        {isSubmitting ? "Submitting..." : "Apply as an operator"}
      </button>
    </form>
  );
}
