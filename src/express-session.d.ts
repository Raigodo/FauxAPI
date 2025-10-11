// src/types/express-session.d.ts
import "express-session";

declare module "express-session" {
    interface SessionData {
        userId?: string;
        // add whatever you store in session here
    }
}

declare module "express-serve-static-core" {
    interface Request {
        session: import("express-session").Session & Partial<import("express-session").SessionData>;
    }
}
