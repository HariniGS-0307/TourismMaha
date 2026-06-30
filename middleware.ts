import { withAuth } from "next-auth/middleware";

export default withAuth(function middleware() {}, {
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;

      if (!token) {
        return false;
      }

      if (pathname.startsWith("/dashboard/admin")) {
        return token.role === "ADMIN";
      }

      if (pathname.startsWith("/dashboard/operator")) {
        return token.role === "OPERATOR";
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/access-denied",
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
