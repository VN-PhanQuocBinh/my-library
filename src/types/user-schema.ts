interface BaseUser extends Document {
  email: string;
  phoneNumber: string;
  address: string;
  passwordHash?: string | undefined;
  __v?: number | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  comparePassword(password: string): Promise<boolean>;
}

interface TypeWithId {
  _id: string;
}

// Doc gia
export interface IDocGia extends BaseUser {
  firstname: string;
  lastname: string;
  gender: "male" | "female" | "other";
  dateOfBirth: Date;

  // Virtual fields
  isBanned?: boolean;
}

export interface IDocGiaWithId extends IDocGia, TypeWithId {}

// Nhan vien
export interface INhanVien extends BaseUser {
  fullname: string;
  duty: "staff" | "manager";
}

export interface INhanVienWithId extends INhanVien, TypeWithId {}
