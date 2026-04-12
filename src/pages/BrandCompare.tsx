import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, MapPin, Star, Shield, Clock, Heart,
  Users, Stethoscope, Baby, Moon, ArrowRight, CheckCircle
} from "lucide-react";
import heroImageCn from "@/assets/hero-image-cn.jpg";

interface BrandVariant {
  name: string;
  tagline: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  howItWorksTitle: string;
  footerBrand: string;
  footerTagline: string;
  searchPlaceholder: string;
  badges: string[];
  steps: { num: string; title: string; desc: string }[];
}

const variants: BrandVariant[] = [
  {
    name: "智忆连",
    tagline: "共同面对失智症照护",
    heroTitle: "失智症照护，",
    heroHighlight: "智忆相连",
    heroSubtitle: "与家人协调失智症照护，找到专业护理人员，确保亲人安全——一个团队，一个平台。",
    ctaTitle: "您的失智症照护之旅从这里开始",
    ctaSubtitle: "加入信任智忆连的家庭，协调充满爱心的失智症照护。",
    ctaButton: "寻找失智症护理人员",
    howItWorksTitle: "智忆连如何运作",
    footerBrand: "智忆连",
    footerTagline: "自2024年起，支持失智症照护者和家庭。",
    searchPlaceholder: "您需要什么失智症护理？",
    badges: ["AI辅助失智症护理与陪伴", "背景调查", "GPS和走失警报", "AI辅助记录", "AI辅助定位"],
    steps: [
      { num: "1", title: "寻找专业帮助", desc: "浏览经过专业失智症培训的护理人员，拥有记忆照护、日落综合症和日常生活支持方面的验证经验。" },
      { num: "2", title: "团队协作", desc: "邀请家庭成员，分配任务，分享更新，一起管理药物。" },
      { num: "3", title: "保持安全和知情", desc: "智能定位追踪、走失警报、健康生命体征和每日签到让每个人都了解情况。" },
    ],
  },
  {
    name: "忆连",
    tagline: "记忆相连，关爱不断",
    heroTitle: "失智症照护，",
    heroHighlight: "忆路相连",
    heroSubtitle: "连接家庭与专业护理，守护亲人的每一段记忆——协调照护、追踪安全、温暖陪伴。",
    ctaTitle: "让记忆的纽带不再断裂",
    ctaSubtitle: "加入信任忆连的家庭，用爱与科技守护失智症亲人。",
    ctaButton: "寻找失智症护理人员",
    howItWorksTitle: "忆连如何运作",
    footerBrand: "忆连",
    footerTagline: "自2024年起，连接记忆与关爱。",
    searchPlaceholder: "您需要什么失智症护理？",
    badges: ["AI辅助失智症护理与陪伴", "背景调查", "GPS和走失警报", "AI辅助记录", "AI辅助定位"],
    steps: [
      { num: "1", title: "寻找专业帮助", desc: "浏览经过专业失智症培训的护理人员，让亲人获得最适合的记忆照护支持。" },
      { num: "2", title: "团队协作", desc: "邀请家庭成员，分配任务，分享更新，共同守护亲人的日常。" },
      { num: "3", title: "安全守护", desc: "智能定位追踪、走失警报和每日签到，让每一段记忆都有人守护。" },
    ],
  },
  {
    name: "忆畅",
    tagline: "让记忆畅行无阻",
    heroTitle: "失智症照护，",
    heroHighlight: "忆路畅行",
    heroSubtitle: "让失智症照护不再艰难——专业护理、家庭协作、智能守护，一切畅通无阻。",
    ctaTitle: "让照护之路更加顺畅",
    ctaSubtitle: "加入信任忆畅的家庭，让失智症照护变得轻松高效。",
    ctaButton: "寻找失智症护理人员",
    howItWorksTitle: "忆畅如何运作",
    footerBrand: "忆畅",
    footerTagline: "自2024年起，让失智症照护畅行无忧。",
    searchPlaceholder: "您需要什么失智症护理？",
    badges: ["AI辅助失智症护理与陪伴", "背景调查", "GPS和走失警报", "AI辅助记录", "AI辅助定位"],
    steps: [
      { num: "1", title: "轻松找到帮助", desc: "浏览专业失智症护理人员，一键匹配最适合亲人的照护方案。" },
      { num: "2", title: "全家畅通协作", desc: "邀请家庭成员，任务分配、进度共享、药物管理，一切井然有序。" },
      { num: "3", title: "安心无忧", desc: "智能定位、走失提醒、健康监测，让照护之路畅通无阻。" },
    ],
  },
  {
    name: "忆战",
    tagline: "与遗忘抗争，为记忆而战",
    heroTitle: "失智症照护，",
    heroHighlight: "为忆而战",
    heroSubtitle: "不向遗忘屈服——集结家庭力量，联手专业护理，用科技武装，打赢这场记忆保卫战。",
    ctaTitle: "加入这场记忆保卫战",
    ctaSubtitle: "与千万家庭并肩作战，忆战与您共同守护每一份珍贵记忆。",
    ctaButton: "立即加入忆战",
    howItWorksTitle: "忆战如何运作",
    footerBrand: "忆战",
    footerTagline: "自2024年起，与失智症家庭并肩作战。",
    searchPlaceholder: "您需要什么失智症护理？",
    badges: ["AI辅助失智症护理与陪伴", "背景调查", "GPS和走失警报", "AI辅助记录", "AI辅助定位"],
    steps: [
      { num: "1", title: "召集战友", desc: "找到经过专业失智症训练的护理战士，与您并肩守护亲人。" },
      { num: "2", title: "组建战队", desc: "邀请家庭成员加入照护战队，统一指挥、协同作战、信息共享。" },
      { num: "3", title: "智能防线", desc: "GPS追踪、走失警报、健康监测——筑起全方位智能防护网。" },
    ],
  },
];

