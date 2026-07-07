/**
 * Notch Note — built-in "starter" templates.
 * These are richer, curated templates that instantiate a full tree
 * (root page + sub-pages + optional databases) with prefilled tiptap content.
 */
import { cctCreate, NN } from "./nn-client";

export interface StarterTemplate {
  key: string;
  name: string;
  icon: string;
  cover?: string;
  description: string;
  build: (ctx: BuildCtx) => Promise<{ id: string }>;
}

interface BuildCtx {
  workspaceId: string;
  userId: number | string;
}

/* ─── tiptap JSON helpers ───────────────────────────────────────────── */
const p = (text?: string, marks?: any[]) =>
  text
    ? { type: "paragraph", content: [{ type: "text", text, ...(marks ? { marks } : {}) }] }
    : { type: "paragraph" };
const h = (level: 1 | 2 | 3, text: string) => ({
  type: "heading",
  attrs: { level },
  content: [{ type: "text", text }],
});
const hr = () => ({ type: "horizontalRule" });
const quote = (text: string) => ({
  type: "blockquote",
  content: [p(text)],
});
const bullet = (items: string[]) => ({
  type: "bulletList",
  content: items.map((t) => ({
    type: "listItem",
    content: [p(t)],
  })),
});
const numbered = (items: string[]) => ({
  type: "orderedList",
  attrs: { start: 1 },
  content: items.map((t) => ({
    type: "listItem",
    content: [p(t)],
  })),
});
const todo = (items: { text: string; checked?: boolean }[]) => ({
  type: "taskList",
  content: items.map((it) => ({
    type: "taskItem",
    attrs: { checked: !!it.checked },
    content: [p(it.text)],
  })),
});
const link = (text: string, href: string) => p(text, [{ type: "link", attrs: { href } }]);

const doc = (blocks: any[]) => ({ type: "doc", content: blocks });

async function createPage(
  ctx: BuildCtx,
  parentId: string,
  data: { title: string; icon?: string; cover?: string; type?: "page" | "database"; content?: any },
): Promise<string> {
  const { id } = await cctCreate(NN.block, {
    workspace_id: ctx.workspaceId,
    parent_id: parentId,
    type: data.type || "page",
    title: data.title,
    icon: data.icon || "",
    cover: data.cover || "",
    properties: JSON.stringify({ editor_content: data.content || null }),
    content_order: JSON.stringify([]),
    archived: 0,
    in_trash: 0,
    created_by: ctx.userId || 0,
    last_edited_by: ctx.userId || 0,
  });
  return id;
}

