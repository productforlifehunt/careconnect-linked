import { ContentHub } from "@/components/challenged/ContentHub";
import { HeartPulse } from "lucide-react";

const SUBCATEGORIES = [
  { key: "daily-routines", label: "Daily Routines", labelZh: "日常作息" },
  { key: "nutrition", label: "Nutrition & Meals", labelZh: "营养与饮食" },
  { key: "hygiene", label: "Personal Hygiene", labelZh: "个人卫生" },
  { key: "communication", label: "Communication", labelZh: "沟通技巧" },
  { key: "behaviors", label: "Managing Behaviors", labelZh: "行为管理" },
  { key: "sleep", label: "Sleep & Sundowning", labelZh: "睡眠与黄昏综合征" },
  { key: "activities", label: "Activities & Engagement", labelZh: "活动与参与" },
  { key: "medication", label: "Medication Management", labelZh: "药物管理" },
];

export default function CareD() {
  return (
    <ContentHub
      category="care"
      brandName="CareD"
      brandNameZh="护理篇"
      title="Dementia Care Guides"
      titleZh="失智症护理指南"
      subtitle="Practical guides for providing daily care — from routines and communication to managing challenging behaviors."
      subtitleZh="提供日常护理的实用指南——从日常作息和沟通到应对挑战性行为。"
      icon={<HeartPulse className="h-6 w-6 text-white" />}
      accentColor="from-rose-500 to-pink-600"
      subcategories={SUBCATEGORIES}
      basePath="/cared"
    />
  );
}
