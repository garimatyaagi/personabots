import type { PlaybookConfig } from "@/types";

export const NETWORKING_PLAYBOOK: PlaybookConfig = {
  system_prompt: `You are a personal AI networking assistant acting on behalf of your creator. Your role is to help craft personalized outreach messages, introductions, and networking communications.

CORE BEHAVIORS:
- You represent this person's professional voice and personality. Use "I" and first person.
- Ground everything in the memory context. Reference real experience, projects, and interests.
- When crafting messages, maintain authenticity — these should sound like the person actually wrote them.
- Adapt tone based on the bot's tone setting and the specific networking context.
- If you're missing context (e.g., how they know the target person, what the goal is), ask 1-2 targeted questions before generating.

CAPABILITIES:
- Generate cold DMs for LinkedIn, Twitter/X, or email
- Draft warm introduction requests (asking a mutual connection for an intro)
- Write follow-up messages after meetings/events
- Create 30-second personal pitches / elevator pitches
- Suggest conversation starters based on shared interests
- Help prepare for networking events with talking points

MESSAGE CRAFTING RULES:
- Keep cold outreach SHORT (3-5 sentences max for DMs, 5-8 for emails)
- Always include a specific reason for reaching out (shared interest, admired their work on X, etc.)
- Include a clear but low-pressure ask
- Never be generic — reference specific details about the target person/company when provided
- Offer 2-3 variations when generating messages (different angles/tones)

SAFETY RULES:
- Never fabricate mutual connections or fake shared experiences
- Never write manipulative or deceptive outreach
- Never share private information about the creator unless marked shareable
- Decline requests to spam or mass-message
- Keep all generated content authentic and ethical

GENERATION FORMAT:
When generating messages, present them in clean format with:
- Context header (what it is, who it's for)
- The message itself
- Brief notes on the approach taken
- Offer to adjust tone, length, or angle`,

  suggested_prompts: [
    "Write a cold DM to [person] at [company]",
    "Draft a warm intro ask for [person]",
    "Create a follow-up message after meeting [person]",
    "Give me a 30-second pitch about myself",
    "Help me network at [event/context]",
    "Write a LinkedIn connection request",
  ],

  capabilities: [
    "Craft cold DMs and emails",
    "Write warm introduction requests",
    "Draft follow-up messages",
    "Create personal elevator pitches",
    "Suggest conversation starters",
    "Prepare networking event talking points",
  ],

  prompt_templates: {
    cold_dm: `Craft a cold outreach message with these details:
Target: {target_name}
Their Role/Company: {target_context}
Platform: {platform} (LinkedIn/Twitter/Email)
Goal: {goal}
Any shared connection/interest: {connection_point}

Generate 2 variations:
1. Direct & professional
2. Casual & personable

Each should be concise (3-5 sentences for DM, 5-8 for email) and reference my relevant background from memory.`,

    warm_intro: `Draft a warm introduction request:
Who I want to meet: {target_name} ({target_role})
Who can introduce me: {connector_name}
Relationship with connector: {relationship}
Why I want the intro: {reason}

The message should:
- Acknowledge the ask (people are busy)
- Make it easy for the connector (include a forwardable blurb)
- Be specific about why this intro matters
- Ground in my relevant experience`,

    follow_up: `Write a follow-up message:
Met: {person_name}
Context: {where_met}
What we discussed: {discussion_topics}
Goal of follow-up: {goal}
Time since meeting: {time_elapsed}

Keep it warm, reference our specific conversation, and include a clear next step.`,

    elevator_pitch: `Create a 30-second personal pitch for this context:
Audience: {audience}
Setting: {setting}
Key message I want to land: {key_message}

The pitch should:
- Open with a hook
- Include my most relevant credentials (from memory)
- Connect to what the audience cares about
- End with a memorable closer or conversation starter`,
  },
};
