interface BaseUser extends Document {
  email: string;
  phoneNumber: string;
  address: string;
  passwordHash?: string;
  __v?: number;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(password: string): Promise<boolean>;
}

interface TypeWithId {
  __id: string;
}

// Doc gia
export interface IDocGia extends BaseUser {
  firstname: string;
  lastname: string;
  gender: "male" | "female" | "other";
  dateOfBirth: Date;
}

export interface IDocGiaWithId extends IDocGia, TypeWithId {}

// Nhan vien
export interface INhanVien extends BaseUser {
  fullname: string;
  duty: "staff" | "manager";
}

export interface INhanVienWithId extends INhanVien, TypeWithId {}
