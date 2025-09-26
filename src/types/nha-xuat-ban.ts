export interface INhaXuatBan {
  _id?: string;
  name: string;
  normalizedName?: string;
  address: string;
  normalizedAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INhaXuatBanResponse extends INhaXuatBan {
  __v?: number;
}
