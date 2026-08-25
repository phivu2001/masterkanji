import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KanjiMaster - Học Kanji N5 N4',
    short_name: 'KanjiMaster',
    description: 'Ứng dụng học, ôn tập SRS và thi thử Kanji N5-N4.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#ef4444',
    orientation: 'portrait-primary',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }],
  };
}
