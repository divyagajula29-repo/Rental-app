import { Room, TenantRegistration, Payment, User } from '../types';

export type UserRole = 'owner' | 'tenant';

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

const USER_STORAGE_KEY = 'rentalUser';
const ROOMS_STORAGE_KEY = 'rooms';
const REGISTRATIONS_KEY = 'tenantRegistrations';
const PAYMENTS_KEY = 'tenantPayments';
const USERS_KEY = 'allUsers';
const PASSWORD_RESET_KEY = 'passwordResets';

// Mock users database
const mockUsers: User[] = [
  { 
    uid: '1', 
    name: 'Owner Admin', 
    email: 'owner@building.com', 
    password: 'owner123',
    role: 'owner',
    phone: '9876543210'
  },
  { 
    uid: '2', 
    name: 'Tenant One', 
    email: 'tenant1@building.com', 
    password: 'tenant123',
    role: 'tenant',
    phone: '9876543211'
  },
  { 
    uid: '3', 
    name: 'Tenant Two', 
    email: 'tenant2@building.com', 
    password: 'tenant123',
    role: 'tenant',
    phone: '9876543212'
  },
];

// Initialize users in localStorage if not exists
const initializeUsers = () => {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
  }
};

// Initialize rooms if not exists
const initializeRooms = () => {
  const existingRooms = localStorage.getItem(ROOMS_STORAGE_KEY);
  if (!existingRooms) {
    const initialRooms: Room[] = [
      { roomNumber: '101', floor: 1, roomType: 'single', status: 'vacant', tenantId: null },
      { roomNumber: '102', floor: 1, roomType: 'single', status: 'vacant', tenantId: null },
      { roomNumber: '103', floor: 1, roomType: 'double', status: 'vacant', tenantId: null },
      { roomNumber: '104', floor: 1, roomType: 'double', status: 'vacant', tenantId: null },
      { roomNumber: '201', floor: 2, roomType: 'single', status: 'vacant', tenantId: null },
      { roomNumber: '202', floor: 2, roomType: 'single', status: 'vacant', tenantId: null },
      { roomNumber: '203', floor: 2, roomType: 'double', status: 'vacant', tenantId: null },
      { roomNumber: '204', floor: 2, roomType: 'double', status: 'vacant', tenantId: null },
      { roomNumber: '301', floor: 3, roomType: 'single', status: 'vacant', tenantId: null },
      { roomNumber: '302', floor: 3, roomType: 'single', status: 'vacant', tenantId: null },
      { roomNumber: '303', floor: 3, roomType: 'double', status: 'vacant', tenantId: null },
      { roomNumber: '304', floor: 3, roomType: 'double', status: 'vacant', tenantId: null },
      { roomNumber: '401', floor: 4, roomType: 'single', status: 'vacant', tenantId: null },
      { roomNumber: '402', floor: 4, roomType: 'single', status: 'vacant', tenantId: null },
      { roomNumber: '403', floor: 4, roomType: 'double', status: 'vacant', tenantId: null },
      { roomNumber: '404', floor: 4, roomType: 'double', status: 'vacant', tenantId: null },
      { roomNumber: '501', floor: 5, roomType: 'single', status: 'vacant', tenantId: null },
      { roomNumber: '502', floor: 5, roomType: 'single', status: 'vacant', tenantId: null },
      { roomNumber: '503', floor: 5, roomType: 'double', status: 'vacant', tenantId: null },
      { roomNumber: '504', floor: 5, roomType: 'double', status: 'vacant', tenantId: null },
    ];
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(initialRooms));
  }
};

// Initialize on import
initializeUsers();
initializeRooms();

export const login = (email: string, password: string): AuthUser | null => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find((u: User) => u.email === email && u.password === password);
  
  if (!user) return null;

  const authUser: AuthUser = {
    uid: user.uid,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone
  };

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
  return authUser;
};

