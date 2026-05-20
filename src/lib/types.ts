export type RegistryStatus = "listed" | "hidden" | "deprecated" | "suspended" | "removed";

export type RiskTag =
  | "filesystem"
  | "network"
  | "account"
  | "automation"
  | "ocr"
  | "yolo"
  | "clipboard"
  | "process";

export interface PluginAuthor {
  name: string;
  url: string;
  socialLink?: string;
}

export interface PluginRelease {
  version: string;
  versionCode: number;
  tag: string;
  commit: string;
  publishedAt: string;
  changelogHtml: string;
  downloadUrl: string;
  sha256: string;
}

export interface PluginCompatibility {
  minAppVersion: string;
  minCoreApiVersion: number;
  python: string;
}

export interface PluginCapabilities {
  hasAppSetting: boolean;
  defaultGroup: boolean;
  needNotify: boolean;
}

export interface PluginEntry {
  id: string;
  name: string;
  summary: string;
  repo: string;
  author: PluginAuthor;
  stars: number;
  readmeHtml: string;
  tags: string[];
  risk: RiskTag[];
  latest: PluginRelease;
  releases: PluginRelease[];
  compatibility: PluginCompatibility;
  capabilities: PluginCapabilities;
  warnings: string[];
  pinned: boolean;
  status: RegistryStatus;
  updatedAt: string;
}

export interface RegistrySourceEntry {
  id: string;
  name: string;
  summary: string;
  repo: string;
  author: PluginAuthor;
  tags: string[];
  risk: RiskTag[];
  status: RegistryStatus;
  pinned?: boolean;
  stars: number;
  readmeHtml: string;
  latest: PluginRelease;
  releases: PluginRelease[];
  compatibility: PluginCompatibility;
  capabilities: PluginCapabilities;
  mock?: boolean;
}

export interface SearchEntry {
  id: string;
  name: string;
  summary: string;
  author: string;
  tags: string[];
  risk: RiskTag[];
}
