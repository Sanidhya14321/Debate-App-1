"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Profile Header Skeleton
export function ProfileHeaderSkeleton() {
  return (
    <Card className="mb-8 bg-black/30 backdrop-blur-sm border-white/20">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-64" />
            <div className="flex items-center space-x-4 mt-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

// Stats Grid Skeleton
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6 text-center bg-black/30 backdrop-blur-sm border-white/20">
          <Skeleton className="h-8 w-8 mx-auto mb-2 rounded" />
          <Skeleton className="h-8 w-16 mx-auto mb-1" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </Card>
      ))}
    </div>
  );
}

// Debate List Skeleton
export function DebateListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center space-y-1">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Performance Metrics Skeleton
export function PerformanceMetricsSkeleton() {
  return (
    <Card className="p-6 bg-zinc-900/30 border-zinc-800/50">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <Skeleton className="w-24 h-24 mx-auto rounded-full" />
            <Skeleton className="h-4 w-16 mx-auto mt-2" />
          </div>
          <div className="text-center">
            <Skeleton className="w-24 h-24 mx-auto rounded-full" />
            <Skeleton className="h-4 w-16 mx-auto mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-zinc-800/30 rounded-lg p-3 text-center">
              <Skeleton className="h-6 w-8 mx-auto mb-1" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Analytics Card Skeleton
export function AnalyticsCardSkeleton() {
  return (
    <Card className="p-6 bg-zinc-900/30 border-zinc-800/50">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Form Skeleton
export function FormSkeleton() {
  return (
    <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/20">
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

// Page Header Skeleton
export function PageHeaderSkeleton() {
  return (
    <div className="text-center space-y-4 mb-8">
      <Skeleton className="h-12 w-64 mx-auto" />
      <Skeleton className="h-6 w-96 mx-auto" />
      <Skeleton className="h-8 w-32 mx-auto rounded-full" />
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-white/10">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Chat Message Skeleton
export function ChatMessageSkeleton() {
  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

// Tournament Card Skeleton
export function TournamentCardSkeleton() {
  return (
    <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/20">
      <CardContent className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}