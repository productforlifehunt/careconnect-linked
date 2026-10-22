import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function RecruitmentSourceDetails({ value }: { value: string }) {
  if (!value) return null;
  return (
    <Collapsible className="space-y-2">
      <CollapsibleTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="group h-auto w-full justify-between whitespace-normal py-2 text-left">
          <span>Recruitment source / 招募来源</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="whitespace-pre-wrap break-words text-sm text-foreground">{value}</p>
      </CollapsibleContent>
    </Collapsible>
  );
}