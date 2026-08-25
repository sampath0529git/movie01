import fs from 'fs';
import path from 'path';

function createFile(file, content) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, content.trim() + '\n');
}

createFile('app/(main)/discover/page.tsx', `
"use client";
import DiscoverView from '@/views/DiscoverView';
import { useRouter } from 'next/navigation';
export default function Page() {
    const router = useRouter();
    return <DiscoverView onSelectMedia={(i: any) => router.push(\`/\${i.type.toLowerCase() === 'movie' ? 'movies' : 'tv'}/\${i.slug || i.id}\`)} customMedia={[]} isLoading={false} loadMore={() => {}} hasMore={false} />;
}
`);

createFile('app/(main)/movies/page.tsx', `
"use client";
import MoviesView from '@/views/MoviesView';
import { useRouter } from 'next/navigation';
export default function Page() {
    const router = useRouter();
    return <MoviesView onSelectMedia={(i: any) => router.push(\`/\${i.type.toLowerCase() === 'movie' ? 'movies' : 'tv'}/\${i.slug || i.id}\`)} customMedia={[]} isLoading={false} loadMore={() => {}} hasMore={false} />;
}
`);

createFile('app/(main)/tv-series/page.tsx', `
"use client";
import TvSeriesView from '@/views/TvSeriesView';
import { useRouter } from 'next/navigation';
export default function Page() {
    const router = useRouter();
    return <TvSeriesView onSelectMedia={(i: any) => router.push(\`/\${i.type.toLowerCase() === 'movie' ? 'movies' : 'tv'}/\${i.slug || i.id}\`)} customMedia={[]} isLoading={false} loadMore={() => {}} hasMore={false} />;
}
`);

createFile('app/(main)/watchlist/page.tsx', `
"use client";
import WatchlistView from '@/views/WatchlistView';
export default function Page() {
    return <WatchlistView />;
}
`);

createFile('app/(main)/admin/page.tsx', `
"use client";
import AdminView from '@/views/AdminView';
export default function Page() {
    return <AdminView />;
}
`);

createFile('app/(main)/collections/page.tsx', `
"use client";
import CollectionsView from '@/views/CollectionsView';
import { useRouter } from 'next/navigation';
export default function Page() {
    const router = useRouter();
    return <CollectionsView onSelectMedia={(i: any) => router.push(\`/\${i.type.toLowerCase() === 'movie' ? 'movies' : 'tv'}/\${i.slug || i.id}\`)} />;
}
`);

createFile('app/(main)/collections/[id]/page.tsx', `
"use client";
import CollectionDetailsView from '@/views/CollectionDetailsView';
import { useRouter } from 'next/navigation';
export default function Page() {
    const router = useRouter();
    return <CollectionDetailsView onSelectMedia={(i: any) => router.push(\`/\${i.type.toLowerCase() === 'movie' ? 'movies' : 'tv'}/\${i.slug || i.id}\`)} />;
}
`);

createFile('app/(main)/cast-collections/page.tsx', `
"use client";
import CastCollectionsView from '@/views/CastCollectionsView';
import { useRouter } from 'next/navigation';
export default function Page() {
    const router = useRouter();
    return <CastCollectionsView onSelectMedia={(i: any) => router.push(\`/\${i.type.toLowerCase() === 'movie' ? 'movies' : 'tv'}/\${i.slug || i.id}\`)} />;
}
`);

createFile('app/(main)/cast/[id]/page.tsx', `
"use client";
import CollectionDetailsView from '@/views/CollectionDetailsView';
import { useRouter } from 'next/navigation';
export default function Page() {
    const router = useRouter();
    return <CollectionDetailsView onSelectMedia={(i: any) => router.push(\`/\${i.type.toLowerCase() === 'movie' ? 'movies' : 'tv'}/\${i.slug || i.id}\`)} />;
}
`);
