import WatchViewWrapper from './WatchViewWrapper';
import { supabase, snakeToCamel } from '@/supabase';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ mediaType: string; id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  
  let slug = id;
  if (slug.endsWith('-watch-online')) {
    slug = slug.replace('-watch-online', '-watch-free');
  } else if (slug.endsWith('-watch-free')) {
    slug = slug.replace('-watch-free', '-watch-online');
  }

  // Fetch data
  let { data } = await supabase.from('media').select('*').eq('slug', id).limit(1);
  if (!data || data.length === 0) {
      const { data: altData } = await supabase.from('media').select('*').eq('slug', slug).limit(1);
      data = altData;
  }

  if (data && data.length > 0) {
    const item = snakeToCamel(data[0]);
    const title = item.seoTitle || `${item.title} (${item.year}) | MovieZen`;
    const description = item.metaDescription || item.description?.substring(0, 160) || `Download & Watch ${item.title} .`;
    const image = item.bannerUrl || item.imageUrl;

    return {
      title,
      description,
      keywords: item.keywords,
      openGraph: {
        title,
        description,
        images: image ? [image] : [],
        type: item.type === 'MOVIE' ? 'video.movie' : 'video.tv_show',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : [],
      }
    }
  }

  return {
    title: 'Watch on MovieZen',
  }
}

export default function Page({ params }: Props) {
    return <WatchViewWrapper />;
}
