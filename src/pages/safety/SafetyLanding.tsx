import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Bell, Route, ShieldAlert, BatteryFull, Sparkles, Users, Home, MessageCircle, Car, Monitor, Smartphone, Tablet, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrandMark } from "@/components/BrandMark";

/** Public marketing front for NotchSafety — family location, nothing else. */
export default function SafetyLanding() {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const L = (cn: string, en: string) => (zh ? cn : en);

  const features = [
    { icon: MapPin, t: L("实时家人地图", "Live family map"), d: L("每 15 秒更新一次位置，家人都在同一张地图上。", "Everyone on one map, refreshed every 15 seconds.") },
    { icon: Home, t: L("地点提醒", "Place alerts"), d: L("到家、到校、离开等进出提醒，自动发送。", "Automatic arrive & leave alerts for home, school and anywhere else.") },
    { icon: Route, t: L("位置历史与路线", "History & routes"), d: L("查看今天走过的路线、停留点与最高速度。", "Review today's route, stops and top speed.") },
    { icon: ShieldAlert, t: L("一键紧急求助", "One-tap SOS"), d: L("紧急时把位置与求助同时发给圈子里的所有人。", "Send your location and a call for help to your whole circle.") },
    { icon: BatteryFull, t: L("电量与状态", "Battery & status"), d: L("看到家人手机电量与移动状态，不用再打电话确认。", "See phone battery and movement without calling to check.") },
    { icon: Sparkles, t: L("智能安全助手", "Safety assistant"), d: L("用日常语言问“他今天去过哪里”，助手基于你的圈子数据回答。", "Ask in plain words where someone has been — answered from your own circle data.") },
  ];

  const steps = [
    { t: L("建立圈子", "Create a circle"), d: L("给家庭起个名字，一分钟完成。", "Name your family group — takes a minute.") },
    { t: L("邀请家人", "Invite family"), d: L("分享一条邀请链接，对方点开即加入。", "Share one invite link; they tap it and they're in.") },
    { t: L("设置地点", "Add places"), d: L("圈出家、学校、公司，进出自动提醒。", "Circle home, school or work for automatic alerts.") },
  ];

  return (
    <div className="w-full">
      <section className="hero-gradient px-4 py-16 text-center md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <BrandMark size={64} showWordmark={false} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-5xl">
            {L("知道家人平安，就够了。", "Know everyone is safe.")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/85 md:text-lg">
            {L(
              "家人位置、地点提醒、紧急求助 —— 一个专为家庭定位而生的应用。",
              "Family location, place alerts and emergency help — one app built purely for family locating.",
            )}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth">{L("免费开始", "Get started free")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/auth">{L("我已有账号", "I already have an account")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold md:text-3xl">{L("你需要的全部功能", "Everything you need")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.t} className="border-transparent card-elevated">
              <CardContent className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{f.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/50 px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold md:text-3xl">{L("三步开始", "Three steps to start")}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.t} className="rounded-2xl bg-card p-6 card-elevated">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Users className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-2xl font-bold md:text-3xl">{L("现在就把家人加进来", "Bring your family in today")}</h2>
        <p className="mt-3 text-muted-foreground">
          {L("位置只在你的圈子内共享，随时可以关闭。", "Location is shared only inside your circle, and you can switch it off any time.")}
        </p>
        <Button asChild size="lg" className="mt-6 gap-2">
          <Link to="/auth"><Bell className="h-4 w-4" />{L("创建我的圈子", "Create my circle")}</Link>
        </Button>
      </section>

      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        <BrandMark size={22} showWordmark className="justify-center" />
        <p className="mt-3">{L("家人位置 · 地点提醒 · 紧急求助", "Family location · Place alerts · SOS")}</p>
      </footer>
    </div>
  );
}
