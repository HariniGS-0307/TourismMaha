import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="container-shell section-spacing">
      <div className="mx-auto max-w-md card-surface p-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Create an account
        </h1>
        <p className="mt-2 text-slate-600">
          Join to save favorites, book trips, and track confirmations.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
