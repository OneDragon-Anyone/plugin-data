import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { PluginEntry } from "./types";

const rootDir = process.cwd();

export async function getPlugins(): Promise<PluginEntry[]> {
  const content = await readFile(join(rootDir, "public", "plugins.json"), "utf-8");
  return JSON.parse(content) as PluginEntry[];
}

export async function getPlugin(id: string): Promise<PluginEntry | undefined> {
  const plugins = await getPlugins();
  return plugins.find((plugin) => plugin.id === id);
}
