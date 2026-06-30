import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

type RegisterOperatorInput = RegisterUserInput & {
  businessName: string;
  phone: string;
  description: string;
  verificationDocumentUrl?: string;
};

export async function registerUser(input: RegisterUserInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: "USER",
    },
  });
}

export async function registerOperator(input: RegisterOperatorInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: "OPERATOR",
      operatorProfile: {
        create: {
          businessName: input.businessName,
          phone: input.phone,
          description: input.description,
          isVerified: false,
          verificationDocs: input.verificationDocumentUrl
            ? [input.verificationDocumentUrl]
            : [],
        },
      },
    },
    include: {
      operatorProfile: true,
    },
  });
}
