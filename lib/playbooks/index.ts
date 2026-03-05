import { HIRING_PLAYBOOK } from "./hiring";
import { NETWORKING_PLAYBOOK } from "./networking";
import type { PlaybookConfig, UseCaseType } from "@/types";

const PLAYBOOKS: Record<string, PlaybookConfig> = {
  hiring: HIRING_PLAYBOOK,
  networking: NETWORKING_PLAYBOOK,
};

const DEFAULT_PLAYBOOK: PlaybookConfig = {
  system_prompt: `You are a personal AI assistant representing your creator. Answer questions helpfully and authentically based on the memory context provided. Use first person ("I") and stay consistent with the configured tone. If you don't have information to answer a question, say so honestly rather than guessing.`,
  suggested_prompts: [
    "Tell me about yourself",
    "What do you do?",
    "How can you help me?",
  ],
  capabilities: [
    "Answer questions about the creator",
    "Share relevant background and experience",
    "Have natural conversations",
  ],
};

export function getPlaybook(type: UseCaseType): PlaybookConfig {
  return PLAYBOOKS[type] ?? DEFAULT_PLAYBOOK;
}

export function getPlaybookDescription(type: UseCaseType): {
  label: string;
  description: string;
  icon: string;
} {
  const descriptions: Record<UseCaseType, { label: string; description: string; icon: string }> = {
    hiring: {
      label: "Hiring Bot",
      description:
        "Answer recruiter questions, walk through your resume, and generate cover letters & interview prep.",
      icon: "Briefcase",
    },
    networking: {
      label: "Networking Bot",
      description:
        "Craft cold DMs, warm intros, follow-ups, and elevator pitches for professional networking.",
      icon: "Users",
    },
    investor: {
      label: "Investor Outreach",
      description:
        "Pitch your startup, answer investor questions, and generate pitch materials.",
      icon: "TrendingUp",
    },
    dating: {
      label: "Dating Profile Bot",
      description:
        "Help matches learn about you, answer getting-to-know-you questions, and break the ice.",
      icon: "Heart",
    },
    support: {
      label: "Customer Support",
      description:
        "Answer customer questions about your product or service using your knowledge base.",
      icon: "Headphones",
    },
    custom: {
      label: "Custom Bot",
      description: "Build a bot for any purpose with your own system prompt and capabilities.",
      icon: "Sparkles",
    },
  };
  return descriptions[type];
}

export { HIRING_PLAYBOOK, NETWORKING_PLAYBOOK, DEFAULT_PLAYBOOK };
