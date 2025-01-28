import React from 'react';
import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  className?: string;
}

export function Skeleton({
  count = 1,
  className,
  ...props
}: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
            className
          )}
          {...props}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-4 w-full" count={3} />
    </div>
  );
}

export function RepoSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[70%]" />
      </div>
    </div>
  );
}

export function FileTreeSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-6 w-[150px]" />
      <div className="ml-4 space-y-2">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[140px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  );
}
