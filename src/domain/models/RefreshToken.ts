import { User } from "./User.js";

export type RefreshToken = {
    userId: User["id"];
    token: string;
};
