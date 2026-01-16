'use server';

import { createServerClient } from "@/lib/pocketbase/server";
import { revalidatePath } from "next/cache";

export async function addToFavorites(story: any) {
    const client = await createServerClient();
    const user = client.authStore.record;

    if (!user) {
        return { error: 'Unauthorized' };
    }

    try {
        // Check if already exists to avoid errors (although database constraint handles it)
        // We can just try create and catch error
        await client.collection('favorites').create({
            user: user.id,
            storyId: story.id.toString(),
            title: story.title,
            url: story.url,
            author: story.by,
            score: story.score,
            commentsCount: story.descendants,
            postedAt: new Date(story.time * 1000).toISOString(),
        });

        revalidatePath('/[lng]/hackernews', 'page');
        revalidatePath('/[lng]/favorites', 'page');

        return { success: true };
    } catch (error: any) {
        // If uniqueness constraint violation, it's already favorited, so act like success or specific error
        if (error?.status === 400) { // Constraint violation usually 400
            return { error: 'Already in favorites' };
        }
        console.error('Error adding to favorites:', error);
        return { error: 'Failed to add favorite' };
    }
}

export async function removeFromFavorites(storyId: string) {
    const client = await createServerClient();
    const user = client.authStore.record;

    if (!user) return { error: 'Unauthorized' };

    try {
        // We need to find the record ID in 'favorites' first (because storyId != recordId)
        // Or we expect the UI to pass the favorite record ID?
        // It is safer to find by storyId for the current user to be robust
        const record = await client.collection('favorites').getFirstListItem(`user="${user.id}" && storyId="${storyId}"`);

        await client.collection('favorites').delete(record.id);

        revalidatePath('/[lng]/hackernews', 'page');
        revalidatePath('/[lng]/favorites', 'page');

        return { success: true };
    } catch (error) {
        console.error('Error removing favorite:', error);
        return { error: 'Failed to remove favorite' };
    }
}

export async function getFavoritesMap(storyIds: number[]) {
    const client = await createServerClient();
    const user = client.authStore.record;

    if (!user || storyIds.length === 0) return {};

    try {
        // Build a filter string
        const filterStr = storyIds.map(id => `storyId="${id}"`).join('||');
        // Wrap in user check
        const fullFilter = `user="${user.id}" && (${filterStr})`;

        const records = await client.collection('favorites').getList(1, 100, {
            filter: fullFilter,
            fields: 'storyId,id', // return storyId and the record ID
        });

        // Return a map: storyId -> true (or recordId)
        const map: Record<string, boolean> = {};
        records.items.forEach(r => {
            map[r.storyId] = true;
        });
        return map;

    } catch (error) {
        console.error("Failed to fetch favorites map", error);
        return {};
    }
}
