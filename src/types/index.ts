export interface Room {
  roomNumber: string;
  floor: number;
  roomType: 'single' | 'double';
  status: 'vacant' | 'occupied';
  tenantId: string | null;
}

export interface TenantRegistration {
  tenantId: string;
  tenantName: string;
  aadharNumber: string;
  aadharCardUrl?: string;
  company: string;
  familyMembersCount: number;
  roomNumber: string;
  roomType: 'single' | 'double';
  joinedAt: string;
  phone?: string;
}

export interface Payment {
  tenantId: string;
  roomNumber: string;
  month: string; // Format: YYYY-MM
  amount: number;
  screenshotUrl: string;
  status: 'paid' | 'pending';
  createdAt: string;
  type: 'rent' | 'deposit';
}

export interface User {
  uid: string;
  name: string;
  email: string;
  password: string;
  role: 'owner' | 'tenant';
  phone?: string;
}