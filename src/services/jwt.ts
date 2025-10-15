import "dotenv/config";
import { default as jwt, JwtPayload } from "jsonwebtoken";
import { User } from "../domain/models/User.js";
import { RefreshTokenDao } from "./dao/refresh-token-dao.js";

export function generateAccessToken(user: User) {
    return jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: "2h",
    });
}

export async function generateRefreshToken(user: User) {
    const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET!);
    await RefreshTokenDao.upsert({ userId: user.id, token: refreshToken });
    return refreshToken;
}

export function veriffyAccessToken(
    token: string
): { valid: false } | { valid: true; payload: { userId: string } } {
    let refreshPayload: { userId: string } | undefined;

    let valid: boolean = true;

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
        if (err) {
            valid = false;
            return;
        }
        refreshPayload = { userId: (user as JwtPayload).userId as string };
    });

    return {
        valid,
        payload: refreshPayload!,
    };
}

export function veriffyRefreshToken(
    token: string
): { valid: false } | { valid: true; payload: { userId: string } } {
    let refreshPayload: { userId: string } | undefined;

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, (err, user) => {
        if (err) {
            return { valid: false };
        }
        refreshPayload = { userId: (user as JwtPayload).userId as string };
    });

    return {
        valid: true,
        payload: refreshPayload!,
    };
}