export const logout = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const getCurrentUser = (): AuthUser | null => {
  const userStr = localStorage.getItem(USER_STORAGE_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const isTenantRegistered = (userId: string): boolean => {
  const registrations = JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) || '[]');
  return registrations.some((r: TenantRegistration) => r.tenantId === userId);
};

export const getTenantRegistration = (tenantId: string): TenantRegistration | null => {
  const registrations = JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) || '[]');
  return registrations.find((r: TenantRegistration) => r.tenantId === tenantId) || null;
};

export const registerTenant = (registration: TenantRegistration) => {
  const registrations = JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) || '[]');
  registrations.push(registration);
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations));

  // Update room status
  const rooms = JSON.parse(localStorage.getItem(ROOMS_STORAGE_KEY) || '[]');
  const roomIndex = rooms.findIndex((r: Room) => r.roomNumber === registration.roomNumber);
  if (roomIndex !== -1) {
    rooms[roomIndex].status = 'occupied';
    rooms[roomIndex].tenantId = registration.tenantId;
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  }
};

export const getAvailableRooms = (): Room[] => {
  const rooms = JSON.parse(localStorage.getItem(ROOMS_STORAGE_KEY) || '[]');
  return rooms.filter((r: Room) => r.status === 'vacant');
};

export const getTenantPayments = (tenantId: string): Payment[] => {
  const payments = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
  return payments.filter((p: Payment) => p.tenantId === tenantId);
};

export const getAllPayments = (): Payment[] => {
  return JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
};

export const addPayment = (payment: Payment) => {
  const payments = JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
  
  // Remove existing payment for the same month if exists
  const filteredPayments = payments.filter((p: Payment) => 
    !(p.tenantId === payment.tenantId && p.month === payment.month)
  );
  
  filteredPayments.push(payment);
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(filteredPayments));
};

export const getAllUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const getAllRooms = (): Room[] => {
  return JSON.parse(localStorage.getItem(ROOMS_STORAGE_KEY) || '[]');
};

// Password reset functions
export const initiatePasswordReset = (phone: string) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find((u: User) => u.phone === phone);
  
  if (!user) {
    return { success: false, message: 'Phone number not found' };
  }

  // Generate 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store reset code with expiry (1 hour)
  const resetData = {
    userId: user.uid,
    code: resetCode,
    expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
  };
  
  const resets = JSON.parse(localStorage.getItem(PASSWORD_RESET_KEY) || '[]');
  resets.push(resetData);
  localStorage.setItem(PASSWORD_RESET_KEY, JSON.stringify(resets));
  
  console.log(`Reset code for ${phone}: ${resetCode}`); // In real app, send via SMS
  
  return { 
    success: true, 
    message: `Reset code sent to ${phone}. For demo, code is: ${resetCode}`,
    resetCode 
  };
};

export const validateResetCode = (code: string) => {
  const resets = JSON.parse(localStorage.getItem(PASSWORD_RESET_KEY) || '[]');
  const reset = resets.find((r: any) => r.code === code && new Date(r.expiresAt) > new Date());
  
  if (!reset) {
    return { valid: false, message: 'Invalid or expired reset code' };
  }
  
  return { valid: true, userId: reset.userId };
};

export const resetPassword = (code: string, newPassword: string) => {
  const codeValidation = validateResetCode(code);
  if (!codeValidation.valid) {
    return { success: false, message: 'Invalid or expired reset code' };
  }
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const userIndex = users.findIndex((u: User) => u.uid === codeValidation.userId);
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  users[userIndex].password = newPassword;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Remove used reset code
  const resets = JSON.parse(localStorage.getItem(PASSWORD_RESET_KEY) || '[]');
  const filteredResets = resets.filter((r: any) => r.code !== code);
  localStorage.setItem(PASSWORD_RESET_KEY, JSON.stringify(filteredResets));
  
  return { success: true, message: 'Password reset successful' };
};