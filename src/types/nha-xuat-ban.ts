export interface INhaXuatBan {
  _id?: string;
  name: string;
  address: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INhaXuatBanResponse extends INhaXuatBan {
  __v?: number;
}