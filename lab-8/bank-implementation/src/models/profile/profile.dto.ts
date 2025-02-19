export interface CreateProfileDto {
  id: string;
  name: string;
  email: string;
}

export interface ProfileDto {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}
