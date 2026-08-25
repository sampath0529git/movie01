"use client";
import CastCollectionsView from '@/views/CastCollectionsView';
import { useRouter } from 'next/navigation';
export default function Page() {
    const router = useRouter();
    return <CastCollectionsView onSelectMedia={(i: any) => router.push(`/${i.type.toLowerCase() === 'movie' ? 'movies' : 'tv'}/${i.slug || i.id}`)} />;
}
