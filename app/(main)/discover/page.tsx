"use client";
import DiscoverView from '@/views/DiscoverView';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useMediaData } from '@/firebase';

function DiscoverContent() {
    const router = useRouter();
    const { data, loading, loadMore, hasMore } = useMediaData(1000);
    return <DiscoverView onSelectMedia={(i: any) => router.push(`/${i.type.toLowerCase() === 'movie' ? 'movies' : 'tv'}/${i.slug || i.id}`)} customMedia={data} isLoading={loading} loadMore={loadMore} hasMore={hasMore} />;
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DiscoverContent />
        </Suspense>
    );
}
