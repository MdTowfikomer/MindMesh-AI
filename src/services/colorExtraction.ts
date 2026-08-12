import { DominantColor } from '../types/mindmesh';

export class ColorExtractionService {
  /**
   * Simulates extracting dominant color palette from an image URL or image data.
   * Returns human-readable color names and corresponding hex codes.
   */
  public static extractDominantColors(imageUrl?: string, titleText?: string): DominantColor[] {
    if (!imageUrl && !titleText) {
      return [{ name: 'monochrome', hex: '#6B7280' }];
    }

    const textLower = (titleText || imageUrl || '').toLowerCase();

    const colorPalettes: { key: string; colors: DominantColor[] }[] = [
      {
        key: 'blue',
        colors: [
          { name: 'blue', hex: '#3B82F6' },
          { name: 'indigo', hex: '#6366F1' },
          { name: 'ocean', hex: '#1E40AF' },
        ],
      },
      {
        key: 'purple',
        colors: [
          { name: 'purple', hex: '#8B5CF6' },
          { name: 'violet', hex: '#A855F7' },
          { name: 'warm tone', hex: '#D946EF' },
        ],
      },
      {
        key: 'green',
        colors: [
          { name: 'emerald', hex: '#10B981' },
          { name: 'green', hex: '#22C55E' },
          { name: 'teal', hex: '#14B8A6' },
        ],
      },
      {
        key: 'red',
        colors: [
          { name: 'red', hex: '#EF4444' },
          { name: 'warm tone', hex: '#F97316' },
          { name: 'crimson', hex: '#991B1B' },
        ],
      },
      {
        key: 'dark',
        colors: [
          { name: 'charcoal', hex: '#1F2937' },
          { name: 'black', hex: '#111827' },
          { name: 'monochrome', hex: '#4B5563' },
        ],
      },
    ];

    for (const p of colorPalettes) {
      if (textLower.includes(p.key)) {
        return p.colors;
      }
    }

    let hash = 0;
    for (let i = 0; i < textLower.length; i++) {
      hash = textLower.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorPalettes.length;
    return colorPalettes[index].colors;
  }
}
