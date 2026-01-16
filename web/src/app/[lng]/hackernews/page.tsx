import { formatDateTime } from "@/lib/utils";
import { getLatestStories } from "@/lib/hackernews";
import Link from "next/link";
import { ExternalLink, MessageCircle, Clock, User, ArrowUpCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTranslation } from "../../i18n";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { DeferredButton } from "@/components/ui/deferred-button";
import { getFavoritesMap } from "@/lib/actions/favorites";
import { getDeferredMap } from "@/lib/actions/deferred";
import { createServerClient } from "@/lib/pocketbase/server";

import { AutoRefresh } from "@/components/ui/auto-refresh";

// function formatTime removed as we use formatDateTime from utils

export default async function HackerNewsPage({
    params,
    searchParams,
}: {
    params: Promise<{ lng: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const { lng } = await params;
    const { page } = await searchParams;
    const { t } = await useTranslation(lng, 'common');

    const currentPage = Number(page) || 1;
    const limit = 30;

    const { stories, total } = await getLatestStories(currentPage, limit);

    const client = await createServerClient();
    const user = client.authStore.record;

    const favoritesMap = user ? await getFavoritesMap(stories.map(s => s.id)) : {};
    const deferredMap = user ? await getDeferredMap(stories.map(s => s.id)) : {};

    const totalPages = Math.ceil(total / limit);
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, total);

    const hasPrevious = currentPage > 1;
    const hasNext = currentPage < totalPages;

    return (

        <div className="container mx-auto space-y-8 animate-in fade-in duration-500">
            <AutoRefresh intervalMs={30000} />
            <div className="flex flex-col space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    {t('hackernewsPage.title')}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {t('hackernewsPage.description')}
                </p>
            </div>

            <div className="grid gap-4">
                {stories.map((story, index) => (
                    <div
                        key={story.id}
                        className="card bg-base-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] border border-base-300"
                    >
                        <div className="card-body p-4 sm:p-6">
                            <div className="flex items-start gap-4">
                                <div className="hidden sm:flex flex-col items-center justify-center w-12 text-center text-primary font-bold text-xl opacity-50">
                                    {start + index}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <h2 className="card-title text-xl font-semibold leading-tight">
                                            <a
                                                href={story.url || `https://news.ycombinator.com/item?id=${story.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-primary transition-colors flex items-center gap-2"
                                            >
                                                {story.title}
                                                {story.url && <ExternalLink className="h-4 w-4 opacity-50" />}
                                            </a>
                                        </h2>
                                        {user && (
                                            <div className="flex items-center gap-1">
                                                <FavoriteButton
                                                    story={story}
                                                    isFavorited={!!favoritesMap[story.id]}
                                                    userId={user.id}
                                                />
                                                <DeferredButton
                                                    story={story}
                                                    isDeferred={!!deferredMap[story.id]}
                                                    userId={user.id}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
                                        <span className="flex items-center gap-1">
                                            <ArrowUpCircle className="h-4 w-4" />
                                            {story.score} {t('story.points')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            {story.by}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {formatDateTime(story.time * 1000)}
                                        </span>
                                        <a
                                            href={`https://news.ycombinator.com/item?id=${story.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 hover:text-primary transition-colors hover:underline"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            {story.descendants || 0} {t('story.comments')}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {stories.length === 0 && (
                    <div className="alert alert-warning">
                        <span>{t('hackernewsPage.empty')}</span>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-base-200 rounded-lg shadow-sm border border-base-300 gap-4">
                <div className="text-sm text-base-content/70">
                    {t('pagination.showing', { start, end, total })}
                </div>

                <div className="flex items-center gap-2">
                    {/* First Page */}
                    <Link
                        href={`/${lng}/hackernews?page=1`}
                        className={`btn btn-sm ${currentPage === 1 ? 'btn-disabled opacity-50' : 'btn-outline'}`}
                        aria-disabled={currentPage === 1}
                        tabIndex={currentPage === 1 ? -1 : undefined}
                        title={t('pagination.first')}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('pagination.first')}</span>
                    </Link>

                    {/* Previous Page */}
                    <Link
                        href={`/${lng}/hackernews?page=${currentPage - 1}`}
                        className={`btn btn-sm ${!hasPrevious ? 'btn-disabled opacity-50' : 'btn-outline'}`}
                        aria-disabled={!hasPrevious}
                        tabIndex={!hasPrevious ? -1 : undefined}
                        title={t('pagination.previous')}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('pagination.previous')}</span>
                    </Link>

                    {/* Current Page Indicator */}
                    <div className="btn btn-sm btn-ghost no-animation cursor-default font-bold">
                        {currentPage}
                    </div>

                    {/* Next Page */}
                    <Link
                        href={`/${lng}/hackernews?page=${currentPage + 1}`}
                        className={`btn btn-sm ${!hasNext ? 'btn-disabled opacity-50' : 'btn-outline'}`}
                        aria-disabled={!hasNext}
                        tabIndex={!hasNext ? -1 : undefined}
                        title={t('pagination.next')}
                    >
                        <span className="hidden sm:inline">{t('pagination.next')}</span>
                        <ChevronRight className="h-4 w-4" />
                    </Link>

                    {/* Last Page */}
                    <Link
                        href={`/${lng}/hackernews?page=${totalPages}`}
                        className={`btn btn-sm ${currentPage === totalPages ? 'btn-disabled opacity-50' : 'btn-outline'}`}
                        aria-disabled={currentPage === totalPages}
                        tabIndex={currentPage === totalPages ? -1 : undefined}
                        title={t('pagination.last')}
                    >
                        <span className="hidden sm:inline">{t('pagination.last')}</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
