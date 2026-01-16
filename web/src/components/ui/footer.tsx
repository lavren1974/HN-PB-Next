'use client'

import Link from 'next/link'
import { Github, Mail } from 'lucide-react'
import { useTranslation } from '@/app/i18n/client'
import { ClientWrapper } from './client-wrapper'

export function Footer({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, 'common')

  return (
    <ClientWrapper>
      <footer className="border-t mt-auto bg-base-100">
        <div className="mx-auto max-w-7xl py-12 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1 - About */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="text-xl font-bold tracking-tight mb-2 inline-block">
                HN-PB-Next
              </Link>
              <p className="text-sm text-base-content/80 max-w-sm">
                {t('homePage.subtitle')}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <a
                  href="https://github.com/lavren1974/HN-PB-Next"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm btn-circle"
                  aria-label="Github"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="mailto:lavren1974@gmail.com"
                  className="btn btn-ghost btn-sm btn-circle"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Column 2 - Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href={`/${lng}`} className="hover:text-primary transition-colors">
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lng}/hackernews`} className="hover:text-primary transition-colors">
                    {t('nav.hackernews')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lng}/favorites`} className="hover:text-primary transition-colors">
                    {t('favorites.title')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${lng}/about`} className="hover:text-primary transition-colors">
                    {t('nav.about')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Stack */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.resources')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://nextjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Next.js
                  </a>
                </li>
                <li>
                  <a
                    href="https://pocketbase.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    PocketBase
                  </a>
                </li>
                <li>
                  <a
                    href="https://tailwindcss.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Tailwind CSS
                  </a>
                </li>
                <li>
                  <a
                    href="https://daisyui.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    daisyUI
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-base-200 text-center text-sm text-base-content/60">
            <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </ClientWrapper>
  );
}