import { Bot, Clock3, ListChecks, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIAssistant } from "@/contexts/AIAssistantContext";

const HELP_ITEMS = [
  { icon: Clock3, title: "Hourly care events", text: "Choose any hour on Today. You can add more than one event to the same hour." },
  { icon: ListChecks, title: "Daily care summary", text: "Use Log entry, then Daily care summary, to reflect on the day and fill any gaps." },
  { icon: Mic, title: "Answer by voice", text: "Tap the microphone beside any question. Check the matched answer before moving on." },
];

export default function EsmHelp() {
  const { openAssistant } = useAIAssistant();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-foreground">Help</h1>
      <div className="mt-5 divide-y divide-border border-y border-border">
        {HELP_ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3 py-4">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>
      <Button
        className="mt-6 w-full"
        size="lg"
        onClick={() => openAssistant({
          title: "Study help",
          contextPrompt: "Help the participant understand how to complete the ESM caregiver study forms. Do not provide medical advice.",
          starterFallback: "What would you like to know about completing the study?",
        })}
      >
        <Bot className="mr-2 h-5 w-5" />
        Ask the study assistant
      </Button>
    </div>
  );
}