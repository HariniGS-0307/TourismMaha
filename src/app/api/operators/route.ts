import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { operatorRegisterSchema } from "@/lib/validators/auth";
import { registerOperator } from "@/server/services/auth-service";
import { createNotification } from "@/server/services/notification-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = operatorRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const user = await registerOperator(parsed.data);
    await createNotification({
      userId: user.id,
      type: "operator_application",
      title: "Operator application received",
      message: "Your operator application is under review.",
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to register operator.",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { operatorId, isVerified } = await request.json();
  const { prisma } = await import("@/lib/prisma");
  const operator = await prisma.operatorProfile.update({
    where: { id: operatorId },
    data: { isVerified },
  });

  await createNotification({
    userId: operator.userId,
    type: "operator_verification",
    title: isVerified ? "Operator approved" : "Operator update",
    message: isVerified
      ? "Your operator account has been approved."
      : "Your operator account status has been updated.",
  });

  return NextResponse.json(operator);
}
