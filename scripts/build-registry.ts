import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { PluginEntry, RegistrySourceEntry, SearchEntry } from "../src/lib/types";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const registryPath = join(rootDir, "registry", "plugins.json");
const publicDir = join(rootDir, "public");
const pluginDetailsDir = join(publicDir, "plugins");

async function readRegistry(): Promise<Record<string, RegistrySourceEntry>> {
  const content = await readFile(registryPath, "utf-8");
  return JSON.parse(content) as Record<string, RegistrySourceEntry>;
}

function normalizeEntry(entry: RegistrySourceEntry): PluginEntry {
  return {
    ...entry,
    pinned: entry.pinned ?? false,
    warnings: [],
    updatedAt: entry.latest.publishedAt
  };
}

function shouldIncludeEntry(entry: RegistrySourceEntry): boolean {
  return process.env.INCLUDE_MOCK_PLUGINS === "true" || entry.mock !== true;
}

function toSearchEntry(entry: PluginEntry): SearchEntry {
  return {
    id: entry.id,
    name: entry.name,
    summary: entry.summary,
    author: entry.author.name,
    tags: entry.tags,
    risk: entry.risk
  };
}

function statusRank(status: PluginEntry["status"]): number {
  const ranks: Record<PluginEntry["status"], number> = {
    listed: 0,
    deprecated: 1,
    hidden: 2,
    suspended: 3,
    removed: 4
  };
  return ranks[status];
}

async function writeJson(path: string, data: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

async function main(): Promise<void> {
  const source = await readRegistry();
  const plugins = Object.values(source)
    .filter(shouldIncludeEntry)
    .map(normalizeEntry)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const statusDiff = statusRank(a.status) - statusRank(b.status);
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const searchIndex = plugins.map(toSearchEntry);

  await rm(pluginDetailsDir, { force: true, recursive: true });
  await mkdir(pluginDetailsDir, { recursive: true });
  await writeJson(join(publicDir, "plugins.json"), plugins);
  await writeJson(join(publicDir, "search-index.json"), searchIndex);

  for (const plugin of plugins) {
    await writeJson(join(pluginDetailsDir, `${plugin.id}.json`), plugin);
  }

  console.log(`Generated ${plugins.length} plugins`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
