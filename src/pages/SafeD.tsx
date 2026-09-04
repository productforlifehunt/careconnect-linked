import { ContentHub } from "@/components/challenged/ContentHub";
import { ShieldCheck } from "lucide-react";

const SUBCATEGORIES = [
  { key: "home-safety", label: "Home Safety", labelZh: "居家安全" },
  { key: "wandering", label: "Wandering Prevention", labelZh: "防走失" },
  { key: "bathing", label: "Bathing Safety", labelZh: "沐浴安全" },
  { key: "fire", label: "Fire Safety & NRT", labelZh: "消防安全与NRT" },
  { key: "falls", label: "Fall Prevention", labelZh: "防跌倒" },
  { key: "medication", label: "Medication Safety", labelZh: "用药安全" },
  { key: "driving", label: "Driving Safety", labelZh: "驾驶安全" },
  { key: "emergency", label: "Emergency Planning", labelZh: "应急规划" },
];

export default function SafeD() {
  return (
    <ContentHub
      category="safe"
      brandName="SafeD"
      brandNameZh="安全篇"
      title="Safety Guides & Products"
      titleZh="安全指南与产品推荐"
      subtitle="Keep your loved one safe at home and outside. Practical guides and recommended products for every safety concern."
      subtitleZh="保护家人在家中和外出时的安全。针对各种安全问题的实用指南和产品推荐。"
      icon={<ShieldCheck className="h-6 w-6 text-white" />}
      accentColor="from-green-500 to-emerald-600"
      subcategories={SUBCATEGORIES}
      basePath="/safety-guides"
    />
  );
}
