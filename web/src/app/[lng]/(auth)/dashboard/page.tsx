import { createServerClient } from "@/lib/pocketbase/server";
import { DashboardClient } from "./page-client";
import { Settings } from "lucide-react";
import { useTranslation } from "../../../i18n";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ lng: string; }>;
}) {
  const { lng } = await params;
  const { t } = await useTranslation(lng, 'common');
  const client = await createServerClient();

  // Check if user is authenticated before proceeding
  if (!client.authStore.isValid || !client.authStore.model?.id) {
    return (
      <div className="space-y-8">
        <div className="alert alert-error">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-bold">{t('dashboard.authRequired')}</h3>
            <div className="text-xs">{t('dashboard.loginToAccess')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-base-content">{t('dashboard.title')}</h1>
        <button className="btn btn-primary" id="settings-button">
          <Settings className="h-4 w-4 mr-2" />
          {t('dashboard.settings')}
        </button>
      </div>

      {/* Main Content: Account Info */}
      <DashboardClient lng={lng} />
    </div>
  );
}