/* ─── Family Wall (flagship) ────────────────────────────────────────── */
async function buildFamilyWall(ctx: BuildCtx) {
  const rootContent = doc([
    h(1, "🏡 The Family Wall"),
    p(
      "A living hub for our family — announcements, memories, recipes, plans, and everything in between.",
    ),
    hr(),
    h(2, "📌 This Week"),
    todo([
      { text: "Sunday roast at Grandma's — 6pm", checked: false },
      { text: "Sign school permission slips", checked: false },
      { text: "Book plumber for kitchen sink", checked: false },
      { text: "Water the tomato plants 🌱", checked: true },
    ]),
    h(2, "🎉 Coming Up"),
    bullet([
      "Mom's birthday — March 14 (planning →)",
      "Family camping trip — Easter weekend",
      "Emma's ballet recital — April 6",
    ]),
    hr(),
    h(2, "🗂️ Sections"),
    p("Click any of the sub-pages in the sidebar to explore."),
    quote("💡 Tip: right-click any sub-page to duplicate, favorite, or move it."),
    hr(),
    h(2, "💌 Family Motto"),
    quote("Home is where our story begins."),
  ]);

  const rootId = await createPage(ctx, ctx.workspaceId, {
    title: "🏡 Family Wall",
    icon: "🏡",
    cover:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1600&auto=format&fit=crop&q=80",
    content: rootContent,
  });

  // Announcements
  await createPage(ctx, rootId, {
    title: "📣 Announcements",
    icon: "📣",
    content: doc([
      h(1, "📣 Family Announcements"),
      p("Post big news here so nobody misses it."),
      hr(),
      h(3, "New baby cousin! 👶"),
      p("Aunt Lily gave birth to little Noah on Feb 2. Both healthy and happy."),
      h(3, "Dad's promotion 🎉"),
      p("Dad is officially Head of Engineering as of Jan 1."),
      h(3, "House renovation ✅"),
      p("Kitchen remodel wraps up March 20. Photos coming."),
    ]),
  });

  // Birthdays & Anniversaries
  await createPage(ctx, rootId, {
    title: "🎂 Birthdays & Anniversaries",
    icon: "🎂",
    content: doc([
      h(1, "🎂 Birthdays & Anniversaries"),
      h(2, "January"),
      bullet(["Jan 04 — Uncle Ben", "Jan 22 — Cousin Mia"]),
      h(2, "February"),
      bullet(["Feb 14 — Mom & Dad anniversary ❤️", "Feb 28 — Grandpa Joe"]),
      h(2, "March"),
      bullet(["Mar 14 — Mom 🎉", "Mar 30 — Sister Ava"]),
      h(2, "Wishlist ideas"),
      todo([
        { text: "Mom — spa voucher", checked: false },
        { text: "Grandpa — vintage record", checked: false },
        { text: "Ava — art supplies", checked: false },
      ]),
    ]),
  });

  // Memory Lane
  await createPage(ctx, rootId, {
    title: "📸 Memory Lane",
    icon: "📸",
    cover:
      "https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=1600&auto=format&fit=crop&q=80",
    content: doc([
      h(1, "📸 Memory Lane"),
      p("Photos, letters and stories worth keeping forever."),
      hr(),
      h(2, "2024 Summer at the Lake"),
      quote(
        "The kids swam every day, Grandpa taught them to fish, and we grilled at sunset. Best week of the year.",
      ),
      h(2, "2023 Christmas in Vermont"),
      quote("Snowed in for 3 days. Board games, cocoa, and Dad's terrible carol singing."),
      h(2, "Add your own"),
      p("Use the + button to add a new memory. Photos, dates, a short story — that's it."),
    ]),
  });

  // Grocery List
  await createPage(ctx, rootId, {
    title: "🛒 Grocery List",
    icon: "🛒",
    content: doc([
      h(1, "🛒 Weekly Grocery List"),
      p("Anyone in the family can tick items off. Cleared every Sunday."),
      hr(),
      h(3, "🥬 Produce"),
      todo([
        { text: "Spinach", checked: false },
        { text: "Bananas", checked: false },
        { text: "Onions", checked: true },
        { text: "Garlic", checked: false },
      ]),
      h(3, "🥩 Protein"),
      todo([
        { text: "Chicken thighs", checked: false },
        { text: "Eggs (2 dozen)", checked: false },
      ]),
      h(3, "🥛 Dairy"),
      todo([{ text: "Milk", checked: false }, { text: "Greek yogurt", checked: false }]),
      h(3, "🧻 Household"),
      todo([{ text: "Toilet paper", checked: false }, { text: "Dishwasher tabs", checked: false }]),
    ]),
  });

  // Chore Chart
  await createPage(ctx, rootId, {
    title: "🧹 Chore Chart",
    icon: "🧹",
    content: doc([
      h(1, "🧹 Weekly Chore Chart"),
      p("Rotate assignments every Sunday evening. First to finish gets to pick Friday's movie 🎬."),
      hr(),
      h(3, "Mom"),
      todo([
        { text: "Meal planning", checked: false },
        { text: "Laundry — whites", checked: false },
      ]),
      h(3, "Dad"),
      todo([
        { text: "Trash & recycling", checked: false },
        { text: "Yard work", checked: false },
      ]),
      h(3, "Ava"),
      todo([{ text: "Vacuum living room", checked: false }, { text: "Set the table", checked: false }]),
      h(3, "Ben"),
      todo([{ text: "Feed the dog 🐶", checked: false }, { text: "Clean bedroom", checked: false }]),
    ]),
  });

  // Family Recipes (database)
  const recipesId = await createPage(ctx, rootId, {
    title: "🍝 Family Recipes",
    icon: "🍝",
    type: "database",
  });
  // seed some recipe entries
  const recipes = [
    { title: "Grandma's Sunday Sauce", icon: "🍝" },
    { title: "Dad's BBQ Ribs", icon: "🍖" },
    { title: "Mom's Apple Pie", icon: "🥧" },
    { title: "Uncle Ben's Chili", icon: "🌶️" },
    { title: "Aunt Lily's Lemon Cake", icon: "🍋" },
  ];
  for (const r of recipes) {
    await createPage(ctx, recipesId, {
      title: r.title,
      icon: r.icon,
      content: doc([
        h(1, r.title),
        h(3, "Ingredients"),
        bullet(["…", "…", "…"]),
        h(3, "Steps"),
        numbered(["Prep everything.", "Cook low and slow.", "Serve with love."]),
        h(3, "Story"),
        quote("Why this recipe matters to our family."),
      ]),
    });
  }

  // Family Planning (rich page with sections)
  await createPage(ctx, rootId, {
    title: "🗓️ Family Planning",
    icon: "🗓️",
    cover:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1600&auto=format&fit=crop&q=80",
    content: doc([
      h(1, "🗓️ Family Planning HQ"),
      p("Budgets, trips, big decisions — plan them together, in one place."),
      hr(),
      h(2, "💰 Monthly Budget"),
      bullet([
        "Rent / mortgage — $2,100",
        "Groceries — $850",
        "Utilities — $220",
        "Kids activities — $300",
        "Fun / eating out — $400",
      ]),
      quote("Review the first Sunday of every month. Adjust together."),
      hr(),
      h(2, "🏖️ Trip Ideas"),
      todo([
        { text: "Yellowstone road trip — July", checked: false },
        { text: "Grandma's cabin — Labor Day weekend", checked: false },
        { text: "Ski trip — December", checked: false },
      ]),
      h(2, "🎯 Family Goals — this year"),
      numbered([
        "Sunday dinner together, every week.",
        "One new hobby per person.",
        "Screen-free Saturday mornings.",
        "Save $6,000 for the family trip.",
      ]),
      hr(),
      h(2, "🧭 Big Decisions Log"),
      bullet([
        "Switch schools for Ben? — Deciding by April",
        "New car? — Researching hybrids",
        "Adopt another dog? 🐕 — Family vote in June",
      ]),
    ]),
  });

  // Contacts
  await createPage(ctx, rootId, {
    title: "📇 Family Contacts",
    icon: "📇",
    content: doc([
      h(1, "📇 Family Contacts"),
      p("Emergency numbers, doctors, schools, and important people."),
      hr(),
      h(3, "🚨 Emergency"),
      bullet(["911", "Poison Control — 1-800-222-1222"]),
      h(3, "🏥 Healthcare"),
      bullet([
        "Dr. Patel (pediatrician) — (555) 010-2233",
        "Dr. Nguyen (family GP) — (555) 010-4455",
        "Dentist — Bright Smiles — (555) 010-8899",
      ]),
      h(3, "🏫 Schools"),
      bullet(["Ben — Lincoln Elementary — (555) 010-2020", "Ava — Roosevelt Middle — (555) 010-3030"]),
      h(3, "👨‍👩‍👧 Extended Family"),
      bullet(["Grandma Rose — (555) 010-1111", "Uncle Ben — (555) 010-2222"]),
    ]),
  });

  return { id: rootId };
}

