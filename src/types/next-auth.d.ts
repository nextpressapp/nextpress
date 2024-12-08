import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        role: string;
    }

    interface Session extends DefaultSession {
        user: User & {
            id: string;
            role: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
    }
}
