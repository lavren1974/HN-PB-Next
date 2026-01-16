'use client';

import { useTranslation } from "@/app/i18n/client";
import { Github, Code, Database, Globe } from "lucide-react";

export function AboutClient({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, 'about');

  return (
    <div className="max-w-4xl mx-auto px-4 animate-in fade-in duration-500">
      <div className="space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            {t('about.title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('about.description')}
          </p>
        </div>

        {/* Mission Section */}
        <div className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold mb-4">
              {t('about.mission.title')}
            </h2>
            <p className="text-lg text-base-content/80 leading-relaxed">
              {t('about.mission.text')}
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {t('about.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-200">
              <div className="card-body flex flex-row items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="font-semibold text-lg">{t('about.features.list.1')}</span>
              </div>
            </div>
            {/* Feature 2: Favorites & Deferred */}
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-200">
              <div className="card-body flex flex-row items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-full text-secondary">
                  <Database className="w-6 h-6" />
                </div>
                <span className="font-semibold text-lg">{t('about.features.list.2')}</span>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-200">
              <div className="card-body flex flex-row items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-full text-accent">
                  <Code className="w-6 h-6" />
                </div>
                <span className="font-semibold text-lg">{t('about.features.list.3')}</span>
              </div>
            </div>
            {/* Feature 4 */}
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-200">
              <div className="card-body flex flex-row items-center gap-4">
                <div className="p-3 bg-success/10 rounded-full text-success">
                  <Github className="w-6 h-6" />
                </div>
                <span className="font-semibold text-lg">{t('about.features.list.4')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold mb-4">
              {t('about.support.title')}
            </h2>
            <p className="text-lg text-base-content/80 mb-4">
              {t('about.support.text')}
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-base-200 rounded-lg break-all">
                <span className="font-bold block sm:inline mr-2">{t('about.support.crypto.btc')}:</span>
                <span className="font-mono text-sm select-all">bc1q4ye0nvx4z4gpr5lv7dut3hyu96m6dcvcpqqnj7</span>
              </div>
              <div className="p-3 bg-base-200 rounded-lg break-all">
                <span className="font-bold block sm:inline mr-2">{t('about.support.crypto.xmr')}:</span>
                <span className="font-mono text-sm select-all">48aN8ABaA5fXdniA5gbRbeQYGg2mLaXUVVT8bZoS19uVbd6oC8GxRS83RzRkGwUuyTJu6Sb8gazLGBzgTJrwVuHcJFAv81e</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact/Source Section */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold mb-4">
            {t('about.contact.title')}
          </h2>
          <p className="text-base-content/80 mb-6 max-w-2xl mx-auto">
            {t('about.contact.text')}
          </p>
          <a
            href="https://github.com/lavren1974/HN-PB-Next"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline gap-2"
          >
            <Github className="w-5 h-5" />
            GitHub Repository
          </a>
        </div>
      </div>
    </div>
  );
}