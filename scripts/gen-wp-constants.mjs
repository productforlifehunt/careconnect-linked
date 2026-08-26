import fs from 'node:fs';

const truth = JSON.parse(fs.readFileSync('docs/wp-truth.json', 'utf8'));
const slugs = JSON.parse(fs.readFileSync('scripts/wp-cct-slugs.json', 'utf8'));

function toIdent(s) {
  return String(s).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '').toUpperCase();
}
function lc(s) {
  const parts = String(s).replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/);
  return parts.map((p, i) => (i === 0 ? p.toLowerCase() : p[0].toUpperCase() + p.slice(1).toLowerCase())).join('');
}

/**
 * Stable frontend alias per dictionary CCT number. Frontend code references
 * these aliases, never raw numbers or slugs, so a dictionary renumbering is a
 * one-line change here.
 */
const CCT_ALIASES = {
  2: 'shop',
  6: 'freshcoinTransaction',
  30: 'vote',
  31: 'review',
  51: 'blockedKeyword',
  114: 'productFlavor',
  121: 'chatConversation',
  126: 'chatMessage',
  140: 'product',
  141: 'comment',
  146: 'productBrand',
  149: 'afreshCommunityPost',
  151: 'userProfile',
  153: 'userQuitPlan',
  161: 'userLogEvent',
  162: 'userChoice',
  168: 'recipe',
  171: 'userHealthLog',
  174: 'productIngredient',
  177: 'userCustomWorkout',
  178: 'userCustomSymptom',
  181: 'userReasonToQuit',
  185: 'notification',
  186: 'notificationToken',
  187: 'calendarEvent',
  192: 'userSubscription',
  193: 'userAiCredit',
  197: 'careNote',
  198: 'infoCard',
  199: 'careGroup',
  200: 'careGroupInvite',
  201: 'careGroupPrivateMemberGroup',
  202: 'careGroupPost',
  203: 'careGroupGallery',
  204: 'careTask',
  205: 'medicineSchedule',
  206: 'medicineLog',
  207: 'checkinSchedule',
  208: 'checkinLog',
  209: 'careTip',
  210: 'carePlan',
  211: 'emergencyContact',
  212: 'careDocument',
  213: 'currentLocation',
  214: 'safeZone',
  215: 'careFacility',
  216: 'careJob',
  217: 'challengedContent',
  218: 'studyNote',
  258: 'userProfile2',
};

/** Stable frontend alias per dictionary relation number. */
const REL_ALIASES = {
  103: 'userFreshcoinTransactions',
  112: 'productFlavors',
  116: 'shopProducts',
  117: 'productWooProducts',
  118: 'userShop',
  119: 'shopLinkedShop',
  128: 'userProducts',
  129: 'userQuitPlans',
  137: 'conversationMembers',
  138: 'conversationMessages',
  139: 'messageParentMessage',
  140: 'careGroupConversation',
  142: 'commentReplies',
  143: 'reviewComments',
  144: 'shopReviews',
  145: 'productReviews',
  147: 'productBrands',
  148: 'shopVendors',
  150: 'communityPostComments',
  152: 'userProfileRel',
  154: 'quitPlanProducts',
  163: 'logEventChoice',
  164: 'userChoices',
  165: 'logEventProducts',
  169: 'recipeProducts',
  172: 'userHealthLogs',
  173: 'userLogEvents',
  175: 'productIngredients',
  176: 'healthLogChildLogEvents',
  179: 'logEventCustomWorkouts',
  180: 'logEventCustomSymptoms',
  182: 'userReasonsToQuit',
  183: 'userBlockedKeywords',
  188: 'userNotifications',
  189: 'userNotificationTokens',
  190: 'userCalendarEvents',
  191: 'calendarEventLogEvents',
  194: 'userSubscriptions',
  195: 'userAiCredits',
  219: 'userCaredOnes',
  220: 'caredOneInfoCards',
  221: 'infoCardEmergencyContacts',
  222: 'careGroupInvites',
  223: 'careGroupMembers',
  224: 'careGroupPrivateMemberGroups',
  225: 'privateMemberGroupMembers',
  226: 'careGroupPosts',
  227: 'careGroupPostPrivateGroups',
  228: 'careGroupPostMentionedUsers',
  229: 'careGroupPostComments',
  230: 'careGroupGalleries',
  231: 'careTaskCaredOnes',
  232: 'careTaskAssignees',
  233: 'careGroupTasks',
  234: 'careTaskPrivateMemberGroups',
  235: 'careTaskVisibleUsers',
  236: 'careTaskComments',
  237: 'caredOneMedicineSchedules',
  238: 'medicineScheduleLogs',
  239: 'caredOneCheckinSchedules',
  240: 'checkinScheduleLogs',
  241: 'checkinScheduleAssignees',
  242: 'caredOneCareNotes',
  243: 'caredOneCareTips',
  244: 'caredOneCarePlans',
  245: 'caredOneEmergencyContacts',
  246: 'caredOneCareDocuments',
  247: 'userCurrentLocations',
  248: 'userSafeZones',
  249: 'careFacilityMembers',
  250: 'careJobCaredOnes',
  251: 'careJobAssignees',
  252: 'careGroupJobs',
  253: 'careJobTasks',
  254: 'careJobComments',
  255: 'userFinishedContent',
  256: 'contentStudyNotes',
  257: 'contentCareTips',
  259: 'userProfile2Rel',
  260: 'checkinNotificationReceivers',
  262: 'calendarEventInvitees',
  263: 'careTaskCalendarEvents',
  264: 'providerReviews',
};

