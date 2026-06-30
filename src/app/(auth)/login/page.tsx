import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="container-shell section-spacing">
      <div className="mx-auto max-w-md card-surface p-8">
        <h1 className="text-3xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-2 text-slate-600">
          Access your bookings, wishlist, and dashboards.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
