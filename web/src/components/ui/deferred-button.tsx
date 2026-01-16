"use client";

import { useTransition, useOptimistic } from "react";
import { Clock } from "lucide-react";
import { addToDeferred, removeFromDeferred } from "@/lib/actions/deferred";

interface DeferredButtonProps {
    story: any;
    isDeferred: boolean;
    userId?: string;
}

export function DeferredButton({ story, isDeferred, userId }: DeferredButtonProps) {
    const [isPending, startTransition] = useTransition();

    const [optimisticDeferred, setOptimisticDeferred] = useOptimistic(
        isDeferred,
        (state, targetState: boolean) => targetState
    );

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId) {
            alert("Please login to save for later");
            return;
        }

        const newState = !optimisticDeferred;

        startTransition(async () => {
            setOptimisticDeferred(newState);

            try {
                if (optimisticDeferred) {
                    await removeFromDeferred(story.id.toString());
                } else {
                    await addToDeferred(story);
                }
            } catch (err) {
                console.error("Failed to toggle deferred", err);
            }
        });
    };

    if (!userId) return null;

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`btn btn-ghost btn-circle btn-sm hover:bg-transparent ${isPending ? "cursor-not-allowed opacity-70" : ""}`}
            title={optimisticDeferred ? "Remove from deferred" : "Read later"}
        >
            <Clock
                className={`w-5 h-5 transition-colors duration-200 ${optimisticDeferred
                    ? "fill-blue-400 text-blue-400"
                    : "text-base-content/30 hover:text-blue-400"
                    }`}
            />
        </button>
    );
}
