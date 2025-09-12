import type { Request } from "express";
import type { IDocGia } from "./doc-gia.ts";
import type { INhanVien } from "./nhan-vien.ts";

interface BaseJWTPayload {
  sub: string;
  email: string;
}

export interface ReaderJWTPayload extends BaseJWTPayload {
  firstname: string;
  lastname: string;
}

export interface StaffJWTPayload extends BaseJWTPayload {
  fullname: string;
}

export interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export interface ReaderRegisterRequest extends Request {
  body: Pick<
    IDocGia,
    | "firstname"
    | "lastname"
    | "gender"
    | "dateOfBirth"
    | "phoneNumber"
    | "email"
    | "address"
  > & { password: string };
}
export interface StaffRegisterRequest extends Request {
  body: Pick<
    INhanVien,
    "fullname" | "email" | "duty" | "phoneNumber" | "address"
  > & { password: string };
}
