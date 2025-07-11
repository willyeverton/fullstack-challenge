export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface EnrichedUserData {
  linkedin: string;
  github: string;
}

export interface EnrichedUser extends User {
  enrichedData?: EnrichedUserData;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface CreateUserResponse extends User {} 