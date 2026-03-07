import type { SocialLinks, CustomLink } from "@/types";

export function migrateSocialLinksToCustomLinks(
  socialLinks: SocialLinks
): CustomLink[] {
  const links: CustomLink[] = [];
  if (socialLinks.linkedin)
    links.push({ label: "LinkedIn", url: socialLinks.linkedin, icon: "linkedin" });
  if (socialLinks.twitter)
    links.push({ label: "Twitter", url: socialLinks.twitter, icon: "twitter" });
  if (socialLinks.github)
    links.push({ label: "GitHub", url: socialLinks.github, icon: "github" });
  if (socialLinks.website)
    links.push({ label: "Website", url: socialLinks.website, icon: "website" });
  return links;
}

export function detectPlatformIcon(url: string): string | undefined {
  const lower = url.toLowerCase();
  if (lower.includes("linkedin.com")) return "linkedin";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("github.com")) return "github";
  if (lower.includes("youtube.com")) return "youtube";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("dribbble.com")) return "dribbble";
  if (lower.includes("behance.net")) return "behance";
  if (lower.includes("medium.com")) return "medium";
  return undefined;
}
