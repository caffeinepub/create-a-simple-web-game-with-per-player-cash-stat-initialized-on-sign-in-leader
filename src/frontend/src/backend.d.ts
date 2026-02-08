import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    id: PlayerID;
    cash: Cash;
    joinedAt: Time;
    hasClaimedReward: boolean;
    clickSpeed: Speed;
}
export interface LeaderboardEntry {
    player: Principal;
    cash: bigint;
}
export type Time = bigint;
export type Cash = bigint;
export type PlayerID = Principal;
export type Speed = bigint;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCash(amount: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimStarterReward(): Promise<void>;
    enforceAdminCashLeadership(admin: Principal): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCash(): Promise<Cash>;
    getCashLeaderboard(limit: bigint): Promise<Array<LeaderboardEntry>>;
    getPlayerStatus(): Promise<Player>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeCash(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    upgradeSpeed(): Promise<void>;
}
