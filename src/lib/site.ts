export const siteConfig = {
  name: "ZZZ OneDragon Plugin Registry",
  shortName: "ZZZOD Plugins",
  repoOwner: import.meta.env.PUBLIC_GITHUB_OWNER ?? "your-org",
  repoName: import.meta.env.PUBLIC_GITHUB_REPO ?? "plugin-registry",
  basePath: "/plugin-registry"
};

export function issueUrl(title: string, body: string): string {
  const params = new URLSearchParams({ title, body });
  return `https://github.com/${siteConfig.repoOwner}/${siteConfig.repoName}/issues/new?${params.toString()}`;
}
