import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "USER" | "OPERATOR" | "ADMIN";
      isSuspended: boolean;
    };
  }

  interface User {
    role: "USER" | "OPERATOR" | "ADMIN";
    isSuspended: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "OPERATOR" | "ADMIN";
    isSuspended?: boolean;
  }
}
