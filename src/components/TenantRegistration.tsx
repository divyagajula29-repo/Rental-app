import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { registerTenant, getAvailableRooms, getCurrentUser } from '../utils/auth';
import { Upload, CheckCircle, AlertCircle, Home, Users, Building, FileText } from 'lucide-react';

interface TenantRegistrationProps {
  onComplete: () => void;
}

export default function TenantRegistration({ onComplete }: TenantRegistrationProps) {
  const [formData, setFormData] = useState({
    aadharNumber: '',
    company: '',
    familyMembersCount: 1,
    roomNumber: '',
    roomType: 'single' as 'single' | 'double',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [aadharFile, setAadharFile] = useState<File | null>(null);

  const availableRooms = getAvailableRooms();
  const filteredRooms = availableRooms.filter(room => room.roomType === formData.roomType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const user = getCurrentUser();
    if (!user) {
      setError('User not found. Please login again.');
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.aadharNumber || !formData.company || !formData.roomNumber) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    if (formData.aadharNumber.length !== 12 || !/^\d+$/.test(formData.aadharNumber)) {
      setError('Please enter a valid 12-digit Aadhar number');
      setLoading(false);
      return;
    }

    try {
      const registration = {
        tenantId: user.uid,
        tenantName: user.name,
        aadharNumber: formData.aadharNumber,
        aadharCardUrl: aadharFile ? URL.createObjectURL(aadharFile) : '',
        company: formData.company,
        familyMembersCount: formData.familyMembersCount,
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        joinedAt: new Date().toISOString(),
        phone: user.phone || ''
      };

      registerTenant(registration);
      setMessage('Registration successful! Redirecting to dashboard...');
      
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setAadharFile(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Complete Your Registration</CardTitle>
          <CardDescription>
            Please provide your details to complete the room registration
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personal Information
              </h3>
              
              <div>
                <Label htmlFor="aadhar">Aadhar Number</Label>
                <Input
                  id="aadhar"
                  type="text"
                  value={formData.aadharNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, aadharNumber: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                  placeholder="Enter 12-digit Aadhar number"
                  maxLength={12}
                  required
                />
              </div>

              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Enter your company name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="family">Family Members Count</Label>
                <Input
                  id="family"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.familyMembersCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, familyMembersCount: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="aadhar-file">Upload Aadhar Card (Optional)</Label>
                <div className="mt-2">
                  <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        {aadharFile ? aadharFile.name : 'Click to upload Aadhar card'}
                      </p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Room Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="w-5 h-5" />
                Room Selection
              </h3>

              <div>
                <Label htmlFor="room-type">Room Type</Label>
                <Select 
                  value={formData.roomType} 
                  onValueChange={(value: 'single' | 'double') => {
                    setFormData(prev => ({ ...prev, roomType: value, roomNumber: '' }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Bedroom</SelectItem>
                    <SelectItem value="double">Double Bedroom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="room">Available Rooms</Label>
                <Select 
                  value={formData.roomNumber} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, roomNumber: value }))}
                  disabled={filteredRooms.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRooms.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No rooms available
                      </SelectItem>
                    ) : (
                      filteredRooms.map(room => (
                        <SelectItem key={room.roomNumber} value={room.roomNumber}>
                          Room {room.roomNumber} - Floor {room.floor} ({room.roomType === 'single' ? 'Single' : 'Double'})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {filteredRooms.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No {formData.roomType} rooms available at the moment
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || filteredRooms.length === 0}>
              {loading ? 'Registering...' : 'Complete Registration'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}