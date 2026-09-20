import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { SerendipityConnection, MemoryItem } from '../types/mindmesh';

export class MarkdownExporterService {
  /**
   * Generates a deterministic filename: YYYY-MM-DD-[topic-slug].md
   */
  public static generateFilename(title: string): string {
    const isoDate = new Date().toISOString().slice(0, 10);
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 35);
    return `${isoDate}-${slug || 'thought'}.md`;
  }

  /**
   * Synthesizes a Markdown string for a Discovered Connection
   */
  public static formatConnectionMarkdown(
    conn: SerendipityConnection,
    sourceMem?: MemoryItem,
    targetMem?: MemoryItem
  ): string {
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let md = `# ${conn.title}\n\n`;
    md += `> **Context Space:** #${conn.contextSpace || 'Pattern'} | **Match Fit:** ${Math.round((conn.confidenceScore || 0.9) * 100)}%\n`;
    md += `> *Synthesized by MindMesh AI on ${dateStr}*\n\n`;

    md += `## 💡 Synthesized Opportunity\n`;
    md += `${conn.suggestedBuildIdea}\n\n`;

    if (conn.actionableGuidance) {
      md += `## 📝 Discovered Pattern & Guidance\n`;
      md += `${conn.actionableGuidance.paragraph1}\n\n`;
      if (conn.actionableGuidance.paragraph2) {
        md += `${conn.actionableGuidance.paragraph2}\n\n`;
      }
    }

    if (sourceMem || targetMem) {
      md += `## 🔗 Connected Thoughts\n`;
      if (sourceMem) md += `- **Source:** ${sourceMem.title} (${sourceMem.type})\n`;
      if (targetMem) md += `- **Target:** ${targetMem.title} (${targetMem.type})\n`;
      md += `\n`;
    }

    if (conn.explainabilityWhy && conn.explainabilityWhy.length > 0) {
      md += `## 🕸️ Graph Evidence\n`;
      conn.explainabilityWhy.forEach((reason) => {
        md += `- ${reason}\n`;
      });
      md += `\n`;
    }

    if (conn.nextActions && conn.nextActions.length > 0) {
      md += `## 🎯 Actionable Next Steps\n`;
      conn.nextActions.forEach((action) => {
        const isCompleted = (conn.completedNextActions || []).includes(action);
        md += `- [${isCompleted ? 'x' : ' '}] ${action}\n`;
      });
      md += `\n`;
    }

    md += `---\n*Generated with MindMesh AI — Edge Knowledge Graph Engine*\n`;
    return md;
  }

  /**
   * Shares a synthesized Markdown file via Native Share Sheet
   */
  public static async exportConnectionAsMarkdown(
    conn: SerendipityConnection,
    sourceMem?: MemoryItem,
    targetMem?: MemoryItem
  ): Promise<boolean> {
    try {
      const filename = this.generateFilename(conn.title);
      const content = this.formatConnectionMarkdown(conn, sourceMem, targetMem);
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/markdown',
          dialogTitle: `Export ${filename} to Obsidian / Notion`,
          UTI: 'net.daringfireball.markdown',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('[MarkdownExporter] Export error:', err);
      return false;
    }
  }
}