/* ─── Family Recipes (standalone book) ──────────────────────────────── */
async function buildFamilyRecipeBook(ctx: BuildCtx) {
  const rootId = await createPage(ctx, ctx.workspaceId, {
    title: "🍽️ Family Recipe Book",
    icon: "🍽️",
    cover:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&auto=format&fit=crop&q=80",
    content: doc([
      h(1, "🍽️ Family Recipe Book"),
      p("Every recipe that ever mattered — passed down, written down, kept forever."),
      hr(),
      h(2, "📖 Categories"),
      bullet(["Breakfast", "Weeknight dinners", "Sunday feasts", "Desserts", "Grandma's originals"]),
      quote("💡 Turn this page into a Database via the ⋯ menu to view recipes as a gallery."),
    ]),
  });
  const seed = [
    { t: "Sunday Roast Chicken", i: "🍗" },
    { t: "Weeknight Pasta al Limone", i: "🍋" },
    { t: "Grandma's Cinnamon Rolls", i: "🥐" },
    { t: "Weekend Waffles", i: "🧇" },
    { t: "Slow-cooker Beef Stew", i: "🥘" },
    { t: "Chocolate Chip Cookies", i: "🍪" },
  ];
  for (const r of seed) {
    await createPage(ctx, rootId, {
      title: r.t,
      icon: r.i,
      content: doc([
        h(1, r.t),
        h(3, "Serves / Time"),
        p("Serves 4 • 45 min"),
        h(3, "Ingredients"),
        bullet(["…", "…", "…"]),
        h(3, "Instructions"),
        numbered(["Prep.", "Cook.", "Plate & enjoy."]),
        h(3, "Notes"),
        quote("Family notes and tweaks over the years."),
      ]),
    });
  }
  return { id: rootId };
}

