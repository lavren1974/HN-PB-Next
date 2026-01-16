export interface Story {
  id: number;
  title: string;
  by: string;
  time: number;
  url?: string;
  score: number;
  descendants?: number; // comment count
  type: string;
}

export interface PaginatedStories {
  stories: Story[];
  total: number;
}

export async function getLatestStories(page: number = 1, limit: number = 20): Promise<PaginatedStories> {
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

  try {
    const response = await fetch(
      `${pbUrl}/api/collections/news_feed/records?page=${page}&perPage=${limit}&sort=-postedAt`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      // If collection doesn't exist or other error, return empty
      console.error(`Failed to fetch stories from PocketBase: ${response.status} ${response.statusText}`);
      return { stories: [], total: 0 };
    }

    const data = await response.json();

    const stories: Story[] = data.items.map((item: any) => ({
      id: parseInt(item.storyId, 10) || 0,
      title: item.title,
      by: item.author,
      time: item.postedAt ? Math.floor(new Date(item.postedAt).getTime() / 1000) : 0,
      url: item.url,
      score: item.score,
      descendants: item.commentsCount,
      type: 'story'
    }));

    return {
      stories,
      total: data.totalItems,
    };
  } catch (error) {
    console.error('Error fetching HN stories from PB:', error);
    return { stories: [], total: 0 };
  }
}
