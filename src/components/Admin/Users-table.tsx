// users-table.tsx
import React, { Suspense, useState, useEffect } from 'react';
import { UserRow } from '../data-table';
import { usersService } from '@/API/UsersService';
import adduserIcon from '../../assets/add_user.svg';
import { DownloadCloudIcon, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from '@radix-ui/react-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

const UserTable = React.lazy(() => import('../data-table'));

export default function Users() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await usersService.getAllUsers();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }
    setStep(2);
  };

  const handleSubmitStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("تم إنشاء المستخدم بنجاح!");
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      confirmPassword: '',
      city: '',
      otp: ''
    });
    setStep(1);
    setIsAddUserModalOpen(false);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);


  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="p-6 flex items-center justify-center h-64 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      {/* Add User Modal - Keep your existing modal code */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
      <DialogPortal >
          <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] w-full" />
      <DialogContent className="fixed w-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[450px] max-h-[85vh] bg-white p-6 rounded-xl shadow-lg z-[99999] focus:outline-none">
                    <DialogTitle className="text-right">
              {step === 1 ? "إضافة مستخدم جديد" : "تأكيد رقم الهاتف"}
            </DialogTitle>
            <DialogDescription className="text-right">
              {step === 1 
                ? "املأ المعلومات الأساسية للمستخدم" 
                : "أدخل رمز التحقق الذي تم إرساله إلى هاتفك"}
            </DialogDescription>

          {step === 1 ? (
            <form onSubmit={handleSubmitStep1} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-right block">
                    الاسم الأول
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="text-right"
                    placeholder="أدخل الاسم الأول"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-right block">
                    الاسم الأخير
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="text-right"
                    placeholder="أدخل الاسم الأخير"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-right block">
                  رقم الهاتف
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-right block">
                  المدينة
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                  placeholder="أدخل المدينة"
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="password" className="text-right block">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="text-right pr-10"
                    placeholder="أدخل كلمة المرور"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="confirmPassword" className="text-right block">
                  تأكيد كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="text-right pr-10"
                    placeholder="أكد كلمة المرور"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  التالي
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitStep2} className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  تم إرسال رمز التحقق إلى رقم الهاتف
                  <span className="font-semibold"> {formData.phone}</span>
                </p>
                
                <div className="flex justify-center space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <Input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl"
                      value={formData.otp[i] || ''}
                      onChange={(e) => {
                        const newOtp = formData.otp.split('');
                        newOtp[i] = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          otp: newOtp.join('')
                        }));
                        
                        // Auto focus next input
                        if (e.target.value && i < 5) {
                          const nextInput = document.getElementById(`otp-${i+1}`);
                          if (nextInput) (nextInput as HTMLInputElement).focus();
                        }
                      }}
                      id={`otp-${i}`}
                    />
                  ))}
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="link"
                    className="text-purple-600"
                    onClick={() => {
                      // Resend OTP logic
                      alert("تم إعادة إرسال رمز التحقق");
                    }}
                  >
                    إعادة إرسال الرمز
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  رجوع
                </Button>
                <Button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={formData.otp.length !== 6}
                >
                  تأكيد وإنشاء حساب
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
        </DialogPortal>
      </Dialog>
      {/* Main Content */}
      <div className="flex flex-col md:flex-col justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 justify-between w-full">
          <div>           
            <h1 className='text-2xl font-bold text-gray-800'>المستخدمين</h1>
            <p className="text-gray-600 mt-1">إدارة جميع المستخدمين في النظام</p>
          </div>
          <Button 
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
            onClick={() => setIsAddUserModalOpen(true)}
          >
            <span>أضف جديد</span>
            <img src={adduserIcon} alt="Add User" className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-end gap-2 w-full md:w-full">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-right"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            فلتر
            <DownloadCloudIcon/>
          </button>

          <button className="bg-gray-100 p-2 rounded-lg">
            <MoreVertical/>
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-white w-64 shadow-md rounded-lg p-4 mb-4 border border-gray-200 float-right mr-12">
          <div className="space-y-2 flex flex-col items-end w-full">
            {/* Filter options */}
          </div>
        </div>
      )}
      
      <Suspense fallback={<div className="flex items-center justify-center h-64">جاري تحميل الجدول...</div>}>
        <UserTable data={filteredUsers} />
      </Suspense>
    </div>
  );
};