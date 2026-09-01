import { ContentHub } from "@/components/challenged/ContentHub";
import { Lightbulb } from "lucide-react";

const SUBCATEGORIES = [
  { key: "understanding", label: "Understanding Dementia", labelZh: "认识失智症" },
  { key: "types", label: "Types & Causes", labelZh: "类型与病因" },
  { key: "signs", label: "Signs & Symptoms", labelZh: "征兆与症状" },
  { key: "stages", label: "Stages", labelZh: "发展阶段" },
  { key: "diagnosis", label: "Diagnosis", labelZh: "诊断" },
  { key: "prevention", label: "Risk Factors & Prevention", labelZh: "风险因素与预防" },
  { key: "treatments", label: "Treatments", labelZh: "治疗方法" },
];

export default function AwareD() {
  return (
    <ContentHub
      category="aware"
      brandName="AwareD"
      brandNameZh="认知篇"
      title="Understanding Dementia"
      titleZh="了解失智症"
      subtitle="Basics of dementia — what it is, how it progresses, and how it is diagnosed."
      subtitleZh="失智症基础知识——它是什么、如何发展、如何诊断。"
      icon={<Lightbulb className="h-6 w-6 text-white" />}
      accentColor="from-amber-500 to-orange-600"
      subcategories={SUBCATEGORIES}
      basePath="/aware"
    />
  );
}
