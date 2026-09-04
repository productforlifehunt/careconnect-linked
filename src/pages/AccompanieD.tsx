import { ContentHub } from "@/components/challenged/ContentHub";
import { HandHeart } from "lucide-react";

const SUBCATEGORIES = [
  { key: "find-companions", label: "Find Companions", labelZh: "找寻陪伴" },
  { key: "ai-companion", label: "AI Companion", labelZh: "AI陪伴" },
  { key: "companion-guides", label: "Companion Guides", labelZh: "陪伴指南" },
  { key: "activities", label: "Activities Together", labelZh: "共同活动" },
  { key: "remote-care", label: "Remote Care", labelZh: "远程关怀" },
];

export default function AccompanieD() {
  return (
    <ContentHub
      category="accompany"
      brandName="AccompanieD"
      brandNameZh="陪伴篇"
      title="Companionship & Support"
      titleZh="陪伴与支持"
      subtitle="Find the right companion for your cared one — from professional caregivers to AI-powered support and activity guides."
      subtitleZh="为被护理者找到合适的陪伴——从专业护理人员到AI智能陪伴和活动指南。"
      icon={<HandHeart className="h-6 w-6 text-white" />}
      accentColor="from-violet-500 to-purple-600"
      subcategories={SUBCATEGORIES}
      basePath="/accompanied"
    />
  );
}
