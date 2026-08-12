import { MemoryItem } from '../types/mindmesh';
import { EmbeddingsService } from './embeddings';

export interface ParsedSearchQuery {
  keywords: string[];
  excludedKeywords: string[];
  typeFilter?: string;
  siteFilter?: string;
  objectFilter?: string;
  textFilter?: string;
  colorFilter?: string;
  dateAfterFilter?: Date;
}

export class AdvancedSearchService {
  /**
   * Tokenizes and parses search syntax:
   * "shoes blue type:image site:twitter.com object:car text:pricing color:blue after:yesterday -red"
   */
  public static parseQuery(rawQuery: string): ParsedSearchQuery {
    const tokens = rawQuery.trim().split(/\s+/).filter(Boolean);

    const result: ParsedSearchQuery = {
      keywords: [],
      excludedKeywords: [],
    };

    for (const token of tokens) {
      if (token.startsWith('-') && token.length > 1) {
        result.excludedKeywords.push(token.slice(1).toLowerCase());
      } else if (token.startsWith('type:')) {
        result.typeFilter = token.slice(5).toLowerCase();
      } else if (token.startsWith('site:')) {
        result.siteFilter = token.slice(5).toLowerCase();
      } else if (token.startsWith('object:')) {
        result.objectFilter = token.slice(7).toLowerCase();
      } else if (token.startsWith('text:')) {
        result.textFilter = token.slice(5).toLowerCase();
      } else if (token.startsWith('color:')) {
        result.colorFilter = token.slice(6).toLowerCase();
      } else if (token.startsWith('after:')) {
        const dateStr = token.slice(6).toLowerCase();
        if (dateStr === 'yesterday') {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          result.dateAfterFilter = d;
        } else if (dateStr === 'lastweek') {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          result.dateAfterFilter = d;
        } else {
          const parsed = new Date(dateStr);
          if (!isNaN(parsed.getTime())) result.dateAfterFilter = parsed;
        }
      } else {
        result.keywords.push(token.toLowerCase());
      }
    }

    return result;
  }

  /**
   * Executes multi-stage search query matching over memories array.
   */
  public static filterMemories(memories: MemoryItem[], rawQuery: string): MemoryItem[] {
    const trimmed = rawQuery.trim();
    if (!trimmed) return memories;

    const parsed = this.parseQuery(trimmed);

    let results = memories.filter((item) => {
      // 1. Exclude search (-keyword)
      if (parsed.excludedKeywords.length > 0) {
        const fullText = `${item.title} ${item.content} ${item.tags.join(' ')} ${(item.invisibleTags || []).join(' ')}`.toLowerCase();
        for (const ex of parsed.excludedKeywords) {
          if (fullText.includes(ex)) return false;
        }
      }

      // 2. Type filter (type:article, type:video, type:pdf, etc.)
      if (parsed.typeFilter) {
        if (item.type.toLowerCase() !== parsed.typeFilter) return false;
      }

      // 3. Site filter (site:medium.com, site:twitter.com, site:paulgraham.com)
      if (parsed.siteFilter) {
        const domain = item.urlMetadata?.domain || '';
        const url = item.urlMetadata?.url || '';
        if (!domain.toLowerCase().includes(parsed.siteFilter) && !url.toLowerCase().includes(parsed.siteFilter)) {
          return false;
        }
      }

      // 4. Object filter (object:car, object:dog, etc.)
      if (parsed.objectFilter) {
        const tagsCombined = [...item.tags, ...(item.invisibleTags || [])].map((t) => t.toLowerCase());
        const contentCombined = `${item.title} ${item.content} ${item.ocrText || ''}`.toLowerCase();
        if (!tagsCombined.some((t) => t.includes(parsed.objectFilter!)) && !contentCombined.includes(parsed.objectFilter!)) {
          return false;
        }
      }

      // 5. Text in image OCR filter (text:pricing)
      if (parsed.textFilter) {
        const ocr = (item.ocrText || '').toLowerCase();
        if (!ocr.includes(parsed.textFilter)) return false;
      }

      // 6. Search by color (color:blue, warm tones, red, etc.)
      if (parsed.colorFilter) {
        const colors = item.dominantColors || [];
        const hasColor = colors.some(
          (c) => c.name.toLowerCase().includes(parsed.colorFilter!) || c.hex.toLowerCase().includes(parsed.colorFilter!)
        );
        if (!hasColor && !item.tags.some((t) => t.toLowerCase().includes(parsed.colorFilter!))) {
          return false;
        }
      }

      // 7. Date filter (after:yesterday, after:2026-08-01)
      if (parsed.dateAfterFilter) {
        const itemDate = new Date(item.createdAt);
        if (itemDate < parsed.dateAfterFilter) return false;
      }

      // 8. Multi-keyword chaining (all positive keywords must match across title, content, ocr, visible tags, or INVISIBLE tags)
      if (parsed.keywords.length > 0) {
        const fullIndexableText = [
          item.title,
          item.content,
          item.ocrText || '',
          ...item.tags,
          ...(item.invisibleTags || []),
          item.urlMetadata?.domain || '',
          item.urlMetadata?.author || '',
          item.urlMetadata?.fullText || '',
          ...(item.urlMetadata?.highlights || []),
        ]
          .join(' ')
          .toLowerCase();

        for (const kw of parsed.keywords) {
          if (!fullIndexableText.includes(kw)) {
            return false;
          }
        }
      }

      return true;
    });

    // 9. Semantic / Natural Language Vector Fallback if strict token filter yields 0 matches for plain queries
    if (results.length === 0 && parsed.keywords.length > 0 && !parsed.typeFilter && !parsed.siteFilter && !parsed.colorFilter) {
      const queryVec = EmbeddingsService.generateEmbedding(trimmed);
      results = memories
        .map((m) => {
          const itemVec = EmbeddingsService.generateEmbedding(`${m.title} ${m.content} ${m.tags.join(' ')}`);
          const sim = EmbeddingsService.calculateCosineSimilarity(queryVec, itemVec);
          return { item: m, sim };
        })
        .filter((pair) => pair.sim > 0.45)
        .sort((a, b) => b.sim - a.sim)
        .map((pair) => pair.item);
    }

    return results;
  }
}
