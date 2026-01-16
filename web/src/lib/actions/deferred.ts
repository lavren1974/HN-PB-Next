'use server';

import { createServerClient } from "@/lib/pocketbase/server";
import { revalidatePath } from "next/cache";

export async function addToDeferred(story: any) {
    const client = await createServerClient();
    const user = client.authStore.record;

    if (!user) {
        return { error: 'Unauthorized' };
    }

    try {
        await client.collection('deferred').create({
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
        revalidatePath('/[lng]/deferred', 'page');

        return { success: true };
    } catch (error: any) {
        if (error?.status === 400) {
            return { error: 'Already in deferred' };
        }
        console.error('Error adding to deferred:', error);
        return { error: 'Failed to add to deferred' };
    }
}

export async function removeFromDeferred(storyId: string) {
    const client = await createServerClient();
    const user = client.authStore.record;

    if (!user) return { error: 'Unauthorized' };

    try {
        const record = await client.collection('deferred').getFirstListItem(`user="${user.id}" && storyId="${storyId}"`);

        await client.collection('deferred').delete(record.id);

        revalidatePath('/[lng]/hackernews', 'page');
        revalidatePath('/[lng]/deferred', 'page');

        return { success: true };
    } catch (error) {
        console.error('Error removing deferred:', error);
        return { error: 'Failed to remove from deferred' };
    }
}

export async function getDeferredMap(storyIds: number[]) {
    const client = await createServerClient();
    const user = client.authStore.record;

    if (!user || storyIds.length === 0) return {};

    try {
        const filterStr = storyIds.map(id => `storyId="${id}"`).join('||');
        const fullFilter = `user="${user.id}" && (${filterStr})`;

        const records = await client.collection('deferred').getList(1, 100, {
            filter: fullFilter,
            fields: 'storyId,id',
        });

        const map: Record<string, boolean> = {};
        records.items.forEach(r => {
            map[r.storyId] = true;
        });
        return map;

    } catch (error) {
        console.error("Failed to fetch deferred map", error);
        return {};
    }
}
