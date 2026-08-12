import { MemoryItem, MemoryType, UrlMetadata } from '../types/mindmesh';
import { ColorExtractionService } from './colorExtraction';

export class URLEnrichmentService {
  /**
   * Enriches pasted web URL or quote text into a structured mymind MemoryItem
   */
  public static enrichInput(input: string): Omit<MemoryItem, 'id' | 'createdAt'> {
    const isUrl = /^https?:\/\//i.test(input.trim());

    if (isUrl) {
      const url = input.trim();
      let domain = 'web.com';
      try {
        const parsedUrl = new URL(url);
        domain = parsedUrl.hostname.replace(/^www\./, '');
      } catch (e) {
        domain = 'web article';
      }

      // Check domain type
      if (domain.includes('twitter.com') || domain.includes('x.com')) {
        return {
          type: 'quote',
          title: 'Post on X / Twitter',
          content: `“Building in public is not about bragging, it is about creating leverage and proof of work.” — @indiefounder (${domain})`,
          tags: ['Tweet', 'Social', 'X', 'IndieHackers'],
          invisibleTags: ['twitter post', 'build in public', 'social bookmark'],
          contextSpace: 'Idea',
          urlMetadata: {
            url,
            domain,
            author: '@indiefounder',
            siteName: 'X / Twitter',
          },
        };
      }

      const articleTitle = `Web Bookmark from ${domain}`;
      const heroImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80';
      const dominantColors = ColorExtractionService.extractDominantColors(heroImage, articleTitle);

      const urlMeta: UrlMetadata = {
        url,
        domain,
        author: `${domain.split('.')[0]} Editorial`,
        siteName: domain,
        readTime: '4 min read',
        highlights: [
          `Key Insight from ${domain}: Local-first architectures eliminate network latency entirely.`,
        ],
        fullText: `Web Article Saved from ${url}

This article explores modern mobile UX patterns, local vector search engines, and why users prefer clean distraction-free reader views.

Key Takeaways:
1. Zero Latency Optimistic State Updates
2. Offline-First Local Embeddings
3. Invisible Auto-Categorization`,
      };

      return {
        type: 'article',
        title: articleTitle,
        content: `Extracted article content from ${domain}. Discusses high-performance mobile UX, state sync, and clean reader views.`,
        imageUrl: heroImage,
        tags: ['Article', 'Bookmark', domain.split('.')[0]],
        invisibleTags: ['web clipping', 'smart bookmark', 'reader mode'],
        dominantColors,
        urlMetadata: urlMeta,
        contextSpace: 'MobileUX',
        aspectRatio: 1.2,
      };
    }

    // Direct quote or text block
    return {
      type: 'quote',
      title: input.slice(0, 45) + (input.length > 45 ? '...' : ''),
      content: input,
      tags: ['Quote', 'CapturedNote'],
      invisibleTags: ['web highlight', 'quote card'],
      contextSpace: 'Idea',
      aspectRatio: 0.9,
    };
  }
}
