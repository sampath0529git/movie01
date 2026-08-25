"use client";
import CollectionsView from '@/views/CollectionsView';
import { useRouter } from 'next/navigation';
export default function Page() {
    const router = useRouter();
    return <CollectionsView onSelectMedia={(i: any) => router.push(`/${i.type.toLowerCase() === 'movie' ? 'movies' : 'tv'}/${i.slug || i.id}`)} />;
}
