
import { createServerClient } from "@/lib/pocketbase/server";
import { ArrowRight, Newspaper, Star, Zap, Database, Lock, Clock } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "../i18n";

export default async function Home({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;
  const { t } = await useTranslation(lng, 'common');

  const client = await createServerClient();
  const user = client.authStore.record;

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="relative isolate pt-14 text-center">
        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-base-content sm:text-6xl mb-6">
                {t('homePage.title')}
              </h1>
              <p className="text-lg leading-8 text-base-content/70 mb-8">
                {t('homePage.subtitle')}
              </p>

              {user ? (
                <p className="text-xl font-medium text-primary mb-8">
                  {t('homePage.loggedInAs', { email: user.email })}
                </p>
              ) : null}

              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href={`/${lng}/hackernews`}
                  className="btn btn-primary btn-lg group"
                >
                  {t('homePage.cta')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                {!user && (
                  <Link href={`/${lng}/login`} className="btn btn-ghost btn-lg">
                    {t('nav.login')} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Feature 1: Live Stories */}
          <div className="card bg-base-200 shadow-sm hover:shadow-lg transition-all duration-300 border border-base-300">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <Newspaper className="h-8 w-8" />
                <h3 className="card-title text-xl">{t('homePage.features.feed.title')}</h3>
              </div>
              <p className="text-base-content/70">
                {t('homePage.features.feed.description')}
              </p>
            </div>
          </div>

          {/* Feature 2: Favorites */}
          <div className="card bg-base-200 shadow-sm hover:shadow-lg transition-all duration-300 border border-base-300">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4 text-warning">
                <Star className="h-8 w-8" />
                <h3 className="card-title text-xl">{t('homePage.features.favorites.title')}</h3>
              </div>
              <p className="text-base-content/70">
                {t('homePage.features.favorites.description')}
              </p>
            </div>
          </div>

          {/* Feature 3: Deferred */}
          <div className="card bg-base-200 shadow-sm hover:shadow-lg transition-all duration-300 border border-base-300">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4 text-secondary">
                <Clock className="h-8 w-8" />
                <h3 className="card-title text-xl">{t('homePage.features.deferred.title')}</h3>
              </div>
              <p className="text-base-content/70">
                {t('homePage.features.deferred.description')}
              </p>
            </div>
          </div>

          {/* Feature 4: Modern Tech */}
          <div className="card bg-base-200 shadow-sm hover:shadow-lg transition-all duration-300 border border-base-300">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4 text-info">
                <Zap className="h-8 w-8" />
                <h3 className="card-title text-xl">{t('homePage.features.tech.title')}</h3>
              </div>
              <p className="text-base-content/70">
                {t('homePage.features.tech.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Footer Badge/Info */}
      <div className="text-center pb-12 opacity-50">
        <div className="flex justify-center gap-6 text-sm">
          <span className="flex items-center gap-1"><Database className="w-4 h-4" /> PocketBase</span>
          <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> Next.js 16</span>
          <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> Secure</span>
        </div>
      </div>

    </div>
  );
}