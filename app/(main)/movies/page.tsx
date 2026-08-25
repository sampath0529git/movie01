"use client";
import MoviesView from '@/views/MoviesView';
import { useRouter } from 'next/navigation';
import { useMediaData } from '@/firebase';

export default function Page() {
    const router = useRouter();
    const { data, loading, loadMore, hasMore } = useMediaData(1000);
    return <MoviesView onSelectMedia={(i: any) => router.push(`/${i.type.toLowerCase() === 'movie' ? 'movies' : 'tv'}/${i.slug || i.id}`)} customMedia={data} isLoading={loading} loadMore={loadMore} hasMore={hasMore} />;
}
