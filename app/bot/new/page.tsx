import { Navbar } from "@/components/shared/navbar";
import { BotBuilderWizard } from "@/components/bot-builder/wizard";

export default function NewBotPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <BotBuilderWizard />
      </main>
    </div>
  );
}
