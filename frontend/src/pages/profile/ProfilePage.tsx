import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { UserLayout } from '@/components/layout/UserLayout';
import { authAPI } from '@/services/api.service';
import { LoadingSpinner } from '@/components/ui/loadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User, Mail, Shield, Save, Eye, EyeOff, Key, Calendar } from 'lucide-react';

interface ProfileForm {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [loading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState<ProfileForm>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Partial<ProfileForm>>({});

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const validateProfileForm = () => {
    const newErrors: Partial<ProfileForm> = {};

    if (!form.name.trim()) {
      newErrors.name = t('profile.errors.nameRequired');
    }

    if (!form.email.trim()) {
      newErrors.email = t('profile.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = t('profile.errors.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Partial<ProfileForm> = {};

    if (!form.currentPassword) {
      newErrors.currentPassword = t('profile.errors.currentPasswordRequired');
    }

    if (form.newPassword && form.newPassword.length < 6) {
      newErrors.newPassword = t('profile.errors.passwordMinLength');
    }

    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = t('profile.errors.passwordsDontMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;

    setUpdating(true);
    try {
      const updateData: any = {
        name: form.name,
        email: form.email
      };

      if (form.currentPassword) {
        updateData.currentPassword = form.currentPassword;
        if (form.newPassword) {
          updateData.newPassword = form.newPassword;
        }
      }

      const response = await authAPI.updateProfile(updateData);
      
      if (response.data) {
        updateUser(response.data.user);
        setForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        toast.success(t('profile.updateSuccess'));
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      toast.error(err.message || t('profile.updateError'));
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    setUpdating(true);
    try {
      const updateData = {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      };

      const response = await authAPI.updateProfile(updateData);
      
      if (response.data) {
        setForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        toast.success(t('profile.passwordUpdateSuccess'));
      }
    } catch (err: any) {
      console.error('Password update error:', err);
      toast.error(err.message || t('profile.passwordUpdateError'));
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'staff':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    return t(`roles.${role}`) || role;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <UserLayout>
      <div className="p-4 md:p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">{t('profile.pageTitle')}</h1>
        <p className="text-gray-600">{t('profile.pageDescription')}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-xl">{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <Badge 
                variant="outline" 
                className={`${getRoleBadgeColor(user?.role || 'user')} border mt-2 mx-auto`}
              >
                <Shield className="w-3 h-3 mr-1" />
                {getRoleLabel(user?.role || 'user')}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{getRoleLabel(user?.role || 'user')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  {t('profile.memberSince')} {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </span>
              </div>
              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>{t('profile.accountStatus')}: 
                    <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
                      {user?.isActive ? t('profile.active') : t('profile.inactive')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">
                  <User className="w-4 h-4 mr-2" />
                  {t('profile.profileTab')}
                </TabsTrigger>
                <TabsTrigger value="password">
                  <Key className="w-4 h-4 mr-2" />
                  {t('profile.passwordTab')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.editProfile')}</CardTitle>
                    <CardDescription>
                      {t('profile.editProfileDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">{t('profile.name')}</Label>
                          <Input
                            id="name"
                            value={form.name}
                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={t('profile.namePlaceholder')}
                            className={errors.name ? 'border-red-500' : ''}
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">{t('profile.email')}</Label>
                          <Input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder={t('profile.emailPlaceholder')}
                            className={errors.email ? 'border-red-500' : ''}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3">{t('profile.passwordVerification')}</h4>
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">{t('profile.currentPassword')}</Label>
                          <div className="relative flex items-center">
                            <Input
                              id="currentPassword"
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={form.currentPassword}
                              onChange={(e) => setForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder={t('profile.currentPasswordPlaceholder')}
                              className={errors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 h-full px-3 hover:bg-transparent flex items-center justify-center"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {errors.currentPassword && (
                            <p className="text-sm text-red-500">{errors.currentPassword}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            {t('profile.passwordVerificationHelp')}
                          </p>
                        </div>
                      </div>

                      <Button type="submit" disabled={updating} className="w-full sm:w-auto">
                        <Save className="w-4 h-4 mr-2" />
                        {updating ? t('profile.updating') : t('profile.updateProfile')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.changePassword')}</CardTitle>
                    <CardDescription>
                      {t('profile.changePasswordDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="password-current">{t('profile.currentPassword')}</Label>
                        <div className="relative flex items-center">
                          <Input
                            id="password-current"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={form.currentPassword}
                            onChange={(e) => setForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            placeholder={t('profile.currentPasswordPlaceholder')}
                            className={errors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 h-full px-3 hover:bg-transparent flex items-center justify-center"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {errors.currentPassword && (
                          <p className="text-sm text-red-500">{errors.currentPassword}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
                          <div className="relative flex items-center">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? 'text' : 'password'}
                              value={form.newPassword}
                              onChange={(e) => setForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder={t('profile.newPasswordPlaceholder')}
                              className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 h-full px-3 hover:bg-transparent flex items-center justify-center"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {errors.newPassword && (
                            <p className="text-sm text-red-500">{errors.newPassword}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
                          <div className="relative flex items-center">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={form.confirmPassword}
                              onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder={t('profile.confirmPasswordPlaceholder')}
                              className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 h-full px-3 hover:bg-transparent flex items-center justify-center"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-gray-500 space-y-1">
                        <p>{t('profile.passwordRequirements')}</p>
                      </div>

                      <Button type="submit" disabled={updating} className="w-full sm:w-auto">
                        <Key className="w-4 h-4 mr-2" />
                        {updating ? t('profile.updating') : t('profile.updatePassword')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};