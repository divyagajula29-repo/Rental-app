import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { getAllPayments, getAllUsers } from '../utils/auth';
import { Building, DollarSign, Users, Home, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export default function OwnerDashboard() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  useEffect(() => {
    const loadData = () => {
      // Load rooms from localStorage
      const storedRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
      const storedPayments = getAllPayments();
      const storedUsers = getAllUsers();

      setRooms(storedRooms);
      setPayments(storedPayments);
      setUsers(storedUsers);
      setLoading(false);
    };

    loadData();
  }, []);

  const getCurrentMonth = () => {
    return new Date().toISOString().slice(0, 7);
  };

  const getPaymentStatus = (roomNumber: string) => {
    const currentMonth = getCurrentMonth();
    const payment = payments.find(p => p.roomNumber === roomNumber && p.month === currentMonth);
    return payment?.status || 'pending';
  };

  const getOccupancyStats = () => {
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const vacantRooms = totalRooms - occupiedRooms;
    
    return {
      total: totalRooms,
      occupied: occupiedRooms,
      vacant: vacantRooms,
      occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : '0'
    };
  };

  const getRevenueStats = () => {
    const currentMonth = getCurrentMonth();
    const currentMonthPayments = payments.filter(p => p.month === currentMonth && p.status === 'paid');
    const totalRevenue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const expectedRevenue = rooms.filter(r => r.status === 'occupied').reduce((sum, r) => {
      return sum + (r.roomType === 'single' ? 8000 : 12000);
    }, 0);

    return {
      current: totalRevenue,
      expected: expectedRevenue,
      collected: currentMonthPayments.length,
      pending: rooms.filter(r => r.status === 'occupied').length - currentMonthPayments.length
    };
  };

  const getRoomsByFloor = (floor: number) => {
    return rooms.filter(room => room.floor === floor);
  };

  const getTenantInfo = (tenantId: string) => {
    return users.find(u => u.uid === tenantId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getOccupancyStats();
  const revenue = getRevenueStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your building and track payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold">{stats.occupied}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vacant</p>
                <p className="text-2xl font-bold">{stats.vacant}</p>
              </div>
              <Home className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold">{stats.occupancyRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Revenue Overview
          </CardTitle>
          <CardDescription>
            Current month: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Collected</p>
              <p className="text-2xl font-bold text-green-600">₹{revenue.current.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{revenue.collected} payments</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Expected</p>
              <p className="text-2xl font-bold text-blue-600">₹{revenue.expected.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{stats.occupied} occupied rooms</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">₹{(revenue.expected - revenue.current).toLocaleString()}</p>
              <p className="text-sm text-gray-500">{revenue.pending} pending payments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floor Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Room Status by Floor</CardTitle>
          <CardDescription>Click on a floor to view detailed room information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedFloor === null ? "default" : "outline"}
              onClick={() => setSelectedFloor(null)}
            >
              All Floors
            </Button>
            {[1, 2, 3, 4, 5].map(floor => (
              <Button
                key={floor}
                variant={selectedFloor === floor ? "default" : "outline"}
                onClick={() => setSelectedFloor(floor)}
              >
                Floor {floor}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rooms Grid */}
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map(floor => {
          if (selectedFloor && selectedFloor !== floor) return null;
          const floorRooms = getRoomsByFloor(floor);
          
          return (
            <Card key={floor}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Floor {floor}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {floorRooms.map(room => {
                    const paymentStatus = getPaymentStatus(room.roomNumber);
                    const tenant = room.tenantId ? getTenantInfo(room.tenantId) : null;
                    const isPaid = paymentStatus === 'paid';
                    
                    return (
                      <div
                        key={room.roomNumber}
                        className={`p-4 rounded-lg border-2 ${
                          room.status === 'vacant' 
                            ? 'border-gray-200 bg-gray-50' 
                            : isPaid 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-red-500 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg">Room {room.roomNumber}</h3>
                          {room.status === 'occupied' ? (
                            isPaid ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            )
                          ) : (
                            <Home className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <p className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium capitalize">{room.roomType}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-medium capitalize ${
                              room.status === 'vacant' ? 'text-gray-600' : 'text-green-600'
                            }`}>
                              {room.status}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-gray-600">Rent:</span>
                            <span className="font-medium">
                              ₹{room.roomType === 'single' ? '8,000' : '12,000'}
                            </span>
                          </p>
                          {room.status === 'occupied' && (
                            <>
                              <p className="flex justify-between">
                                <span className="text-gray-600">Payment:</span>
                                <span className={`font-medium ${
                                  isPaid ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {isPaid ? 'Paid' : 'Pending'}
                                </span>
                              </p>
                              {tenant && (
                                <div className="pt-2 border-t">
                                  <p className="text-gray-600">Tenant:</p>
                                  <p className="font-medium">{tenant.name}</p>
                                  <p className="text-xs text-gray-500">{tenant.email}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}