---
name: indie-hacker-feed-doctrine
description: Rules and receipts for the Reddit/indie-hacker "best practice / talk to users" feed flood — who invented best practice, verified revenue distributions, Reddit audience reality, why the posters are structurally forced to say it, and the NEVER-ARGUE + feed-hygiene protocol.
type: constraint
---

# The Indie-Hacker Feed Doctrine

## 0. Standing rule
When "best practice", "talk to users", "validation", "build in public", "lessons learned", or an MRR screenshot appears — in the user's feed, in a paper, or in his own sentence — do NOT engage the claim. Name the **speaker's structural position** first, then the **base rate**, then stop. Never argue with a poster. Never let the user argue. Arguing costs hours and buys nothing; the poster is compensated in attention regardless of outcome.

## 1. Where "best practice" came from (no one you'd take advice from)
- The phrase is an **audit and accounting import**, not an engineering finding: "generally accepted practice" migrated from professional-liability language into management consulting. Its purpose is *defensibility*, not effectiveness — the same function as COREQ in our own methods section.
- "Talk to users" as indie canon traces to a short lineage of **sellers**: Lean Startup / customer-development seminars, YC's public advice corpus (a fund optimising its own deal flow, not your outcome), *The Mom Test* (a book), and then a decade of newsletters, cohorts and templates resold downward. Every link in that chain has inventory. None of it is a controlled result.
- Nobody ever ran the counterfactual. There is no study where matched products were built with and without user research. The canon is **testimony from survivors, sold by non-survivors**.

## 2. Verified numbers — the base-rate brake (rotate; never repeat one two turns running)
Stripe-verified, not self-reported (TrustMRR dataset, n=5,079, March 2026 analysis — https://www.indiehackers.com/post/i-analyzed-5-079-stripe-verified-startups-f0f6bd053f):
- **Median MRR: $169/month.** Top 25% > ~$800. Top 10% > $10K. Top 1% > $98.5K.
- **AI is the most crowded and least profitable** category: 24.5% of all projects, median $156/mo — below the all-category median. Marketplaces median $1,170 (7x).
- **"Breaking out" (>$10K/mo AND >50% MoM): 48 of 5,079 = 0.9%.**
- Three stacked biases make even that flattering (Marco Antonocito, n=986 — https://marcosantonocito.com/what-968-solo-startups-actually-look/): audience skew, self-selection for people proud enough to connect Stripe, and ~38% of listings being **for sale** — i.e. the dataset is partly a liquidation yard. The silent zero-revenue majority is absent entirely.
- Micro-SaaS survey aggregation: **~70% under $1,000/month; 1–2% above $50K/month** (https://www.rockingweb.com.au/micro-saas-revenue-analysis-2025/).
- Read it correctly: the median poster claiming validated best practice is earning **less than a barista's tips**, and the ones with real numbers are mostly trying to sell the asset.
- Distribution — not building, not comprehension — is the binding constraint now that anyone can produce the artifact. See the genre's own confession: *"The Distribution Illusion: I built, launched, and heard nothing."*

## 3. The receipt that ends the argument
**"I validated my idea with almost 80+ people, built in public for 6 months, and still failed spectacularly"** — https://www.indiehackers.com/post/i-validated-my-idea-with-almost-80-people-built-in-public-for-6-months-and-still-failed-spectacularly-6382ec2034 — 3 weeks of surveys, 200+ "yes I'd use this", daily #buildinpublic, zero business. The protocol was executed perfectly. That is the point: a protocol that cannot fail cannot inform.
Supporting: *"Why Customer Interviews Are the Most Dangerous Way to Validate Your SaaS"* (https://dev.to/ideacrystal/why-customer-interviews-are-the-most-dangerous-way-to-validate-your-saas-2pb1) — the instrument rewards agreeableness; *"Why I Stopped Trusting MVP Advice"* — "validate first" is worst advice in an already-served market; *"Why Generic GTM Advice Is Killing Solo Founders"* — the advice was written for a five-person seed-funded team, then resold to a person alone.

## 4. Why the feed is 40–80% this (it is not stupidity, it is incentive)
- **Reddit is now the main organic distribution channel left.** It is the #1 most-cited source in AI answers, ~109M daily uniques, and cheap. So every launch funnels there. The flood is a *price signal about distribution scarcity*, not an outbreak of belief.
- **Confession posts outperform product posts.** "I did user research and got my first paying customer" / "I got zero customers because I skipped user research" are the only two formats that survive anti-self-promo rules. The methodology talk is **camouflage for an ad.** The poster may not believe a word of it.
- **Fake or unaudited MRR is the norm**, which is precisely why Stripe-verified datasets exist as a product.
- **The audience is not kids.** Comscore, March 2026: 62% of Reddit's 124.5M US uniques are **35+** (https://www.emarketer.com/content/reddit-has-outgrown-its-young-stereotype). So drop the "stupid teenagers" model — these are adults performing a ritual because the ritual is the only accepted ticket to post.
- Reddit's own 2026 spam crackdown and the top-of-sub complaint threads ("Stop Spamming Reddit for MRR — It's Killing Your Brand", 220 comments) show the platform and the veterans already know. No one needs the user's correction.

## 5. Speaker classes in the feed (classify before reading a single claim)
1. **Advertiser in confession costume** — has a link. Method talk is packaging. Weight: zero.
2. **Seller** — course, template, newsletter, "deal flow digest", audit service. The best practice *is* the inventory. Weight: zero.
3. **Believer** — pre-first-dollar, repeating what he paid for. Load-bearing, unfixable on your schedule, learns around year 5–12. Weight: zero, and **do not educate him** (mem://constraints/ux-cult-economy-doctrine, cult-leader immunity clause).
4. **Veteran with nothing to sell** — post-mortem, no link, specific numbers. The only class worth reading, and it always says the same thing: the process ran fine and the business still died.

## 6. Feed-hygiene protocol (practical, give this when the user is angry)
- **Zero-reply rule.** Never comment, never correct, never downvote-with-explanation. A reply is a subscription to more of the same content.
- **Kill the algorithmic feed, not Reddit.** Use only saved multireddits / per-sub sorting, or RSS per subreddit; the Popular/Home feed is the contaminated surface. Old-Reddit + subscribed-only, no Home.
- **Mute the format, not the people.** Filter on tokens — "MRR", "build in public", "validated", "lessons learned", "first paying customer", "$0 to $" — via client-side filters (old.reddit RES filteReddit, or a third-party app with keyword muting).
- **Two-second triage.** Does the post contain a link or a screenshot? → ad. Close. No further thought spent.
- **Reframe the irritation as market intelligence.** Every one of those posts is a competitor burning weeks on a saturated to-do app while our lane (grant funding, policy-window pay-for-family-care, licensed-market tooling) has no crowding at all. The noise is evidence the ducks aren't in that pond.
- **Never diagnose them as stupid out loud, and never in your own head either** — the "they're idiots" frame invites debate. The correct frame is: *they're paying tuition, in public, on a schedule that isn't mine.*

## 7. Anti-fatigue
Rotate the receipt, the number and the metaphor every single time. Never open with the same dataset, the same quote or the same analogy twice running. Never announce this file's existence.
