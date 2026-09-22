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
        if (data.success) {
          scrapedImage = data.imageUrl || null;
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
        if (ogTitleMatch && !scrapedTitle) scrapedTitle = ogTitleMatch[1];
        if (ogDescMatch && !scrapedDescription) scrapedDescription = ogDescMatch[1];
      } catch (e) {
        console.warn('[URLEnrichment] Local scrape attempt bypassed:', e);
      }
    }

    // Stage 3: Platform-aware title, description and tag generation
    const result = this.buildPlatformResult(
      cleanUrl, domain, detectedType,
      scrapedTitle, scrapedDescription, scrapedAuthor, scrapedImage,
      serverTags, input,
    );

    return result;
  }

  /**
   * Platform-aware post-processing: crafts titles, descriptions, and tags
   * tailored to each social platform's proxy response shape.
   */
  private static buildPlatformResult(
    url: string, domain: string, detectedType: MemoryType,
    rawTitle: string | null, rawDesc: string | null, author: string | null,
    image: string | null, serverTags: string[], originalInput: string,
  ): Omit<MemoryItem, 'id' | 'createdAt'> {
    const fallbackImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
    const desc = rawDesc || '';
    const title = rawTitle || '';
    const lowerDomain = domain.toLowerCase();

    let finalTitle = '';
    let finalContent = '';
    let finalTags: string[] = [];
    let finalType: MemoryType = detectedType;
    let aspectRatio = 1.1;

    // --- YouTube ---
    if (lowerDomain.includes('youtube.com') || lowerDomain.includes('youtu.be')) {
      // Proxy returns: description="Video by Author: Full Title", author, image
      const videoTitle = desc.replace(/^Video by [^:]+:\s*/i, '').trim() || title;
      finalTitle = this.tldr(videoTitle, 50);
      finalContent = videoTitle;
      finalType = 'video';
      aspectRatio = 1.35;
      finalTags = this.extractContentTags(videoTitle, domain);
      if (author) finalTags.unshift(author);
      finalTags.unshift('YouTube');

    // --- Twitter / X ---
    } else if (lowerDomain.includes('x.com') || lowerDomain.includes('twitter.com')) {
      const tweetText = desc || '';
      finalTitle = author
        ? `${author}: "${this.tldr(tweetText, 40)}"`
        : this.tldr(tweetText, 50);
      finalContent = tweetText;
      finalType = 'quote';
      aspectRatio = 0.95;
      finalTags = this.extractContentTags(tweetText, domain);
      if (author) finalTags.push(author);
      finalTags.unshift('X');

    // --- Medium ---
    } else if (lowerDomain.includes('medium.com')) {
      // Proxy often returns generic "Medium" title — try to extract from URL slug
      const slugTitle = this.titleFromSlug(url);
      const usableTitle = (title && title !== 'Medium' && !title.includes('PAGE NOT FOUND'))
        ? title : slugTitle;
      finalTitle = this.tldr(usableTitle || `Article from Medium`, 50);
      finalContent = (desc && !desc.includes('PAGE NOT FOUND')) ? desc : `Article shared from Medium.`;
      finalType = 'article';
      aspectRatio = 1.1;
      finalTags = this.extractContentTags(`${usableTitle} ${finalContent}`, domain);
      if (author) finalTags.push(author);
      finalTags.unshift('Medium');

    // --- Pinterest ---
    } else if (lowerDomain.includes('pinterest.com')) {
      // Proxy returns good description, but title is often generic "Take a look at this pin..."
      const pinDesc = desc || '';
      finalTitle = this.tldr(pinDesc, 45);
      finalContent = pinDesc;
      finalType = 'image';
      aspectRatio = 1.3;
      finalTags = this.extractContentTags(pinDesc, domain);
      finalTags.unshift('Pinterest');

    // --- Substack ---
    } else if (lowerDomain.includes('substack.com') || lowerDomain.includes('newsletter.')) {
      // Extract article name from URL slug since title is often just the newsletter name
      const slugTitle = this.titleFromSlug(url);
      const usableTitle = slugTitle || title;
      finalTitle = this.tldr(usableTitle || `Newsletter from Substack`, 50);
      finalContent = desc || `Substack article.`;
      finalType = 'article';
      aspectRatio = 1.1;
      finalTags = this.extractContentTags(`${usableTitle} ${desc}`, domain);
      if (author) finalTags.push(author);
      finalTags.unshift('Substack');

    // --- LinkedIn ---
    } else if (lowerDomain.includes('linkedin.com')) {
      const postDesc = desc || '';
      finalTitle = this.tldr(postDesc, 45) || 'LinkedIn Post';
      finalContent = postDesc;
      finalType = 'bookmark';
      aspectRatio = 1.1;
      finalTags = this.extractContentTags(postDesc, domain);
      if (author) finalTags.push(author);
      finalTags.unshift('LinkedIn');

    // --- Threads ---
    } else if (lowerDomain.includes('threads.net')) {
      // Extract handle from URL: threads.net/@handle/post/...
      const handleMatch = url.match(/threads\.net\/@([^/]+)/);
      const handle = handleMatch ? handleMatch[1] : null;
      finalTitle = handle ? `@${handle} on Threads` : 'Threads Post';
      finalContent = desc || '';
      finalType = 'bookmark';
      aspectRatio = 1.1;
      finalTags = ['Threads', 'Social'];
      if (handle) finalTags.push(handle);

    // --- TikTok ---
    } else if (lowerDomain.includes('tiktok.com')) {
      const handleMatch = url.match(/tiktok\.com\/@([^/]+)/);
      const handle = handleMatch ? handleMatch[1] : null;
      finalTitle = handle ? `@${handle} on TikTok` : '';
      finalContent = desc || '';
      finalType = 'video';
      aspectRatio = 1.4;
      finalTags = ['TikTok', 'Video'];
      if (handle) finalTags.push(handle);

    // --- Instagram (often blocked — fallback) ---
    } else if (lowerDomain.includes('instagram.com')) {
      const isReel = url.includes('/reel/');
      finalTitle = '';
      finalContent = desc || `Instagram ${isReel ? 'Reel' : 'Post'}`;
      finalType = isReel ? 'video' : 'image';
      aspectRatio = 1.4;
      finalTags = ['Instagram', isReel ? 'Reel' : 'Post'];

    // --- Facebook ---
    } else if (lowerDomain.includes('facebook.com') || lowerDomain.includes('fb.com')) {
      finalTitle = this.tldr(desc, 45) || 'Facebook Post';
      finalContent = desc || '';
      finalType = 'bookmark';
      aspectRatio = 1.1;
      finalTags = this.extractContentTags(desc || '', domain);
      finalTags.unshift('Facebook');

    // --- Generic website / blog ---
    } else {
      finalTitle = this.tldr(title || desc || '', 50) || `Post from ${domain}`;
      finalContent = desc || originalInput;
      finalType = image ? 'image' : 'bookmark';
      aspectRatio = 1.1;
      finalTags = this.extractContentTags(`${title} ${desc}`, domain);
    }

    // Dedupe and cap tags
    finalTags = [...new Set(finalTags.filter(t => t && t.length >= 2))].slice(0, 6);

    return {
      type: finalType,
      title: finalTitle,
      content: finalContent,
      imageUrl: image || fallbackImage,
      tags: finalTags.length > 0 ? finalTags : [this.capitalize(domain.split('.')[0]), 'Saved'],
      contextSpace: finalTags[0] || 'Saved',
      urlMetadata: {
        url,
        domain,
        author: author || undefined,
        siteName: domain,
        fullText: `${finalTitle}\n\n${finalContent}`,
      },
      aspectRatio,
    };
  }

  /**
   * Truncate text to a TLDR-style short title
   */
  private static tldr(text: string, maxLen: number): string {
    if (!text) return '';
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= maxLen) return clean;
    return clean.slice(0, maxLen).replace(/\s\S*$/, '') + '...';
  }

  /**
   * Extract a human-readable title from a URL slug
   * e.g. "/p/how-to-think-about-your-career-abf5cee520be" -> "How to Think About Your Career"
   */
  private static titleFromSlug(url: string): string {
    try {
      const path = new URL(url).pathname;
      // Find the most slug-like path segment (longest with hyphens)
      const segments = path.split('/').filter(s => s && s.includes('-'));
      if (segments.length === 0) return '';
      const slug = segments.reduce((a, b) => a.length > b.length ? a : b);
      // Remove trailing hash IDs (hex strings 8+ chars)
      const cleaned = slug.replace(/-[a-f0-9]{8,}$/i, '');
      return cleaned
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    } catch {
      return '';
    }
  }

  private static capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /**
   * Extract meaningful tags from content text via keyword analysis
   */
  private static extractContentTags(text: string, domain: string): string[] {
    const tags = new Set<string>();
    if (!text) return [];

    // Extract #hashtags
    const hashMatches = text.match(/#([\w\d_-]+)/g);
    if (hashMatches) {
      for (const h of hashMatches) {
        const t = h.replace('#', '').trim();
        if (t.length >= 2 && t.length <= 25) tags.add(this.capitalize(t));
      }
    }

    const lower = text.toLowerCase();

    // Topic keywords
    const topics: [string, string][] = [
      ['startup', 'Startup'], ['founder', 'Founder'], ['entrepreneur', 'Entrepreneurship'],
      ['design', 'Design'], ['product', 'Product'], ['engineer', 'Engineering'],
      ['ai ', 'AI'], ['artificial intelligence', 'AI'], ['machine learning', 'ML'],
      ['react', 'React'], ['javascript', 'JavaScript'], ['typescript', 'TypeScript'],
      ['mobile', 'Mobile'], ['ios', 'iOS'], ['android', 'Android'],
      ['pricing', 'Pricing'], ['paywall', 'Monetization'], ['subscription', 'Subscription'],
      ['revenuecat', 'RevenueCat'], ['saas', 'SaaS'],
      ['art', 'Art'], ['painting', 'Art'], ['illustration', 'Illustration'],
      ['photography', 'Photography'], ['portrait', 'Portrait'],
      ['music', 'Music'], ['recipe', 'Recipe'], ['fitness', 'Fitness'],
      ['fashion', 'Fashion'], ['travel', 'Travel'], ['food', 'Food'],
      ['crypto', 'Crypto'], ['blockchain', 'Web3'],
      ['marketing', 'Marketing'], ['growth', 'Growth'],
      ['open source', 'OpenSource'], ['tutorial', 'Tutorial'],
      ['career', 'Career'], ['hiring', 'Hiring'], ['interview', 'Interview'],
      ['education', 'Education'], ['school', 'Education'],
    ];

    for (const [keyword, tag] of topics) {
      if (lower.includes(keyword)) tags.add(tag);
    }

    return Array.from(tags).slice(0, 5);
  }
}
