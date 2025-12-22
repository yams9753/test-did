
export enum Role {
  OWNER = 'OWNER',
  WALKER = 'WALKER'
}

export enum Size {
  S = 'S',
  M = 'M',
  L = 'L'
}

export enum WalkStatus {
  OPEN = 'OPEN',
  MATCHED = 'MATCHED',
  COMPLETED = 'COMPLETED'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  nickname: string;
  regionCode: string;
  trustScore: number;
  role: Role;
}

export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  size: Size;
  notes?: string;
  imageUrl?: string;
}

export interface WalkRequest {
  id: string;
  ownerId: string;
  dogId: string;
  dog?: Dog;
  owner?: User;
  scheduledAt: string;
  duration: number;
  reward: number;
  status: WalkStatus;
  createdAt: string;
}

export interface Application {
  id: string;
  requestId: string;
  walkerId: string;
  walker?: User;
  status: ApplicationStatus;
  createdAt: string;
}
