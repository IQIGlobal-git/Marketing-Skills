import matter from "gray-matter";
import { Skill } from "./types";
import { getCategoryForSkill } from "./categories";

const REPO_OWNER = "coreyhaines31";
const REPO_NAME = "marketingskills";
const BRANCH = "main";

interface GitHubContentItem {
  name: string;
  type: "file" | "dir";
  path: string;
}

export async function fetchSkillsList(): Promise<Skill[]> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/skills`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch skills list: ${res.status}`);
  }

  const items: GitHubContentItem[] = await res.json();
  const dirs = items.filter((item) => item.type === "dir");

  const skills = await Promise.all(
    dirs.map(async (dir) => {
      try {
        return await fetchSkillMetadata(dir.name);
      } catch {
        return null;
      }
    })
  );

  return skills.filter((s): s is Skill => s !== null);
}

async function fetchSkillMetadata(slug: string): Promise<Skill> {
  const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/skills/${slug}/SKILL.md`;
  const res = await fetch(rawUrl, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`Failed to fetch skill ${slug}: ${res.status}`);
  }

  const text = await res.text();
  const { data, content } = matter(text);

  return {
    slug,
    name: data.name || slug,
    description: data.description || "",
    category: getCategoryForSkill(slug),
    content,
  };
}

export async function fetchSkillContent(slug: string): Promise<string> {
  const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/skills/${slug}/SKILL.md`;
  const res = await fetch(rawUrl, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`Failed to fetch skill content for ${slug}: ${res.status}`);
  }

  return res.text();
}
