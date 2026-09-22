import * as SQLite from 'expo-sqlite';
import { MemoryItem, SerendipityConnection, BuildPlan } from '../types/mindmesh';

const DB_NAME = 'mindmesh_local_v1.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const SQLiteDatabaseService = {
  async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!dbInstance) {
      dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    }
    return dbInstance;
  },

  async initDatabase(): Promise<void> {
    try {
      const db = await this.getDb();

      // Create Memories Table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS memories (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          imageUrl TEXT,
          ocrText TEXT,
          audioDuration TEXT,
          audioWaveform TEXT,
          tags TEXT NOT NULL,
          contextSpace TEXT NOT NULL,
          confidenceScore REAL,
          createdAt TEXT NOT NULL
        );
      `);

      // Create Connections Table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS connections (
          id TEXT PRIMARY KEY NOT NULL,
          sourceMemoryId TEXT,
          targetMemoryId TEXT,
          title TEXT NOT NULL,
          confidenceScore REAL NOT NULL,
          contextSpace TEXT NOT NULL,
          suggestedBuildIdea TEXT NOT NULL,
          explainabilityWhy TEXT NOT NULL,
          evidenceProof TEXT NOT NULL,
          actionableGuidance TEXT,
          nextActions TEXT,
          completedNextActions TEXT,
          isDeepDiveExpanded INTEGER DEFAULT 0
        );
      `);

      // Ensure migration columns exist for existing tables
      try {
        await db.execAsync('ALTER TABLE connections ADD COLUMN sourceMemoryId TEXT;');
      } catch (_) {}
      try {
        await db.execAsync('ALTER TABLE connections ADD COLUMN targetMemoryId TEXT;');
      } catch (_) {}

      // Migrate memories table — add columns missing from the original schema
      const memoryMigrations = [
        'ALTER TABLE memories ADD COLUMN urlMetadata TEXT;',
        'ALTER TABLE memories ADD COLUMN mediaUrl TEXT;',
        'ALTER TABLE memories ADD COLUMN fileSize TEXT;',
        'ALTER TABLE memories ADD COLUMN pageCount INTEGER;',
        'ALTER TABLE memories ADD COLUMN directory TEXT;',
        'ALTER TABLE memories ADD COLUMN personalNote TEXT;',
        'ALTER TABLE memories ADD COLUMN deletedAt TEXT;',
        'ALTER TABLE memories ADD COLUMN aspectRatio REAL;',
        'ALTER TABLE memories ADD COLUMN entities TEXT;',
        'ALTER TABLE memories ADD COLUMN isPinned INTEGER DEFAULT 0;',
        'ALTER TABLE memories ADD COLUMN invisibleTags TEXT;',
        'ALTER TABLE memories ADD COLUMN dominantColors TEXT;',
      ];
      for (const sql of memoryMigrations) {
        try { await db.execAsync(sql); } catch (_) {}
      }
      // Create Build Plans Table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS build_plans (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          subtitle TEXT NOT NULL,
          connectedMemoryIds TEXT NOT NULL,
          prd TEXT NOT NULL,
          techStackSchema TEXT NOT NULL,
          revenueCatStrategy TEXT NOT NULL,
          taskChecklist TEXT NOT NULL
        );
      `);

      // Create Settings Table (BYOK, custom keys, user preferences)
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);

      console.log('[SQLiteDatabaseService] Database tables initialized successfully.');
    } catch (error) {
      console.error('[SQLiteDatabaseService] Failed to initialize SQLite database:', error);
    }
  },

  async getSetting(key: string): Promise<string | null> {
    try {
      const db = await this.getDb();
      const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM settings WHERE key = ?',
        [key]
      );
      return row?.value || null;
    } catch (error) {
      console.error(`[SQLiteDatabaseService] Error reading setting ${key}:`, error);
      return null;
    }
  },

  async saveSetting(key: string, value: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    } catch (error) {
      console.error(`[SQLiteDatabaseService] Error saving setting ${key}:`, error);
    }
  },

  async deleteSetting(key: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.runAsync('DELETE FROM settings WHERE key = ?', [key]);
    } catch (error) {
      console.error(`[SQLiteDatabaseService] Error deleting setting ${key}:`, error);
    }
  },

  async saveMemory(memory: MemoryItem): Promise<void> {
    try {
      const db = await this.getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO memories (
          id, type, title, content, imageUrl, ocrText, audioDuration, audioWaveform,
          tags, contextSpace, confidenceScore, createdAt,
          urlMetadata, mediaUrl, fileSize, pageCount, directory, personalNote,
          deletedAt, aspectRatio, entities, isPinned, invisibleTags, dominantColors
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          memory.id,
          memory.type,
          memory.title,
          memory.content,
          memory.imageUrl || null,
          memory.ocrText || null,
          memory.audioDuration || null,
          JSON.stringify(memory.audioWaveform || []),
          JSON.stringify(memory.tags || []),
          memory.contextSpace,
          memory.confidenceScore ?? 0.95,
          memory.createdAt,
          memory.urlMetadata ? JSON.stringify(memory.urlMetadata) : null,
          memory.mediaUrl || null,
          memory.fileSize || null,
          memory.pageCount ?? null,
          memory.directory || null,
          memory.personalNote || null,
          memory.deletedAt || null,
          memory.aspectRatio ?? null,
          memory.entities ? JSON.stringify(memory.entities) : null,
          memory.isPinned ? 1 : 0,
          memory.invisibleTags ? JSON.stringify(memory.invisibleTags) : null,
          memory.dominantColors ? JSON.stringify(memory.dominantColors) : null,
        ]
      );
    } catch (error) {
      console.error('[SQLiteDatabaseService] Error saving memory:', error);
    }
  },

  async getAllMemories(): Promise<MemoryItem[]> {
    try {
      const db = await this.getDb();
      const rows = await db.getAllAsync<any>('SELECT * FROM memories ORDER BY createdAt DESC');
      return rows.map((row) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        content: row.content,
        imageUrl: row.imageUrl || undefined,
        ocrText: row.ocrText || undefined,
        audioDuration: row.audioDuration || undefined,
        audioWaveform: row.audioWaveform ? JSON.parse(row.audioWaveform) : undefined,
        tags: row.tags ? JSON.parse(row.tags) : [],
        contextSpace: row.contextSpace,
        confidenceScore: row.confidenceScore,
        createdAt: row.createdAt,
        urlMetadata: row.urlMetadata ? JSON.parse(row.urlMetadata) : undefined,
        mediaUrl: row.mediaUrl || undefined,
        fileSize: row.fileSize || undefined,
        pageCount: row.pageCount ?? undefined,
        directory: row.directory || undefined,
        personalNote: row.personalNote || undefined,
        deletedAt: row.deletedAt || undefined,
        aspectRatio: row.aspectRatio ?? undefined,
        entities: row.entities ? JSON.parse(row.entities) : undefined,
        isPinned: !!row.isPinned,
        invisibleTags: row.invisibleTags ? JSON.parse(row.invisibleTags) : undefined,
        dominantColors: row.dominantColors ? JSON.parse(row.dominantColors) : undefined,
      }));
    } catch (error) {
      console.error('[SQLiteDatabaseService] Error getting all memories:', error);
      return [];
    }
  },

  async deleteMemory(id: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.runAsync('DELETE FROM memories WHERE id = ?', [id]);
    } catch (error) {
      console.error('[SQLiteDatabaseService] Error deleting memory:', error);
    }
  },

  async saveBuildPlan(plan: BuildPlan): Promise<void> {
    try {
      const db = await this.getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO build_plans (
          id, title, subtitle, connectedMemoryIds, prd, techStackSchema, revenueCatStrategy, taskChecklist
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          plan.id,
          plan.title,
          plan.subtitle,
          JSON.stringify(plan.connectedMemoryIds),
          JSON.stringify(plan.prd),
          JSON.stringify(plan.techStackSchema),
          JSON.stringify(plan.revenueCatStrategy),
          JSON.stringify(plan.taskChecklist),
        ]
      );
    } catch (error) {
      console.error('[SQLiteDatabaseService] Error saving build plan:', error);
    }
  },

  async getLatestBuildPlan(): Promise<BuildPlan | null> {
    try {
      const db = await this.getDb();
      const rows = await db.getAllAsync<any>('SELECT * FROM build_plans LIMIT 1');
      if (rows.length === 0) return null;
      const row = rows[0];
      return {
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
        connectedMemoryIds: JSON.parse(row.connectedMemoryIds),
        prd: JSON.parse(row.prd),
        techStackSchema: JSON.parse(row.techStackSchema),
        revenueCatStrategy: JSON.parse(row.revenueCatStrategy),
        taskChecklist: JSON.parse(row.taskChecklist),
      };
    } catch (error) {
      console.error('[SQLiteDatabaseService] Error getting build plan:', error);
      return null;
    }
  },

  async saveConnection(connection: SerendipityConnection): Promise<void> {
    try {
      const db = await this.getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO connections (
          id, sourceMemoryId, targetMemoryId, title, confidenceScore, contextSpace,
          suggestedBuildIdea, explainabilityWhy, evidenceProof, actionableGuidance,
          nextActions, completedNextActions, isDeepDiveExpanded
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          connection.id,
          connection.sourceMemoryId,
          connection.targetMemoryId,
          connection.title,
          connection.confidenceScore,
          connection.contextSpace,
          connection.suggestedBuildIdea,
          JSON.stringify(connection.explainabilityWhy || []),
          JSON.stringify(connection.evidenceProof || {}),
          JSON.stringify(connection.actionableGuidance || {}),
          JSON.stringify(connection.nextActions || []),
          JSON.stringify(connection.completedNextActions || []),
          connection.isDeepDiveExpanded ? 1 : 0,
        ]
      );
    } catch (error) {
      console.error('[SQLiteDatabaseService] Error saving connection:', error);
    }
  },

  async getAllConnections(): Promise<SerendipityConnection[]> {
    try {
      const db = await this.getDb();
      const rows = await db.getAllAsync<any>('SELECT * FROM connections ORDER BY id DESC');
      return rows.map((row) => ({
        id: row.id,
        sourceMemoryId: row.sourceMemoryId || '',
        targetMemoryId: row.targetMemoryId || '',
        title: row.title,
        confidenceScore: row.confidenceScore,
        contextSpace: row.contextSpace,
        suggestedBuildIdea: row.suggestedBuildIdea,
        explainabilityWhy: row.explainabilityWhy ? JSON.parse(row.explainabilityWhy) : [],
        evidenceProof: row.evidenceProof ? JSON.parse(row.evidenceProof) : {
          sourceTitle: '',
          sourceDate: '',
          targetTitle: '',
          targetDate: '',
          quoteSnippet: '',
        },
        actionableGuidance: row.actionableGuidance ? JSON.parse(row.actionableGuidance) : undefined,
        nextActions: row.nextActions ? JSON.parse(row.nextActions) : [],
        completedNextActions: row.completedNextActions ? JSON.parse(row.completedNextActions) : [],
        isDeepDiveExpanded: !!row.isDeepDiveExpanded,
      }));
    } catch (error) {
      console.error('[SQLiteDatabaseService] Error getting all connections:', error);
      return [];
    }
  },

  async deleteConnection(id: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.runAsync('DELETE FROM connections WHERE id = ?', [id]);
    } catch (error) {
      console.error('[SQLiteDatabaseService] Error deleting connection:', error);
    }
  },
};