/* ─── Family Planning ───────────────────────────────────────────────── */
async function buildFamilyPlanning(ctx: BuildCtx) {
  const rootId = await createPage(ctx, ctx.workspaceId, {
    title: "📅 Family Planning",
    icon: "📅",
    content: doc([
      h(1, "📅 Family Planning"),
      p("Budgets, calendars, goals and big decisions — planned together."),
      hr(),
      h(2, "This Month"),
      todo([
        { text: "Pay bills (1st of month)", checked: false },
        { text: "Weekly meal plan", checked: false },
        { text: "Family meeting — Sunday 7pm", checked: false },
      ]),
    ]),
  });
  await createPage(ctx, rootId, {
    title: "💰 Budget",
    icon: "💰",
    content: doc([
      h(1, "Monthly Budget"),
      bullet(["Income", "Housing", "Food", "Transport", "Kids", "Fun", "Savings"]),
      quote("Review together the first Sunday of every month."),
    ]),
  });
  await createPage(ctx, rootId, {
    title: "🎯 Goals",
    icon: "🎯",
    content: doc([
      h(1, "Family Goals"),
      numbered(["Health", "Learning", "Adventure", "Kindness", "Money"]),
    ]),
  });
  await createPage(ctx, rootId, {
    title: "🧭 Big Decisions",
    icon: "🧭",
    content: doc([
      h(1, "Big Decisions Log"),
      p("Every big family decision gets a page: options, pros & cons, and the final call."),
    ]),
  });
  return { id: rootId };
}

/* ─── Registry ──────────────────────────────────────────────────────── */
export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    key: "family-wall",
    name: "Family Wall",
    icon: "🏡",
    description:
      "A rich family hub — announcements, birthdays, memory lane, chore chart, grocery list, recipes database and family planning HQ. 8 pre-filled sub-pages.",
    build: buildFamilyWall,
  },
  {
    key: "family-recipes",
    name: "Family Recipe Book",
    icon: "🍽️",
    description: "A recipe collection with 6 seeded family recipes — ready to be filled in.",
    build: buildFamilyRecipeBook,
  },
  {
    key: "family-planning",
    name: "Family Planning",
    icon: "📅",
    description: "Budget, goals and big-decisions workspace for the whole family.",
    build: buildFamilyPlanning,
  },
];
