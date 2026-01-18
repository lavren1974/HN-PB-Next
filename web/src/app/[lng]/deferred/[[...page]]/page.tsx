import { createServerClient } from "@/lib/pocketbase/server";
import { DeferredButton } from "@/components/ui/deferred-button";
import { ExternalLink, Clock, User, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { redirect } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { getFavoritesMap } from "@/lib/actions/favorites";
import Link from "next/link";

// function formatTime removed as we use formatDateTime from utils

export default async function DeferredPage({
    params,
}: {
    params: Promise<{ lng: string; page?: string[] }>;
}) {
    const { lng, page } = await params;
    const { t } = await useTranslation(lng, 'common');
    const client = await createServerClient();
    const user = client.authStore.record;

    if (!user) {
        redirect(`/${lng}/login`);
    }

    const pageParam = page?.[0];
    const parsedPage = pageParam ? parseInt(pageParam, 10) : 1;
    const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    const limit = 30;

    // Fetch deferred posts with pagination
    const result = await client.collection('deferred').getList(currentPage, limit, {
        sort: '-created',
        filter: `user="${user.id}"`,
        // We get totalItems from the result
    });

    const deferredPosts = result.items;

    // Get favorites map to check which deferred posts are also favorited
    const favoritesMap = user ? await getFavoritesMap(deferredPosts.map(p => Number(p.storyId))) : {};

    const total = result.totalItems;
    const totalPages = result.totalPages;

    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, total);

    const hasPrevious = currentPage > 1;
    const hasNext = currentPage < totalPages;

    const getPageLink = (p: number) => {
        if (p === 1) return `/${lng}/deferred`;
        return `/${lng}/deferred/${p}`;
    };

    return (
        <div className="container mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    {t('deferred.title')}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {t('deferred.description')}
                </p>
            </div>

            <div className="grid gap-4">
                {deferredPosts.length === 0 ? (
                    <div className="alert alert-info">
                        <span>{t('deferred.empty')}</span>
                    </div>
                ) : (
                    deferredPosts.map((post, index) => {
                        const storyMock = {
                            id: Number(post.storyId),
                            title: post.title,
                            url: post.url,
                            by: post.author,
                            score: post.score,
                            descendants: post.commentsCount,
                            time: 0
                        };

                        return (
                            <div
                                key={post.id}
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
                                                        href={post.url || `https://news.ycombinator.com/item?id=${post.storyId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-primary transition-colors flex items-center gap-2"
                                                    >
                                                        {post.title}
                                                        {post.url && <ExternalLink className="h-4 w-4 opacity-50" />}
                                                    </a>
                                                </h2>
                                                <div className="flex items-center gap-1">
                                                    <FavoriteButton
                                                        story={storyMock}
                                                        isFavorited={!!favoritesMap[post.storyId]}
                                                        userId={user.id}
                                                    />
                                                    <DeferredButton
                                                        story={storyMock}
                                                        isDeferred={true}
                                                        userId={user.id}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    {post.author}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {formatDateTime(post.postedAt || post.created)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Pagination Controls */}
            {total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-base-200 rounded-lg shadow-sm border border-base-300 gap-4">
                    <div className="text-sm text-base-content/70">
                        {t('pagination.showing', { start, end, total })}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* First Page */}
                        <Link
                            href={getPageLink(1)}
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
                            href={getPageLink(currentPage - 1)}
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
                            href={getPageLink(currentPage + 1)}
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
                            href={getPageLink(totalPages)}
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
            )}
        </div>
    );
}
