"use client";
import WatchView from '@/views/WatchView';
import { useRouter } from 'next/navigation';

export default function WatchViewWrapper() {
    const router = useRouter();
    return <WatchView item={null} onBack={() => router.back()} />;
}
