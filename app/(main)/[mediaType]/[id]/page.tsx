import WatchViewWrapper from './WatchViewWrapper';
import { supabase, snakeToCamel } from '@/supabase';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { mediaType: string; id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = params;
  
  let slug = id;
  if (slug.endsWith('-sinhala-subtitles')) {
    slug = slug.replace('-sinhala-subtitles', '-sinhala-sub');
  } else if (slug.endsWith('-sinhala-sub')) {
    slug = slug.replace('-sinhala-sub', '-sinhala-subtitles');
  }

  // Fetch data
  let { data } = await supabase.from('media').select('*').eq('slug', id).limit(1);
  if (!data || data.length === 0) {
      const { data: altData } = await supabase.from('media').select('*').eq('slug', slug).limit(1);
      data = altData;
  }

  if (data && data.length > 0) {
    const item = snakeToCamel(data[0]);
    const title = item.seoTitle || `${item.title} (${item.year}) Sinhala Subtitles | MovieVibe`;
    const description = item.metaDescription || item.description?.substring(0, 160) || `Download & Watch ${item.title} with Sinhala Subtitles.`;
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
    title: 'Watch on MovieVibe',
  }
}

export default function Page({ params }: Props) {
    return <WatchViewWrapper />;
}
