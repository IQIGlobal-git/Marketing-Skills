import { NextResponse } from "next/server";
import { fetchSkillsList } from "@/lib/github";
import { CATEGORY_ORDER } from "@/lib/categories";
import { Category } from "@/lib/types";

export async function GET() {
  try {
    const skills = await fetchSkillsList();

    const categoryMap = new Map<string, Category>();
    for (const skill of skills) {
      if (!categoryMap.has(skill.category)) {
        categoryMap.set(skill.category, { name: skill.category, skills: [] });
      }
      categoryMap.get(skill.category)!.skills.push(skill);
    }

    const categories = CATEGORY_ORDER
      .filter((name) => categoryMap.has(name))
      .map((name) => categoryMap.get(name)!);

    // Add any categories not in the predefined order
    for (const [name, cat] of categoryMap) {
      if (!CATEGORY_ORDER.includes(name)) {
        categories.push(cat);
      }
    }

    return NextResponse.json({ skills, categories });
  } catch (error) {
    console.error("Failed to fetch skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills from GitHub" },
      { status: 500 }
    );
  }
}