const missingSlug = truth.ccts.filter((c) => !slugs[String(c.id)]);
if (missingSlug.length) {
  console.warn('[warn] CCTs without a live REST slug (add to scripts/wp-cct-slugs.json):',
    missingSlug.map((c) => `${c.id}. ${c.name}`).join(' | '));
}
const missingAlias = truth.ccts.filter((c) => !CCT_ALIASES[c.id]);
if (missingAlias.length) {
  console.warn('[warn] CCTs without an alias:', missingAlias.map((c) => `${c.id}. ${c.name}`).join(' | '));
}
const missingRelAlias = truth.relations.filter((r) => !REL_ALIASES[r.id]);
if (missingRelAlias.length) {
  console.warn('[warn] Relations without an alias:', missingRelAlias.map((r) => r.id).join(','));
}

let out = `// AUTO-GENERATED — DO NOT EDIT BY HAND.
// Dictionary:  ${truth.source}
// Pipeline:    scripts/build-truth.mjs -> docs/wp-truth.json -> scripts/gen-wp-constants.mjs
// Slug map:    scripts/wp-cct-slugs.json (verified against the live /wp-json/ route list)
//
// OPAQUE NAMING: every field code (aNN) and option code (bNN) is meaningless.
// Only the dictionary is truth. Never infer meaning or order from a code.

export interface WPCCTDef {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly f: Readonly<Record<string, string>>;
  readonly opt: Readonly<Record<string, Readonly<Record<string, string>>>>;
}

export const WP = {
  cct: {
`;

for (const c of truth.ccts) {
  const slug = slugs[String(c.id)] || '';
  out += `    /** ${c.id}. ${c.name} */\n    "${c.id}": {\n      id: ${c.id},\n      slug: ${JSON.stringify(slug)},\n      name: ${JSON.stringify(c.name)},\n      f: {\n`;
  for (const f of c.fields) {
    out += `        ${JSON.stringify(toIdent(f.label))}: ${JSON.stringify(f.code)},  // ${f.type || '?'}\n`;
  }
  out += `      },\n      opt: {\n`;
  for (const f of c.fields) {
    const map = f.optionMap || {};
    const keys = Object.keys(map);
    if (!keys.length) continue;
    out += `        ${JSON.stringify(toIdent(f.label))}: { `;
    out += keys.map((code) => `${JSON.stringify(toIdent(map[code]))}: ${JSON.stringify(code)}`).join(', ');
    out += ` },\n`;
  }
  out += `      },\n    },\n`;
}

out += `  },\n  rel: {\n`;
for (const r of truth.relations) {
  out += `    /** ${r.id}. ${r.name} — ${r.parent} -> ${r.child} (${r.type}) */\n`;
  out += `    "${r.id}": { id: ${r.id}, parent: ${JSON.stringify(r.parent)}, child: ${JSON.stringify(r.child)}, type: ${JSON.stringify(r.type)}`;
  if (r.fields.length) {
    out += `, f: { `;
    out += r.fields.map((f) => `${JSON.stringify(toIdent(f.label))}: ${JSON.stringify(f.code)}`).join(', ');
    out += ` }, opt: { `;
    out += r.fields
      .filter((f) => Object.keys(f.optionMap || {}).length)
      .map((f) => {
        const map = f.optionMap;
        return `${JSON.stringify(toIdent(f.label))}: { ${Object.keys(map).map((code) => `${JSON.stringify(toIdent(map[code]))}: ${JSON.stringify(code)}`).join(', ')} }`;
      })
      .join(', ');
    out += ` } },\n`;
  } else {
    out += ` },\n`;
  }
}
out += `  },\n} as const;\n\n`;

// ── Semantic aliases ───────────────────────────────────────────────
out += `/**
 * Semantic CCT aliases. Frontend code MUST use these (T.careGroup.slug,
 * T.careGroup.f.NAME, T.notification.opt.THIS_IS_THE_NOTIFICATION_FOR_APP.CHALLENGED)
 * so a dictionary renumbering never touches feature code.
 */
export const T = {
`;
for (const c of truth.ccts) {
  const alias = CCT_ALIASES[c.id];
  if (!alias) continue;
  out += `  /** ${c.id}. ${c.name} */\n  ${alias}: WP.cct["${c.id}"],\n`;
}
out += `} as const;\n\n`;

out += `/** Semantic JetEngine relation IDs. Use R.careGroupMembers, never a raw number. */\nexport const R = {\n`;
for (const r of truth.relations) {
  const alias = REL_ALIASES[r.id];
  if (!alias) continue;
  out += `  /** ${r.id}. ${r.name} */\n  ${alias}: ${r.id},\n`;
}
out += `} as const;\n\n`;

out += `/** Dictionary CCT number -> live JetEngine REST slug. */
export const CCT_SLUG: Readonly<Record<string, string>> = {
${truth.ccts.map((c) => `  "${c.id}": ${JSON.stringify(slugs[String(c.id)] || '')},`).join('\n')}
} as const;

/** Resolve a REST slug from a dictionary CCT number. Throws when unmapped. */
export function cctSlug(id: number | string): string {
  const slug = CCT_SLUG[String(id)];
  if (!slug) throw new Error(\`[wp-schema] No live CCT slug mapped for dictionary CCT \${id}\`);
  return slug;
}
`;

fs.mkdirSync('src/integrations', { recursive: true });
fs.writeFileSync('src/integrations/wp-schema.ts', out);
console.log('Wrote src/integrations/wp-schema.ts', out.length, 'bytes');
