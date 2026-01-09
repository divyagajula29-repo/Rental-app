import { Room, Payment } from '../types';

export const mockRooms: Room[] = [
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

export const mockPayments: Payment[] = [];