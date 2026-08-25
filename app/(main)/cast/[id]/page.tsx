"use client";
import CollectionDetailsView from '@/views/CollectionDetailsView';
import { useRouter } from 'next/navigation';
export default function Page() {
    const router = useRouter();
    return <CollectionDetailsView onSelectMedia={(i: any) => router.push(`/${i.type.toLowerCase() === 'movie' ? 'movies' : 'tv'}/${i.slug || i.id}`)} />;
}
