import "dotenv/config";
import { default as jwt, JwtPayload } from "jsonwebtoken";
import { User } from "../domain/models/User.js";
import { RefreshTokenDao } from "./dao/refresh-token-dao.js";

export function generateAccessToken(user: User) {
    return jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: "2h",
    });
}

type ValidationResult =
    | { valid: false; payload: undefined }
    | { valid: true; payload: { userId: string } };

export async function generateRefreshToken(user: User) {
    const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET!);
    await RefreshTokenDao.upsert({ userId: user.id, token: refreshToken });
    return refreshToken;
}

export function veriffyAccessToken(token: string): ValidationResult {
    let refreshPayload: { userId: string } | undefined;
    let ok = true;

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
        if (err) {
            ok = false;
            return;
        }
        refreshPayload = { userId: (user as JwtPayload).userId as string };
    });

    if (ok) {
        return { valid: true, payload: refreshPayload! };
    }
    return { valid: false, payload: undefined };
}

export async function veriffyRefreshToken(token: string): Promise<ValidationResult> {
    let refreshPayload: { userId: string } | undefined;
    let ok = true;

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, (err, user) => {
        if (err) {
            ok = false;
            return;
        }
        refreshPayload = { userId: (user as JwtPayload).userId as string };
    });

    if (ok) {
        return { valid: true, payload: refreshPayload! };
    }
    return { valid: false, payload: undefined };
}
