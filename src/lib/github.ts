/**
 * GitHub API integration for fetching marketing skills.
 *
 * Skills live in the coreyhaines31/marketingskills repo under /skills/{slug}/SKILL.md.
 * Each SKILL.md has YAML frontmatter (name, description) and markdown body (instructions).
 *
 * Two GitHub endpoints are used:
 * - GitHub Contents API: directory listing only (subject to rate limiting)
 * - raw.githubusercontent.com: file content fetching (no rate limit)
 *
 * All responses are cached for 1 hour via Next.js revalidate.
 */

import matter from "gray-matter";
import { Skill } from "./types";
import { getCategoryForSkill } from "./categories";

const REPO_OWNER = "coreyhaines31";
const REPO_NAME = "marketingskills";
const BRANCH = "main";

/** Shape of items returned by the GitHub Contents API */
interface GitHubContentItem {
  name: string;
  type: "file" | "dir";
  path: string;
}

/**
 * Fetches all skills from the GitHub repository.
 * 1. Lists /skills/ directory via GitHub Contents API to discover skill slugs
 * 2. Fetches each SKILL.md from raw.githubusercontent.com
 * 3. Parses YAML frontmatter for name/description
 * 4. Assigns categories from the local mapping
 */
export async function fetchSkillsList(): Promise<Skill[]> {
  // Use the GitHub Contents API for directory listing (cached 1 hour)
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/skills`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch skills list: ${res.status}`);
  }

  const items: GitHubContentItem[] = await res.json();
  const dirs = items.filter((item) => item.type === "dir");

  // Fetch metadata for each skill directory in parallel
  const skills = await Promise.all(
    dirs.map(async (dir) => {
      try {
        return await fetchSkillMetadata(dir.name);
      } catch {
        return null; // Skip skills that fail to load
      }
    })
  );

  return skills.filter((s): s is Skill => s !== null);
}

/**
 * Fetches and parses a single skill's SKILL.md file.
 * Uses raw.githubusercontent.com (no rate limit) instead of the Contents API.
 */
async function fetchSkillMetadata(slug: string): Promise<Skill> {
  const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/skills/${slug}/SKILL.md`;
  const res = await fetch(rawUrl, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`Failed to fetch skill ${slug}: ${res.status}`);
  }

  const text = await res.text();
  // gray-matter extracts YAML frontmatter (data) and markdown body (content)
  const { data, content } = matter(text);

  return {
    slug,
    name: data.name || slug,
    description: data.description || "",
    category: getCategoryForSkill(slug),
    content,
  };
}

/** Fetches the raw SKILL.md content for a given skill slug */
export async function fetchSkillContent(slug: string): Promise<string> {
  const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/skills/${slug}/SKILL.md`;
  const res = await fetch(rawUrl, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`Failed to fetch skill content for ${slug}: ${res.status}`);
  }

  return res.text();
}
