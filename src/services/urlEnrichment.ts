import { MemoryItem, MemoryType, UrlMetadata } from '../types/mindmesh';

export class URLEnrichmentService {
  private static readonly BACKEND_ENRICH_URL = 'https://mindmesh-api.vercel.app/api/v1/enrich-url';

  /**
   * Helper to extract clean URL from shared text blurbs (e.g. "Check out this Instagram post https://instagram.com/p/...")
   */
  public static extractUrl(input: string): string {
    const urlMatch = input.match(/(https?:\/\/[^\s]+)/i);
    if (urlMatch) {
      return urlMatch[1].replace(/[\,\.\"\')]+$/, '').trim();
    }
    return input.trim();
  }

  /**
   * Synchronous quick fallback enrichment
   */
  public static enrichInput(input: string): Omit<MemoryItem, 'id' | 'createdAt'> {
    const cleanUrl = this.extractUrl(input);
    const isUrl = /^https?:\/\//i.test(cleanUrl);

    if (isUrl) {
      let domain = 'web.com';
      try {
        const parsedUrl = new URL(cleanUrl);
        domain = parsedUrl.hostname.replace(/^www\./, '');
      } catch (e) {
        domain = 'web link';
      }

      return {
        type: 'image',
        title: `Visual Content from ${domain}`,
        content: `Captured post and visual media from ${domain}.`,
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        tags: ['Social', 'VisualCard', domain.split('.')[0]],
        contextSpace: 'Idea',
        urlMetadata: {
          url: cleanUrl,
          domain,
          siteName: domain,
        },
        aspectRatio: 1.1,
      };
    }

    return {
      type: 'quote',
      title: input.slice(0, 45) + (input.length > 45 ? '...' : ''),
      content: input,
      tags: ['Quote', 'CapturedNote'],
      contextSpace: 'Idea',
      aspectRatio: 0.9,
    };
  }

  /**
   * Async 2-Stage Metadata & Image Scraper Engine (Local OpenGraph + Server Proxy Fallback)
   * Handles Instagram, LinkedIn, Twitter/X, and Web post URLs shared from any app.
   */
  public static async enrichUrlAsync(input: string): Promise<Omit<MemoryItem, 'id' | 'createdAt'>> {
    const cleanUrl = this.extractUrl(input);
    const isUrl = /^https?:\/\//i.test(cleanUrl);

    if (!isUrl) {
      return this.enrichInput(input);
    }

    let domain = 'web.com';
    try {
      const parsedUrl = new URL(cleanUrl);
      domain = parsedUrl.hostname.replace(/^www\./, '');
    } catch (e) {
      domain = 'web link';
    }

    let scrapedImage: string | null = null;
    let scrapedTitle: string | null = null;
    let scrapedDescription: string | null = null;

    // Stage 1: Quick Local OpenGraph Fetch Attempt
    try {
      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      const html = await response.text();

      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);

      if (ogImageMatch) scrapedImage = ogImageMatch[1];
      if (ogTitleMatch) scrapedTitle = ogTitleMatch[1];
      if (ogDescMatch) scrapedDescription = ogDescMatch[1];
    } catch (e) {
      console.log('[URLEnrichment] Local scrape attempt bypassed:', e);
    }

    // Stage 2: Server Enrichment Proxy Fallback (If local scrape incomplete)
    if (!scrapedImage || !scrapedDescription) {
      try {
        const res = await fetch(this.BACKEND_ENRICH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanUrl }),
        });
        const data = await res.json();
        if (data.success) {
          if (data.imageUrl) scrapedImage = data.imageUrl;
          if (data.title) scrapedTitle = data.title;
          if (data.description) scrapedDescription = data.description;
        }
      } catch (e) {
        console.log('[URLEnrichment] Server proxy enrichment error:', e);
      }
    }

    // Generate intelligent Mind Tags from text content
    const fullText = `${scrapedTitle || ''} ${scrapedDescription || ''} ${domain}`;
    const generatedTags = this.generateMindTags(fullText, domain);

    const finalTitle = scrapedTitle || `Visual Card from ${domain}`;
    const finalDescription = scrapedDescription || input;
    const finalImage = scrapedImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

    return {
      type: 'image',
      title: finalTitle,
      content: finalDescription,
      imageUrl: finalImage,
      tags: generatedTags,
      contextSpace: generatedTags[0] || 'Idea',
      urlMetadata: {
        url: cleanUrl,
        domain,
        siteName: domain,
        fullText: `${finalTitle}\n\n${finalDescription}`,
      },
      aspectRatio: 1.1,
    };
  }

  /**
   * Generates specific Mind Tags based on topic analysis
   */
  private static generateMindTags(text: string, domain: string): string[] {
    const lower = text.toLowerCase();
    const tags = new Set<string>();

    if (lower.includes('knight') || lower.includes('armor') || lower.includes('warrior')) tags.add('fantasy warrior');
    if (lower.includes('art') || lower.includes('render') || lower.includes('3d')) tags.add('digital art');
    if (lower.includes('dark') || lower.includes('hood') || lower.includes('souls')) tags.add('dark souls');
    if (lower.includes('concept') || lower.includes('design')) tags.add('concept art');
    if (lower.includes('character')) tags.add('character design');
    if (lower.includes('render')) tags.add('3D render');
    if (lower.includes('pricing') || lower.includes('paywall')) tags.add('Pricing');
    if (lower.includes('revenuecat') || lower.includes('subscription')) tags.add('RevenueCat');

    if (tags.size === 0) {
      tags.add(domain.split('.')[0]);
      tags.add('VisualCard');
      tags.add('Design');
    }

    return Array.from(tags).slice(0, 6);
  }
}
