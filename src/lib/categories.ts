/**
 * Skill-to-category mapping.
 *
 * Skills fetched from the GitHub repo (coreyhaines31/marketingskills) do NOT have
 * a category field in their YAML frontmatter. This file provides a hardcoded mapping
 * based on the source repo's README organization.
 *
 * IMPORTANT: When new skills are added to the GitHub repo, this mapping must be
 * updated manually. Skills not found here default to "Other".
 */

/** Maps skill slug → marketing category name */
export const SKILL_CATEGORIES: Record<string, string> = {
  // Conversion Optimization — improving signup, onboarding, and purchase flows
  "page-cro": "Conversion Optimization",
  "signup-flow-cro": "Conversion Optimization",
  "onboarding-cro": "Conversion Optimization",
  "form-cro": "Conversion Optimization",
  "popup-cro": "Conversion Optimization",
  "paywall-upgrade-cro": "Conversion Optimization",

  // Content & Copy — writing and content strategy
  "copywriting": "Content & Copy",
  "copy-editing": "Content & Copy",
  "cold-email": "Content & Copy",
  "email-sequence": "Content & Copy",
  "social-content": "Content & Copy",
  "content-strategy": "Content & Copy",

  // SEO & Discovery — search engine and discoverability optimization
  "seo-audit": "SEO & Discovery",
  "ai-seo": "SEO & Discovery",
  "programmatic-seo": "SEO & Discovery",
  "site-architecture": "SEO & Discovery",
  "competitor-alternatives": "SEO & Discovery",
  "schema-markup": "SEO & Discovery",

  // Paid & Distribution — paid advertising and promotion
  "paid-ads": "Paid & Distribution",
  "ad-creative": "Paid & Distribution",

  // Measurement & Testing — analytics and experimentation
  "analytics-tracking": "Measurement & Testing",
  "ab-test-setup": "Measurement & Testing",

  // Retention — reducing churn and increasing engagement
  "churn-prevention": "Retention",

  // Growth Engineering — programmatic growth tactics
  "free-tool-strategy": "Growth Engineering",
  "referral-program": "Growth Engineering",

  // Strategy & Monetization — high-level marketing strategy and pricing
  "marketing-ideas": "Strategy & Monetization",
  "marketing-psychology": "Strategy & Monetization",
  "launch-strategy": "Strategy & Monetization",
  "pricing-strategy": "Strategy & Monetization",

  // Sales & RevOps — revenue operations and sales processes
  "revops": "Sales & RevOps",
  "sales-enablement": "Sales & RevOps",

  // Foundation — base product context for the agent
  "product-marketing-context": "Foundation",
};

/** Display order for categories in the skills browser and API response */
export const CATEGORY_ORDER = [
  "Foundation",
  "Conversion Optimization",
  "Content & Copy",
  "SEO & Discovery",
  "Paid & Distribution",
  "Measurement & Testing",
  "Retention",
  "Growth Engineering",
  "Strategy & Monetization",
  "Sales & RevOps",
];

/** Look up the category for a given skill slug. Returns "Other" if not mapped. */
export function getCategoryForSkill(slug: string): string {
  return SKILL_CATEGORIES[slug] || "Other";
}
