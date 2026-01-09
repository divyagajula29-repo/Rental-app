import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { getCurrentUser, getTenantRegistration, getTenantPayments, addPayment } from '../utils/auth';
import { Home, Users, Calendar, DollarSign, Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function TenantDashboard() {
  const [user, setUser] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setError('User not found. Please login again.');
        setLoading(false);
        return;
      }

      const tenantRegistration = getTenantRegistration(currentUser.uid);
      if (!tenantRegistration) {
        setError('Registration not found. Please complete your registration first.');
        setLoading(false);
        return;
      }

      const tenantPayments = getTenantPayments(currentUser.uid);

      setUser(currentUser);
      setRegistration(tenantRegistration);
      setPayments(tenantPayments);
      setLoading(false);
    };

    loadData();
  }, []);

  const handlePaymentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !user || !registration) return;

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const existingPayment = payments.find(p => p.month === currentMonth);

      if (existingPayment && existingPayment.status === 'paid') {
        setError('Payment for this month has already been submitted.');
        setUploading(false);
        return;
      }

      const payment = {
        tenantId: user.uid,
        roomNumber: registration.roomNumber,
        month: currentMonth,
        amount: registration.roomType === 'single' ? 8000 : 12000,
        screenshotUrl: URL.createObjectURL(selectedFile),
        status: 'paid' as const,
        createdAt: new Date().toISOString(),
        type: 'rent' as const
      };

      addPayment(payment);
      
      const updatedPayments = getTenantPayments(user.uid);
      setPayments(updatedPayments);
      
      setMessage('Payment proof uploaded successfully!');
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('payment-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError('Failed to upload payment proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const getCurrentMonthPaymentStatus = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const payment = payments.find(p => p.month === currentMonth);
    return payment?.status || 'pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentMonthStatus = getCurrentMonthPaymentStatus();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's your room and payment information</p>
      </div>

      {/* Room Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Your Room Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Room Number</p>
              <p className="text-lg font-semibold">{registration?.roomNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Floor</p>
              <p className="text-lg font-semibold">Floor {registration?.roomNumber?.[0]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Room Type</p>
              <p className="text-lg font-semibold capitalize">{registration?.roomType} Bedroom</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Rent</p>
              <p className="text-lg font-semibold">₹{registration?.roomType === 'single' ? '8,000' : '12,000'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="text-lg font-semibold">{registration?.company}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Family Members</p>
              <p className="text-lg font-semibold">{registration?.familyMembersCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Aadhar Number</p>
              <p className="text-lg font-semibold">****{registration?.aadharNumber?.slice(-4)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Joined Date</p>
              <p className="text-lg font-semibold">
                {registration?.joinedAt ? new Date(registration.joinedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Rent Payment
          </CardTitle>
          <CardDescription>
            Current month status: {currentMonthStatus === 'paid' ? 'Paid' : 'Pending'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-600">{message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {currentMonthStatus === 'paid' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-green-600">Payment Received</p>
              <p className="text-gray-600">Your rent for this month has been paid successfully.</p>
            </div>
          ) : (
            <form onSubmit={handlePaymentUpload} className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Upload your payment proof for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <label className="flex flex-col items-center cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to upload payment screenshot'}
                    </span>
                    <span className="text-xs text-gray-500">JPG, PNG, PDF (Max 5MB)</span>
                    <input
                      id="payment-file"
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Uploading...' : 'Submit Payment Proof'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No payment history available</p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {new Date(payment.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500">₹{payment.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {payment.status === 'paid' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">Paid</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600">Pending</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}