"use client";

import { useUser, usePocketBase } from "@/components/pocketbase-provider";
import { deleteAccount, updateProfile } from "@/lib/actions/account";
import { useState, useEffect } from "react";
import { Trash2, AlertCircle, X, Save, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export function DashboardClient({ lng }: { lng: string }) {
  const user = useUser();
  const client = usePocketBase();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsErrors, setSettingsErrors] = useState<string[]>([]);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsWarning, setSettingsWarning] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useTranslation();

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  const handleConfirmDelete = async () => {
    try {
      const result = await deleteAccount();

      if (result.error) {
        setError(result.error);
      } else if (result.redirect) {
        router.push(`/${lng}${result.redirect}`);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(t('dashboard.errors.deleteUnexpected'));
    }
  };

  const handleSettingsSubmit = async (formData: FormData) => {
    setIsUpdatingProfile(true);
    setSettingsError(null);
    setSettingsErrors([]);
    setSettingsSuccess(false);
    setSettingsWarning(null);

    // Get form values
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;
    const currentPassword = formData.get("currentPassword") as string;

    // If password fields are empty, remove them from formData
    if (!password || password.trim().length === 0) {
      formData.delete("password");
    }
    if (!passwordConfirm || passwordConfirm.trim().length === 0) {
      formData.delete("passwordConfirm");
    }
    if (!currentPassword || currentPassword.trim().length === 0) {
      formData.delete("currentPassword");
    }



    try {
      const result = await updateProfile(formData);

      if (result.error) {
        setSettingsError(result.error);
      } else if (result.errors) {
        setSettingsErrors(result.errors);
      } else if (result.success) {
        // Handle warning if present
        if (result.warning) {
          setSettingsWarning(result.warning);
        }

        // Check if password was changed by looking at form data
        const passwordChanged = formData.has("password") && formData.get("password");

        if (passwordChanged) {
          // If password was changed, refresh auth state from cookies (updated by server)
          try {
            if (typeof window !== 'undefined') {
              client.authStore.loadFromCookie(document.cookie);
            }
          } catch (refreshError) {
            console.error('Failed to refresh client auth from cookies:', refreshError);
          }
        }

        setSettingsSuccess(true);
        setTimeout(() => {
          setShowSettings(false);
          setSettingsSuccess(false);
          setSettingsWarning(null);
        }, result.warning ? 4000 : 2000); // Show longer if there's a warning
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSettingsError(t('dashboard.settingsModal.unexpectedError'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle settings button click
  useEffect(() => {
    const handleSettingsClick = () => {
      setShowSettings(true);
      setSettingsError(null);
      setSettingsErrors([]);
      setSettingsSuccess(false);
      setSettingsWarning(null);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    };

    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
      settingsButton.addEventListener('click', handleSettingsClick);
    }

    return () => {
      if (settingsButton) {
        settingsButton.removeEventListener('click', handleSettingsClick);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title text-base-content">
            {t('dashboard.accountInfo.title')}
          </h2>
          <div className="space-y-3">
            {user?.name && (
              <p className="text-base-content/80">
                <span className="font-medium">{t('dashboard.accountInfo.name')}:</span> {user.name}
              </p>
            )}
            <p className="text-base-content/80">
              <span className="font-medium">{t('dashboard.accountInfo.email')}:</span> {user?.email}
            </p>
            <p className="text-base-content/80">
              <span className="font-medium">{t('dashboard.accountInfo.id')}:</span> {user?.id}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title text-error">
            {t('dashboard.dangerZone.title')}
          </h2>

          {error && (
            <div className="alert alert-error">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {!showConfirm ? (
            <button
              onClick={handleDeleteClick}
              className="btn btn-error btn-outline"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('dashboard.dangerZone.deleteButton')}
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-base-content/80">
                {t('dashboard.dangerZone.confirmMessage')}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleConfirmDelete}
                  className="btn btn-error"
                >
                  {t('dashboard.dangerZone.confirmDelete')}
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="btn btn-ghost"
                >
                  {t('dashboard.dangerZone.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('dashboard.settingsModal.title')}</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {settingsSuccess && (
              <div className="alert alert-success mb-4">
                <span>{t('dashboard.settingsModal.success')}</span>
              </div>
            )}

            {settingsWarning && (
              <div className="alert alert-warning mb-4">
                <AlertCircle className="h-5 w-5" />
                <span>{settingsWarning}</span>
              </div>
            )}

            {settingsError && (
              <div className="alert alert-error mb-4">
                <AlertCircle className="h-5 w-5" />
                <span>{settingsError}</span>
              </div>
            )}

            {settingsErrors.length > 0 && (
              <div className="alert alert-error mb-4">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <ul className="list-disc ml-4">
                    {settingsErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form action={handleSettingsSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-base-content/80 mb-1">
                  {t('dashboard.accountInfo.name')}
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  defaultValue={user?.name || ''}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="divider">{t('dashboard.settingsModal.changePassword')}</div>

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-base-content/80 mb-1">
                  {t('dashboard.settingsModal.currentPassword')}
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    placeholder={t('dashboard.settingsModal.currentPasswordPlaceholder')}
                    className="input input-bordered w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/60 hover:text-base-content"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-base-content/80 mb-1">
                  {t('dashboard.settingsModal.newPassword')}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showNewPassword ? "text" : "password"}
                    name="password"
                    placeholder={t('dashboard.settingsModal.newPasswordPlaceholder')}
                    className="input input-bordered w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/60 hover:text-base-content"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="passwordConfirm" className="block text-sm font-medium text-base-content/80 mb-1">
                  {t('dashboard.settingsModal.confirmNewPassword')}
                </label>
                <div className="relative">
                  <input
                    id="passwordConfirm"
                    type={showConfirmPassword ? "text" : "password"}
                    name="passwordConfirm"
                    placeholder={t('dashboard.settingsModal.confirmNewPasswordPlaceholder')}
                    className="input input-bordered w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/60 hover:text-base-content"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isUpdatingProfile ? t('dashboard.settingsModal.updating') : t('dashboard.settingsModal.update')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="btn btn-ghost"
                  disabled={isUpdatingProfile}
                >
                  {t('dashboard.settingsModal.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}