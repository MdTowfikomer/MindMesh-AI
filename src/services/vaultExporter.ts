import { Share, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useMemoryStore } from '../stores/memoryStore';
import { MemoryItem, SerendipityConnection } from '../types/mindmesh';

export class VaultExporterService {
  /**
   * Export all memories and graph connections as a complete JSON vault file
   */
  static async exportVaultJson(): Promise<boolean> {
    try {
      const state = useMemoryStore.getState();
      const vaultData = {
        exportedAt: new Date().toISOString(),
        appName: 'MindMesh AI',
        version: '1.0.0',
        stats: {
          totalMemories: state.memories.length,
          totalConnections: state.connections.length,
          totalSmartSpaces: state.savedSmartSpaces.length,
        },
        memories: state.memories,
        connections: state.connections,
        smartSpaces: state.savedSmartSpaces,
      };

      const jsonContent = JSON.stringify(vaultData, null, 2);
      const filename = `MindMesh_Vault_${new Date().toISOString().slice(0, 10)}.json`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Mind Vault Backup',
          UTI: 'public.json',
        });
      } else {
        await Share.share({
          title: 'MindMesh AI Vault Export',
          message: jsonContent,
        });
      }

      return true;
    } catch (error) {
      console.warn('exportVaultJson failed:', error);
      return false;
    }
  }

  /**
   * Export all memories as an Obsidian-compatible Markdown index note (.md)
   */
  static async exportVaultMarkdownIndex(): Promise<boolean> {
    try {
      const state = useMemoryStore.getState();
      let md = `# MindMesh AI Vault Backup\n`;
      md += `*Exported on ${new Date().toLocaleString()}*\n\n`;
      md += `Total Memories: ${state.memories.length} | Discovered Patterns: ${state.connections.length}\n\n`;
      md += `---\n\n`;

      md += `## 🧠 Mind Vault Items\n\n`;
      state.memories.forEach((mem, idx) => {
        md += `### ${idx + 1}. ${mem.title || 'Untitled Memory'}\n`;
        md += `- **Type**: ${mem.type}\n`;
        md += `- **Space**: #${mem.contextSpace || 'General'}\n`;
        md += `- **Tags**: ${mem.tags.map((t) => `#${t}`).join(' ')}\n`;
        md += `- **Saved**: ${new Date(mem.createdAt).toLocaleString()}\n`;
        if (mem.urlMetadata?.url) md += `- **Source URL**: ${mem.urlMetadata.url}\n`;
        if (mem.content) md += `\n> ${mem.content.replace(/\n/g, '\n> ')}\n`;
        if (mem.personalNote) md += `\n*Note*: ${mem.personalNote}\n`;
        md += `\n---\n\n`;
      });

      if (state.connections.length > 0) {
        md += `## ✨ Discovered Knowledge Patterns\n\n`;
        state.connections.forEach((conn, idx) => {
          md += `### Pattern ${idx + 1}: ${conn.title}\n`;
          md += `**Build Idea**: ${conn.suggestedBuildIdea}\n`;
          if (conn.actionableGuidance?.paragraph1) {
            md += `\n${conn.actionableGuidance.paragraph1}\n`;
          }
          md += `\n---\n\n`;
        });
      }

      const filename = `MindMesh_Vault_Index_${new Date().toISOString().slice(0, 10)}.md`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, md, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/markdown',
          dialogTitle: 'Export Obsidian Markdown Vault',
          UTI: 'net.daringfireball.markdown',
        });
      } else {
        await Share.share({
          title: 'MindMesh AI Markdown Index',
          message: md,
        });
      }

      return true;
    } catch (error) {
      console.warn('exportVaultMarkdownIndex failed:', error);
      return false;
    }
  }
}
