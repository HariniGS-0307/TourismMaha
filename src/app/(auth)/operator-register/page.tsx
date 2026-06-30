import { OperatorRegisterForm } from "@/components/auth/operator-register-form";

export default function OperatorRegisterPage() {
  return (
    <div className="container-shell section-spacing">
      <div className="card-surface mx-auto max-w-4xl p-8">
        <h1 className="text-3xl font-semibold text-slate-900">
          Become an operator
        </h1>
        <p className="mt-2 text-slate-600">
          Apply to publish experiences, manage bookings, and access operator
          analytics.
        </p>
        <div className="mt-6">
          <OperatorRegisterForm />
        </div>
      </div>
    </div>
  );
}
