import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/api/auth/signin",
  },
  callbacks: {
    authorized: ({ token }) => token?.email === "thibautscholaert@gmail.com",
  },
});

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};

