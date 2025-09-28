export interface INhanVien extends Document {
  fullname: string;
  normalizedFullname?: string;
  duty: "staff" | "manager";
  email: string;
  passwordHash?: string;
  phoneNumber: string;
  address: string;
  status?: "active" | "inactive";
  comparePassword(password: string): Promise<boolean>;
  __v?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INhanVienWithId extends INhanVien {
  _id: string;
}