const MiniHomepage = ({ v, index }: { v: BrandVariant; index: number }) => (
  <div className="border-2 border-border rounded-xl overflow-hidden bg-background">
    {/* Label */}
    <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
      <Badge variant="secondary" className="text-base font-bold">方案 {index + 1}</Badge>
      <span className="text-2xl font-bold text-foreground">{v.name}</span>
      <span className="text-sm text-muted-foreground ml-2">— {v.tagline}</span>
    </div>

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImageCn} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
      </div>
      <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="max-w-xl">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3 leading-tight">
            {v.heroTitle}{" "}
            <span className="text-coral">{v.heroHighlight}</span>
          </h1>
          <p className="text-sm md:text-base text-primary-foreground/90 mb-4">
            {v.heroSubtitle}
          </p>
          <div className="bg-card rounded-lg p-2 shadow-lg">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <div className="pl-7 py-2 text-sm text-muted-foreground bg-muted/50 rounded">{v.searchPlaceholder}</div>
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <div className="pl-7 py-2 text-sm text-muted-foreground bg-muted/50 rounded">城市或邮编</div>
              </div>
              <Button variant="coral" size="sm">搜索</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {v.badges.map((b) => (
              <div key={b} className="flex items-center gap-1 text-primary-foreground/80 text-xs">
                <CheckCircle className="h-3 w-3" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="px-4 py-8">
      <h2 className="text-lg font-bold text-foreground text-center mb-6">{v.howItWorksTitle}</h2>
      <div className="grid grid-cols-3 gap-4">
        {v.steps.map((s) => (
          <div key={s.num} className="text-center">
            <div className="mx-auto w-10 h-10 rounded-xl hero-gradient flex items-center justify-center mb-2">
              <span className="text-primary-foreground font-bold">{s.num}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{s.title}</h3>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="hero-gradient py-6">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-lg font-bold text-primary-foreground mb-2">{v.ctaTitle}</h2>
        <p className="text-primary-foreground/80 mb-4 text-sm">{v.ctaSubtitle}</p>
        <div className="flex gap-2 justify-center">
          <Button variant="coral" size="sm">{v.ctaButton}</Button>
          <Button variant="secondary" size="sm">免费注册</Button>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t bg-card py-4 px-4">
      <div className="text-center">
        <span className="font-bold text-foreground">{v.footerBrand}</span>
        <span className="text-xs text-muted-foreground ml-2">{v.footerTagline}</span>
      </div>
    </footer>
  </div>
);

const BrandCompare = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="min-h-full bg-muted/30 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">中文品牌名称对比</h1>
          <p className="text-muted-foreground">以下为四个品牌名称方案的完整首页预览，请选择您最满意的方案</p>
        </div>

        {/* Quick comparison table */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              {variants.map((v, i) => (
                <div
                  key={v.name}
                  className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${selected === i ? "border-primary bg-primary/5" : "border-transparent hover:border-muted-foreground/30"}`}
                  onClick={() => setSelected(i)}
                >
                  <div className="text-2xl font-bold text-foreground">{v.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{v.tagline}</div>
                  <div className="text-sm font-medium text-primary mt-2">「{v.heroHighlight}」</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Full previews */}
        <div className="space-y-10">
          {variants.map((v, i) => (
            <MiniHomepage key={v.name} v={v} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandCompare;
