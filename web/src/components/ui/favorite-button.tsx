"use client";

import { useTransition, useOptimistic } from "react";
import { Star } from "lucide-react";
import { addToFavorites, removeFromFavorites } from "@/lib/actions/favorites";

interface FavoriteButtonProps {
    story: any; // Using any for simplicity with the HN story object
    isFavorited: boolean;
    userId?: string;
}

export function FavoriteButton({ story, isFavorited, userId }: FavoriteButtonProps) {
    const [isPending, startTransition] = useTransition();

    // Optimistic state: starts with isFavorited (server state), 
    // updates immediately to 'targetState' when addOptimistic is called.
    const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(
        isFavorited,
        (state, targetState: boolean) => targetState
    );

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId) {
            alert("Please login to add favorites");
            return;
        }

        // Calculate intended new state
        const newState = !optimisticFavorited;

        startTransition(async () => {
            // Updated UI immediately
            setOptimisticFavorited(newState);

            // Perform actual server action
            try {
                if (optimisticFavorited) {
                    await removeFromFavorites(story.id.toString());
                } else {
                    await addToFavorites(story);
                }
            } catch (err) {
                // If it fails, the revalidation won't happen, 
                // and React will eventually revert the optimistic state 
                // if we trigger a re-render or if the parent revalidates eventually.
                // For a robust implementation, usually we might handle error toast here.
                console.error("Failed to toggle favorite", err);
            }
        });
    };

    if (!userId) return null;

    return (
        <button
            onClick={handleToggle}
            // We do NOT disable the button during pending if we want it to feel "responsive",
            // BUT preventing spam clicks is good. 
            // Better to disable logic but keep visual "active".
            // Since we have isPending, let's just make it unclickable but look normal.
            disabled={isPending}
            className={`btn btn-ghost btn-circle btn-sm hover:bg-transparent ${isPending ? "cursor-not-allowed opacity-70" : ""}`}
            title={optimisticFavorited ? "Remove from favorites" : "Add to favorites"}
        >
            <Star
                className={`w-5 h-5 transition-colors duration-200 ${optimisticFavorited
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-base-content/30 hover:text-yellow-400"
                    }`}
            />
        </button>
    );
}
