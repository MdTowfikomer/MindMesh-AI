import { MemoryItem, MemoryType, UrlMetadata } from '../types/mindmesh';
import { API_CONFIG } from '../config/api';

export class URLEnrichmentService {
  private static get ENRICH_URL_ENDPOINT(): string {
    return `${API_CONFIG.PROXY_BASE_URL}${API_CONFIG.ENRICH_URL_ENDPOINT}`;
  }

  /**
   * Helper to extract clean URL from shared text blurbs (e.g. "Check out this Instagram post https://instagram.com/p/...")
   */
  public static extractUrl(input: string): string {
    const urlMatch = input.match(/(https?:\/\/[^\s]+)/i);
    if (urlMatch) {
      let rawUrl = urlMatch[1].replace(/[\,\.\"\')]+$/, '').trim();
      // Clean tracking parameters from Instagram/YouTube shares
      try {
        const u = new URL(rawUrl);
        if (u.hostname.includes('instagram.com') || u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
          u.searchParams.delete('igsi');
          u.searchParams.delete('utm_source');
          u.searchParams.delete('utm_medium');
          u.searchParams.delete('utm_campaign');
          u.searchParams.delete('feature');
          rawUrl = u.toString();
        }
      } catch {}
      return rawUrl;
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
      } catch {
        domain = 'web link';
      }

      const isVideo = cleanUrl.includes('/reel/') || cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be') || cleanUrl.includes('tiktok.com');

      return {
        type: isVideo ? 'video' : 'image',
        title: `Visual Content from ${domain}`,
        content: `Captured post and visual media from ${domain}.`,
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        tags: [domain.includes('instagram') ? 'Instagram Reel' : 'Social', 'VisualCard', domain.split('.')[0]],
        contextSpace: 'Idea',
        urlMetadata: {
          url: cleanUrl,
          domain,
          siteName: domain,
        },
        aspectRatio: isVideo ? 1.4 : 1.1,
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
   * Async Multi-Stage Metadata & Image Scraper Engine
   * Handles Instagram Reels/Posts, YouTube, TikTok, Twitter/X, and Web links.
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
    } catch {
      domain = 'web link';
    }

    let scrapedImage: string | null = null;
    let scrapedTitle: string | null = null;
    let scrapedDescription: string | null = null;
    let scrapedAuthor: string | null = null;
    let detectedType: MemoryType = cleanUrl.includes('/reel/') || cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be') || cleanUrl.includes('tiktok.com') ? 'video' : 'image';

    let serverTags: string[] = [];

    // Stage 1: Call Backend Scraper Proxy (Equipped with Headless Microlink, YouTube oEmbed, OpenGraph, and LLM Tagging)
    try {
      const res = await fetch(this.ENRICH_URL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-key': API_CONFIG.APP_SECRET || 'SHIPATHON',
        },
        body: JSON.stringify({ url: cleanUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.imageUrl) {
          scrapedImage = data.imageUrl;
          scrapedTitle = data.title || '';
          scrapedDescription = data.description;
          scrapedAuthor = data.author;
          if (Array.isArray(data.tags) && data.tags.length > 0) {
            serverTags = data.tags;
          }
          if (data.mediaType === 'video') {
            detectedType = 'video';
          }
        }
      }
    } catch (e) {
      console.warn('[URLEnrichment] Server proxy enrichment error:', e);
    }

    // Stage 2: Local OpenGraph Fallback if proxy was offline or returned empty
    if (!scrapedImage) {
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
        console.warn('[URLEnrichment] Local scrape attempt bypassed:', e);
      }
    }

    // For videos/reels: user specified "no need for title.!"
    let finalTitle = detectedType === 'video' ? '' : (scrapedTitle || `Visual Card from ${domain}`);
    const finalDescription = scrapedDescription || input;
    const finalImage = scrapedImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

    // Combine server LLM tags with fallback tags
    const fallbackTags = this.generateMindTags(`${finalTitle} ${finalDescription} ${domain}`, domain);
    const finalTags = serverTags.length > 0 ? serverTags : fallbackTags;

    return {
      type: detectedType,
      title: finalTitle,
      content: finalDescription,
      imageUrl: finalImage,
      tags: finalTags,
      contextSpace: finalTags[0] || (detectedType === 'video' ? 'Video' : 'Visual'),
      urlMetadata: {
        url: cleanUrl,
        domain,
        author: scrapedAuthor || undefined,
        siteName: domain,
        fullText: `${finalTitle}\n\n${finalDescription}`,
      },
      aspectRatio: domain.includes('instagram.com') ? 1.4 : (detectedType === 'video' ? 1.35 : 1.1),
    };
  }

  /**
   * Generates specific Mind Tags based on hashtags and topic analysis
   */
  private static generateMindTags(text: string, domain: string): string[] {
    const tags = new Set<string>();

    // 1. Extract explicit #hashtags from Instagram/social caption
    const hashMatches = text.match(/#([\w\d_-]+)/g);
    if (hashMatches) {
      for (const h of hashMatches) {
        const cleanTag = h.replace('#', '').trim();
        if (cleanTag.length >= 2 && cleanTag.length <= 25) {
          tags.add(cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1));
        }
      }
    }

    // 2. Keyword Topic Taxonomy
    const lower = text.toLowerCase();
    if (lower.includes('instagram')) tags.add('Instagram');
    if (lower.includes('reel')) tags.add('Reel');
    if (lower.includes('youtube') || lower.includes('video')) tags.add('Video');
    if (lower.includes('knight') || lower.includes('armor') || lower.includes('warrior')) tags.add('Fantasy Warrior');
    if (lower.includes('art') || lower.includes('render') || lower.includes('3d')) tags.add('Digital Art');
    if (lower.includes('concept') || lower.includes('design')) tags.add('Design');
    if (lower.includes('school') || lower.includes('education')) tags.add('Education');
    if (lower.includes('pricing') || lower.includes('paywall')) tags.add('Pricing');
    if (lower.includes('revenuecat') || lower.includes('subscription')) tags.add('RevenueCat');

    if (tags.size === 0) {
      const baseDomain = domain.split('.')[0];
      tags.add(baseDomain.charAt(0).toUpperCase() + baseDomain.slice(1));
      tags.add('VisualCard');
    }

    return Array.from(tags).slice(0, 6);
  }
}
