import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-xLpexZsM.mjs";
import { t as Input } from "./input-DmTt3-fi.mjs";
import { t as Textarea } from "./textarea-DPamDMgK.mjs";
import { a as getWPToken, i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { a as inspectModeOn, c as setInspectMode, i as getRecorded, l as subscribeRecorder, r as clearRecorded } from "./recorder-CZ3Gd8pJ.mjs";
import { i as WP, n as R, r as T, t as CCT_SLUG } from "./wp-schema-Dnlz0TVP.mjs";
import { At as Lock, E as Square, En as CircleCheck, Ft as Link2, Nn as ChevronDown, _ as TriangleAlert, _t as MousePointerClick, at as Play, en as Globe, gt as Navigation, it as Plus, j as Sparkles, jn as ChevronRight, kn as ChevronsUpDown, m as Unlink, n as X, q as ScanSearch, un as Download, y as Trash2 } from "../_libs/lucide-react.mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { l as createServerFn } from "./createServerFn-Be1RckzI.mjs";
import { t as createSsrRpc } from "./createSsrRpc-DWUsQYVr.mjs";
import { a as objectType, i as numberType, n as booleanType, o as stringType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
import { t as Switch } from "./switch-Coli7fra.mjs";
import { t as useServerFn } from "./useServerFn-BEMTK175.mjs";
import { a as resolveImport, i as readSource, n as importClosure, r as liveEntries, t as analyse } from "./live-index-DtKtdPKC.mjs";
import { t as decodeNotes } from "./notes-transport-DYZ3UYut.mjs";
import { t as inspectorNotesCache } from "./notes-cache-Bdl5H6YR.mjs";
import { n as findSameElementNote, t as elementAlias } from "./route-key-D5CyzPmV.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-BxP3B8Fw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ReadWriteInspector-jWzib5Cu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var wp_schema_default = "// AUTO-GENERATED — DO NOT EDIT BY HAND.\n// Dictionary:  /mnt/documents/最新数据字典-2026-09-04.txt\n// Pipeline:    scripts/build-truth.mjs -> docs/wp-truth.json -> scripts/gen-wp-constants.mjs\n// Slug map:    scripts/wp-cct-slugs.json (verified against the live /wp-json/ route list)\n//\n// OPAQUE NAMING: every field code (aNN) and option code (bNN) is meaningless.\n// Only the dictionary is truth. Never infer meaning or order from a code.\n\nexport interface WPCCTDef {\n  readonly id: number;\n  readonly slug: string;\n  readonly name: string;\n  readonly f: Readonly<Record<string, string>>;\n  readonly opt: Readonly<Record<string, Readonly<Record<string, string>>>>;\n}\n\nexport const WP = {\n  cct: {\n    /** GUI-verified CCT324: user-created inspector manual notes. */\n    \"324\": { id: 324, slug: \"manual_notes\", name: \"Manual Notes\", f: { \"名字\": \"a55\", \"内容\": \"a56\" }, opt: {} },\n    /** 140. Product */\n    \"140\": {\n      id: 140,\n      slug: \"nicotine_product\",\n      name: \"Product\",\n      f: {\n        \"NAME\": \"a55\",  // Text\n        \"DESCRIPTION\": \"a56\",  // Textarea\n        \"PRODUCT_TYPE\": \"a57\",  // Checkbox\n        \"THE_SUPPLEMENT_IS_GLP_1\": \"a571\",  // Radio\n        \"GLP_1_PRODUCT_CATEGORY\": \"a572\",  // ?\n        \"THE_SUPPLEMENT_IS_PEPTIDES\": \"a573\",  // Radio\n        \"SUPPLEMENT_PRODUCT_CATEGORY\": \"a574\",  // Radio\n        \"THE_FOOD_SUPPLEMENT_CONTAINS_CAFFEINE\": \"a575\",  // Radio\n        \"THE_FOOD_SUPPLEMENT_CONTAINS_PROTEIN\": \"a576\",  // Radio\n        \"GIFTCARD_TYPE\": \"a577\",  // Radio\n        \"GIFTCARD_PRICE\": \"a578\",  // Number\n        \"DIGITAL_PRODUCT_PLATFORM\": \"a579\",  // ?\n        \"DIGITAL_PRODUCT_CATEGORY\": \"a580\",  // ?\n        \"THE_PRODUCT_IS_A_NRT_PRODUCT\": \"a58\",  // Radio\n        \"NRT_CERTIFICATION_INSTITUTE\": \"a59\",  // Checkbox\n        \"THE_NICOTINE_PRODUCT_IS_A_SMOKELESS_NICOTINE_PRODUCT\": \"a60\",  // Radio\n        \"NICOTINE_PRODUCT_CATEGORY\": \"a61\",  // Radio\n        \"THE_PRODUCT_CONTAINS_TOBACCO\": \"a62\",  // Radio\n        \"NICOTINE_STRENGTH_IN_MG\": \"a63\",  // Number\n        \"SMOKELESS_PRODUCT_STRENGTH_CATEGORY\": \"a64\",  // Radio\n        \"NRT_PRODUCT_STAGE_CATEGORY\": \"a65\",  // Radio\n        \"THE_PRODUCT_IS_APPROVED\": \"a66\",  // Radio\n        \"HOW_MANY_PRODUCTS_IN_A_PACK\": \"a67\",  // Number\n        \"IMAGES\": \"a68\",  // Gallery\n        \"GOOGLE_PRODUCT_CATEGORY_ID\": \"a69\",  // Text\n        \"COIN_ALLOWANCE\": \"a70\",  // Number\n        \"CUSTOM_FOOD_DETAIL\": \"a71\",  // Textarea\n        \"CUSTOM_RECIPE_DETAIL\": \"a711\",  // Textarea\n        \"CUSTOM_WORKOUT_DETAIL\": \"a712\",  // Textarea\n        \"CUSTOM_MEDICINE_DETAIL\": \"a713\",  // Textarea\n        \"ALCOHOL_PRODUCT_CATEGORY\": \"a72\",  // Checkbox\n        \"ALCOHOL_PERCENTAGE\": \"a73\",  // Number\n        \"ALCOHOL_VOLUME_PER_BOTTLE\": \"a74\",  // Number\n        \"PRODUCT_LISTING_TYPE\": \"a75\",  // Checkbox\n      },\n      opt: {\n        \"PRODUCT_TYPE\": { \"NICOTINE_PRODUCT\": \"b55\", \"ALCOHOL_PRODUCT\": \"b56\", \"FOOD\": \"b57\", \"SUPPLEMENT\": \"b58\", \"MEDICINE\": \"b59\", \"GEAR\": \"b60\", \"GIFTCARD\": \"b61\", \"DIGITAL_PRODUCT\": \"b62\" },\n        \"THE_SUPPLEMENT_IS_GLP_1\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"THE_SUPPLEMENT_IS_PEPTIDES\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"THE_FOOD_SUPPLEMENT_CONTAINS_CAFFEINE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"THE_FOOD_SUPPLEMENT_CONTAINS_PROTEIN\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"GIFTCARD_TYPE\": { \"AMAZON\": \"b55\" },\n        \"THE_PRODUCT_IS_A_NRT_PRODUCT\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"THE_NICOTINE_PRODUCT_IS_A_SMOKELESS_NICOTINE_PRODUCT\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"NICOTINE_PRODUCT_CATEGORY\": { \"CIGARETTE\": \"b55\", \"CIGAR\": \"b56\", \"CIGARILLO\": \"b57\", \"PIPE\": \"b58\", \"HOOKAH\": \"b59\", \"HAND_ROLL\": \"b60\", \"HEATED_TOBACCO\": \"b61\", \"VAPE\": \"b62\", \"MOIST_SNUFF_DIP\": \"b63\", \"NASAL_SNUFF\": \"b64\", \"TOBACCO_POUCH_SNUS\": \"b65\", \"CHEWING_TOBACCO\": \"b66\", \"NICOTINE_POUCH\": \"b67\", \"NICOTINE_GUM\": \"b68\", \"NICOTINE_STRIP\": \"b69\", \"NICOTINE_LOZENGE_MINT\": \"b70\", \"NICOTINE_SUBLINGUAL_TABLET\": \"b71\", \"NICOTINE_NASAL_SPRAY\": \"b72\", \"NICOTINE_COTTON\": \"b73\", \"NICOTINE_HARD_CANDY\": \"b74\", \"NICOTINE_PEARL\": \"b75\", \"NICOTINE_TOOTHPICK\": \"b76\", \"NICOTINE_MOUTH_SPRAY\": \"b77\", \"NICOTINE_INHALER\": \"b78\", \"NICOTINE_GEL\": \"b79\", \"NICOTINE_LOLLIPOPS_SUCKERS\": \"b80\" },\n        \"THE_PRODUCT_CONTAINS_TOBACCO\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"THE_PRODUCT_IS_APPROVED\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"ALCOHOL_PRODUCT_CATEGORY\": { \"BEER\": \"b55\", \"CIDER\": \"b56\", \"WINE\": \"b57\", \"FORTIFIED_WINE\": \"b58\", \"SPIRITS\": \"b59\", \"ALCOPOPS\": \"b60\", \"PROSECCO_CHAMPAGNE\": \"b61\" },\n        \"PRODUCT_LISTING_TYPE\": { \"OUR_NON_SPECIFIC_CATEGORY_PRODUCT_CUSTOMIZABLE_BY_USERS\": \"b55\", \"USER_S_PERSONAL_PRODUCTS\": \"b56\" },\n      },\n    },\n    /** 146. Product’s brand */\n    \"146\": {\n      id: 146,\n      slug: \"nicotine_products_b\",\n      name: \"Product’s brand\",\n      f: {\n        \"BRAND_NAME\": \"a55\",  // Text\n        \"BRAND_IMAGE\": \"a56\",  // Gallery\n        \"BRAND_IS_APPROVED\": \"a57\",  // Radio\n        \"BRAND_IS_STILL_ACTIVE\": \"a58\",  // Radio\n      },\n      opt: {\n        \"BRAND_IS_APPROVED\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"BRAND_IS_STILL_ACTIVE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 114. Product's flavor */\n    \"114\": {\n      id: 114,\n      slug: \"nicotine_products_fl\",\n      name: \"Product's flavor\",\n      f: {\n        \"FLAVOR_NAME\": \"a55\",  // Text\n        \"FLAVOR_IS_APPROVED\": \"a56\",  // Radio\n        \"FLAVOR_IS_STILL_ACTIVE\": \"a57\",  // Radio\n      },\n      opt: {\n        \"FLAVOR_IS_APPROVED\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"FLAVOR_IS_STILL_ACTIVE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 174. Product's ingredient */\n    \"174\": {\n      id: 174,\n      slug: \"products_ingredient\",\n      name: \"Product's ingredient\",\n      f: {\n        \"INGREDIENT_NAME\": \"a55\",  // Text\n        \"INGREDIENT_IS_APPROVED\": \"a56\",  // Radio\n        \"INGREDIENT_IS_STILL_ACTIVE\": \"a57\",  // Radio\n      },\n      opt: {\n        \"INGREDIENT_IS_APPROVED\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"INGREDIENT_IS_STILL_ACTIVE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 288. Ownership claim */\n    \"288\": {\n      id: 288,\n      slug: \"ownership_claim\",\n      name: \"Ownership claim\",\n      f: {\n        \"CLAIM\": \"a55\",  // Text\n        \"PROOF\": \"a56\",  // Gallery\n        \"STATUS\": \"a57\",  // Radio\n        \"IS_DISPUTE\": \"a58\",  // Radio\n        \"REPLY\": \"a59\",  // Text\n      },\n      opt: {\n        \"STATUS\": { \"PENDING\": \"b55\", \"APPROVED\": \"b56\", \"REJECTED\": \"b57\" },\n        \"IS_DISPUTE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 168. Recipe */\n    \"168\": {\n      id: 168,\n      slug: \"recipe\",\n      name: \"Recipe\",\n      f: {\n        \"NAME\": \"a55\",  // Text\n        \"SERVINGS\": \"a56\",  // Text\n        \"RECIPE_DETAIL\": \"a57\",  // Textarea\n        \"IMAGE\": \"a58\",  // ?\n      },\n      opt: {\n      },\n    },\n    /** 2. Shop */\n    \"2\": {\n      id: 2,\n      slug: \"shop\",\n      name: \"Shop\",\n      f: {\n        \"SHOP_NAME\": \"a55\",  // Text\n        \"SHOP_DESCRIPTION\": \"a56\",  // Text\n        \"SHOP_WEBSITE\": \"a57\",  // Text\n        \"SHOP_COUNTRY\": \"a58\",  // Text\n        \"SHOP_ADDRESS\": \"a59\",  // Text\n        \"SHOP_PHONE\": \"a60\",  // Text\n        \"SHOP_EMAIL\": \"a61\",  // Text\n        \"SHOP_IS_ONLINE\": \"a62\",  // Radio\n        \"ONLINE_SHOP_TYPE\": \"a63\",  // Checkbox\n        \"SHOP_IS_LOCAL_PHYSICAL\": \"a64\",  // Radio\n        \"LOCAL_PHYSICAL_SHOP_TYPE\": \"a65\",  // Checkbox\n        \"SHOP_S_SHIPPING_REGIONS\": \"a66\",  // Checkbox\n        \"SHOP_IS_APPROVED\": \"a67\",  // Radio\n        \"SHOP_IS_STILL_ACTIVE\": \"a68\",  // Radio\n        \"THIS_SHOP_IS_ONE_OF_OUR_OFFICIAL_SHOPS\": \"a69\",  // Radio\n        \"OWNER_USER_ID\": \"a70\",  // Text\n        \"CLAIM_STATUS\": \"a71\",  // Text\n        \"CLAIM_EMAIL\": \"a72\",  // Text\n        \"CLAIM_PROOF\": \"a73\",  // Text\n        \"PHONE\": \"a74\",  // Text\n        \"DEFAULT_COIN_ALLOWANCE\": \"a75\",  // Number\n        \"THE_SHOP_HAS_JOINED_OUR_MARKETPLACE_AS_A_MARKETPLACE_SELLER\": \"a76\",  // Radio\n        \"THIS_IS_THE_HIDDEN_SHOP_TO_STORE_TYPE_4_PRICE_FOR_SHOP_THAT_IS_ON_OUR_DIRECTORY_LIST_AND_ALSO_CHOOSES_TO_SELL_ON_OUR_MARKET_PLACE\": \"a77\",  // Radio\n        \"THIS_SHOP_CHOOSES_TO_SELL_ON_OUR_MARKETPLACE_BUT_DOESN_T_DESERVE_TO_BE_LISTED_ON_OUR_DIRECTORY\": \"a78\",  // Radio\n      },\n      opt: {\n        \"SHOP_IS_ONLINE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"ONLINE_SHOP_TYPE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"SHOP_IS_LOCAL_PHYSICAL\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"LOCAL_PHYSICAL_SHOP_TYPE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"SHOP_IS_APPROVED\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"SHOP_IS_STILL_ACTIVE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"THIS_SHOP_IS_ONE_OF_OUR_OFFICIAL_SHOPS\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"THE_SHOP_HAS_JOINED_OUR_MARKETPLACE_AS_A_MARKETPLACE_SELLER\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"THIS_IS_THE_HIDDEN_SHOP_TO_STORE_TYPE_4_PRICE_FOR_SHOP_THAT_IS_ON_OUR_DIRECTORY_LIST_AND_ALSO_CHOOSES_TO_SELL_ON_OUR_MARKET_PLACE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"THIS_SHOP_CHOOSES_TO_SELL_ON_OUR_MARKETPLACE_BUT_DOESN_T_DESERVE_TO_BE_LISTED_ON_OUR_DIRECTORY\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 149. Community post */\n    \"149\": {\n      id: 149,\n      slug: \"afresh_community_pos\",\n      name: \"Community post\",\n      f: {\n        \"TITLE\": \"a55\",  // Text\n        \"CONTENT\": \"a56\",  // Textarea\n        \"COMMUNITY_TYPE\": \"a57\",  // Radio\n        \"LANGUAGE\": \"a58\",  // Radio\n        \"APP_AREA\": \"a59\",  // Checkbox\n        \"COMMUNITY_POST_CATEGORY\": \"a60\",  // Radio\n      },\n      opt: {\n        \"COMMUNITY_TYPE\": { \"AFRESH\": \"b55\", \"NRTLIST\": \"b56\", \"POUCHLIST\": \"b57\", \"CHALLENGED\": \"b58\", \"CARE_CNC\": \"b59\" },\n        \"LANGUAGE\": { \"ENGLISH\": \"b55\", \"SIMPLIFIED_CHINESE\": \"b56\" },\n        \"APP_AREA\": { \"GLOBAL_ENGLISH\": \"b55\", \"CHINA\": \"b56\" },\n        \"COMMUNITY_POST_CATEGORY\": { \"DISCUSSION\": \"b55\", \"ARTICLE\": \"b56\" },\n      },\n    },\n    /** 141. Comment */\n    \"141\": {\n      id: 141,\n      slug: \"comment\",\n      name: \"Comment\",\n      f: {\n        \"TITLE\": \"a55\",  // text\n        \"CONTENT\": \"a56\",  // textarea\n      },\n      opt: {\n      },\n    },\n    /** 30. Vote */\n    \"30\": {\n      id: 30,\n      slug: \"vote\",\n      name: \"Vote\",\n      f: {\n        \"UPVOTE_OR_DOWNVOTE\": \"a55\",  // Radio\n      },\n      opt: {\n        \"UPVOTE_OR_DOWNVOTE\": { \"UPVOTE\": \"b55\", \"DOWNVOTE\": \"b56\" },\n      },\n    },\n    /** 31. Review */\n    \"31\": {\n      id: 31,\n      slug: \"review\",\n      name: \"Review\",\n      f: {\n        \"TITLE\": \"a55\",  // text\n        \"CONTENT\": \"a56\",  // textarea\n        \"RATING\": \"a57\",  // number\n        \"PRODUCT_FLAVOR_RATING\": \"a58\",  // number\n        \"NICOTINE_PRODUCT_NICOTINE_HIT_RATING\": \"a59\",  // number\n        \"NICOTINE_PRODUCT_NICOTINE_RELEASE_RATING\": \"a60\",  // number\n        \"NICOTINE_PRODUCT_GUM_FRIENDLINESS_RATING\": \"a61\",  // number\n      },\n      opt: {\n      },\n    },\n    /** 151. User‘s extended profile */\n    \"151\": {\n      id: 151,\n      slug: \"users_extended_prof\",\n      name: \"User‘s extended profile\",\n      f: {\n        \"USER_NAME_FOR_AFRESH\": \"a55\",  // Text\n        \"USER_NAME_FOR_ADRY\": \"a551\",  // Text\n        \"USER_NAME_FOR_ABLOCKED\": \"a552\",  // Text\n        \"USER_NAME_FOR_NRTLIST\": \"a553\",  // Text\n        \"USER_NAME_FOR_SMOKELESSLIST\": \"a554\",  // Text\n        \"USER_NAME_FOR_BENOTCH\": \"a555\",  // Text\n        \"USER_NAME_FOR_CHALLENGED\": \"a556\",  // Text\n        \"USER_NAME_FOR_CARECNC\": \"a557\",  // Text\n        \"USER_NAME_IN_AFRESH_COMMUNITY\": \"a56\",  // Text\n        \"TIMEZONE\": \"a57\",  // Text\n        \"LANGUAGE\": \"a58\",  // Text\n        \"CURRENCY\": \"a59\",  // Text\n        \"USER_S_GENERAL_ROLE_FOR_AFRESH\": \"a60\",  // Checkbox\n        \"USER_S_GOAL_FOR_QUIT_SMOKING\": \"a61\",  // Radio\n        \"USER_S_GOAL_FOR_QUIT_DRINKING_ALCOHOL\": \"a611\",  // Radio\n        \"USER_S_GOAL_FOR_QUIT_PORN\": \"a612\",  // Radio\n        \"AI_TONE\": \"a62\",  // Radio\n        \"CUSTOM_AI_TONE\": \"a63\",  // Text\n        \"ALLOWS_SPEAKING_F_WORD_IN_FELLA_MODE\": \"a64\",  // Radio\n        \"HOW_SHOULD_FELLA_CALL_YOU\": \"a65\",  // Text\n        \"HOW_MUCH_FELLA_NESS_SHOULD_OUR_FELLA_BE\": \"a66\",  // Number\n        \"AI_STRICTNESS_LEVEL\": \"a67\",  // Number\n        \"CUSTOM_AI_SYSTEM_PROMPT\": \"a68\",  // Textarea\n        \"QUIT_SMOKING_START_DATE\": \"a69\",  // Timedate\n        \"QUIT_DRINKING_ALCOHOL_START_DATE\": \"a691\",  // Timedate\n        \"USER_FINISHED_OR_SKIPPED_ONBOARDING_FOR_AFRESH\": \"a70\",  // Radio\n        \"USER_FINISHED_OR_SKIPPED_ONBOARDING_FOR_ADRY\": \"a71\",  // Radio\n        \"USER_FINISHED_OR_SKIPPED_ONBOARDING_FOR_BENOTCH\": \"a72\",  // Radio\n        \"USER_S_BASELINE_PORN_WATCH_TIME_PER_DAY\": \"a74\",  // Number\n        \"USER_S_BASELINE_PORN_WATCHING_CATEGORY\": \"a75\",  // Text\n        \"USER_S_BASELINE_PORN_WATCHING_DETAIL\": \"a76\",  // Text\n        \"QUIT_PORN_START_DATE\": \"a77\",  // Datetime\n        \"USER_S_GOLD_FRESHCOIN_BALANCE\": \"a78\",  // Number\n        \"USER_S_SILVER_FRESHCOIN_BALANCE\": \"a781\",  // Number\n        \"USER_S_GOLD_DRYCOIN_BALANCE\": \"a79\",  // Number\n        \"USER_S_SILVER_DRYCOIN_BALANCE\": \"a791\",  // Number\n        \"USER_S_GOLD_BLOCKED_COIN_BALANCE\": \"a80\",  // Number\n        \"USER_S_SILVER_BLOCKED_COIN_BALANCE\": \"a801\",  // Number\n        \"USER_S_GOLD_NOTCH_COIN_BALANCE\": \"a81\",  // Number\n        \"USER_S_SILVER_NOTCH_COIN_BALANCE\": \"a811\",  // Number\n        \"USER_S_BIOLOGICALSEX\": \"a82\",  // Radio\n        \"USER_S_OTHER_SEX_DETAIL\": \"a821\",  // Text\n        \"USER_S_SEX_DETAIL\": \"a822\",  // Text\n        \"USER_S_DATEOFBIRTH\": \"a83\",  // Datetime\n        \"USER_S_BLOODTYPE\": \"a84\",  // Radio\n        \"FITZPATRICKSKINTYPE\": \"a85\",  // Radio\n        \"WHEELCHAIRUSE\": \"a86\",  // Radio\n        \"USER_S_APP_SETTING_FOR_AFRESH\": \"a87\",  // Textarea\n        \"USER_S_APP_SETTING_FOR_ADRY\": \"a88\",  // Textarea\n        \"USER_S_APP_SETTING_FOR_ABLOCKED\": \"a89\",  // Textarea\n        \"USER_S_APP_SETTING_FOR_BENOTCH\": \"a90\",  // Textarea\n        \"USER_S_AI_CREDITS_FOR_AFRESH\": \"a91\",  // Number\n        \"USER_S_AI_CREDITS_FOR_ADRY\": \"a92\",  // Number\n        \"USER_S_AI_CREDITS_FOR_ABLOCKED\": \"a93\",  // Number\n        \"USER_S_AI_CREDITS_FOR_BENOTCH\": \"a94\",  // Number\n        \"USER_S_APP_SETTING_FOR_CHALLENGED\": \"a95\",  // Textarea\n        \"USER_S_APP_SETTING_FOR_CARECNC\": \"a96\",  // Textarea\n      },\n      opt: {\n        \"USER_S_GENERAL_ROLE_FOR_AFRESH\": { \"QUITTER\": \"b55\", \"DOCTOR\": \"b56\", \"RESEARCHER\": \"b57\" },\n        \"USER_S_GOAL_FOR_QUIT_SMOKING\": { \"GET_AFRESH\": \"b55\", \"GET_FRESHER\": \"b56\", \"STAY_FRESH\": \"b57\" },\n        \"USER_S_GOAL_FOR_QUIT_DRINKING_ALCOHOL\": { \"GET_ADRY\": \"b55\", \"GET_DRYER\": \"b56\", \"STAY_DRY\": \"b57\" },\n        \"USER_S_GOAL_FOR_QUIT_PORN\": { \"GET_ABLOCKED\": \"b55\", \"GET_MORE_BLOCKED\": \"b56\", \"STAY_BLOCKED\": \"b57\" },\n        \"AI_TONE\": { \"COACH\": \"b55\", \"FRIEND\": \"b56\", \"BUTLER\": \"b57\", \"FELLA\": \"b58\", \"CUSTOM\": \"b59\" },\n        \"ALLOWS_SPEAKING_F_WORD_IN_FELLA_MODE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"USER_FINISHED_OR_SKIPPED_ONBOARDING_FOR_AFRESH\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"USER_FINISHED_OR_SKIPPED_ONBOARDING_FOR_ADRY\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"USER_FINISHED_OR_SKIPPED_ONBOARDING_FOR_BENOTCH\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"USER_S_BIOLOGICALSEX\": { \"NOTSET_0\": \"b55\", \"FEMALE_1\": \"b56\", \"MALE_2\": \"b57\", \"OTHER_3\": \"b58\" },\n        \"USER_S_BLOODTYPE\": { \"NOTSET_0\": \"b55\", \"APOSITIVE_1\": \"b56\", \"ABPOSITIVE_5\": \"b57\", \"ABNEGATIVE_6\": \"b58\", \"ONEGATIVE_8\": \"b59\" },\n        \"FITZPATRICKSKINTYPE\": { \"NOTSET_0\": \"b55\", \"I_1\": \"b56\", \"V_5\": \"b57\", \"VI_6\": \"b58\", \"IV_4\": \"b59\" },\n        \"WHEELCHAIRUSE\": { \"NOTSET_0\": \"b55\", \"NO_1\": \"b56\", \"YES_2\": \"b57\" },\n      },\n    },\n    /** 258. User‘s extended profile 2 */\n    \"258\": {\n      id: 258,\n      slug: \"user_ext_profile_2\",\n      name: \"User‘s extended profile 2\",\n      f: {\n        \"ALLOW_EMERGENCY_LOCATION_REQUEST\": \"a55\",  // Radio\n        \"LOCATION_SHARE_IS_ON\": \"a56\",  // Radio\n        \"GENERAL_USER_ROLE\": \"a58\",  // Checkbox\n        \"IS_PAID_CARE_PROVIDER\": \"a59\",  // Radio\n        \"CARE_PROVIDER_IS_ACTIVE\": \"a60\",  // Radio\n        \"CARE_PROVIDER_IS_BACKGROUND_CHECKED\": \"a61\",  // Radio\n        \"CARE_PROVIDER_S_BACKGROUND_CHECK_DETAIL\": \"a62\",  // Text\n        \"CARE_PROVIDER_S_CANCELLATION_POLICY\": \"a63\",  // ?\n        \"CARE_PROVIDER_S_LOCATION\": \"a64\",  // ?\n        \"CARE_PROVIDER_OFFERS_SERVICE_TYPE\": \"a65\",  // Checkbox\n        \"CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE\": \"a66\",  // Number\n        \"CARE_PROVIDER_S_HOURLY_RATE_FOR_REMOTE_SERVICE\": \"a67\",  // Number\n        \"CARE_PROVIDER_OFFERS_CARE_SERVICE_TYPE\": \"a68\",  // Checkbox\n        \"CARE_PROVIDER_S_RATE_FOR_REMOTE_CHECKINS\": \"a69\",  // Number\n        \"CARE_PROVIDER_S_RATE_FOR_REMOTE_MEDICINE_SUPERVISION\": \"a70\",  // Number\n        \"CARE_PROVIDES_CAN_DRIVE\": \"a86\",  // Radio\n        \"CARE_PROVIDES_HAS_OWN_TRANSPORTATION\": \"a87\",  // Radio\n        \"CARE_PROVIDER_IS_A_NON_SMOKER\": \"a88\",  // Radio\n        \"CARE_PROVIDER_IS_EXPERIENCED_WITH\": \"a89\",  // Checkbox\n        \"CARED_ONE_S_AI_SYSTEM_PROMPT\": \"a90\",  // Text\n        \"CARED_ONE_S_LOW_BATTERY_LEVEL_TO_NOTIFY\": \"a102\",  // Number\n        \"CARED_ONE_S_TIME_NOT_REPORTING_TO_NOTIFY\": \"a103\",  // Number\n        \"CARED_ONE_S_CONDITION_TYPE\": \"a104\",  // Checkbox\n        \"CARED_ONE_S_CUSTOM_CONDITION_NAME\": \"a105\",  // Text\n        \"CARED_ONE_S_DESCRIPTION\": \"a106\",  // Text\n      },\n      opt: {\n        \"ALLOW_EMERGENCY_LOCATION_REQUEST\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"LOCATION_SHARE_IS_ON\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"GENERAL_USER_ROLE\": { \"CARED_ONE\": \"b55\", \"CARING_ONE\": \"b56\" },\n        \"IS_PAID_CARE_PROVIDER\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"CARE_PROVIDER_IS_ACTIVE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"CARE_PROVIDER_IS_BACKGROUND_CHECKED\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"CARE_PROVIDER_OFFERS_SERVICE_TYPE\": { \"IN_PERSON\": \"b55\", \"VIRTURE\": \"b56\" },\n        \"CARE_PROVIDER_OFFERS_CARE_SERVICE_TYPE\": { \"PET_CARE_AND_COMPANION\": \"b55\", \"IN_PERSON_CHILD_CARE_AND_COMPANION\": \"b56\", \"REMOTE_CHILD_COMPANION\": \"b57\", \"ADULT_CARE_AND_COMPANION\": \"b58\", \"ADULT_REMOTE_COMPANION\": \"b59\", \"IN_PERSON_ELDERLY_CARE_AND_COMPANION\": \"b60\", \"REMOTE_ELDERLY_COMPANION\": \"b61\", \"HOUSEKEEPING\": \"b62\", \"ERRAND_AND_DELIVERY\": \"b63\", \"TRANSPORTATION\": \"b64\", \"MEDICAL_ESCORT\": \"b65\", \"IN_PERSON_CHECKIN\": \"b66\", \"REMOTE_CHECKIN\": \"b67\", \"REMOTE_MEDICINE_SUPERVISION\": \"b68\" },\n        \"CARE_PROVIDES_CAN_DRIVE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"CARE_PROVIDES_HAS_OWN_TRANSPORTATION\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"CARE_PROVIDER_IS_A_NON_SMOKER\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"CARE_PROVIDER_IS_EXPERIENCED_WITH\": { \"NEWBORN_UP_TO_12_MONTHS\": \"b55\", \"TODDLER_1_3_YEARS\": \"b56\", \"EARLY_SCHOOL_AGE_4_6_YEARS\": \"b57\", \"PRIMARY_SCHOOL_AGE_7_12_YEARS\": \"b58\", \"TEENAGER_12_YEARS\": \"b59\", \"TWINS_MULTIPLES\": \"b60\", \"SPECIAL_NEEDS_CHILDREN\": \"b61\" },\n        \"CARED_ONE_S_CONDITION_TYPE\": { \"SUBSTANCE_USE\": \"b55\", \"SUBSTANCE_USE_DISORDER\": \"b56\", \"BRAIN_CANCER\": \"b57\", \"BREAST_CANCER\": \"b58\", \"COLORECTAL_CANCER\": \"b59\", \"ENDOMETRIAL_UTERINE\": \"b60\", \"KIDNEY_BLADDER_CANCER\": \"b61\", \"LEUKEMIA\": \"b62\", \"LIVER_CANCER\": \"b63\", \"LUNG_CANCER\": \"b64\", \"LYMPHOMA\": \"b65\", \"MYELOMA_CANCER\": \"b66\", \"NEUROBLASTOMA\": \"b67\", \"ORAL_CANCER\": \"b68\", \"OSTEOSARCOMA\": \"b69\", \"OTHER_CANCER\": \"b70\", \"OVARIAN_CANCER\": \"b71\", \"PANCREATIC_CANCER\": \"b72\", \"PROSTATE_CANCER\": \"b73\", \"SKIN_MELANOMA_CANCER\": \"b74\", \"STOMACH_ESOPHAGEAL_CANCER\": \"b75\", \"THYROID_CANCER\": \"b76\", \"ANEURYSM\": \"b77\", \"ARTERY_DISEASE\": \"b78\", \"CARDIOVASCULAR_STROKE\": \"b79\", \"CONGENITAL_HEART_DISEASE\": \"b80\", \"HEART_ATTACK\": \"b81\", \"HEART_FAILURE\": \"b82\", \"HEART_SURGERY\": \"b83\", \"OTHER_CARDIOVASCULAR_STROKE\": \"b84\", \"STROKE\": \"b85\", \"CONGENITAL_IMMUNE_DISORDER\": \"b86\", \"COVID_19\": \"b87\", \"CYSTIC_FIBROSIS\": \"b89\", \"HEART_DEFECT\": \"b90\", \"HIV_AIDS\": \"b91\", \"LUPUS\": \"b92\", \"OTHER_CONGENITAL_IMMUNE_DISORDER\": \"b93\", \"ADOPTION\": \"b94\", \"COMPLICATIONS\": \"b95\", \"HIGH_RISK_PREGNANCY\": \"b96\", \"INFANT_CHILDBIRTH\": \"b97\", \"OTHER_INFANT_CHILDBIRTH\": \"b98\", \"PREMATURE_BIRTH\": \"b99\", \"BRAIN_INJURY\": \"b100\", \"BROKEN_BONES_INTERNAL_INJURY\": \"b101\", \"BURN\": \"b102\", \"INJURY\": \"b103\", \"MOTOR_VEHICLE_INJURY\": \"b104\", \"OTHER_INJURY\": \"b105\", \"SPINAL_CORD_INJURY\": \"b106\", \"WAR_INJURY\": \"b107\", \"ALS_AMYOTROPHIC_LATERAL_SCLEROSIS\": \"b108\", \"BRAIN_DAMAGE\": \"b110\", \"BRAIN_TUMOR_NON_CANCER\": \"b111\", \"CEREBRAL_PALSY\": \"b112\", \"DEMENTIA\": \"b113\", \"EPILEPSY_SEIZURE_DISORDERS\": \"b114\", \"MENTAL_ILLNESS\": \"b115\", \"MULTIPLE_SCLEROSIS\": \"b116\", \"NEUROLOGICAL_CONDITION\": \"b117\", \"OTHER_NEUROLOGICAL_CONDITION\": \"b118\", \"OTHER_CONDITION\": \"b120\", \"PREFER_NOT_TO_SAY\": \"b121\", \"BONE_MARROW_TRANSPLANT\": \"b122\", \"ORGAN_TRANSPLANT\": \"b123\", \"OTHER_SURGERY_TRANSPLANTATION\": \"b124\", \"SURGERY\": \"b125\", \"SURGERY_TRANSPLANTATION\": \"b126\", \"CROHNS_COLITIS_IBS\": \"b88\", \"ALZHEIMERS\": \"b109\", \"PARKINSONS\": \"b119\" },\n      },\n    },\n    /** 181. User‘s reason to quit */\n    \"181\": {\n      id: 181,\n      slug: \"users_reason_to_qui\",\n      name: \"User‘s reason to quit\",\n      f: {\n        \"NAME\": \"a55\",  // Text\n        \"DETAIL\": \"a56\",  // Textarea\n        \"REASONS_TO_QUIT_WHAT\": \"a57\",  // Radio\n        \"REASONS_TYPE\": \"a58\",  // Radio\n        \"OTHER_NAME\": \"a59\",  // Text\n      },\n      opt: {\n        \"REASONS_TO_QUIT_WHAT\": { \"QUIT_SMOKING\": \"b55\", \"QUIT_DRINKING\": \"b56\", \"QUIT_PORN\": \"b57\" },\n        \"REASONS_TYPE\": { \"MY_HEALTH\": \"b55\", \"MY_FAMILY\": \"b56\", \"MY_WELL_BEING\": \"b57\", \"TO_SAVE_MONEY\": \"b58\", \"TO_HAVE_A_CHILD\": \"b59\", \"MY_FREEDOM\": \"b60\", \"OTHER\": \"b61\" },\n      },\n    },\n    /** 153. User's quit plan */\n    \"153\": {\n      id: 153,\n      slug: \"users_quit_plan\",\n      name: \"User's quit plan\",\n      f: {\n        \"PLAN_NAME\": \"a55\",  // Text\n        \"QUIT_SMOKING_PLAN_TYPE\": \"a56\",  // Radio\n        \"QUIT_DRINKING_PLAN_TYPE\": \"a561\",  // Radio\n        \"QUIT_PORN_PLAN_TYPE\": \"a562\",  // Radio\n        \"AFRESH_METHOD\": \"a57\",  // Radio\n        \"ADRY_METHOD\": \"a571\",  // Radio\n        \"ABLOCKED_METHOD\": \"a572\",  // Radio\n        \"GRADUALLY_AFRESH_TIME_TARGET\": \"a59\",  // Number\n        \"GET_FRESHER_TARGET\": \"a60\",  // Number\n        \"COMBINES_WITH_NRT\": \"a61\",  // Radio\n        \"COMBINES_WITH_QUITTING_MEDICINE\": \"a62\",  // Radio\n        \"STATUS\": \"a63\",  // Radio\n        \"CUSTOM_AI_SYSTEM_PROMPT\": \"a64\",  // Textarea\n      },\n      opt: {\n        \"QUIT_SMOKING_PLAN_TYPE\": { \"GET_AFRESH\": \"b55\", \"GET_FRESHER\": \"b56\", \"STAY_FRESH\": \"b57\" },\n        \"QUIT_DRINKING_PLAN_TYPE\": { \"GET_ADRY\": \"b55\", \"GET_DRYER\": \"b56\", \"STAY_DRY\": \"b57\" },\n        \"QUIT_PORN_PLAN_TYPE\": { \"GET_ABLOCKED\": \"b55\", \"GET_MORE_BLOCKED\": \"b56\", \"STAY_BLOCKED\": \"b57\" },\n        \"AFRESH_METHOD\": { \"COLD_TURKEY_AFRESH\": \"b55\", \"GRADUALLY_AFRESH\": \"b56\" },\n        \"ADRY_METHOD\": { \"GET_ADRY_NOW\": \"b55\", \"GRADUALLY_ADRY\": \"b56\" },\n        \"ABLOCKED_METHOD\": { \"GET_ABLOCKED_NOW\": \"b55\", \"GRADUALLY_ABLOCKED\": \"b56\" },\n        \"COMBINES_WITH_NRT\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"COMBINES_WITH_QUITTING_MEDICINE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"STATUS\": { \"DRAFT\": \"b55\", \"ACTIVE\": \"b56\", \"PAUSED\": \"b57\", \"COMPLETED\": \"b58\", \"ABANDONED\": \"b59\" },\n      },\n    },\n    /** 51. User's blocked keyword and domain */\n    \"51\": {\n      id: 51,\n      slug: \"blocked_keyword\",\n      name: \"User's blocked keyword and domain\",\n      f: {\n        \"PURPOSE_OF_BLOCK\": \"a55\",  // Radio\n        \"OTHER_PURPOSE_NAME\": \"a56\",  // Text\n        \"BLOCKED_KEYWORDS\": \"a57\",  // Text\n        \"BLOCKED_DOMAINS\": \"a58\",  // Text\n      },\n      opt: {\n        \"PURPOSE_OF_BLOCK\": { \"QUIT_SMOKING\": \"b55\", \"QUIT_DRINKING\": \"b56\", \"QUIT_PORN\": \"b57\", \"OTHER\": \"b58\" },\n      },\n    },\n    /** 171. User's apple health or google health log event */\n    \"171\": {\n      id: 171,\n      slug: \"apple_health_or_goog\",\n      name: \"User's apple health or google health log event\",\n      f: {\n        \"APPLE_HEALTH_OR_GOOGLE_HEALTH_LOG_TYPE_SLUG\": \"a55\",  // Text\n        \"APPLE_HEALTH_OR_GOOGLE_HEALTH_LOG_TYPE_VALUE\": \"a56\",  // Textarea\n        \"START_TIME\": \"a57\",  // Datetime\n        \"END_TIME\": \"a58\",  // Datetime\n        \"TIME\": \"a59\",  // Datetime\n        \"SOURCE\": \"a60\",  // Radio\n        \"APPLE_HEALTH_OR_GOOGLE_HEALTH_LOG_UUID\": \"a61\",  // Text\n        \"RECORDING_DEVICE\": \"a62\",  // Text\n      },\n      opt: {\n        \"SOURCE\": { \"APPLE_HEALTH\": \"b55\", \"GOOGLE_HEALTH\": \"b56\" },\n        \"RECORDING_DEVICE\": { \"SLEEPCHANGES\": \"b56\", \"HAIRLOSS\": \"b57\", \"SORETHROAT\": \"b58\", \"SINUSCONGESTION\": \"b59\", \"WHEEZING\": \"b60\", \"GENERALIZEDBODYACHE\": \"b61\", \"HOTFLASHES\": \"b62\", \"WATERSPORTS\": \"b63\", \"RUGBY\": \"b64\", \"SOCCER\": \"b65\", \"SOFTBALL\": \"b66\", \"VOLLEYBALL\": \"b67\", \"CROSSTRAINING\": \"b68\", \"MIXEDCARDIO\": \"b69\", \"HIGHINTENSITYINTERVALTRAINING\": \"b70\", \"JUMPROPE\": \"b71\", \"STAIRCLIMBING\": \"b72\", \"STAIRS\": \"b73\", \"STEPTRAINING\": \"b74\", \"FITNESSGAMING\": \"b75\", \"DIETARYPANTOTHENICACID\": \"b76\", \"DIETARYPHOSPHORUS\": \"b77\", \"DIETARYPOTASSIUM\": \"b78\", \"DIETARYPROTEIN\": \"b79\", \"DIETARYRIBOFLAVIN\": \"b80\", \"DIETARYSELENIUM\": \"b81\", \"DIETARYSODIUM\": \"b82\", \"DIETARYSUGAR\": \"b83\", \"DIETARYTHIAMIN\": \"b84\", \"DIETARYVITAMINA\": \"b85\", \"DIETARYVITAMINB12\": \"b86\", \"DIETARYVITAMINB6\": \"b87\", \"DIETARYVITAMINC\": \"b88\", \"DIETARYVITAMIND\": \"b89\", \"DIETARYVITAMINE\": \"b90\", \"DIETARYVITAMINK\": \"b91\", \"DIETARYWATER\": \"b92\", \"DIETARYZINC\": \"b93\" },\n      },\n    },\n    /** 161. User’s other log event */\n    \"161\": {\n      id: 161,\n      slug: \"users_log_event\",\n      name: \"User’s other log event\",\n      f: {\n        \"LOG_EVENT_NAME\": \"a55\",  // Text\n        \"LOG_EVENT_CONTENT\": \"a56\",  // Textarea\n        \"LOG_EVENT_TYPE\": \"a57\",  // Radio\n        \"LOG_SMOKING_TYPE\": \"a58\",  // Radio\n        \"LOG_DRINKING_ALCOHOL_TYPE\": \"a59\",  // Radio\n        \"LOG_PORN_TYPE\": \"a60\",  // Radio\n        \"LOG_EVENT_TIME\": \"a61\",  // Datetime\n        \"MOOD_DETAIL\": \"a62\",  // Textarea\n        \"CRAVING_INTENSITY_BEFORE_CRAVING\": \"a63\",  // Number\n        \"CRAVING_SMOKING_CONTEXT\": \"a64\",  // Checkbox\n        \"OTHER_CRAVING_SMOKING_CONTEXT_CONTENT\": \"a65\",  // Text\n        \"ENERGY_LEVEL\": \"a66\",  // Number\n        \"SLEEP_QUALITY\": \"a67\",  // Text\n        \"STRESS_LEVEL\": \"a68\",  // Text\n        \"CRAVING_SMOKINGTRIGGER_CATEGORY\": \"a69\",  // Radio\n        \"OTHER_CRAVING_SMOKING_TRIGGER\": \"a70\",  // Text\n        \"LOCATION_CATEGORY\": \"a71\",  // Radio\n        \"LOCATION_DETAIL\": \"a72\",  // Textarea\n        \"CBT_THOUGHT_RECORD\": \"a73\",  // Textarea\n        \"CBT_COGNITIVE_DISTORTION_TYPE\": \"a74\",  // Textarea\n        \"CBT_REFRAMED_THOUGHT\": \"a75\",  // Textarea\n        \"CRAVING_INTENSITY_AFTER_CRAVING_SMOKING_OR_WHATEVER_SHIT\": \"a76\",  // Number\n        \"NOTE_CONTENT\": \"a77\",  // Textarea\n        \"MEAL_TYPE\": \"a78\",  // Radio\n        \"CUSTOM_FOOD_MEAL_OR_SUPPLEMENT_DETAIL\": \"a79\",  // Textarea\n        \"CUSTOM_RECIPE_DETAIL\": \"a80\",  // Textarea\n        \"CUSTOM_WORKOUT_DETAIL\": \"a81\",  // Textarea\n        \"CUSTOM_MEDICINE_DETAIL\": \"a82\",  // Textarea\n        \"DOSE_EVENT_LOG_STATUS\": \"a83\",  // Radio (Apple HKMedicationDoseEvent.LogStatus)\n        \"DOSE_EVENT_NOTE\": \"a84\",  // Textarea\n        \"DOSE_QUANTITY\": \"a85\",  // Number (Apple doseQuantity)\n        \"SCHEDULED_DOSE_QUANTITY\": \"a86\",  // Number (Apple scheduledDoseQuantity)\n        \"DOSE_UNIT\": \"a87\",  // Text (UCUM)\n        \"SCHEDULED_DATE\": \"a88\",  // Datetime (Apple scheduledDate)\n        \"SCHEDULE_TYPE\": \"a89\",  // Radio (Apple ScheduleType)\n        \"CONCEPT_IDENTIFIER\": \"a90\",  // Text (Apple HKMedicationConcept.identifier)\n        \"CONCEPT_DISPLAY_TEXT\": \"a91\",  // Text\n        \"CONCEPT_GENERAL_FORM\": \"a92\",  // Text\n        \"CLINICAL_CODING_SYSTEM\": \"a93\",  // Text\n        \"CLINICAL_CODING_CODE\": \"a94\",  // Text (RxCUI)\n        \"CLINICAL_CODING_VERSION\": \"a95\",  // Text\n        \"CHECK_TYPE\": \"a96\",  // Radio\n        \"LOG_MEDICINE_NOTE\": \"a97\",  // Text\n        \"LOG_CHECKIN_NOTE\": \"a98\",  // Text\n        \"CHECKED_BY_AI\": \"a99\",  // Radio\n        \"FOR_APP\": \"a100\",  // Text (lowercase app name)\n        \"AI_MEMORY_STATUS\": \"a101\",  // Radio\n        \"AI_MEMORY_SOURCE\": \"a102\",  // Radio\n      },\n      opt: {\n        \"LOG_EVENT_TYPE\": { \"SMOKING\": \"b55\", \"DRINKING_ALCOHOL\": \"b56\", \"PORN\": \"b57\", \"WATER\": \"b58\", \"FOOD\": \"b59\", \"BREATHING_EXERCISE\": \"b60\", \"WORKOUT\": \"b61\", \"MOTIVATION\": \"b62\", \"PLEDGE\": \"b63\", \"MEMORY\": \"b64\", \"SLEEP\": \"b65\", \"MOOD\": \"b66\", \"APPLE_HEALTH_SYMPTOMS\": \"b67\", \"CUSTOM_HEALTH_SYMPTOMS\": \"b68\", \"CUSTOM_MEDICINE\": \"b69\", \"AI_MEMORY\": \"b70\", \"NOTE\": \"b71\", \"FASTING\": \"b72\" },\n        \"LOG_SMOKING_TYPE\": { \"SMOKED\": \"b55\", \"RESISTED\": \"b56\" },\n        \"LOG_DRINKING_ALCOHOL_TYPE\": { \"DRANK\": \"b55\", \"RESISTED\": \"b56\" },\n        \"LOG_PORN_TYPE\": { \"WATCHED\": \"b55\", \"RESISTED\": \"b56\" },\n        \"CRAVING_SMOKING_CONTEXT\": { \"I_M_TAKING_A_BREAK\": \"b56\", \"OTHER\": \"b57\", \"IM_DRINKING_A_GLASS_OF_ALCOHOL\": \"b55\" },\n        \"CRAVING_SMOKINGTRIGGER_CATEGORY\": { \"STRESS\": \"b55\", \"SOCIAL\": \"b56\", \"BOREDOM\": \"b57\", \"ALCOHOL\": \"b58\", \"COFFEE\": \"b59\", \"MEAL\": \"b60\", \"EMOTION\": \"b61\", \"HABIT\": \"b62\", \"OTHER\": \"b63\" },\n        \"LOCATION_CATEGORY\": { \"HOME\": \"b55\", \"WORK\": \"b56\", \"BAR\": \"b57\", \"RESTAURANT\": \"b58\", \"CAR\": \"b59\", \"OUTDOOR\": \"b60\" },\n        \"MEAL_TYPE\": { \"BREAKFAST\": \"b55\", \"LUNCH\": \"b56\", \"DINNER\": \"b57\", \"SNACK\": \"b58\" },\n        \"DOSE_EVENT_LOG_STATUS\": { \"NOT_INTERACTED\": \"b55\", \"NOT_LOGGED\": \"b56\", \"NOTIFICATION_NOT_SENT\": \"b57\", \"SKIPPED\": \"b58\", \"SNOOZED\": \"b59\", \"TAKEN\": \"b60\" },\n        \"SCHEDULE_TYPE\": { \"ASNEEDED\": \"b55\", \"SCHEDULE\": \"b56\" },\n        \"CHECK_TYPE\": { \"TAKEN\": \"b55\", \"SKIPPED\": \"b56\", \"MISSED\": \"b57\" },\n        \"CHECKED_BY_AI\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"AI_MEMORY_STATUS\": { \"DRAFT\": \"b55\", \"PENDING_APPROVAL\": \"b56\", \"ACTIVE\": \"b57\", \"ARCHIVED\": \"b58\" },\n        \"AI_MEMORY_SOURCE\": { \"USER_WRITTEN\": \"b55\", \"AI_SUGGESTED\": \"b56\" },\n      },\n    },\n    /** 177. User’s custom workout */\n    \"177\": {\n      id: 177,\n      slug: \"users_custom_workout\",\n      name: \"User’s custom workout\",\n      f: {\n        \"CUSTOM_WORKOUT_NAME\": \"a55\",  // Text\n      },\n      opt: {\n      },\n    },\n    /** 178. User’s custom symptom */\n    \"178\": {\n      id: 178,\n      slug: \"users_custom_sympto\",\n      name: \"User’s custom symptom\",\n      f: {\n        \"CUSTOM_SYMPTOM_NAME\": \"a55\",  // Text\n      },\n      opt: {\n      },\n    },\n    /** 162. Use's non-custom and custom choice and alternative choice */\n    \"162\": {\n      id: 162,\n      slug: \"choice_and_alternative_choice\",\n      name: \"Use's non-custom and custom choice and alternative choice\",\n      f: {\n        \"THIS_CHOICE_IS_A_NON_CUSTOM_CHOICE\": \"a55\",  // Radio\n        \"NON_CUSTOM_CHOICE_AND_ALTERNATIVE_CHOICE_NAME\": \"a56\",  // Text\n        \"NON_CUSTOM_CHOICE_AND_ALTERNATIVE_CHOICE_DISPLAY_ORDER\": \"a57\",  // Text\n        \"CUSTOM_CHOICE_AND_ALTERNATIVE_CHOICE_NAME\": \"a58\",  // Text\n        \"CUSTOM_ALTERNATIVE_STRATEGY_ICON\": \"a59\",  // Text\n      },\n      opt: {\n        \"THIS_CHOICE_IS_A_NON_CUSTOM_CHOICE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 121. Chat Conversation */\n    \"121\": {\n      id: 121,\n      slug: \"chat_conversation\",\n      name: \"Chat Conversation\",\n      f: {\n        \"CHAT_TYPE\": \"a55\",  // Radio\n        \"CHAT_NAME\": \"a56\",  // Text\n        \"LAST_MESSAGE_AT\": \"a57\",  // Datetime\n        \"APP\": \"a58\",  // Radio\n      },\n      opt: {\n        \"CHAT_TYPE\": { \"ONE_TO_ONE\": \"b55\", \"MANY_USERS\": \"b56\", \"AI\": \"b57\" },\n        \"APP\": { \"AFRESH\": \"b55\", \"ADRY\": \"b56\", \"ABLOCKED\": \"b57\", \"BENOTCH\": \"b58\", \"CHALLENGED\": \"b59\", \"CARECNC\": \"b60\" },\n      },\n    },\n    /** 126. Chat Message */\n    \"126\": {\n      id: 126,\n      slug: \"chat_message\",\n      name: \"Chat Message\",\n      f: {\n        \"CHAT_MESSAGE_CONTENT\": \"a55\",  // Text\n        \"CHAT_MESSAGE_TYPE\": \"a56\",  // Radio\n        \"IMAGE_URL\": \"a57\",  // Text\n        \"PRICE_CARD_DATA\": \"a58\",  // Textarea\n      },\n      opt: {\n        \"CHAT_MESSAGE_TYPE\": { \"TEXT\": \"b55\", \"IMAGE\": \"b56\", \"AI\": \"b57\", \"SYSTEM_MESSAGE\": \"b58\", \"PRICE_CARD\": \"b59\" },\n      },\n    },\n    /** 185. Notification */\n    \"185\": {\n      id: 185,\n      slug: \"users_notification\",\n      name: \"Notification\",\n      f: {\n        \"NOTIFICATION_TYPE\": \"a55\",  // Radio\n        \"NOTIFICATION_TITLE\": \"a56\",  // Text\n        \"NOTIFICATION_CONTENT\": \"a57\",  // Textarea\n        \"ACTION_URL\": \"a58\",  // Text\n        \"NOTIFICATION_IS_READ\": \"a59\",  // Radio\n        \"THIS_IS_THE_NOTIFICATION_FOR_APP\": \"a60\",  // Radio\n      },\n      opt: {\n        \"NOTIFICATION_TYPE\": { \"USER_CHAT\": \"b55\", \"BOOKING\": \"b56\", \"SYSTEM\": \"b57\", \"LOCATION_ALERT\": \"b58\", \"CHECK_IN\": \"b59\", \"MEDICINE\": \"b60\" },\n        \"NOTIFICATION_IS_READ\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"THIS_IS_THE_NOTIFICATION_FOR_APP\": { \"AFRESH\": \"b55\", \"ADRY\": \"b56\", \"ABLOCKED\": \"b57\", \"BENOTCH\": \"b58\", \"CHALLENGED\": \"b59\", \"CARECNC\": \"b60\" },\n      },\n    },\n    /** 186. User's notification token */\n    \"186\": {\n      id: 186,\n      slug: \"users_notif_token\",\n      name: \"User's notification token\",\n      f: {\n        \"ENDPOINT_OR_TOKEN\": \"a55\",  // Text\n        \"NOTIFICATION_PROVIDER\": \"a56\",  // Radio\n        \"DEVICE_LABEL\": \"a57\",  // Text\n        \"AUTH_KEY\": \"a58\",  // Text\n        \"P256DH\": \"a59\",  // Text\n        \"IS_ACTIVE\": \"a60\",  // Radio\n        \"APP\": \"a61\",  // Radio\n      },\n      opt: {\n        \"NOTIFICATION_PROVIDER\": { \"WEB_PUSH_NOTIFICATION\": \"b55\", \"FIREBASE_FCM\": \"b56\", \"APPLE_APN\": \"b57\", \"J_PUSH\": \"b58\", \"WECHAT\": \"b59\" },\n        \"IS_ACTIVE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"APP\": { \"AFRESH\": \"b55\", \"ADRY\": \"b56\", \"ABLOCKED\": \"b57\", \"BENOTCH\": \"b58\", \"CHALLENGED\": \"b59\", \"CARECNC\": \"b60\" },\n      },\n    },\n    /** 187. User's calendar event */\n    \"187\": {\n      id: 187,\n      slug: \"users_calendar_event\",\n      name: \"User's calendar event\",\n      f: {\n        \"TITLE\": \"a55\",  // Text\n        \"DESCRIPTION\": \"a56\",  // Textarea\n        \"START_AT\": \"a57\",  // Datetime\n        \"END_AT\": \"a58\",  // Datetime\n        \"ALL_DAY\": \"a59\",  // Radio\n        \"CUSTOM_EVENT_TYPE\": \"a60\",  // Radio\n        \"LOCATION\": \"a61\",  // Text\n        \"TIMEZONE\": \"a62\",  // Text\n        \"STATUS\": \"a63\",  // Radio\n        \"PRIORITY\": \"a64\",  // Number\n        \"COLOR\": \"a65\",  // Colorpicker\n        \"RRULE\": \"a66\",  // Textarea\n        \"EXDATES\": \"a68\",  // Textarea\n        \"RDATES\": \"a69\",  // Textarea\n        \"RECURRENCE_ID\": \"a70\",  // Text\n        \"SHOW_AS\": \"a71\",  // Radio\n        \"VISIBILITY\": \"a72\",  // Radio\n        \"REMINDERS\": \"a73\",  // Textarea\n        \"IS_AVAILABILITY\": \"a74\",  // Radio\n        \"AVAILABILITY_NOTE\": \"a75\",  // Text\n        \"RSVP_REQUIRED\": \"a76\",  // Radio\n        \"ALLOW_COMMENTS\": \"a77\",  // Radio\n        \"EXTERNAL_SOURCE\": \"a78\",  // Radio\n        \"ICAL_UID\": \"a79\",  // Text\n        \"SEQUENCE\": \"a80\",  // Number\n        \"ETAG\": \"a81\",  // Text\n        \"GOOGLE_EVENT_ID\": \"a82\",  // Text\n        \"MEETING_URL\": \"a83\",  // Text\n        \"ATTACHMENTS\": \"a84\",  // Textarea\n        \"LAST_SYNC_AT\": \"a85\",  // Datetime\n        \"SYNC_TOKEN\": \"a86\",  // Text\n        \"GEO_LAT\": \"a87\",  // Text\n        \"GEO_LNG\": \"a88\",  // Text\n        \"TAGS\": \"a89\",  // Text\n        \"CUSTOM_DATA\": \"a90\",  // Textarea\n        \"APP\": \"a91\",  // Radio\n        \"MEDICATION_CONCEPT_IDENTIFIER\": \"a92\",  // Text\n        \"MEDICATION_DOSE_QUANTITY\": \"a93\",  // Number\n        \"MEDICATION_DOSE_UNIT\": \"a94\",  // Text\n        \"MEDICATION_SCHEDULE_TYPE\": \"a95\",  // Radio\n        \"MEDICINE_LOG_TYPE\": \"a96\",  // Radio\n        \"CHECKIN_LOG_TYPE\": \"a97\",  // Radio\n        \"MEDICINE_STOCK\": \"a98\",  // Number\n        \"MEDICINE_REFILL\": \"a99\",  // Number\n        \"MEDICINE_PRESCRIBER\": \"a100\",  // Text\n        \"MEDICINE_BOUGHT_PHARMACY\": \"a101\",  // Text\n        \"MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING\": \"a102\",  // Number\n      },\n      opt: {\n        \"ALL_DAY\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"CUSTOM_EVENT_TYPE\": { \"MEDICINE_SCHEDULE\": \"b55\", \"HEALTH_CHECKIN\": \"b56\", \"HABIT\": \"b57\", \"TODO\": \"b58\" },\n        \"STATUS\": { \"CONFIRMED\": \"b55\", \"TENTATIVE\": \"b56\", \"CANCELLED\": \"b57\" },\n        \"SHOW_AS\": { \"BUSY\": \"b55\", \"FREE\": \"b56\", \"TENTATIVE\": \"b57\", \"UNAVAILABLE\": \"b58\" },\n        \"VISIBILITY\": { \"DEFAULT\": \"b55\", \"PUBLIC\": \"b56\", \"PRIVATE\": \"b57\", \"CONFIDENTIAL\": \"b58\" },\n        \"IS_AVAILABILITY\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"RSVP_REQUIRED\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"ALLOW_COMMENTS\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"EXTERNAL_SOURCE\": { \"INTERNAL\": \"b55\", \"GOOGLE\": \"b56\", \"OUTLOOK\": \"b57\", \"APPLE\": \"b58\" },\n        \"APP\": { \"AFRESH\": \"b55\", \"ADRY\": \"b56\", \"ABLOCKED\": \"b57\", \"BENOTCH\": \"b58\", \"CHALLENGED\": \"b59\", \"CARECNC\": \"b60\" },\n        \"MEDICATION_SCHEDULE_TYPE\": { \"ASNEEDED\": \"b55\", \"SCHEDULE\": \"b56\" },\n        \"MEDICINE_LOG_TYPE\": { \"AI\": \"b55\", \"HUMAN\": \"b56\" },\n        \"CHECKIN_LOG_TYPE\": { \"AI\": \"b55\", \"HUMAN\": \"b56\" },\n      },\n    },\n    /** 6. FreshCoin Transaction */\n    \"6\": {\n      id: 6,\n      slug: \"freshcoin_transaction\",\n      name: \"FreshCoin Transaction\",\n      f: {\n        \"AMOUNT\": \"a55\",  // Number\n      },\n      opt: {\n      },\n    },\n    /** 192. User's subscription */\n    \"192\": {\n      id: 192,\n      slug: \"users_subscription\",\n      name: \"User's subscription\",\n      f: {\n        \"PRODUCT_ID\": \"a55\",  // Text\n        \"PLATFORM\": \"a56\",  // Radio\n        \"STATUS\": \"a57\",  // Radio\n        \"ORIGINAL_TRANSACTION_ID\": \"a58\",  // Text\n        \"PURCHASED_AT\": \"a59\",  // Datetime\n        \"EXPIRES_AT\": \"a60\",  // Datetime\n        \"AUTO_RENEW\": \"a61\",  // Radio\n        \"ENVIRONMENT\": \"a62\",  // Radio\n        \"LAST_EVENT_AT\": \"a63\",  // datetime\n        \"STORE_PAYLOAD\": \"a64\",  // textarea\n        \"PLAN\": \"a65\",  // Radio\n        \"THE_SUBSCRIPTION_IS_FOR_APP\": \"a66\",  // Radio\n      },\n      opt: {\n        \"PLATFORM\": { \"APPLE_APP_STORE\": \"b55\", \"GOOGLE_PLAY\": \"b56\", \"STRIPE\": \"b57\", \"MANUAL\": \"b58\", \"PROMO\": \"b59\" },\n        \"STATUS\": { \"ACTIVE\": \"b55\", \"IN_TRIAL\": \"b56\", \"IN_GRACE_PERIOD\": \"b57\", \"IN_BILLING_RETRY\": \"b58\", \"CANCELLED_BUT_NOT_EXPIRED\": \"b59\", \"EXPIRED\": \"b60\", \"REFUNDED_OR_REVOKED\": \"b61\", \"PAUSED\": \"b62\" },\n        \"AUTO_RENEW\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"ENVIRONMENT\": { \"PRODUCTION\": \"b55\", \"SANDBOX\": \"b56\" },\n        \"PLAN\": { \"MONTHLY\": \"b55\", \"QUARTERLY\": \"b56\", \"ANNUAL\": \"b57\", \"LIFETIME\": \"b58\" },\n        \"THE_SUBSCRIPTION_IS_FOR_APP\": { \"AFRESH\": \"b55\", \"ADRY\": \"b56\", \"ABLOCKED\": \"b57\", \"BENOTCH\": \"b58\" },\n      },\n    },\n    /** 193. User's ai credit */\n    \"193\": {\n      id: 193,\n      slug: \"users_credit_ledger\",\n      name: \"User's ai credit\",\n      f: {\n        \"PRODUCT_ID\": \"a55\",  // Text\n        \"PLATFORM\": \"a56\",  // Radio\n        \"ORIGINAL_TRANSACTION_ID\": \"a57\",  // Text\n        \"AMOUNT\": \"a58\",  // Number\n        \"REASON\": \"a59\",  // Radio\n        \"PURCHASED_AT\": \"a60\",  // Datetime\n        \"EXPIRES_AT\": \"a61\",  // Datetime\n        \"ENVIRONMENT\": \"a62\",  // Radio\n        \"STORE_PAYLOAD\": \"a63\",  // textarea\n        \"THE_SUBSCRIPTION_IS_FOR_APP\": \"a64\",  // Radio\n      },\n      opt: {\n        \"PLATFORM\": { \"APPLE_APP_STORE\": \"b55\", \"GOOGLE_PLAY\": \"b56\", \"STRIPE\": \"b57\", \"MANUAL\": \"b58\", \"PROMO\": \"b59\" },\n        \"REASON\": { \"PURCHASE\": \"b55\", \"SUBSCRIPTION_GRANT\": \"b56\", \"PROMO_OR_GIFT\": \"b57\", \"REFUND_OR_REVOKE\": \"b58\", \"SPEND_ON_CHAT\": \"b59\", \"SPEND_ON_SCAN\": \"b60\", \"MANUAL_ADJUSTMENT\": \"b61\", \"SIGN_UP_REWARD\": \"b62\", \"INVITE_REWARD\": \"b63\" },\n        \"ENVIRONMENT\": { \"PRODUCTION\": \"b55\", \"SANDBOX\": \"b56\" },\n        \"THE_SUBSCRIPTION_IS_FOR_APP\": { \"AFRESH\": \"b55\", \"ADRY\": \"b56\", \"ABLOCKED\": \"b57\", \"BENOTCH\": \"b58\" },\n      },\n    },\n    /** 198. Cared one's information card */\n    \"198\": {\n      id: 198,\n      slug: \"cared_one_info_card\",\n      name: \"Cared one's information card\",\n      f: {\n        \"CARED_ONE_S_NAME\": \"a55\",  // Text\n        \"CARED_ONE_S_DESCRIPTION\": \"a56\",  // Textarea\n        \"CARED_ONE_S_INFORMATION_CARD_NAME\": \"a57\",  // Text\n        \"STATUS\": \"a58\",  // Radio\n        \"DISPLAYS_LOCATION\": \"a59\",  // Radio\n        \"PUBLIC_SHARE_STARTS_AT\": \"a60\",  // Datetime\n        \"PUBLIC_SHARE_EXPIRES_AT\": \"a61\",  // Datetime\n        \"SHARE_VISIBILITY\": \"a62\",  // Radio\n        \"SHARE_VISIBILITY_AFTER_PUBLIC_EXPIRES\": \"a621\",  // Radio\n        \"PUBLIC_SHARE_EXPIRES\": \"a622\",  // Radio\n        \"CARED_ONE_S_INFORMATION_CARD_DESCRIPTION\": \"a63\",  // Text\n      },\n      opt: {\n        \"STATUS\": { \"DRAFT\": \"b55\", \"ACTIVE\": \"b56\", \"PAUSED\": \"b57\" },\n        \"DISPLAYS_LOCATION\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"SHARE_VISIBILITY\": { \"VISIBLE_TO_PUBLIC\": \"b55\", \"VISIBLE_TO_THE_CARE_GROUP_OF_THE_CARED_ONE\": \"b56\", \"VISIBLE_TO_CAREGIVERS_OF_THE_CARED_ONE\": \"b57\", \"VISIBLE_TO_THE_CARE_GROUP_OF_THE_CARED_ONE_AND_THE_CAREGIVERS_OF_THE_CARED_ONE\": \"b58\" },\n        \"SHARE_VISIBILITY_AFTER_PUBLIC_EXPIRES\": { \"VISIBLE_TO_THE_CARE_GROUP_OF_THE_CARED_ONE\": \"b56\", \"VISIBLE_TO_CAREGIVERS_OF_THE_CARED_ONE\": \"b57\", \"VISIBLE_TO_THE_CARE_GROUP_OF_THE_CARED_ONE_AND_THE_CAREGIVERS_OF_THE_CARED_ONE\": \"b58\" },\n        \"PUBLIC_SHARE_EXPIRES\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 199. Care Group */\n    \"199\": {\n      id: 199,\n      slug: \"care_group\",\n      name: \"Care Group\",\n      f: {\n        \"NAME\": \"a55\",  // Text\n        \"DESCRIPTION\": \"a56\",  // Textarea\n        \"GROUP_TYPE\": \"a57\",  // Radio\n        \"JOIN_CODE\": \"a58\",  // Text\n        \"STATUS\": \"a59\",  // Radio\n      },\n      opt: {\n        \"GROUP_TYPE\": { \"PUBLIC\": \"b55\", \"PRIVATE\": \"b56\" },\n        \"STATUS\": { \"ACTIVE\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 200. Care group invite link */\n    \"200\": {\n      id: 200,\n      slug: \"care_group_invite\",\n      name: \"Care group invite link\",\n      f: {\n        \"TOKEN\": \"a55\",  // Text\n        \"NAME\": \"a56\",  // Text\n        \"EXPIRES_AT\": \"a57\",  // Datetime\n        \"MAX_USES\": \"a58\",  // Number\n        \"USE_COUNT\": \"a59\",  // Number\n        \"IS_REVOKED\": \"a60\",  // Radio\n        \"NOTE\": \"a61\",  // Textarea\n        \"THE_USER_IS_INVITED_AS\": \"a62\",  // Radio\n        \"CUSTOM_OR_APP_NATIVE_GENERATED\": \"a63\",  // Radio\n      },\n      opt: {\n        \"IS_REVOKED\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"THE_USER_IS_INVITED_AS\": { \"NORMAL_GROUP_MEMBER\": \"b55\", \"OWNER\": \"b56\", \"ADMIN\": \"b57\" },\n        \"CUSTOM_OR_APP_NATIVE_GENERATED\": { \"CUSTOM\": \"b55\", \"APP_NATIVE_GENERATED\": \"b56\" },\n      },\n    },\n    /** 201. The related private member groups of one 199. care group */\n    \"201\": {\n      id: 201,\n      slug: \"care_group_pmg\",\n      name: \"The related private member groups of one 199. care group\",\n      f: {\n        \"NAME\": \"a55\",  // Text\n        \"DESCRIPTION\": \"a56\",  // Textarea\n        \"COLOR\": \"a57\",  // Colorpicker\n      },\n      opt: {\n      },\n    },\n    /** 202. The related not too special posts of one care group */\n    \"202\": {\n      id: 202,\n      slug: \"care_group_post\",\n      name: \"The related not too special posts of one care group\",\n      f: {\n        \"TYPE\": \"a55\",  // Radio\n        \"TITLE\": \"a56\",  // Text\n        \"CONTENT\": \"a57\",  // Text\n        \"IS_PINNED\": \"a58\",  // Radio\n        \"SCHEDULED_AT\": \"a59\",  // Datetime\n      },\n      opt: {\n        \"TYPE\": { \"DISCUSSION\": \"b55\", \"ANNOUNCEMENT\": \"b56\", \"WISH\": \"b57\" },\n        \"IS_PINNED\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 203. Care Group Gallery */\n    \"203\": {\n      id: 203,\n      slug: \"care_group_gallery\",\n      name: \"Care Group Gallery\",\n      f: {\n        \"IMAGE\": \"a55\",  // Media\n        \"IMAGE_DESCRIPTION\": \"a56\",  // Textarea\n        \"TAKEN_AT\": \"a57\",  // Datetime\n      },\n      opt: {\n      },\n    },\n    /** 204. Care Task */\n    \"204\": {\n      id: 204,\n      slug: \"care_task\",\n      name: \"Care Task\",\n      f: {\n        \"TITLE\": \"a55\",  // Text\n        \"DESCRIPTION\": \"a56\",  // textarea\n        \"TASK_TYPE\": \"a57\",  // Checkbox\n        \"PEOPLE_NEEDED\": \"a58\",  // Number\n        \"LOCATION\": \"a59\",  // Text\n        \"PHOTO\": \"a60\",  // ?\n        \"DATE_OF_THE_TASK\": \"a61\",  // Date\n        \"TASK_START_TIME\": \"a62\",  // Datetime\n        \"TASK_END_TIME\": \"a63\",  // Datetime\n        \"TASK_COMPLETED_AT\": \"a64\",  // Datetime\n        \"TASK_HELP_STATUS\": \"a65\",  // Radio\n        \"TASK_FINISH_STATUS\": \"a66\",  // Radio\n        \"DUE_DATE\": \"a67\",  // Datetime\n        \"NEEDS_PAYMENT\": \"a68\",  // Radio\n        \"PRICE\": \"a69\",  // Text\n      },\n      opt: {\n        \"TASK_TYPE\": { \"PREPARING_MEALS\": \"b55\", \"GIVING_RIDES\": \"b56\", \"SHOPPING\": \"b57\", \"CHILDCARE\": \"b58\", \"VISITS\": \"b59\", \"COVERAGE\": \"b60\", \"MEDICATIONS_MEDICAL_CARE\": \"b61\", \"MISCELLANEOUS\": \"b62\", \"OCCASIONS\": \"b63\" },\n        \"TASK_HELP_STATUS\": { \"TASK_DOESN_T_NEED_HELP\": \"b55\", \"TASK_NEEDS_HELP\": \"b56\", \"TASK_HAS_FOUND_HELP\": \"b57\" },\n        \"TASK_FINISH_STATUS\": { \"NOT_FINISHED\": \"b55\", \"FINISHED\": \"b56\" },\n        \"NEEDS_PAYMENT\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 206. Medicine log */\n    \"206\": {\n      id: 206,\n      slug: \"medicine_log\",\n      name: \"Medicine log\",\n      f: {\n        \"DOSE_EVENT_LOG_STATUS\": \"a55\",  // Radio\n        \"DOSE_EVENT_NOTE\": \"a56\",  // Textarea\n        \"DOSE_QUANTITY\": \"a57\",  // Number\n        \"SCHEDULED_DOSE_QUANTITY\": \"a58\",  // Number\n        \"DOSE_UNIT\": \"a59\",  // Text\n        \"SCHEDULED_DATE\": \"a60\",  // Datetime\n        \"SCHEDULE_TYPE\": \"a61\",  // Radio\n        \"CONCEPT_IDENTIFIER\": \"a62\",  // Text\n        \"CONCEPT_DISPLAY_TEXT\": \"a63\",  // Text\n        \"CONCEPT_GENERAL_FORM\": \"a64\",  // Text\n        \"CLINICAL_CODING_SYSTEM\": \"a65\",  // Text\n        \"CLINICAL_CODING_CODE\": \"a66\",  // Text\n        \"CLINICAL_CODING_VERSION\": \"a67\",  // Text\n        \"DOSE_LOGGED_TIME\": \"a68\",  // Datetime\n      },\n      opt: {\n        \"DOSE_EVENT_LOG_STATUS\": { \"NOTINTERACTED\": \"b55\", \"NOTLOGGED\": \"b56\", \"NOTIFICATIONNOTSENT\": \"b57\", \"SKIPPED\": \"b58\", \"SNOOZED\": \"b59\", \"TAKEN\": \"b60\" },\n        \"SCHEDULE_TYPE\": { \"ASNEEDED\": \"b55\", \"SCHEDULE\": \"b56\" },\n      },\n    },\n    /** 197. Cared one's care note */\n    \"197\": {\n      id: 197,\n      slug: \"care_note\",\n      name: \"Cared one's care note\",\n      f: {\n        \"TITLE\": \"a55\",  // Text\n        \"CONTENT\": \"a56\",  // Textarea\n      },\n      opt: {\n      },\n    },\n    /** 209. Cared one's care tip */\n    \"209\": {\n      id: 209,\n      slug: \"care_tip\",\n      name: \"Cared one's care tip\",\n      f: {\n        \"TITLE\": \"a55\",  // Text\n        \"CONTENT\": \"a56\",  // Textarea\n        \"CATEGORY\": \"a57\",  // Radio\n        \"IS_PINNED\": \"a58\",  // Radio\n      },\n      opt: {\n        \"CATEGORY\": { \"TIP\": \"b55\", \"AVOID\": \"b56\" },\n        \"IS_PINNED\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 210. Cared one's care plan */\n    \"210\": {\n      id: 210,\n      slug: \"care_plan\",\n      name: \"Cared one's care plan\",\n      f: {\n        \"TITLE\": \"a55\",  // Text\n        \"CONTENT\": \"a56\",  // Textarea\n        \"IS_PINNED\": \"a57\",  // Radio\n      },\n      opt: {\n        \"IS_PINNED\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 211. Cared one's emergency contact person */\n    \"211\": {\n      id: 211,\n      slug: \"emergency_contact\",\n      name: \"Cared one's emergency contact person\",\n      f: {\n        \"NAME\": \"a55\",  // Text\n        \"DETAIL\": \"a56\",  // Textarea\n        \"PHONE\": \"a57\",  // Text\n        \"ADDRESS\": \"a58\",  // Text\n        \"RELATIONSHIP\": \"a59\",  // Text\n        \"NOTE\": \"a60\",  // Text\n      },\n      opt: {\n      },\n    },\n    /** 212. Cared one's care document */\n    \"212\": {\n      id: 212,\n      slug: \"care_document\",\n      name: \"Cared one's care document\",\n      f: {\n        \"NAME\": \"a55\",  // Text\n        \"CONTENT\": \"a56\",  // Textarea\n        \"ATTACHMENTS\": \"a57\",  // Gallery\n      },\n      opt: {\n      },\n    },\n    /** 213. The current location of one user */\n    \"213\": {\n      id: 213,\n      slug: \"current_location\",\n      name: \"The current location of one user\",\n      f: {\n        \"LATITUDE\": \"a55\",  // Text\n        \"LONGITUDE\": \"a56\",  // Text\n        \"ACCURACY_METERS\": \"a57\",  // Number\n        \"ALTITUDE_METERS\": \"a58\",  // Number\n        \"HEADING_DEGREES\": \"a59\",  // Number\n        \"SPEED\": \"a60\",  // Number\n        \"MOVING_TYPE\": \"a62\",  // Radio\n        \"PLATFORM\": \"a63\",  // Radio\n        \"BATTERY_LEVEL\": \"a64\",  // Number\n        \"PHONE_IS_CHARING\": \"a65\",  // Radio\n        \"ADDRESS_TEXT\": \"a66\",  // Text\n        \"CAPTURED_AT\": \"a67\",  // Datetime\n        \"IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION\": \"a68\",  // Radio\n      },\n      opt: {\n        \"MOVING_TYPE\": { \"STATIONARY\": \"b55\", \"WALKING\": \"b56\", \"RUNNING\": \"b57\", \"CYCLING\": \"b58\", \"AUTOMOTIVE\": \"b59\", \"UNKNOWN\": \"b60\" },\n        \"PLATFORM\": { \"IOS\": \"b55\", \"ANDROID\": \"b56\", \"WEB\": \"b57\" },\n        \"PHONE_IS_CHARING\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n        \"IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 214. Safe Zone */\n    \"214\": {\n      id: 214,\n      slug: \"safe_zone\",\n      name: \"Safe Zone\",\n      f: {\n        \"ZONE_TYPE\": \"a55\",  // Radio\n        \"SHAPE_TYPE\": \"a56\",  // Radio\n        \"ZONE_NAME\": \"a57\",  // Text\n        \"ZONE_DESCRIPTION\": \"a58\",  // Text\n        \"CUSTOM_COLOR\": \"a59\",  // Colorpicker\n        \"LATITUDE\": \"a60\",  // Text\n        \"LONGITUDE\": \"a61\",  // Text\n        \"RADIUS_METERS\": \"a62\",  // Number\n        \"POLYGON_POINTS\": \"a63\",  // Textarea\n        \"NOTIFY_ON_ENTER\": \"a64\",  // Radio\n        \"NOTIFY_ON_EXIT\": \"a65\",  // Radio\n        \"SCHEDULE_ENABLED\": \"a66\",  // Radio\n        \"SCHEDULE_START_TIME\": \"a67\",  // Textarea\n        \"SCHEDULE_END_TIME\": \"a68\",  // Textarea\n        \"IS_ACTIVE\": \"a69\",  // Radio\n      },\n      opt: {\n        \"ZONE_TYPE\": { \"SAFE\": \"b55\", \"DANGER\": \"b56\", \"CUSTOM\": \"b57\" },\n        \"SHAPE_TYPE\": { \"RADIUS\": \"b55\", \"POLYGON\": \"b56\" },\n        \"NOTIFY_ON_ENTER\": { \"OFF\": \"b55\", \"ON\": \"b56\" },\n        \"NOTIFY_ON_EXIT\": { \"OFF\": \"b55\", \"ON\": \"b56\" },\n        \"SCHEDULE_ENABLED\": { \"OFF\": \"b55\", \"ON\": \"b56\" },\n        \"IS_ACTIVE\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 215. Care Facility */\n    \"215\": {\n      id: 215,\n      slug: \"care_facility\",\n      name: \"Care Facility\",\n      f: {\n        \"NAME\": \"a55\",  // text\n        \"DETAIL\": \"a56\",  // textarea\n        \"CARE_FACILITY_TYPE\": \"a57\",  // Checkbox\n        \"CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE\": \"a58\",  // Checkbox\n        \"CARE_FACILITY_ROOM_TYPE\": \"a59\",  // Checkbox\n        \"CARE_FACILITY_PROVIDES_ROOM_FACILITY\": \"a60\",  // Checkbox\n        \"CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY\": \"a61\",  // Checkbox\n        \"CARE_FACILITY_PEOPLE_NUMBER\": \"a62\",  // Radio\n        \"LOCATION\": \"a63\",  // Text\n        \"ADDRESS\": \"a64\",  // Text\n        \"FACILITY_IS_APPROVED\": \"a65\",  // Radio\n        \"PHONE\": \"a66\",  // Text\n        \"EMAIL\": \"a67\",  // text\n      },\n      opt: {\n        \"CARE_FACILITY_TYPE\": { \"ADULT_DAY_CARE\": \"b55\", \"ASSISTED_LIVING\": \"b56\", \"HOME_CARE\": \"b57\", \"HOSPICE\": \"b58\", \"INDEPENDENT_LIVING\": \"b59\", \"MEMORY_CARE\": \"b60\", \"NURSING_HOMES\": \"b61\", \"RESIDENTIAL_CARE_HOMES\": \"b62\", \"SENIOR_APARTMENTS\": \"b63\" },\n        \"CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE\": { \"EARLY_STAGE\": \"b55\", \"MIDDLE_STAGE\": \"b56\", \"LATE_STAGE\": \"b57\" },\n        \"CARE_FACILITY_ROOM_TYPE\": { \"STUDIO\": \"b55\", \"ONE_BED_ROOM\": \"b56\", \"TWO_BED_ROOM\": \"b57\", \"MORE_THAN_TWO_BED_ROOM\": \"b58\" },\n        \"CARE_FACILITY_PROVIDES_ROOM_FACILITY\": { \"BALCONY\": \"b55\", \"TOILET\": \"b56\", \"KITCHEN\": \"b57\" },\n        \"CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY\": { \"SWIMMING_POOL\": \"b55\", \"ACTIVE_LIFESTYLE\": \"b56\", \"ENTERTAINMENT_VENUE\": \"b57\", \"LAUNDRY\": \"b58\" },\n        \"CARE_FACILITY_PEOPLE_NUMBER\": { \"LESS_THAN_5\": \"b55\", \"5_20\": \"b56\", \"20_50\": \"b57\", \"MORE_THAN_50\": \"b58\" },\n        \"FACILITY_IS_APPROVED\": { \"YES\": \"b55\", \"NO\": \"b56\" },\n      },\n    },\n    /** 217. Challenged App Content */\n    \"217\": {\n      id: 217,\n      slug: \"challenged_content\",\n      name: \"Challenged App Content\",\n      f: {\n        \"TITLE\": \"a55\",  // Text\n        \"CONTENT\": \"a56\",  // Textarea\n        \"LANGUAGE\": \"a57\",  // Radio\n        \"APP_AREA\": \"a58\",  // Checkbox\n        \"APP_CONTENT_TYPE\": \"a59\",  // Radio\n        \"LEARN_MODULE_NUMBER\": \"a60\",  // Number\n        \"LEARN_LESSON_NUMBER\": \"a61\",  // Number\n        \"CARE_AND_ACCOMPANY_TIPS_CATEGORY\": \"a62\",  // Radio\n        \"FIND_TIPS_CATEGORY\": \"a63\",  // Radio\n      },\n      opt: {\n        \"LANGUAGE\": { \"ENGLISH\": \"b55\", \"SIMPLIFIED_CHINESE\": \"b56\" },\n        \"APP_AREA\": { \"GLOBAL_ENGLISH\": \"b55\", \"CHINA\": \"b56\" },\n        \"APP_CONTENT_TYPE\": { \"LEARN\": \"b55\", \"CARE_AND_ACCOMPANY_TIPS\": \"b56\", \"FIND_TIPS\": \"b57\" },\n        \"CARE_AND_ACCOMPANY_TIPS_CATEGORY\": { \"EATING_AND_DRINKING\": \"b55\", \"TOILETING_AND_CONTINENCE\": \"b56\", \"MEMORY_LOSS\": \"b57\", \"AGGRESSION\": \"b58\", \"DEPRESSION_ANXIETY_AND_APATHY\": \"b59\", \"DIFFICULTY_SLEEPING\": \"b60\", \"DELUSIONS_AND_HALLUCINATIONS\": \"b61\", \"REPETITIVE_BEHAVIOUR\": \"b62\", \"CHANGES_IN_JUDGEMENT\": \"b63\" },\n        \"FIND_TIPS_CATEGORY\": { \"WONDERING\": \"b55\", \"GETTING_LOST\": \"b56\", \"UNWILLING_TO_RETURN_HOME\": \"b57\" },\n      },\n    },\n    /** 218. User's study notes */\n    \"218\": {\n      id: 218,\n      slug: \"study_notes\",\n      name: \"User's study notes\",\n      f: {\n        \"TITLE\": \"a55\",  // Text\n        \"CONTENT\": \"a56\",  // Textarea\n      },\n      opt: {\n      },\n    },\n  },\n  rel: {\n    /** 117. One product can have many related woo products to be sold through woo on each shop — 140. Product -> Products （CPT Products，即woo commerce products) (One to many) */\n    \"117\": { id: 117, parent: \"140. Product\", child: \"Products （CPT Products，即woo commerce products)\", type: \"One to many\" },\n    /** 147. One 140. product can have many related 146. product’s brand — 140. Product -> 146. Product’s brand (One to many) */\n    \"147\": { id: 147, parent: \"140. Product\", child: \"146. Product’s brand\", type: \"One to many\" },\n    /** 112. One 140. product can have many related 114. product’s flavor — 140. Product -> 114. Product's flavor (One to many) */\n    \"112\": { id: 112, parent: \"140. Product\", child: \"114. Product's flavor\", type: \"One to many\" },\n    /** 175. One 140. product can have many related 174. product’s ingredients — 140. Product -> 174. product’s ingredients (One to many) */\n    \"175\": { id: 175, parent: \"140. Product\", child: \"174. product’s ingredients\", type: \"One to many\" },\n    /** 287. One 140. product can have many related product members — 140. Product -> Users (Many to many) */\n    \"287\": { id: 287, parent: \"140. Product\", child: \"Users\", type: \"Many to many\", f: { \"PRODUCT_MEMBER\": \"a55\", \"PRODUCT_MEMBER_ROLE\": \"a56\" }, opt: { \"PRODUCT_MEMBER\": { \"NOTHING_SPECIAL\": \"b55\", \"OWNER\": \"b56\", \"ADMIN\": \"b57\" } } },\n    /** 169. One 168. recipe can have many related 140. products — 168. recipe -> 140. Product (One to many) */\n    \"169\": { id: 169, parent: \"168. recipe\", child: \"140. Product\", type: \"One to many\" },\n    /** 148. One directory marketplace shop like amazon can have many related vendors selling on it — 2. Shop -> 2. Shop (One to many) */\n    \"148\": { id: 148, parent: \"2. Shop\", child: \"2. Shop\", type: \"One to many\" },\n    /** 286. One 2. Shop can have many related facility members — 2. Shop -> Users (Many to many) */\n    \"286\": { id: 286, parent: \"2. Shop\", child: \"Users\", type: \"Many to many\", f: { \"SHOP_MEMBER\": \"a55\", \"SHOP_MEMBER_ROLE\": \"a56\" }, opt: { \"SHOP_MEMBER\": { \"NOTHING_SPECIAL\": \"b55\", \"OWNER\": \"b56\", \"ADMIN\": \"b57\" } } },\n    /** 116. One shop can have many related products to sell and here we also store the price of the product on this nicotine shop — 2. Shop -> 140. Product (Many to many) */\n    \"116\": { id: 116, parent: \"2. Shop\", child: \"140. Product\", type: \"Many to many\", f: { \"PRICE_ONE_UNIT\": \"a55\", \"PRICE_FIVE_UNIT\": \"a56\", \"PRICE_TEN_UNIT\": \"a57\", \"PRICE_MAX_UNIT\": \"a58\", \"MAX_UNITS\": \"a59\", \"PRODUCT_URL\": \"a60\", \"IN_STOCK\": \"a61\", \"SHOP_TYPE\": \"a62\", \"COIN_ALLOWANCE\": \"a63\", \"REGIONS_SHIPS_TO\": \"a64\", \"REGIONS_DOESN_T_SHIP_TO\": \"a65\", \"CURRENCY\": \"a66\", \"MSRP_REGION\": \"a67\", \"PRICE_RECORDED_TIME\": \"a68\" }, opt: { \"IN_STOCK\": { \"YES\": \"b55\", \"NO\": \"b56\" }, \"SHOP_TYPE\": { \"MSRP\": \"b55\", \"DIRECTORY_DISPLAY_NOT_PURCHASABLE\": \"b56\", \"ONE_OF_OUR_OFFICIAL_SHOPS_PURCHASABLE\": \"b57\", \"ONE_OF_OUR_MARKETPLACE_SHOPS_PURCHASABLE\": \"b58\" } } },\n    /** 276. One 275. product price history can have many related 2. shops — 275. product price history -> 2. shop (many to many) */\n    \"276\": { id: 276, parent: \"275. product price history\", child: \"2. shop\", type: \"many to many\" },\n    /** 118. One user can have one dokan shop and here we relate it to its one and only related nicotine shop — Users -> 2. Shop (One to one) */\n    \"118\": { id: 118, parent: \"Users\", child: \"2. Shop\", type: \"One to one\" },\n    /** 119. One nicotine shop that is already listed on our directory can have one related hidden nicotine shop to store price if the shop also chooses to sell on our app — 2. Shop -> 2. Shop (One to one) */\n    \"119\": { id: 119, parent: \"2. Shop\", child: \"2. Shop\", type: \"One to one\" },\n    /** 150. One 149. Community post can have many related comments — 149. Community post -> 141. Comment (One to Many) */\n    \"150\": { id: 150, parent: \"149. Community post\", child: \"141. Comment\", type: \"One to Many\" },\n    /** 142. One comment can have many related comments — 141. Comment -> 141. Comment (Many to Many) */\n    \"142\": { id: 142, parent: \"141. Comment\", child: \"141. Comment\", type: \"Many to Many\" },\n    /** 166. One 149. Afresh community post can have many related 30. votes — 149. Community post -> 30. Vote (One to Many) [dictionary table typo fixed; verified in /afresh GUI 2026-10-26] */\n    \"166\": { id: 166, parent: \"149. Community post\", child: \"30. Vote\", type: \"One to Many\" },\n    /** 167. One comment can have many related 30. votes — 141. Comment -> 30. Vote (One to Many) [dictionary prose; table row repeats 142 by mistake; verified in /afresh GUI 2026-10-26] */\n    \"167\": { id: 167, parent: \"141. Comment\", child: \"30. Vote\", type: \"One to Many\" },\n    /** 144. One product shop can have many related reviews — 2. Shop -> 31. Review (One to Many) */\n    \"144\": { id: 144, parent: \"2. Shop\", child: \"31. Review\", type: \"One to Many\" },\n    /** 264. One care provider can have many related 31. reviews — Users -> 31. Review (One to Many) */\n    \"264\": { id: 264, parent: \"Users\", child: \"31. Review\", type: \"One to Many\" },\n    /** 294. One 215 care facility can have many related 31. reviews — 215. care facility -> 31. Review (One to Many) */\n    \"294\": { id: 294, parent: \"215. care facility\", child: \"31. Review\", type: \"One to Many\" },\n    /** 143. One review can have many related comments — 31. Review -> 141. Comment (One to Many) */\n    \"143\": { id: 143, parent: \"31. Review\", child: \"141. Comment\", type: \"One to Many\" },\n    /** 145. One product can have many related reviews — 140. Product -> 31. Review (One to Many) */\n    \"145\": { id: 145, parent: \"140. Product\", child: \"31. Review\", type: \"One to Many\" },\n    /** 152. One user can have one related user's extended profile — Users -> 151. User's extended profile (One to One) */\n    \"152\": { id: 152, parent: \"Users\", child: \"151. User's extended profile\", type: \"One to One\" },\n    /** 259. One user can have one 258. user‘s extended profile 2 — Users -> 258. User‘s extended profile 2 (One to One) */\n    \"259\": { id: 259, parent: \"Users\", child: \"258. User‘s extended profile 2\", type: \"One to One\" },\n    /** 182. One user can have many related user‘s 181. User‘s reason to quit — Users -> 181. User‘s reason to quit (One to Many) */\n    \"182\": { id: 182, parent: \"Users\", child: \"181. User‘s reason to quit\", type: \"One to Many\" },\n    /** 128. One user can have many related nicotine products — Users -> 140. Product (One to Many) */\n    \"128\": { id: 128, parent: \"Users\", child: \"140. Product\", type: \"One to Many\", f: { \"NICOTINE_PRODUCT_USAGE_TYPE\": \"a55\", \"USAGE_NUMBER_PER_DAY\": \"a56\", \"USAGE_NICOTINE_MG_PER_DAY\": \"a57\", \"USE_MSRP\": \"a58\", \"CUSTOM_PURCHASE_PRICE_PER_UNIT\": \"a59\", \"CUSTOM_NUMBER_PER_PACK\": \"a591\", \"CUSTOM_PURCHASE_PRICE_PER_PACK\": \"a592\", \"CUSTOM_ALCOHOL_PURCHASE_PRICE_PER_ML\": \"a593\", \"CUSTOM_ALCOHOL_PURCHASE_PRICE_PER_UNIT\": \"a594\", \"CUSTOM_ALCOHOL_UNIT_ML\": \"a595\", \"STARTED_USING_AT\": \"a60\", \"STOPPED_USING_AT\": \"a61\", \"PURCHASE_SOURCE\": \"a62\", \"PRODUCT_SOURCE\": \"a63\", \"ALCOHOL_PRODUCT_USAGE_TYPE\": \"a64\", \"ALCOHOL_GLASS_OR_SERVING_VOLUME_PER_DRINK\": \"a65\", \"NUMBER_OF_DRINKS_PER_DAY\": \"a66\", \"ADD_TO_MY_MOST_FREQUENTLY_USED_NICOTINE_PRODUCT_LIST\": \"a67\", \"ADD_TO_MY_MOST_FREQUENTLY_USED_ALCOHOL_PRODUCT_LIST\": \"a68\", \"ADD_TO_MY_MOST_FREQUENTLY_USED_ALTERNATIVE_PRODUCT_FOR_NICOTINE_PRODUCT_LIST\": \"a69\", \"ADD_TO_MY_MOST_FREQUENTLY_USED_ALTERNATIVE_PRODUCT_FOR_ALCOHOL_PRODUCT_LIST\": \"a70\" }, opt: { \"NICOTINE_PRODUCT_USAGE_TYPE\": { \"BASELINE_USAGE\": \"b55\", \"CURRENTLY_USING\": \"b56\", \"NRT_USAGE\": \"b57\", \"ALTERNATIVE_PRODUCT_USAGE\": \"b58\", \"MY_MOST_FREQUENTLY_USED_NICOTINE_PRODUCT\": \"b59\" }, \"USE_MSRP\": { \"YES\": \"b55\", \"NO\": \"b56\" }, \"PURCHASE_SOURCE\": { \"OUR_OFFICIAL_SHOP\": \"b55\", \"OUR_MARKETPLACE_SHOP\": \"b56\", \"OTHER\": \"b57\" }, \"PRODUCT_SOURCE\": { \"FROM_OUR_PRODUCT_CATALOG\": \"b55\", \"CUSTOM_PRODUCT_MADE_BY_USER\": \"b56\", \"OUR_NON_SPECIFIC_CATEGORY_PRODUCT_CUSTOMIZABLE_BY_USERS\": \"b57\" }, \"ALCOHOL_PRODUCT_USAGE_TYPE\": { \"BASELINE_USAGE\": \"b55\", \"CURRENTLY_USING\": \"b56\", \"ALTERNATIVE_PRODUCT_USAGE\": \"b57\", \"MY_MOST_FREQUENTLY_USED_ALCOHOL_PRODUCT\": \"b58\" }, \"ADD_TO_MY_MOST_FREQUENTLY_USED_NICOTINE_PRODUCT_LIST\": { \"BASELINE_USAGE\": \"b55\", \"CURRENTLY_USING\": \"b56\", \"NRT_USAGE\": \"b57\", \"MY_MOST_FREQUENTLY_USED_NICOTINE_PRODUCT\": \"b59\" }, \"ADD_TO_MY_MOST_FREQUENTLY_USED_ALCOHOL_PRODUCT_LIST\": { \"BASELINE_USAGE\": \"b55\", \"CURRENTLY_USING\": \"b56\", \"ALTERNATIVE_PRODUCT_USAGE\": \"b57\", \"MY_MOST_FREQUENTLY_USED_ALCOHOL_PRODUCT\": \"b58\" }, \"ADD_TO_MY_MOST_FREQUENTLY_USED_ALTERNATIVE_PRODUCT_FOR_NICOTINE_PRODUCT_LIST\": { \"YES\": \"b55\", \"NO\": \"b56\", \"ALTERNATIVE_PRODUCT_USAGE\": \"b58\" }, \"ADD_TO_MY_MOST_FREQUENTLY_USED_ALTERNATIVE_PRODUCT_FOR_ALCOHOL_PRODUCT_LIST\": { \"YES\": \"b55\", \"NO\": \"b56\", \"ALTERNATIVE_PRODUCT_USAGE\": \"b57\" } } },\n    /** 129. One user can have many user's quit plans — Users -> User‘s quit plan (One to Many) */\n    \"129\": { id: 129, parent: \"Users\", child: \"User‘s quit plan\", type: \"One to Many\" },\n    /** 154. One user's quit plan can have many related nicotine products — 153. User's quit plan -> 140. Product (One to Many) */\n    \"154\": { id: 154, parent: \"153. User's quit plan\", child: \"140. Product\", type: \"One to Many\" },\n    /** 183. One user can have many related 51. User's blocked keyword and domain — Users -> 51. User's blocked keyword and domain (One to Many) */\n    \"183\": { id: 183, parent: \"Users\", child: \"51. User's blocked keyword and domain\", type: \"One to Many\" },\n    /** 172. One user can have many related 171. User's apple health or google health log event — Users -> 171. User's apple health or google health log event (One to Many) */\n    \"172\": { id: 172, parent: \"Users\", child: \"171. User's apple health or google health log event\", type: \"One to Many\" },\n    /** 173. One user can have many related 161. User’s other log event — Users -> 161. User’s other log event (One to Many) */\n    \"173\": { id: 173, parent: \"Users\", child: \"161. User’s other log event\", type: \"One to Many\" },\n    /** 176. One 171. User's apple health or google health log event can have many related 161. User’s other log events — 171. User's apple health or google health log event -> 161. User’s other log event (One to Many) */\n    \"176\": { id: 176, parent: \"171. User's apple health or google health log event\", child: \"161. User’s other log event\", type: \"One to Many\" },\n    /** 179. One 161. User’s other log events can have many related 177. User’s custom workouts — 161. User’s other log event -> 177. User’s custom workout (One to Many) */\n    \"179\": { id: 179, parent: \"161. User’s other log event\", child: \"177. User’s custom workout\", type: \"One to Many\" },\n    /** 180. One 161. User’s other log events can have many related 178. User’s custom symptom — 161. User’s other log event -> 178. User’s custom symptom (One to Many) */\n    \"180\": { id: 180, parent: \"161. User’s other log event\", child: \"178. User’s custom symptom\", type: \"One to Many\" },\n    /** 163. One user's log event can have one related user's non-custom and custom choice and alternative choice — 161. User's log event -> 162. Use's non-custom and custom choice and alternative choice (One to One) */\n    \"163\": { id: 163, parent: \"161. User's log event\", child: \"162. Use's non-custom and custom choice and alternative choice\", type: \"One to One\" },\n    /** 164. One user can have many related user's custom choice and alternative choices — Users -> 162. Use's non-custom and custom choice and alternative choice (One to Many) */\n    \"164\": { id: 164, parent: \"Users\", child: \"162. Use's non-custom and custom choice and alternative choice\", type: \"One to Many\" },\n    /** 165. One user's log event can have many related products — 161. User's log event -> 140. Product (One to Many) */\n    \"165\": { id: 165, parent: \"161. User's log event\", child: \"140. Product\", type: \"One to Many\", f: { \"USER_S_LOGGED_PRODUCT_TYPE_USE_THIS_FOR_QUIT_SMOKING_AND_LOGGING_NRT\": \"a55\", \"USER_S_LOGGED_PRODUCT_QUANTITY\": \"a66\", \"USER_S_LOGGED_PRODUCT_TYPE_USE_THIS_FOR_QUIT_DRINKING\": \"a67\", \"LOG_ALCOHOL_BOUGHT_TYPE\": \"a68\" }, opt: { \"USER_S_LOGGED_PRODUCT_TYPE_USE_THIS_FOR_QUIT_SMOKING_AND_LOGGING_NRT\": { \"NICOTINE_PRODUCT\": \"b55\", \"NRT_PRODUCT\": \"b56\", \"OTHER_PRODUCT\": \"b57\" }, \"USER_S_LOGGED_PRODUCT_TYPE_USE_THIS_FOR_QUIT_DRINKING\": { \"ALCOHOL_PRODUCT\": \"b55\" }, \"LOG_ALCOHOL_BOUGHT_TYPE\": { \"SHOP_BOUGHT\": \"b55\", \"BAR_PUB_RESTAURANT\": \"b56\" } } },\n    /** 265. One 199. care group can have one related group live 121. chat conversation — 199. care group -> 121. Chat Conversation (One to One) */\n    \"265\": { id: 265, parent: \"199. care group\", child: \"121. Chat Conversation\", type: \"One to One\" },\n    /** 137. One chat conversation can have many related chatters — 121. Chat Conversation -> Users (Many to Many) */\n    \"137\": { id: 137, parent: \"121. Chat Conversation\", child: \"Users\", type: \"Many to Many\", f: { \"THE_USER_JOINED_THIS_CHAT_CONVERSATION_AT_THIS_TIME\": \"a55\", \"THE_USER_LAST_READ_THIS_CHAT_CONVERSATION_AT_THIS_TIME\": \"a56\", \"THE_USER_HAS_FUCKING_MUTED_THIS_CHAT\": \"a57\" }, opt: { \"THE_USER_HAS_FUCKING_MUTED_THIS_CHAT\": { \"YES\": \"b55\", \"NO\": \"b56\" } } },\n    /** 138. One chat conversation can have many related chat messages — 121. Chat Conversation -> 126. Chat Message (One to Many) */\n    \"138\": { id: 138, parent: \"121. Chat Conversation\", child: \"126. Chat Message\", type: \"One to Many\" },\n    /** 139. One chat message can have one parent chat message that it is specifically replying to — 126. Chat Message -> 126. Chat Message (One to Many) */\n    \"139\": { id: 139, parent: \"126. Chat Message\", child: \"126. Chat Message\", type: \"One to Many\" },\n    /** 188. One user can have many related 185. Notifications to receive — Users -> 185. Notification (One to Many) */\n    \"188\": { id: 188, parent: \"Users\", child: \"185. Notification\", type: \"One to Many\" },\n    /** 189. One user can have many related 186. User's notification token — Users -> 186. User's notification token (One to Many) */\n    \"189\": { id: 189, parent: \"Users\", child: \"186. User's notification token\", type: \"One to Many\" },\n    /** 190. One user can have many related 187. User's calendar event — Users -> 187. User's calendar event (One to Many) */\n    \"190\": { id: 190, parent: \"Users\", child: \"187. User's calendar event\", type: \"One to Many\" },\n    /** 262. One 187. user's calendar event can have many related invited users — 187. User's calendar event -> Users (One to Many) */\n    \"262\": { id: 262, parent: \"187. User's calendar event\", child: \"Users\", type: \"One to Many\" },\n    /** 191. One 187. user's calendar event can have many related 161. user's log events — 187. User's calendar event -> 161. user's log events (One to Many) */\n    \"191\": { id: 191, parent: \"187. User's calendar event\", child: \"161. user's log events\", type: \"One to Many\" },\n    /** 263. One care task can have many related user's calendar events — 204. Care Task -> 187. User's calendar event (One to Many) */\n    \"263\": { id: 263, parent: \"204. Care Task\", child: \"187. User's calendar event\", type: \"One to Many\", f: { \"TITLE\": \"a55\", \"BLOCK_TYPE\": \"a56\", \"PROPERTIES\": \"a57\", \"CONTENT_ORDER\": \"a58\", \"ALIVE\": \"a59\", \"ICON\": \"a60\", \"COVER\": \"a61\", \"FORMAT\": \"a62\", \"LAST_EDITED_AT\": \"a63\" }, opt: {  } },\n    /** 280. One 277. block can have many related 277. blocks — 277. Block -> 277. Block (One to Many) */\n    \"280\": { id: 280, parent: \"277. Block\", child: \"277. Block\", type: \"One to Many\" },\n    /** 281. One 278. collection can have many related 277. blocks — 278. Collection -> 277. Block (One to Many) */\n    \"281\": { id: 281, parent: \"278. Collection\", child: \"277. Block\", type: \"One to Many\" },\n    /** 282. One 278. collection can have many related 279. collection views — 278. Collection -> 279. Collection view (One to Many) */\n    \"282\": { id: 282, parent: \"278. Collection\", child: \"279. Collection view\", type: \"One to Many\" },\n    /** 283. One 277. block can have many related 277. blocks (relation property) — 277. Block -> 277. Block (Many to Many) */\n    \"283\": { id: 283, parent: \"277. Block\", child: \"277. Block\", type: \"Many to Many\" },\n    /** 284. One user can have many related 277. blocks — Users -> 277. Block (One to Many) */\n    \"284\": { id: 284, parent: \"Users\", child: \"277. Block\", type: \"One to Many\" },\n    /** 285. One 277. block can have many related 278. collections — 277. Block -> 278. Collection (One to Many) */\n    \"285\": { id: 285, parent: \"277. Block\", child: \"278. Collection\", type: \"One to Many\", f: { \"PROPERTY_ID\": \"a55\", \"LOG_EVENT_CONTENT\": \"a56\", \"LOG_EVENT_TYPE\": \"a57\", \"EVENT_TIME\": \"a61\", \"NOTE_CONTENT\": \"a77\" }, opt: {  } },\n    /** 103. One user can have many related 6. FreshCoin Transaction — Users -> 6. FreshCoin Transaction (One to Many) */\n    \"103\": { id: 103, parent: \"Users\", child: \"6. FreshCoin Transaction\", type: \"One to Many\" },\n    /** 194. One user can have many related 192. User's subscription — Users -> 192. User's subscription (One to Many) */\n    \"194\": { id: 194, parent: \"Users\", child: \"192. User's subscription\", type: \"One to Many\" },\n    /** 195. One user can have many related 193. User's ai credit — Users -> 193. User's ai credit (One to Many) */\n    \"195\": { id: 195, parent: \"Users\", child: \"193. User's ai credit\", type: \"One to Many\" },\n    /** 219. One user can have many related cared ones — Users -> Users (Many to Many) */\n    \"219\": { id: 219, parent: \"Users\", child: \"Users\", type: \"Many to Many\", f: { \"CARED_ONE_INVITATION_STATUS\": \"a58\" }, opt: { \"CARED_ONE_INVITATION_STATUS\": { \"ACCEPTED\": \"b55\", \"PENDING\": \"b56\", \"DECLINED\": \"b57\" } } },\n    /** 220. One cared one can have many related 198. cared one's information cards — Users -> 198. Cared one's information card (One to Many) */\n    \"220\": { id: 220, parent: \"Users\", child: \"198. Cared one's information card\", type: \"One to Many\" },\n    /** 221. One cared one's information card can have many related cared one's emergency contact persons — 198. Cared one's information card -> Users (One to Many) */\n    \"221\": { id: 221, parent: \"198. Cared one's information card\", child: \"Users\", type: \"One to Many\" },\n    /** 295. One user can have many related saved/favorite care givers — Users -> Users (Many to Many) */\n    \"295\": { id: 295, parent: \"Users\", child: \"Users\", type: \"Many to Many\" },\n    /** 222. One 199. care group can many related 200. care group invite links — 199. Care Group -> 200. Care group invite link (One to Many) */\n    \"222\": { id: 222, parent: \"199. Care Group\", child: \"200. Care group invite link\", type: \"One to Many\" },\n    /** 223. One care group can have many related care group members — 199. Care Group -> Users (Many to Many) */\n    \"223\": { id: 223, parent: \"199. Care Group\", child: \"Users\", type: \"Many to Many\", f: { \"CARE_GROUP_S_MEMBER_DISPLAY_NAME\": \"a55\", \"CARE_GROUP_S_MEMBER_TYPES\": \"a56\", \"CARE_GROUP_S_MEMBER_ROLES\": \"a57\", \"CARE_GROUP_S_MEMBER_INVITATION_STATUS\": \"a58\" }, opt: { \"CARE_GROUP_S_MEMBER_TYPES\": { \"NOTHING_SPECIAL\": \"b55\", \"OWNER\": \"b56\", \"ADMIN\": \"b57\" }, \"CARE_GROUP_S_MEMBER_ROLES\": { \"NOTHING_SPECIAL\": \"b55\", \"CARED_ONE\": \"b56\" }, \"CARE_GROUP_S_MEMBER_INVITATION_STATUS\": { \"ACCEPTED\": \"b55\", \"PENDING\": \"b56\", \"DECLINED\": \"b57\" } } },\n    /** 224. One care group can have many related private member groups — 199. Care Group -> 201. The related private member groups of one care group (One to Many) */\n    \"224\": { id: 224, parent: \"199. Care Group\", child: \"201. The related private member groups of one care group\", type: \"One to Many\" },\n    /** 225. One 201. care group's private member group can have related members — 201. The related private member groups of one care group -> Users (Many to Many) */\n    \"225\": { id: 225, parent: \"201. The related private member groups of one care group\", child: \"Users\", type: \"Many to Many\", f: { \"CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_TYPES\": \"a55\" }, opt: { \"CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_TYPES\": { \"NOTHING_SPECIAL\": \"b55\", \"OWNER\": \"b56\", \"ADMIN\": \"b57\" } } },\n    /** 226. One care group can have many related not too special posts — 199. Care Group -> 202. The related not too special posts of one care group (One to Many) */\n    \"226\": { id: 226, parent: \"199. Care Group\", child: \"202. The related not too special posts of one care group\", type: \"One to Many\" },\n    /** 227. One 202. related not too special posts of one care group can have many 201. related care group's private member groups that it's visible to — 202. The related not too special posts of one care group -> 201. The related private member groups of one care group (Many to Many) */\n    \"227\": { id: 227, parent: \"202. The related not too special posts of one care group\", child: \"201. The related private member groups of one care group\", type: \"Many to Many\" },\n    /** 293. One 202 related not too special posts of one care group can have many related 201 care group's private member groups that it's not visible to — 202. The related not too special posts of one care group -> 201. The related private member groups of one care group (Many to Many) */\n    \"293\": { id: 293, parent: \"202. The related not too special posts of one care group\", child: \"201. The related private member groups of one care group\", type: \"Many to Many\" },\n    /** 228. One related not too special posts of one care group can have many related users that it's visible to — 202. The related not too special posts of one care group -> Users (Many to Many) */\n    \"228\": { id: 228, parent: \"202. The related not too special posts of one care group\", child: \"Users\", type: \"Many to Many\" },\n    /** 292. One related not too special posts of one care group can have many related users that it's not visible to — 202. The related not too special posts of one care group -> Users (Many to Many) */\n    \"292\": { id: 292, parent: \"202. The related not too special posts of one care group\", child: \"Users\", type: \"Many to Many\" },\n    /** 229. One 202 related not too special posts of one care group can have many related 141. comments — 202. The related not too special posts of one care group -> 141. Comment (One to Many) */\n    \"229\": { id: 229, parent: \"202. The related not too special posts of one care group\", child: \"141. Comment\", type: \"One to Many\" },\n    /** 230. One care group can many related 203. care group galleries — 199. Care Group -> 203. Care Group Gallery (One to Many) */\n    \"230\": { id: 230, parent: \"199. Care Group\", child: \"203. Care Group Gallery\", type: \"One to Many\" },\n    /** 231. One 204. care task can have many related cared ones — 204.  Care Task -> Users (One to Many) */\n    \"231\": { id: 231, parent: \"204.  Care Task\", child: \"Users\", type: \"One to Many\" },\n    /** 232. One 204. care task can have many related assigned caregivers — 204. Care Task -> Users (One to Many) */\n    \"232\": { id: 232, parent: \"204. Care Task\", child: \"Users\", type: \"One to Many\", f: { \"ASSIGNED_CAREGIVER_STATUS\": \"a55\" }, opt: { \"ASSIGNED_CAREGIVER_STATUS\": { \"PENDING\": \"b55\", \"ACCEPTED\": \"b56\", \"REJECTED\": \"b57\" } } },\n    /** 233. One care group can have many related 204. care tasks — 199. Care Group -> 204. Care Task (Many to Many) */\n    \"233\": { id: 233, parent: \"199. Care Group\", child: \"204. Care Task\", type: \"Many to Many\" },\n    /** 234. One 204. care task can have many 201. related care group's private member groups that it's visible to — 204. Care Task -> 201. The related private member groups of one care group (One to Many) */\n    \"234\": { id: 234, parent: \"204. Care Task\", child: \"201. The related private member groups of one care group\", type: \"One to Many\" },\n    /** 235. One 204. care task can have many related users that it's only visible to — 204. Care Task -> Users (Many to Many) */\n    \"235\": { id: 235, parent: \"204. Care Task\", child: \"Users\", type: \"Many to Many\" },\n    /** 236. One 204. care task can have many related comments — 204. Care Task -> 141. Comment (One to Many) */\n    \"236\": { id: 236, parent: \"204. Care Task\", child: \"141. Comment\", type: \"One to Many\" },\n    /** 253. One 204 care task can have many related 204. care tasks — 204. Care Task -> 204. Care Task (Many to Many) */\n    \"253\": { id: 253, parent: \"204. Care Task\", child: \"204. Care Task\", type: \"Many to Many\" },\n    /** 238. One 187 cared one's medicine schedule can have many related care one's medicine logs — 187. Cared one’s medicine schedule -> 206. Care one's medicine log (One to Many) */\n    \"238\": { id: 238, parent: \"187. Cared one’s medicine schedule\", child: \"206. Care one's medicine log\", type: \"One to Many\" },\n    /** 241. One check in schedule can have many related asigned check-in persons — 207. Checkin schedule -> Users (One to Many) [verified live 2026-09-18] */\n    \"241\": { id: 241, parent: \"207. Checkin schedule\", child: \"Users\", type: \"One to Many\" },\n    /** 260. One 187. checkin schedule can have many related caregivers who will receive notification — 187. User's calendar event -> Users (One to Many) */\n    \"260\": { id: 260, parent: \"187. User's calendar event\", child: \"Users\", type: \"One to Many\" },\n    /** 242. One cared one can have many related 197. cared one's care notes — Users -> 197. Cared one's care note (One to Many) */\n    \"242\": { id: 242, parent: \"Users\", child: \"197. Cared one's care note\", type: \"One to Many\" },\n    /** 243. One cared one can have many related cared one's care tips — Users -> 209. Cared one's care tip (One to Many) */\n    \"243\": { id: 243, parent: \"Users\", child: \"209. Cared one's care tip\", type: \"One to Many\" },\n    /** 244. One cared one can have many related cared one's care plans — Users -> 210. Cared one's care plan (One to Many) */\n    \"244\": { id: 244, parent: \"Users\", child: \"210. Cared one's care plan\", type: \"One to Many\" },\n    /** 245. One cared one can have many related 211. cared one's emergency contact persons — Users -> 211. Cared one's emergency contact person (One to Many) */\n    \"245\": { id: 245, parent: \"Users\", child: \"211. Cared one's emergency contact person\", type: \"One to Many\" },\n    /** 246. One cared one can have many related 212. cared one's care documents — Users -> 212. Cared one's care document (One to Many) */\n    \"246\": { id: 246, parent: \"Users\", child: \"212. Cared one's care document\", type: \"One to Many\" },\n    /** 247. One user can have many related current location snapshots — Users -> 213. The current location of one user (One to many) */\n    \"247\": { id: 247, parent: \"Users\", child: \"213. The current location of one user\", type: \"One to many\", f: { \"USER_TYPE\": \"a55\" }, opt: { \"USER_TYPE\": { \"NOT_SOMEONE_SPECIAL\": \"b55\", \"CARED_ONE\": \"b56\" } } },\n    /** 248. One user can have many related safe zones — Users -> 214. Safe Zone (One to many) */\n    \"248\": { id: 248, parent: \"Users\", child: \"214. Safe Zone\", type: \"One to many\" },\n    /** 290. One cared one’s location notification can have many added related receivers — Users -> Users (One to many) */\n    \"290\": { id: 290, parent: \"Users\", child: \"Users\", type: \"One to many\" },\n    /** 249. Facility -> Users; Many to many verified in /afresh GUI. One owner is a business rule, not relation cardinality. */\n    \"249\": { id: 249, parent: \"215. Care Facility\", child: \"Users\", type: \"Many to many\", f: { \"FACILITY_MEMBER_TYPE\": \"a55\", \"FACILITY_MEMBER_ROLE\": \"a56\" }, opt: { \"FACILITY_MEMBER_TYPE\": { \"NOTHING_SPECIAL\": \"b55\", \"OWNER\": \"b56\", \"ADMIN\": \"b57\" } } },\n    /** 291. One 215. Care Facility can have many related ownership claims — 215. Care Facility -> 288. ownership claim (Many to many（使用many to many以保证后续可拓展性)) */\n    \"291\": { id: 291, parent: \"215. Care Facility\", child: \"288. ownership claim\", type: \"Many to many（使用many to many以保证后续可拓展性)\" },\n    /** 255. One user can many related finished ChallengeD learn content — Users -> 217. Challenged App Content (One to Many) */\n    \"255\": { id: 255, parent: \"Users\", child: \"217. Challenged App Content\", type: \"One to Many\", f: { \"USER_HAS_FINISHED_LEARNING_THIS_LESSON\": \"a55\" }, opt: { \"USER_HAS_FINISHED_LEARNING_THIS_LESSON\": { \"YES\": \"b55\", \"NO\": \"b56\" } } },\n    /** 256. One 217. Challenged App Content can have many related user’s study notes — 217. Challenged App Content -> 218. User's study notes (One to Many) */\n    \"256\": { id: 256, parent: \"217. Challenged App Content\", child: \"218. User's study notes\", type: \"One to Many\" },\n    /** 257. One Challenged App Content can have many related cared one's care tips — 217. Challenged App Content -> 209. Cared one's care tip (One to Many) */\n    \"257\": { id: 257, parent: \"217. Challenged App Content\", child: \"209. Cared one's care tip\", type: \"One to Many\" },\n    /** 240. RETIRED — live backend has it as 207. Checkin schedule -> 208. Checkin log (old dedicated tables). Use 191 for 187 -> 161. [verified live 2026-09-18] */\n    \"240\": { id: 240, parent: \"207. Checkin schedule\", child: \"208. Checkin log\", type: \"One to Many\" },\n  },\n} as const;\n\n/**\n * Semantic CCT aliases. Frontend code MUST use these (T.careGroup.slug,\n * T.careGroup.f.NAME, T.notification.opt.THIS_IS_THE_NOTIFICATION_FOR_APP.CHALLENGED)\n * so a dictionary renumbering never touches feature code.\n */\nexport const T = {\n  /** 140. Product */\n  product: WP.cct[\"140\"],\n  /** 146. Product’s brand */\n  productBrand: WP.cct[\"146\"],\n  /** 114. Product's flavor */\n  productFlavor: WP.cct[\"114\"],\n  /** 174. Product's ingredient */\n  productIngredient: WP.cct[\"174\"],\n  /** 288. Ownership claim */\n  ownershipClaim: WP.cct[\"288\"],\n  /** 168. Recipe */\n  recipe: WP.cct[\"168\"],\n  /** 2. Shop */\n  shop: WP.cct[\"2\"],\n  /** 149. Community post */\n  afreshCommunityPost: WP.cct[\"149\"],\n  /** 141. Comment */\n  comment: WP.cct[\"141\"],\n  /** 30. Vote */\n  vote: WP.cct[\"30\"],\n  /** 31. Review */\n  review: WP.cct[\"31\"],\n  /** 151. User‘s extended profile */\n  userProfile: WP.cct[\"151\"],\n  /** 258. User‘s extended profile 2 */\n  userProfile2: WP.cct[\"258\"],\n  /** 181. User‘s reason to quit */\n  userReasonToQuit: WP.cct[\"181\"],\n  /** 153. User's quit plan */\n  userQuitPlan: WP.cct[\"153\"],\n  /** 51. User's blocked keyword and domain */\n  blockedKeyword: WP.cct[\"51\"],\n  /** 171. User's apple health or google health log event */\n  userHealthLog: WP.cct[\"171\"],\n  /** 161. User’s other log event */\n  userLogEvent: WP.cct[\"161\"],\n  /** 177. User’s custom workout */\n  userCustomWorkout: WP.cct[\"177\"],\n  /** 178. User’s custom symptom */\n  userCustomSymptom: WP.cct[\"178\"],\n  /** 162. Use's non-custom and custom choice and alternative choice */\n  userChoice: WP.cct[\"162\"],\n  /** 121. Chat Conversation */\n  chatConversation: WP.cct[\"121\"],\n  /** 126. Chat Message */\n  chatMessage: WP.cct[\"126\"],\n  /** 185. Notification */\n  notification: WP.cct[\"185\"],\n  /** 186. User's notification token */\n  notificationToken: WP.cct[\"186\"],\n  /** 187. User's calendar event */\n  calendarEvent: WP.cct[\"187\"],\n  /** 6. FreshCoin Transaction */\n  freshcoinTransaction: WP.cct[\"6\"],\n  /** 192. User's subscription */\n  userSubscription: WP.cct[\"192\"],\n  /** 193. User's ai credit */\n  userAiCredit: WP.cct[\"193\"],\n  /** 198. Cared one's information card */\n  infoCard: WP.cct[\"198\"],\n  /** 199. Care Group */\n  careGroup: WP.cct[\"199\"],\n  /** 200. Care group invite link */\n  careGroupInvite: WP.cct[\"200\"],\n  /** 201. The related private member groups of one 199. care group */\n  careGroupPrivateMemberGroup: WP.cct[\"201\"],\n  /** 202. The related not too special posts of one care group */\n  careGroupPost: WP.cct[\"202\"],\n  /** 203. Care Group Gallery */\n  careGroupGallery: WP.cct[\"203\"],\n  /** 204. Care Task */\n  careTask: WP.cct[\"204\"],\n  /** 206. Medicine log */\n  medicineLog: WP.cct[\"206\"],\n  /** 197. Cared one's care note */\n  careNote: WP.cct[\"197\"],\n  /** 209. Cared one's care tip */\n  careTip: WP.cct[\"209\"],\n  /** 210. Cared one's care plan */\n  carePlan: WP.cct[\"210\"],\n  /** 211. Cared one's emergency contact person */\n  emergencyContact: WP.cct[\"211\"],\n  /** 212. Cared one's care document */\n  careDocument: WP.cct[\"212\"],\n  /** 213. The current location of one user */\n  currentLocation: WP.cct[\"213\"],\n  /** 214. Safe Zone */\n  safeZone: WP.cct[\"214\"],\n  /** 215. Care Facility */\n  careFacility: WP.cct[\"215\"],\n  /** 217. Challenged App Content */\n  challengedContent: WP.cct[\"217\"],\n  /** 218. User's study notes */\n  studyNote: WP.cct[\"218\"],\n} as const;\n\n/** Semantic JetEngine relation IDs. Use R.careGroupMembers, never a raw number. */\nexport const R = {\n  /** 117. One product can have many related woo products to be sold through woo on each shop */\n  productWooProducts: 117,\n  /** 147. One 140. product can have many related 146. product’s brand */\n  productBrands: 147,\n  /** 112. One 140. product can have many related 114. product’s flavor */\n  productFlavors: 112,\n  /** 175. One 140. product can have many related 174. product’s ingredients */\n  productIngredients: 175,\n  /** 287. One 140. product can have many related product members */\n  productMembers: 287,\n  /** 169. One 168. recipe can have many related 140. products */\n  recipeProducts: 169,\n  /** 148. One directory marketplace shop like amazon can have many related vendors selling on it */\n  shopVendors: 148,\n  /** 286. One 2. Shop can have many related facility members */\n  shopMembers: 286,\n  /** 116. One shop can have many related products to sell and here we also store the price of the product on this nicotine shop */\n  shopProducts: 116,\n  /** 276. One 275. product price history can have many related 2. shops */\n  productPriceHistoryShops: 276,\n  /** 118. One user can have one dokan shop and here we relate it to its one and only related nicotine shop */\n  userShop: 118,\n  /** 119. One nicotine shop that is already listed on our directory can have one related hidden nicotine shop to store price if the shop also chooses to sell on our app */\n  shopLinkedShop: 119,\n  /** 150. One 149. Community post can have many related comments */\n  communityPostComments: 150,\n  /** 142. One comment can have many related comments */\n  commentReplies: 142,\n  /** 166. One 149. Afresh community post can have many related 30. votes */\n  communityPostVotes: 166,\n  /** 167. One comment can have many related 30. votes */\n  commentVotes: 167,\n  /** 144. One product shop can have many related reviews */\n  shopReviews: 144,\n  /** 264. One care provider can have many related 31. reviews */\n  providerReviews: 264,\n  /** 294. One 215 care facility can have many related 31. reviews */\n  facilityReviews: 294,\n  /** 143. One review can have many related comments */\n  reviewComments: 143,\n  /** 145. One product can have many related reviews */\n  productReviews: 145,\n  /** 152. One user can have one related user's extended profile */\n  userProfileRel: 152,\n  /** 259. One user can have one 258. user‘s extended profile 2 */\n  userProfile2Rel: 259,\n  /** 182. One user can have many related user‘s 181. User‘s reason to quit */\n  userReasonsToQuit: 182,\n  /** 128. One user can have many related nicotine products */\n  userProducts: 128,\n  /** 129. One user can have many user's quit plans */\n  userQuitPlans: 129,\n  /** 154. One user's quit plan can have many related nicotine products */\n  quitPlanProducts: 154,\n  /** 183. One user can have many related 51. User's blocked keyword and domain */\n  userBlockedKeywords: 183,\n  /** 172. One user can have many related 171. User's apple health or google health log event */\n  userHealthLogs: 172,\n  /** 173. One user can have many related 161. User’s other log event */\n  userLogEvents: 173,\n  /** 176. One 171. User's apple health or google health log event can have many related 161. User’s other log events */\n  healthLogChildLogEvents: 176,\n  /** 179. One 161. User’s other log events can have many related 177. User’s custom workouts */\n  logEventCustomWorkouts: 179,\n  /** 180. One 161. User’s other log events can have many related 178. User’s custom symptom */\n  logEventCustomSymptoms: 180,\n  /** 163. One user's log event can have one related user's non-custom and custom choice and alternative choice */\n  logEventChoice: 163,\n  /** 164. One user can have many related user's custom choice and alternative choices */\n  userChoices: 164,\n  /** 165. One user's log event can have many related products */\n  logEventProducts: 165,\n  /** 265. One 199. care group can have one related group live 121. chat conversation */\n  careGroupChat: 265,\n  /** 137. One chat conversation can have many related chatters */\n  conversationMembers: 137,\n  /** 138. One chat conversation can have many related chat messages */\n  conversationMessages: 138,\n  /** 139. One chat message can have one parent chat message that it is specifically replying to */\n  messageParentMessage: 139,\n  /** 188. One user can have many related 185. Notifications to receive */\n  userNotifications: 188,\n  /** 189. One user can have many related 186. User's notification token */\n  userNotificationTokens: 189,\n  /** 190. One user can have many related 187. User's calendar event */\n  userCalendarEvents: 190,\n  /** 262. One 187. user's calendar event can have many related invited users */\n  calendarEventInvitees: 262,\n  /** 191. One 187. user's calendar event can have many related 161. user's log events */\n  calendarEventLogEvents: 191,\n  /** 263. One care task can have many related user's calendar events */\n  careTaskCalendarEvents: 263,\n  /** 280. One 277. block can have many related 277. blocks */\n  blockChildBlocks: 280,\n  /** 281. One 278. collection can have many related 277. blocks */\n  collectionRowBlocks: 281,\n  /** 282. One 278. collection can have many related 279. collection views */\n  collectionViews: 282,\n  /** 283. One 277. block can have many related 277. blocks (relation property) */\n  blockRelationBlocks: 283,\n  /** 284. One user can have many related 277. blocks */\n  userBlocks: 284,\n  /** 285. One 277. block can have many related 278. collections */\n  blockCollections: 285,\n  /** 103. One user can have many related 6. FreshCoin Transaction */\n  userFreshcoinTransactions: 103,\n  /** 194. One user can have many related 192. User's subscription */\n  userSubscriptions: 194,\n  /** 195. One user can have many related 193. User's ai credit */\n  userAiCredits: 195,\n  /** 219. One user can have many related cared ones */\n  userCaredOnes: 219,\n  /** 220. One cared one can have many related 198. cared one's information cards */\n  caredOneInfoCards: 220,\n  /** 221. One cared one's information card can have many related cared one's emergency contact persons */\n  infoCardEmergencyContacts: 221,\n  /** 295. One user can have many related saved/favorite care givers */\n  userSavedCaregivers: 295,\n  /** 222. One 199. care group can many related 200. care group invite links */\n  careGroupInvites: 222,\n  /** 223. One care group can have many related care group members */\n  careGroupMembers: 223,\n  /** 224. One care group can have many related private member groups */\n  careGroupPrivateMemberGroups: 224,\n  /** 225. One 201. care group's private member group can have related members */\n  privateMemberGroupMembers: 225,\n  /** 226. One care group can have many related not too special posts */\n  careGroupPosts: 226,\n  /** 227. One 202. related not too special posts of one care group can have many 201. related care group's private member groups that it's visible to */\n  careGroupPostPrivateGroups: 227,\n  /** 293. One 202 related not too special posts of one care group can have many related 201 care group's private member groups that it's not visible to */\n  careGroupPostHiddenPrivateGroups: 293,\n  /** 228. One related not too special posts of one care group can have many related users that it's visible to */\n  careGroupPostMentionedUsers: 228,\n  /** 292. One related not too special posts of one care group can have many related users that it's not visible to */\n  careGroupPostHiddenUsers: 292,\n  /** 229. One 202 related not too special posts of one care group can have many related 141. comments */\n  careGroupPostComments: 229,\n  /** 230. One care group can many related 203. care group galleries */\n  careGroupGalleries: 230,\n  /** 231. One 204. care task can have many related cared ones */\n  careTaskCaredOnes: 231,\n  /** 232. One 204. care task can have many related assigned caregivers */\n  careTaskAssignees: 232,\n  /** 233. One care group can have many related 204. care tasks */\n  careGroupTasks: 233,\n  /** 234. One 204. care task can have many 201. related care group's private member groups that it's visible to */\n  careTaskPrivateMemberGroups: 234,\n  /** 235. One 204. care task can have many related users that it's only visible to */\n  careTaskVisibleUsers: 235,\n  /** 236. One 204. care task can have many related comments */\n  careTaskComments: 236,\n  /** 253. One 204 care task can have many related 204. care tasks */\n  careTaskSubTasks: 253,\n  /**\n   * 240. One 187. cared one's medicine/checkin schedule can have many related\n   * 161. care one's logs — schedules live in CCT 187, logs in CCT 161, so\n   * medicine and check-in logs share the same relation. (Old CCT 206 + Relation\n   * 238 are retired.)\n   */\n  medicineScheduleLogs: 191,\n\n  /**\n   * Assigned check-in persons. Schedules moved to CCT 187, so the assignee link\n   * is Relation 262 (187 → Users). Relation 241 is retired with CCT 207.\n   */\n  checkinScheduleAssignees: 262,\n  /** 260. One 187. checkin schedule can have many related caregivers who will receive notification */\n  checkinNotificationReceivers: 260,\n  /** 242. One cared one can have many related 197. cared one's care notes */\n  caredOneCareNotes: 242,\n  /** 243. One cared one can have many related cared one's care tips */\n  caredOneCareTips: 243,\n  /** 244. One cared one can have many related cared one's care plans */\n  caredOneCarePlans: 244,\n  /** 245. One cared one can have many related 211. cared one's emergency contact persons */\n  caredOneEmergencyContacts: 245,\n  /** 246. One cared one can have many related 212. cared one's care documents */\n  caredOneCareDocuments: 246,\n  /** 247. One user can have many related current location snapshots */\n  userCurrentLocations: 247,\n  /** 248. One user can have many related safe zones */\n  userSafeZones: 248,\n  /** 290. One cared one’s location notification can have many added related receivers */\n  caredOneLocationReceivers: 290,\n  /** 249. One care facility can have many related facility members */\n  careFacilityMembers: 249,\n  /** 291. One 215. Care Facility can have many related ownership claims */\n  careFacilityOwnershipClaims: 291,\n  /** 255. One user can many related finished ChallengeD learn content */\n  userFinishedContent: 255,\n  /** 256. One 217. Challenged App Content can have many related user’s study notes */\n  contentStudyNotes: 256,\n  /** 257. One Challenged App Content can have many related cared one's care tips */\n  contentCareTips: 257,\n  /** 191. One 187. user's calendar event can have many related 161. user's log events */\n  checkinScheduleLogs: 191,\n} as const;\n\n/** Dictionary CCT number -> live JetEngine REST slug. */\nexport const CCT_SLUG: Readonly<Record<string, string>> = {\n  \"140\": \"nicotine_product\",\n  \"146\": \"nicotine_products_b\",\n  \"114\": \"nicotine_products_fl\",\n  \"174\": \"products_ingredient\",\n  \"288\": \"ownership_claim\",\n  \"168\": \"recipe\",\n  \"2\": \"shop\",\n  \"149\": \"afresh_community_pos\",\n  \"141\": \"comment\",\n  \"30\": \"vote\",\n  \"31\": \"review\",\n  \"151\": \"users_extended_prof\",\n  \"258\": \"user_ext_profile_2\",\n  \"181\": \"users_reason_to_qui\",\n  \"153\": \"users_quit_plan\",\n  \"51\": \"blocked_keyword\",\n  \"171\": \"apple_health_or_goog\",\n  \"161\": \"users_log_event\",\n  \"177\": \"users_custom_workout\",\n  \"178\": \"users_custom_sympto\",\n  \"162\": \"choice_and_alternative_choice\",\n  \"121\": \"chat_conversation\",\n  \"126\": \"chat_message\",\n  \"185\": \"users_notification\",\n  \"186\": \"users_notif_token\",\n  \"187\": \"users_calendar_event\",\n  \"6\": \"freshcoin_transaction\",\n  \"192\": \"users_subscription\",\n  \"193\": \"users_credit_ledger\",\n  \"198\": \"cared_one_info_card\",\n  \"199\": \"care_group\",\n  \"200\": \"care_group_invite\",\n  \"201\": \"care_group_pmg\",\n  \"202\": \"care_group_post\",\n  \"203\": \"care_group_gallery\",\n  \"204\": \"care_task\",\n  \"206\": \"medicine_log\",\n  \"197\": \"care_note\",\n  \"209\": \"care_tip\",\n  \"210\": \"care_plan\",\n  \"211\": \"emergency_contact\",\n  \"212\": \"care_document\",\n  \"213\": \"current_location\",\n  \"214\": \"safe_zone\",\n  \"215\": \"care_facility\",\n  \"217\": \"challenged_content\",\n  \"218\": \"study_notes\",\n} as const;\n\n/** Resolve a REST slug from a dictionary CCT number. Throws when unmapped. */\nexport function cctSlug(id: number | string): string {\n  const slug = CCT_SLUG[String(id)];\n  if (!slug) throw new Error(`[wp-schema] No live CCT slug mapped for dictionary CCT ${id}`);\n  return slug;\n}\n";
/**
* Turns raw WordPress endpoints, field codes and source references into the
* names from the data dictionary (wp-schema). Codes are opaque: names come
* only from the dictionary, never from guessing.
*/
var CCTS = WP.cct;
var RELS = WP.rel;
var BY_SLUG = {};
for (const def of Object.values(CCTS)) BY_SLUG[def.slug] = def;
for (const [id, slug] of Object.entries(CCT_SLUG)) if (!BY_SLUG[slug] && CCTS[id]) BY_SLUG[slug] = CCTS[id];
var ACTIONS = {
	GET: "读 Read",
	POST: "新建/关联 Create/Link",
	PUT: "修改 Update",
	PATCH: "修改 Update",
	DELETE: "删除 Delete"
};
function cctBySlug(slug) {
	return BY_SLUG[slug];
}
function relById(id) {
	return RELS[String(id)];
}
function cctLabel(def, slug) {
	return def ? `CCT ${def.id} ${def.name} (${def.slug})` : `CCT ? (${slug}) — 字典里找不到 / not in dictionary`;
}
function relLabel(id, def) {
	return def ? `REL ${id}: ${def.parent} → ${def.child} (${def.type})` : `REL ${id} — 字典里找不到 / not in dictionary`;
}
function decodeEndpoint(method, endpoint) {
	const ep = endpoint.replace(/^\/+/, "").split("?")[0];
	const action = ACTIONS[method] || method;
	let m = ep.match(/^jet-rel\/(\d+)(?:\/(children|parents)\/(\d+))?/);
	if (m) {
		const rel = relById(m[1]);
		const side = m[2] ? m[2] === "children" ? ` 读子项 children of ${m[3]}` : ` 读父项 parents of ${m[3]}` : "";
		return {
			kind: "rel",
			key: `rel:${m[1]}`,
			rel,
			label: relLabel(m[1], rel) + side,
			action: method === "POST" ? "新建关联 Link" : method === "DELETE" ? "删除关联 Unlink" : action
		};
	}
	m = ep.match(/^jet-cct\/([a-z0-9_]+)(?:\/(\d+))?/);
	if (m) {
		const cct = cctBySlug(m[1]);
		return {
			kind: "cct",
			key: `cct:${m[1]}`,
			cct,
			label: cctLabel(cct, m[1]) + (m[2] ? ` #${m[2]}` : ""),
			action: method === "GET" ? m[2] ? "读一行 Read row" : "读列表 Read list" : action
		};
	}
	if (/^(wc\/|dokan\/)/.test(ep)) return {
		kind: "woo",
		key: `woo:${ep.replace(/\/\d+.*$/, "")}`,
		label: `WooCommerce/Dokan ${ep}`,
		action
	};
	m = ep.match(/^server-fn\/([\w$]+)(?:\/([\w-]+))?/);
	if (m) return {
		kind: "other",
		key: `server:${m[1]}`,
		label: `后端服务 / Backend function ${m[1]}${m[2] ? ` · ${m[2]}` : ""}（服务器内部读写不在浏览器里显示 / its own WordPress reads run on the server）`,
		action
	};
	if (/^wp\/v2\/users/.test(ep)) return {
		kind: "user",
		key: "user",
		label: `WordPress 用户 Users ${ep}`,
		action
	};
	return {
		kind: "other",
		key: `other:${ep}`,
		label: ep,
		action
	};
}
/** Field code → dictionary name for a CCT, or a REL meta field. */
function fieldName(def, code) {
	if (!def?.f) return void 0;
	for (const [name, c] of Object.entries(def.f)) if (c === code) return name;
}
/** Option code → dictionary option name for a field. */
function optionName(def, code, value) {
	const fname = fieldName(def, code);
	if (!fname || !def?.opt?.[fname]) return void 0;
	const names = (Array.isArray(value) ? value : [value]).map((v) => Object.entries(def.opt[fname]).find(([, c]) => c === String(v))?.[0]).filter(Boolean);
	return names.length ? names.join(", ") : void 0;
}
var R_BY_NAME = R;
var T_BY_NAME = T;
function describeRef(kind, key) {
	switch (kind) {
		case "rel": return relLabel(key, relById(key));
		case "relConst": {
			const id = R_BY_NAME[key];
			return id ? relLabel(String(id), relById(id)) + ` [R.${key}]` : `R.${key}（非字典常量 / local name）`;
		}
		case "cct": return cctLabel(cctBySlug(key), key);
		case "cctConst": {
			const d = T_BY_NAME[key];
			return d ? cctLabel(d, d.slug) + ` [T.${key}]` : `T.${key}`;
		}
		case "cctId": {
			const d = CCTS[key];
			return cctLabel(d, d?.slug || key);
		}
		case "woo": return `WooCommerce/Dokan/WP ${key}`;
		default: return key;
	}
}
function normalizeFile(file) {
	return file.replace(/^.*?\/src\//, "").replace(/^src\//, "").replace(/:\d+(:\d+)?$/, "");
}
/** Data references in files and the files they import, re-read from source on every call. */
async function codeRefs(files, maxDepth = 3) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	let frontier = [...new Set(files.map(normalizeFile))];
	for (let depth = 0; depth <= maxDepth && frontier.length; depth++) {
		const todo = frontier.filter((f) => !seen.has(f));
		todo.forEach((f) => seen.add(f));
		const entries = await liveEntries(todo);
		const next = [];
		for (const file of todo) {
			const entry = entries[file];
			if (!entry) continue;
			for (const [kind, key, method, line] of entry.r) if (kind === "write") out.push({
				file,
				line,
				depth,
				kind: "write",
				label: method,
				method,
				snippet: key
			});
			else out.push({
				file,
				line,
				depth,
				kind: method && method !== "GET" ? "write" : method === "GET" ? "read" : "ref",
				label: describeRef(kind, key),
				method
			});
			for (const imp of entry.i) if (!seen.has(imp) && !imp.startsWith("components/ui/")) next.push(imp);
		}
		frontier = next;
	}
	return out;
}
var TYPES = (() => {
	const out = {};
	let cur = "";
	for (const line of String(wp_schema_default).split("\n")) {
		const b = line.match(/^\s*"(\d+)": \{\s*$/);
		if (b) {
			cur = b[1];
			continue;
		}
		const f = line.match(/^\s*"[A-Z0-9_]+": "([a-z]{1,2}\d{1,3})",\s*\/\/\s*(.+?)\s*$/);
		if (f && cur) (out[cur] ||= {})[f[1]] = f[2];
	}
	return out;
})();
/** Dictionary field type of a CCT column, e.g. a55 → "Text". */
function fieldType(def, code) {
	if (def?.id === 324) return {
		a55: "Text",
		a56: "Textarea"
	}[code];
	return def?.id !== void 0 ? TYPES[String(def.id)]?.[code] : void 0;
}
/** "a55「TITLE」(Text)" — code, dictionary name and type together. */
function fieldFull(def, code) {
	const n = fieldName(def, code);
	const t = fieldType(def, code);
	return `${code}${n ? `「${n}」` : ""}${t ? `（${t}）` : ""}`;
}
var PUSH = /notif|通知|push|message|消息|sms|wechat|jpush|notify/i;
function tableName(t) {
	if (t.cct) return `CCT ${t.cct.id}「${t.cct.name}」`;
	if (t.rel) return `REL ${t.rel.id}（${t.rel.parent} → ${t.rel.child}，${t.rel.type}）`;
	return t.label;
}
function paramsText(r, t) {
	const p = r.params;
	if (!p || !Object.keys(p).length) return "没有附加筛选条件";
	const def = t.cct || t.rel;
	return "筛选条件是 " + Object.entries(p).map(([k, v]) => {
		const code = k.replace(/^.*\[|\]$/g, "");
		const o = optionName(def, code, v);
		return `${/^[a-z]{1,2}\d{1,3}$/.test(code) ? fieldFull(def, code) : k} = ${String(v)}${o ? `（即 ${o}）` : ""}`;
	}).join("、");
}
function bodyText(r, t) {
	const b = r.body;
	if (!b || typeof b !== "object") return "";
	const parts = [];
	const walk = (o, def) => {
		for (const [k, v] of Object.entries(o)) {
			if (v && typeof v === "object" && !Array.isArray(v)) {
				walk(v, k === "meta" ? t.rel : def);
				continue;
			}
			const opt = optionName(def, k, v);
			parts.push(`${/^[a-z]{1,2}\d{1,3}$/.test(k) ? fieldFull(def, k) : k} 写成 ${JSON.stringify(v).slice(0, 60)}${opt ? `（即 ${opt}）` : ""}`);
		}
	};
	walk(b, t.cct || t.rel);
	return parts.length ? `，内容是：${parts.join("；")}` : "";
}
function rows(r) {
	if (r.rows === void 0) return "结果还没返回";
	const n = Array.isArray(r.rows) ? r.rows.length : r.rows ? 1 : 0;
	return n ? `返回了 ${n} 行` : "返回 0 行（没有数据）";
}
function requestSentences(reqs) {
	const reads = [];
	const writes = [];
	const pushes = [];
	const seen = /* @__PURE__ */ new Map();
	for (const r of reqs) {
		const t = decodeEndpoint(r.method, r.endpoint);
		const k = `${r.method}|${t.key}|${JSON.stringify(r.params || {})}|${JSON.stringify(r.body || {})}`;
		if (seen.has(k)) {
			seen.set(k, seen.get(k) + 1);
			continue;
		}
		seen.set(k, 1);
		const row = r.endpoint.match(/\/(\d+)(?:$|\?)/)?.[1];
		const caller = r.callers?.[0] ? `，由 ${r.callers[0]} 发起` : "";
		if (r.method === "GET") reads.push(`读取 ${tableName(t)}${row && t.kind === "cct" ? ` 的第 #${row} 行` : ""}，${paramsText(r, t)}，${rows(r)}${caller}。`);
		else {
			const s = `${t.action} ${tableName(t)}${row ? ` 第 #${row} 行` : ""}${bodyText(r, t)}${r.blocked ? "（核对模式已拦住，没有真的写进去）" : ""}${caller}。`;
			(PUSH.test(t.label) ? pushes : writes).push(s);
		}
	}
	return {
		reads,
		writes,
		pushes
	};
}
function ReadWriteNarrative({ text, matches, requests, refs, handlers, scope }) {
	const { reads, writes, pushes } = requestSentences(requests);
	const staticWrites = [...new Map(refs.filter((r) => r.kind === "write").map((r) => [r.label + r.file, r])).values()];
	const shown = matches.map((m) => {
		const t = decodeEndpoint(m.request.method, m.request.endpoint);
		const def = t.cct || t.rel;
		return `${tableName(t)} 第 #${m.row} 行的 ${fieldFull(def, m.field)} 列，存的值是 “${String(m.value).slice(0, 80)}”${m.option ? `，这个选项代码的意思是「${m.option}」` : ""}`;
	});
	const P = ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		"data-inspector-source": "components/inspector/ReadWriteNarrative.tsx:80:62:33509f94d0258c8d205c4daaf64695e6cb0fd0ab47cd98d632349d640698b97d:1",
		className: "text-xs leading-relaxed",
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/inspector/ReadWriteNarrative.tsx:82:5:2994101aa9946715704f125d4e2a6fdd762941c3580a1811d9d61f81623e0393:1",
		className: "space-y-2 rounded-md border border-border bg-muted/30 p-2",
		children: [
			scope === "element" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				"这里显示的「",
				(text || "").slice(0, 60),
				"」来自 ",
				shown.join("；另外也对得上 "),
				"。"
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				"这里显示的「",
				(text || "").slice(0, 60),
				"」在本页读到的数据里找不到完全相同的存储值，它可能是界面固定文字、由多行数据算出来的结果（例如计数），或者数据还没加载完。请看下面「显示的值来自」的逐步推导。"
			] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: reads.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				scope === "element" ? "这个元素的代码" : "这一页",
				"一共做了 ",
				reads.length,
				" 种读取：",
				reads.join(" ")
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [scope === "element" ? "这个元素的代码" : "这一页", "在本页没有记录到读取。"] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: writes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["实际发生的写入有：", writes.join(" ")] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "本页目前没有记录到真实写入。" }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: pushes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["推送 / 通知相关的请求有：", pushes.join(" ")] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "本页目前没有记录到推送或通知请求。" }) }),
			(handlers?.length || 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(P, { children: [
				"点击这个元素会执行 ",
				handlers.map((h) => `${h.prop}（在 ${h.owner} 里）`).join("、"),
				"，核对模式下不会真的执行。"
			] }),
			staticWrites.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(P, { children: [
				"代码里还写着 ",
				staticWrites.length,
				" 处可能的写入（只是代码里有，本次没有实际发生）：",
				staticWrites.slice(0, 12).map((r) => `${r.label}（${r.file}:${r.line}）`).join("、"),
				staticWrites.length > 12 ? " 等" : "",
				"。"
			] })
		]
	});
}
/** Researcher-only: read manual notes for an element and its page. */
var loadInspectorNotes = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	keys: arrayType(stringType().min(1).max(600)).min(1).max(5),
	fingerprint: stringType().max(600).optional(),
	tag: stringType().max(60).optional(),
	page: stringType().max(400).optional(),
	legacy: objectType({
		key: stringType().min(1).max(600),
		label: stringType().max(400)
	}).optional()
}).parse(input)).handler(createSsrRpc("43690a4d3d9aa2699c75ba38700c15cd6046e109e43a5a2683337aac4f01af13"));
/** Researcher-only: read every saved note in one call (the inspector caches them in the browser). */
var loadAllInspectorNotes = createServerFn({ method: "POST" }).handler(createSsrRpc("7a2c7294467f56a028fcf0ff17c2ac4ab9fd538f70a58128b77796a6961e6e9d"));
/** Researcher-only: note picker search (names only, at most 60, searched on the WordPress side). */
var searchInspectorNotes = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	q: stringType().max(200),
	status: enumType([
		"all",
		"verified",
		"unverified"
	])
}).parse(input)).handler(createSsrRpc("c19ad123684bff70e7873b6d6439947839fdde14c75f5dd01ba436b12a96ae8e"));
/** Researcher-only: save (overwrite) the manual note for one element or page. */
var saveInspectorNote = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	key: stringType().min(1).max(600),
	scope: enumType(["element", "page"]),
	page: stringType().max(400),
	label: stringType().max(400),
	title: stringType().min(1).max(240),
	id: stringType().regex(/^\d+$/).optional(),
	create: booleanType().optional(),
	verified: booleanType().optional(),
	text: stringType().max(1e5),
	source: objectType({
		file: stringType().min(1).max(300),
		line: numberType().int().positive(),
		endLine: numberType().int().positive(),
		tag: stringType().min(1).max(60),
		digest: stringType().regex(/^[0-9a-f]{64}$/)
	}).optional(),
	alias: stringType().max(600).optional()
}).parse(input)).handler(createSsrRpc("c7f4965852721a31cbb1d12971fecb7b5e8aca26875d68e10daa9a9485f78230"));
var selectInspectorNote = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	key: stringType().min(1).max(600),
	id: stringType().regex(/^\d+$/),
	scope: enumType(["element", "page"]),
	page: stringType().max(400),
	label: stringType().max(400),
	source: objectType({
		file: stringType().min(1).max(300),
		line: numberType().int().positive(),
		endLine: numberType().int().positive(),
		tag: stringType().min(1).max(60),
		digest: stringType().regex(/^[0-9a-f]{64}$/)
	}).optional(),
	alias: stringType().max(600).optional()
}).parse(input)).handler(createSsrRpc("7955a7df5aef9c063bb7cccf15e6a4567156df200fc56b9178be64857c5b0ba0"));
var noteId = stringType().regex(/^\d+$/);
/** Explicit user submission to one existing record; never creates bindings or relations. */
var submitNoteCorrection = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	id: noteId,
	title: stringType().trim().min(1).max(240),
	text: stringType().min(1).max(1e5),
	expected: objectType({
		title: stringType(),
		text: stringType(),
		verified: booleanType()
	}),
	confirmVerified: booleanType()
}).parse(input)).handler(createSsrRpc("a55074f9a2c3679f0fcb680587f5991c765b0801c777fe5b0cdee20e526c1390"));
/** Researcher-only: notes linked to one CCT324 note through REL325. */
var listRelatedNotes = createServerFn({ method: "POST" }).inputValidator((input) => objectType({ id: noteId }).parse(input)).handler(createSsrRpc("365dfa0e02c1ec2266223abc440777ff8542bba00a3a9377675879bb85ef1d35"));
/** Researcher-only: link an existing note (or a newly created one) to the current note through REL325. */
var linkRelatedNote = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	id: noteId,
	otherId: noteId.optional(),
	create: objectType({
		title: stringType().min(1).max(240),
		text: stringType().max(1e5)
	}).optional()
}).refine((v) => !!v.otherId !== !!v.create).parse(input)).handler(createSsrRpc("4b95470b37060ed8a3242601bbc3e284db14472436be2cc47d75bd58c365fb26"));
var unlinkRelatedNote = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	id: noteId,
	parent: noteId,
	child: noteId
}).refine((v) => v.id === v.parent || v.id === v.child).parse(input)).handler(createSsrRpc("6f7891540b48800a8ccd2ff7ea8f642add416c7c64a217d55e8937106d706e41"));
/** Researcher-only: edit a related note (name, content, manual-check flag) and return the refreshed REL325 list. */
var updateRelatedNote = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	id: noteId,
	otherId: noteId,
	title: stringType().min(1).max(240),
	text: stringType().max(1e5),
	verified: booleanType()
}).parse(input)).handler(createSsrRpc("2ee085be7ed96707ef92a5fc66dd70944c88e13f4f05f4088bcb3efce17ee805"));
/**
* Note picker: WordPress itself searches the names (or exact number) and returns at most 60 rows,
* so nothing ever downloads the whole note table just to type into this box.
*/
function NoteSearchList({ onPick, exclude, search, onClose }) {
	const remote = useServerFn(searchInspectorNotes);
	const run = search ?? (async (q, status) => {
		const r = await remote({ data: {
			q,
			status
		} });
		if ("error" in r && r.error) throw new Error(r.error);
		return r.notes;
	});
	const [text, setText] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [composing, setComposing] = (0, import_react.useState)(false);
	const [committed, setCommitted] = (0, import_react.useState)("");
	const [found, setFound] = (0, import_react.useState)({
		loading: true,
		rows: []
	});
	const query = composing ? committed : text;
	(0, import_react.useEffect)(() => {
		let live = true;
		setFound((f) => ({
			...f,
			loading: true
		}));
		const t = setTimeout(() => {
			run(query, status).then((rows) => live && setFound({
				loading: false,
				rows
			})).catch((e) => live && setFound({
				loading: false,
				rows: [],
				error: String(e)
			}));
		}, query ? 300 : 0);
		return () => {
			live = false;
			clearTimeout(t);
		};
	}, [query, status]);
	const results = found.rows.filter((n) => !exclude?.has(n.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/inspector/NoteSearchList.tsx:31:5:50b9de5737d77c402d59667da4b9f97ddb7151017121190af2ad5ba17f65a6ea:1",
		className: "flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/NoteSearchList.tsx:32:7:f2ed1c0a05301042e3c7e88d8b814ce350a998190d6b1e6a660dda9b78443b08:1",
				role: "group",
				"aria-label": "核对状态筛选",
				className: "flex gap-1 border-b border-border p-2",
				children: [[
					["all", "全部"],
					["verified", "已核对"],
					["unverified", "未核对"]
				].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: status === value ? "secondary" : "ghost",
					"aria-pressed": status === value,
					onClick: () => setStatus(value),
					className: "flex-1",
					children: label
				}, value)), onClose && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "ghost",
					"aria-label": "关闭",
					title: "关闭",
					onClick: onClose,
					className: "px-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				"data-inspector-source": "components/inspector/NoteSearchList.tsx:45:7:45d120ecc57c929d22196f6f1415f1d19eda1bb92081cf8489845578b143cd2b:1",
				autoFocus: true,
				value: text,
				onChange: (e) => {
					setText(e.target.value);
					if (!composing) setCommitted(e.target.value);
				},
				onCompositionStart: () => setComposing(true),
				onCompositionEnd: (e) => {
					setComposing(false);
					setCommitted(e.currentTarget.value);
					setText(e.currentTarget.value);
				},
				onKeyDown: (e) => {
					e.stopPropagation();
					if (e.key === "Enter" && !composing && results[0]) onPick(results[0]);
				},
				placeholder: "搜索注释名字或编号",
				className: "h-10 w-full border-b border-border bg-transparent px-3 text-sm outline-none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/NoteSearchList.tsx:55:7:c3aa27ba837d97eeb77461f9736b76737ac29c2eb52881563026f14b57acc110:1",
				className: "max-h-72 overflow-y-auto overscroll-contain p-1",
				children: [found.loading && results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/inspector/NoteSearchList.tsx:56:50:58c9908041444e5c5bf5bb98153fef90c5351d07e3f0c3671d09824395c139bc:0",
					className: "py-6 text-center text-sm text-muted-foreground",
					children: "搜索中…"
				}) : found.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/inspector/NoteSearchList.tsx:56:137:58c9908041444e5c5bf5bb98153fef90c5351d07e3f0c3671d09824395c139bc:0",
					className: "py-6 text-center text-sm text-destructive",
					children: found.error
				}) : results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/inspector/NoteSearchList.tsx:56:237:58c9908041444e5c5bf5bb98153fef90c5351d07e3f0c3671d09824395c139bc:0",
					className: "py-6 text-center text-sm text-muted-foreground",
					children: "没有找到注释"
				}) : results.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => onPick(n),
					className: "flex h-auto w-full justify-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm font-normal",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-source": "components/inspector/NoteSearchList.tsx:59:15:57ea0d0e5cf5c1c0b22b3c9e5863c4c9e24dfd485ffad23cd0c4ae3ed2800a3e:1",
						className: "min-w-0 truncate",
						children: [
							n.title,
							" · #",
							n.id
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "components/inspector/NoteSearchList.tsx:60:15:4a60d9ce934e7bb37effce213537002c75599cf6e858c4e7a148db1e4b71c430:1",
						className: "ml-auto shrink-0 pl-2 text-xs text-muted-foreground",
						children: n.verified ? "已手动核对" : "未手动核对"
					})]
				}, n.id)), results.length >= 60 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/inspector/NoteSearchList.tsx:63:34:5adbfc0c1c7193fc76f0821c2a41a81d4abd99d35a826565d814eb24d2efcdac:1",
					className: "px-2 py-1 text-xs text-muted-foreground",
					children: "只显示最新 60 条，请输入更多字缩小范围"
				})]
			})
		]
	});
}
/** Researcher-only AI explanation of an inspected element or page. */
var explainReadWrite = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	context: stringType().min(2),
	mode: enumType(["full", "origin"]).optional(),
	scope: enumType(["page", "element"]).optional(),
	noteKeys: arrayType(stringType().max(2e3)).max(3).optional(),
	noteId: stringType().regex(/^\d+$/).optional(),
	draft: objectType({
		title: stringType().max(240),
		text: stringType()
	}).optional()
}).parse(input)).handler(createSsrRpc("1e7513ea11ab0f03772e681b4f51a6657b641e09ec7fbf3ebbcf9bab04236011"));
createServerFn({ method: "POST" }).inputValidator((input) => objectType({ id: stringType().regex(/^\d+$/) }).parse(input)).handler(createSsrRpc("f41ba9d83bea6f205fd3c150915b515c7827685c773d495d0fb3f9d8c3540f5d"));
/** One bounded part of a site audit. Every call verifies WP identity and re-reads CCT324 + REL325. */
var analyzeSiteNote = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	page: stringType().max(500),
	noteId: stringType().regex(/^\d+$/),
	pageNoteIds: arrayType(stringType().regex(/^\d+$/)).max(100).optional(),
	evidence: stringType().min(1),
	chunk: numberType().int().min(1),
	chunks: numberType().int().min(1),
	omissions: arrayType(stringType().max(1e3)).max(1e3)
}).refine((v) => v.chunk <= v.chunks).parse(input)).handler(createSsrRpc("c7b660e60c90ac67defafa5cfd4fbf45668c3236ae3e39736cf4bc752c27dcf6"));
/** Researcher-only dialog about one suggestion. Related notes and code are re-read on the server; nothing is saved. */
var chatAboutCorrection = createServerFn({ method: "POST" }).inputValidator((input) => objectType({
	page: stringType().min(1).max(2e3),
	target: enumType([
		"page_note",
		"element_note",
		"functional_note",
		"code"
	]),
	noteId: stringType().regex(/^\d+$/).nullable(),
	basisNoteIds: arrayType(stringType().regex(/^\d+$/)).max(50),
	reason: stringType(),
	draftTitle: stringType(),
	draftText: stringType(),
	messages: arrayType(objectType({
		role: enumType(["user", "assistant"]),
		content: stringType().min(1)
	})).min(1).max(60)
}).parse(input)).handler(createSsrRpc("ea746736277ceb9aea07e443526e8f12d7462737856a591b0e804c5328ac90a3"));
var labels = {
	page_note: "整页笔记",
	element_note: "元素笔记",
	functional_note: "当前功能逻辑笔记",
	code: "页面逻辑代码"
};
function CorrectionEditor({ suggestion, original, onSaved }) {
	const submit = useServerFn(submitNoteCorrection);
	const [title, setTitle] = (0, import_react.useState)(suggestion.title);
	const [text, setText] = (0, import_react.useState)(suggestion.text);
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [saved, setSaved] = (0, import_react.useState)(false);
	const code = suggestion.target === "code";
	const chat = useServerFn(chatAboutCorrection);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [ask, setAsk] = (0, import_react.useState)("");
	const [thinking, setThinking] = (0, import_react.useState)(false);
	const [chatError, setChatError] = (0, import_react.useState)("");
	const send = async () => {
		const q = ask.trim();
		if (!q || thinking) return;
		const next = [...messages, {
			role: "user",
			content: q
		}];
		setMessages(next);
		setAsk("");
		setThinking(true);
		setChatError("");
		try {
			const r = await chat({ data: {
				page: window.location.pathname + window.location.search,
				target: suggestion.target,
				noteId: suggestion.noteId,
				basisNoteIds: suggestion.basisNoteIds.filter((id) => /^\d+$/.test(id)),
				reason: suggestion.reason,
				draftTitle: title,
				draftText: text,
				messages: next.map((m) => ({
					role: m.role,
					content: m.role === "assistant" && m.text ? `${m.content}\n\n[给出的完整内容]\n${m.text}` : m.content
				}))
			} });
			if (!("reply" in r) || !r.reply) throw new Error("error" in r && r.error || "AI 没有回复。");
			setMessages([...next, {
				role: "assistant",
				content: r.reply,
				...r.title ? { title: r.title } : {},
				...r.text ? { text: r.text } : {}
			}]);
		} catch (e) {
			setChatError(e instanceof Error ? e.message : "对话失败。");
		} finally {
			setThinking(false);
		}
	};
	const save = async () => {
		if (code || !original || !suggestion.noteId || busy) return;
		const session = getWPToken() || "";
		setBusy(true);
		setError("");
		try {
			const result = await submit({ data: {
				id: original.id,
				title,
				text,
				expected: {
					title: original.title,
					text: original.text,
					verified: original.verified
				},
				confirmVerified: confirm
			} });
			if (session !== (getWPToken() || "")) throw new Error("登录状态已变化，请重新读取笔记。");
			if (!result.note) throw new Error(result.error || "未确认保存。");
			const note = {
				...original,
				...result.note
			};
			inspectorNotesCache.put(session, {
				...note,
				key: `cct|${note.id}`,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			});
			onSaved?.(note);
			window.dispatchEvent(new CustomEvent("inspector-note-corrected", { detail: note }));
			setSaved(true);
			setConfirm(false);
		} catch (e) {
			setError(e instanceof Error ? e.message : "保存失败。");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/inspector/CorrectionEditor.tsx:55:10:cf5977d200d53686079d7ad62f897af9ad206b03fd05ae6700fc92445107e585:1",
		className: "space-y-2 border-t border-border pt-2 text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-inspector-source": "components/inspector/CorrectionEditor.tsx:56:5:39dd8bef54ac45895fb4411e7e333de05387ee06766ac93db317e1eb7bdfd7dd:1",
				className: "font-semibold",
				children: [
					"建议修改或补充 · ",
					labels[suggestion.target],
					original ? ` · CCT324 #${original.id} · ${original.title}` : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/CorrectionEditor.tsx:57:5:42a636bca8e0dba81437b060972c705cd2baa41b9a8f68684dd2bcdb90566aaa:1",
				children: suggestion.reason
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-inspector-source": "components/inspector/CorrectionEditor.tsx:58:5:705890a955f87be1882d912e78472c89e2936b704690f21eebcef64a44213080:1",
				className: "text-muted-foreground",
				children: ["功能逻辑基准：", suggestion.basisNoteIds.map((id) => `#${id}`).join("、") || "尚未确认"]
			}),
			!code && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				"data-inspector-source": "components/inspector/CorrectionEditor.tsx:59:15:be7d445598f3409b9ffe444f264969afc96cc1f0b182b9c003cc325e65c0510d:1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					"data-inspector-source": "components/inspector/CorrectionEditor.tsx:59:24:be7d445598f3409b9ffe444f264969afc96cc1f0b182b9c003cc325e65c0510d:1",
					children: "查看修改前的完整笔记"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/inspector/CorrectionEditor.tsx:59:53:be7d445598f3409b9ffe444f264969afc96cc1f0b182b9c003cc325e65c0510d:1",
					className: "whitespace-pre-wrap",
					children: original?.text || "缺少原笔记，不能提交"
				})]
			}),
			!code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				"aria-label": "建议修改或补充标题",
				value: title,
				maxLength: 240,
				disabled: busy || saved,
				onChange: (e) => {
					setTitle(e.target.value);
					setConfirm(false);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				"aria-label": code ? "页面逻辑建议修改或补充" : "建议修改或补充完整正文",
				rows: 10,
				value: text,
				disabled: busy || saved,
				onChange: (e) => {
					setText(e.target.value);
					setConfirm(false);
				}
			}),
			code ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/inspector/CorrectionEditor.tsx:62:15:096a69e1d56fe71b4c0a4679e236c5ce177d0fd82f7f052732ad96dfde3de278:1",
					children: "仅供手动修改页面逻辑；不会写入笔记，也不会自动执行代码。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => {
						const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
						const a = document.createElement("a");
						a.href = url;
						a.download = "页面逻辑建议修改或补充.txt";
						a.click();
						URL.revokeObjectURL(url);
					},
					children: "下载"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => navigator.clipboard?.writeText(text),
					children: "复制"
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				original?.verified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/inspector/CorrectionEditor.tsx:63:30:d167510ff362b43274c3c3c86aafb9dfdfa1fbae1e45a02d6457135557254af2:1",
					className: "text-destructive",
					children: "这条笔记已手动核对。只有你明确确认后才会修改，核对状态保持不变。"
				}),
				!confirm && !saved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					disabled: !original || !title.trim() || !text.trim() || busy,
					onClick: () => setConfirm(true),
					children: ["提交修改到 #", original?.id]
				}),
				confirm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/inspector/CorrectionEditor.tsx:65:19:3b25ac4c182d00afbca8462076844934c1523eeeecc33a2b80442e446aeab83f:0",
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-inspector-source": "components/inspector/CorrectionEditor.tsx:65:46:3b25ac4c182d00afbca8462076844934c1523eeeecc33a2b80442e446aeab83f:1",
						children: [
							"确认用上面完整正文替换 CCT324 #",
							original?.id,
							" 的名字和正文？不改变关联及核对状态。"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/inspector/CorrectionEditor.tsx:65:106:3b25ac4c182d00afbca8462076844934c1523eeeecc33a2b80442e446aeab83f:0",
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							disabled: busy,
							onClick: save,
							children: busy ? "提交中…" : "确认提交修改"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							disabled: busy,
							onClick: () => setConfirm(false),
							children: "取消"
						})]
					})]
				}),
				saved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					"data-inspector-source": "components/inspector/CorrectionEditor.tsx:66:17:2483981b080ebc25c84682bd36cbdd85b9104ae898312606318d919b23157850:1",
					role: "status",
					children: [
						"已保存到 CCT324 #",
						original?.id,
						" 并读回核验；旧分析已过时，请重新分析。"
					]
				})
			] }),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/CorrectionEditor.tsx:68:15:158f23aafad35dee3b4331498be0256e5b68d9f813521fb3a0deef868c9b065e:1",
				role: "alert",
				className: "text-destructive",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/CorrectionEditor.tsx:69:5:d6ebb10c65f8c22a9885a27d7695d19b93a0ae2da6a36cc4187194c9be0b0215:1",
				className: "space-y-2 rounded-md border border-border bg-muted/30 p-2",
				"aria-label": "和 AI 讨论这条建议",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/inspector/CorrectionEditor.tsx:70:7:9036b5523c76562608142058f4c8f3ebaba2351b9d370938bed544f45627de65:1",
						className: "font-semibold",
						children: "和 AI 讨论这条建议"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-inspector-source": "components/inspector/CorrectionEditor.tsx:71:7:0b7c1f8385b92b61c45f881426f6be2667dcd5d27f51722ef4ff33ab965bb49b:1",
						className: "text-muted-foreground",
						children: [
							"关联注释视为正确，只改当前",
							code ? "页面代码" : "注释",
							"。AI 的回复不会自动保存。"
						]
					}),
					messages.map((m, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/inspector/CorrectionEditor.tsx:72:31:e55a3af02fbd483c600f88157d2e8454612f88b3b4387b017ac864ee26e33920:1",
						className: m.role === "user" ? "ml-6 rounded-md bg-primary p-2 text-primary-foreground whitespace-pre-wrap" : "whitespace-pre-wrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-source": "components/inspector/CorrectionEditor.tsx:73:9:786461e45c3f03205d687108857288214694b9385b63a6759d7007370e3633c5:1",
							children: m.content
						}), m.role === "assistant" && m.text && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-source": "components/inspector/CorrectionEditor.tsx:74:46:1a3bfc0d44353e241e564e382bff8feba5a9b06732207401f0459a3976956893:1",
							className: "mt-1 space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								"data-inspector-source": "components/inspector/CorrectionEditor.tsx:75:11:b3110ef54ce0a56143c33945417e233185107f54571a94a1ada2dd78b5dd39f7:1",
								className: "max-h-60 overflow-auto rounded bg-background p-2 text-[11px] whitespace-pre-wrap",
								children: m.text
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/inspector/CorrectionEditor.tsx:76:11:5e55d9cfc644f8122d58cbc42b66c93920249d6cd3180de5884d2df1a6bf36ab:1",
								className: "flex flex-wrap gap-2",
								children: [!saved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => {
										setText(m.text || "");
										if (m.title && !code) setTitle(m.title);
										setConfirm(false);
									},
									children: "放进上面的编辑框"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => navigator.clipboard?.writeText(m.text || ""),
									children: "复制"
								})]
							})]
						})]
					}, k)),
					thinking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/inspector/CorrectionEditor.tsx:82:20:9eb60a1028bac5b76f41389adad824bf74f8dd8f4e3bcbf38b34392656efa4aa:1",
						className: "text-muted-foreground",
						children: "AI 正在回复…"
					}),
					chatError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-inspector-source": "components/inspector/CorrectionEditor.tsx:83:21:889b1aa009d0adb95d12ac3c53e60352c52d68b508066555f69e15539de6cdaf:1",
						role: "alert",
						className: "text-destructive",
						children: chatError
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						"aria-label": "对 AI 说",
						rows: 2,
						value: ask,
						placeholder: "例如：再补上推送写入的 CCT 和 Column；或给我可以复制的代码修改",
						disabled: thinking,
						onChange: (e) => setAsk(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
								e.preventDefault();
								send();
							}
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						disabled: !ask.trim() || thinking,
						onClick: () => void send(),
						children: thinking ? "回复中…" : "发送"
					})
				]
			})
		]
	});
}
function ConflictReportView({ report }) {
	const bad = report.findings.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/inspector/ConflictReportView.tsx:7:10:e9c06b9d8b8b999b5377ca08a866381f19d875bfbf0fa885130310dd04d8b54d:1",
		role: bad ? "alert" : "status",
		className: `space-y-2 rounded-md border p-2 text-xs ${bad ? "border-destructive bg-destructive/5 text-destructive" : "border-border bg-muted/40"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/ConflictReportView.tsx:8:5:829fad79c076885b6a9a28f40e490f9c27a919b37551f2386ceb62da3177c62c:1",
				className: "flex items-center gap-1 font-semibold",
				children: [bad ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), bad ? `发现 ${report.findings.length} 项冲突或疑点` : "本次证据范围内未发现冲突"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/ConflictReportView.tsx:9:5:b88133cbc922672ab4e2ca5bc0096b2485d2102da640eeedb0cc05230deb0cb3:1",
				children: report.summary
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-inspector-source": "components/inspector/ConflictReportView.tsx:10:5:122080b481a2920e5db096ba292c29250d5687475a874eb263ec870a7df7a0a8:1",
				children: [
					"比对注释：",
					report.comparedNoteIds.map((id) => `#${id}`).join("、") || "无",
					"；注释逐对比对：",
					report.comparedPairs.length,
					" 组；代码比对：",
					report.codeCompared ? "已执行" : "未完成"
				]
			}),
			report.findings.map((finding, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/ConflictReportView.tsx:11:42:d1af62b325eb610e91ae7ea43d5b79fa5081714f75eb7c9f4c70c33b80fb8c92:1",
				className: "space-y-1 border-t border-destructive/30 pt-2 whitespace-pre-wrap break-words",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-inspector-source": "components/inspector/ConflictReportView.tsx:12:7:0e9f45a6621c7b296acb2730bcf3e01316aeb9c184f120c530f37a392f7a90f0:1",
						className: "font-semibold",
						children: [
							i + 1,
							". ",
							finding.title
						]
					}),
					finding.noteIds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-inspector-source": "components/inspector/ConflictReportView.tsx:13:38:08c5ee9268fa76b64876431163a5daa80e7357a81aff3e3d91adb8dce4d8326c:1",
						children: ["涉及注释：", finding.noteIds.map((id) => `#${id}`).join("、")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-inspector-source": "components/inspector/ConflictReportView.tsx:14:7:51e27acb8204889eaf4cfaa1e4d801dcabe330c79686705907b22d6e24287449:0",
						children: ["证据：", finding.evidence]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-inspector-source": "components/inspector/ConflictReportView.tsx:14:35:51e27acb8204889eaf4cfaa1e4d801dcabe330c79686705907b22d6e24287449:0",
						children: ["判定：", finding.verdict]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-inspector-source": "components/inspector/ConflictReportView.tsx:14:62:51e27acb8204889eaf4cfaa1e4d801dcabe330c79686705907b22d6e24287449:0",
						children: ["建议修改或补充：", finding.fix]
					}),
					finding.suggestions?.map((suggestion, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CorrectionEditor, {
						suggestion,
						original: report.notes?.find((note) => note.id === suggestion.noteId)
					}, `${i}-${j}`))
				]
			}, i))
		]
	});
}
/** REL325 related manual notes for the current CCT324 note: collapsed list, link/unlink/create, and an AI conflict check. */
function RelatedNotes({ noteId }) {
	const list = useServerFn(listRelatedNotes);
	const link = useServerFn(linkRelatedNote);
	const unlink = useServerFn(unlinkRelatedNote);
	const update = useServerFn(updateRelatedNote);
	const [edits, setEdits] = (0, import_react.useState)({});
	const compare = useServerFn(explainReadWrite);
	const [notes, setNotes] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)({});
	const [state, setState] = (0, import_react.useState)({ loading: true });
	const [pick, setPick] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [ai, setAi] = (0, import_react.useState)({});
	const active = (0, import_react.useRef)(noteId);
	active.current = noteId;
	const [correctionRevision, setCorrectionRevision] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const refresh = () => setCorrectionRevision((value) => value + 1);
		window.addEventListener("inspector-note-corrected", refresh);
		return () => window.removeEventListener("inspector-note-corrected", refresh);
	}, []);
	(0, import_react.useEffect)(() => {
		let live = true;
		setState({ loading: true });
		setNotes([]);
		setOpen({});
		setEdits({});
		setAi({});
		setDraft(null);
		list({ data: { id: noteId } }).then((r) => {
			if (!live) return;
			setNotes(r.notes);
			setState({ error: r.error });
		}).catch((e) => live && setState({ error: String(e) }));
		return () => {
			live = false;
		};
	}, [noteId, correctionRevision]);
	const run = async (fn) => {
		const id = noteId;
		setState({ busy: true });
		try {
			const r = await fn();
			if (active.current !== id) return false;
			if (r.notes) {
				setNotes(r.notes);
				setState({});
				setAi({});
				return true;
			}
			setState({ error: r.error || "失败" });
			return false;
		} catch (e) {
			if (active.current === id) setState({ error: String(e) });
			return false;
		}
	};
	const linked = /* @__PURE__ */ new Set([noteId, ...notes.map((n) => n.id)]);
	const busy = state.loading || state.busy;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/inspector/RelatedNotes.tsx:56:5:1d4fca74d79b667a59c339a8b7a2442c6e19d9d28ccfe8b8d18c31eb34a6e5a2:1",
		className: "space-y-2 rounded-md border p-2",
		"data-rw-inspector": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-inspector-source": "components/inspector/RelatedNotes.tsx:57:7:1d6fd1c0ba36f9cbeff542ca60f8d6fa34077ec58264f2418599c4d7d07fa710:1",
				className: "font-medium",
				children: ["关联注释（REL325 One manual note can have many related manual notes）· ", state.loading ? "读取中…" : `${notes.length} 条`]
			}),
			notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/RelatedNotes.tsx:59:9:8e26843010f3cb9cc0789cca0f035096ac9a69219e88e98095426913ca056ffa:1",
				className: "rounded border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					"aria-expanded": !!open[n.id],
					className: "h-auto w-full justify-start whitespace-normal rounded-none p-2 text-left",
					onClick: () => setOpen((o) => ({
						...o,
						[n.id]: !o[n.id]
					})),
					children: [open[n.id] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "mt-0.5 h-3 w-3 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "mt-0.5 h-3 w-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-source": "components/inspector/RelatedNotes.tsx:62:13:555ec9b3182d74bf998a986932f30d7c16fc128a1f6f041ee849b58ceeb5fb84:0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-source": "components/inspector/RelatedNotes.tsx:62:19:555ec9b3182d74bf998a986932f30d7c16fc128a1f6f041ee849b58ceeb5fb84:0",
								className: "text-muted-foreground",
								children: [
									"#",
									n.id,
									" · "
								]
							}),
							n.title,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-source": "components/inspector/RelatedNotes.tsx:62:85:555ec9b3182d74bf998a986932f30d7c16fc128a1f6f041ee849b58ceeb5fb84:0",
								className: "text-muted-foreground",
								children: [" · ", n.verified ? "已手动核对" : "未手动核对"]
							})
						]
					})]
				}), open[n.id] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/inspector/RelatedNotes.tsx:65:13:8edc87dac516bc15f60ce9d9473edfd874d96480088565417c07f3aa6997cda8:1",
					className: "space-y-2 border-t p-2",
					children: [(() => {
						const e = edits[n.id] || {
							title: n.title,
							text: n.text,
							verified: n.verified
						};
						const set = (v) => setEdits((m) => ({
							...m,
							[n.id]: {
								...e,
								...v
							}
						}));
						const dirty = e.title !== n.title || e.text !== n.text || e.verified !== n.verified;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"aria-label": "关联注释名字",
								value: e.title,
								maxLength: 240,
								disabled: busy,
								onChange: (ev) => set({ title: ev.target.value })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								"aria-label": "关联注释内容",
								rows: 8,
								value: e.text,
								disabled: busy,
								onChange: (ev) => set({ text: ev.target.value })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								"data-inspector-source": "components/inspector/RelatedNotes.tsx:71:19:5abe4e7d14c78b31c712637161d2ad3831f1a6c5f47ffa18a237463ade6d747a:1",
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: e.verified,
									disabled: busy,
									onCheckedChange: (v) => set({ verified: v }),
									"aria-label": "关联注释已手动核对"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/inspector/RelatedNotes.tsx:71:178:5abe4e7d14c78b31c712637161d2ad3831f1a6c5f47ffa18a237463ade6d747a:1",
									children: e.verified ? "已手动核对" : "未手动核对"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-source": "components/inspector/RelatedNotes.tsx:72:19:65452639ab5901d45f1385f697d8918307d34f601ef02390b31b5166ac68d559:1",
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									disabled: busy || !dirty || !e.title.trim(),
									onClick: async () => {
										if (await run(() => update({ data: {
											id: noteId,
											otherId: n.id,
											title: e.title.trim(),
											text: e.text,
											verified: e.verified
										} }))) setEdits((m) => {
											const c = { ...m };
											delete c[n.id];
											return c;
										});
									},
									children: "保存"
								}), dirty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-source": "components/inspector/RelatedNotes.tsx:74:31:6b3b949ff9f1249be634f77f5e23bcf9f3db6a80edd9fddd84e746c5995517c1:1",
									className: "text-muted-foreground",
									children: "有未保存的修改"
								})]
							})
						] });
					})(), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						disabled: busy,
						onClick: () => run(() => unlink({ data: n.side === "parent" ? {
							id: noteId,
							parent: n.id,
							child: noteId
						} : {
							id: noteId,
							parent: noteId,
							child: n.id
						} })),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unlink, { className: "mr-1 h-3 w-3" }), "取消关联"]
					})]
				})]
			}, `${n.side}-${n.id}`)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/RelatedNotes.tsx:82:7:379d77194854700f5f426c480d28f7077b2b0c156b7d71c05b381d83bd1a421d:1",
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
						open: pick,
						onOpenChange: setPick,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								disabled: busy,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "mr-1 h-3 w-3" }), "关联已有注释"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
							"data-rw-inspector": true,
							className: "z-[10001] w-80 p-0",
							onOpenAutoFocus: (e) => e.preventDefault(),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteSearchList, {
								onClose: () => setPick(false),
								exclude: /* @__PURE__ */ new Set([...linked, noteId]),
								onPick: (c) => {
									setPick(false);
									run(() => link({ data: {
										id: noteId,
										otherId: c.id
									} }));
								}
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						disabled: busy,
						onClick: () => setDraft({
							title: "",
							text: ""
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3 w-3" }), "新建关联注释"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						disabled: busy || !notes.length || ai.loading,
						onClick: async () => {
							const id = noteId;
							setAi({ loading: true });
							try {
								const r = await compare({ data: {
									noteId: id,
									context: JSON.stringify({ page: window.location.pathname + window.location.search })
								} });
								if (active.current === id) setAi(r.report ? { report: r.report } : { error: r.error || "失败" });
							} catch (e) {
								if (active.current === id) setAi({ error: String(e) });
							}
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1 h-3 w-3" }), ai.loading ? "AI 比较中…" : "AI 三方核对实际代码与注释"]
					})
				]
			}),
			draft && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/RelatedNotes.tsx:97:9:d8c5f8c8eb3aee4901ac543fb980ab90481cba748a1871522ebfd33da7790891:1",
				className: "space-y-2 rounded border p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "关联注释名字",
						placeholder: "名字",
						value: draft.title,
						maxLength: 240,
						onChange: (e) => setDraft({
							...draft,
							title: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 6,
						placeholder: "内容",
						value: draft.text,
						onChange: (e) => setDraft({
							...draft,
							text: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/inspector/RelatedNotes.tsx:100:11:399695daa0d3e9f56cad751c79ccb0dea05106812f8a4c18a0a193723df16599:1",
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							disabled: busy || !draft.title.trim(),
							onClick: async () => {
								const d = draft;
								if (await run(() => link({ data: {
									id: noteId,
									create: {
										title: d.title.trim(),
										text: d.text
									}
								} }))) setDraft(null);
							},
							children: "保存并关联"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setDraft(null),
							children: "取消"
						})]
					})
				]
			}),
			state.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/RelatedNotes.tsx:106:23:ac52d5d751bc3f6ed43a968b62145c962619663896b15e90a181ceded36d1a13:1",
				className: "text-destructive",
				children: state.error
			}),
			ai.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/RelatedNotes.tsx:107:20:d4db27233e60d0a515c7a6dcefd73b640471df300911a777e6fb4b73a978466e:1",
				className: "text-destructive",
				children: ai.error
			}),
			ai.report && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConflictReportView, { report: ai.report })
		]
	});
}
/** Researcher manual notes for the selected element or the whole page, saved privately so they survive refresh/close. */
/** Per-element read cache for this browser session; cleared on save/lock/retry so it never shows stale bindings. */
var oneCache = /* @__PURE__ */ new Map();
function ManualNotes({ noteKey, legacyKey, legacySourceKey, fingerprint, scope, page, label, tag, onChange, buildEvidence, evidenceReady = false }) {
	const loadOne = useServerFn(loadInspectorNotes);
	const save = useServerFn(saveInspectorNote);
	const select = useServerFn(selectInspectorNote);
	const analyze = useServerFn(explainReadWrite);
	const [ai, setAi] = (0, import_react.useState)({});
	const [picked, setPicked] = (0, import_react.useState)();
	const [selected, setSelected] = (0, import_react.useState)();
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [savedTitle, setSavedTitle] = (0, import_react.useState)("");
	const [choice, setChoice] = (0, import_react.useState)();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [text, setText] = (0, import_react.useState)("");
	const [saved, setSaved] = (0, import_react.useState)("");
	const [state, setState] = (0, import_react.useState)({ loading: true });
	const [retry, setRetry] = (0, import_react.useState)(0);
	const [verified, setVerified] = (0, import_react.useState)(false);
	const [savedVerified, setSavedVerified] = (0, import_react.useState)(false);
	const [stale, setStale] = (0, import_react.useState)(false);
	const [loadedFor, setLoadedFor] = (0, import_react.useState)();
	const ready = loadedFor === noteKey;
	const activeKey = (0, import_react.useRef)(noteKey);
	activeKey.current = noteKey;
	const revision = `${noteKey}|${selected}|${title}|${text}`;
	const activeRevision = (0, import_react.useRef)(revision);
	activeRevision.current = revision;
	const correctionState = (0, import_react.useRef)({
		selected,
		title,
		text,
		savedTitle,
		saved
	});
	correctionState.current = {
		selected,
		title,
		text,
		savedTitle,
		saved
	};
	(0, import_react.useEffect)(() => {
		const updated = (event) => {
			const note = event.detail;
			const current = correctionState.current;
			if (note.id !== current.selected) return;
			if (current.text !== current.saved || current.title !== current.savedTitle) {
				setStale(true);
				setState({ error: "此笔记已通过“建议修改或补充”保存；这里仍有未保存的旧编辑，请重新读取后再编辑。" });
				return;
			}
			setText(note.text);
			setSaved(note.text);
			setTitle(note.title);
			setSavedTitle(note.title);
			setVerified(note.verified);
			setSavedVerified(note.verified);
			onChange?.(note.text);
		};
		window.addEventListener("inspector-note-corrected", updated);
		return () => window.removeEventListener("inspector-note-corrected", updated);
	}, [onChange]);
	(0, import_react.useEffect)(() => {
		setAi({});
	}, [revision]);
	const analyzeNotes = async () => {
		if (!buildEvidence || !selected) return;
		const current = revision;
		setAi({ loading: true });
		try {
			const context = buildEvidence();
			const result = await analyze({ data: {
				context,
				scope,
				noteId: selected,
				draft: {
					title,
					text
				}
			} });
			if (activeRevision.current !== current) return;
			setAi(result.report ? { report: result.report } : { error: result.error || "分析失败，核查未完成。" });
		} catch (error) {
			if (activeRevision.current === current) setAi({ error: String(error) });
		}
	};
	(0, import_react.useEffect)(() => {
		let live = true;
		const session = getWPToken() || "";
		setLoadedFor(void 0);
		setSelected(void 0);
		setChoice(void 0);
		setCreating(false);
		setText("");
		setSaved("");
		setTitle(label.slice(0, 240));
		setSavedTitle("");
		setVerified(false);
		setSavedVerified(false);
		const apply = async (map) => {
			if (!live || session !== (getWPToken() || "")) return;
			const n = findSameElementNote(map, noteKey);
			if (!live || session !== (getWPToken() || "")) return;
			setText(n?.text || "");
			setSaved(n?.text || "");
			onChange?.(n?.text || "");
			setState({ at: n?.updatedAt });
			setSelected(n?.id);
			setChoice(n?.id);
			setTitle(n?.title || label.slice(0, 240));
			setSavedTitle(n?.title || label.slice(0, 240));
			setVerified(!!n?.verified);
			setSavedVerified(!!n?.verified);
			setCreating(false);
			setStale(false);
			setLoadedFor(noteKey);
		};
		const hit = oneCache.get(`${session}|${noteKey}`);
		if (hit !== void 0) apply(new Map(hit ? [[noteKey, hit]] : []));
		else {
			setState({ loading: true });
			setText("");
			setSaved("");
			onChange?.("");
			const keys = [noteKey, ...legacyKey && legacyKey !== noteKey ? [legacyKey] : []];
			loadOne({ data: {
				keys,
				...fingerprint && tag ? {
					fingerprint,
					tag,
					page
				} : {},
				...legacySourceKey && fingerprint ? { legacy: {
					key: legacySourceKey,
					label
				} } : {}
			} }).then((r) => {
				if ("error" in r && r.error) throw new Error(r.error);
				const n = r.notes[0] || null;
				if (n) oneCache.set(`${session}|${noteKey}`, n);
				return apply(new Map(n ? [[noteKey, n]] : []));
			}).catch((e) => live && setState({ error: String(e) }));
		}
		return () => {
			live = false;
		};
	}, [
		noteKey,
		legacyKey,
		legacySourceKey,
		fingerprint,
		tag,
		retry
	]);
	const stableAnchor = async () => {
		const match = fingerprint?.match(/^([^:]+):(\d+):\d+:([0-9a-f]{64}):1$/);
		if (!match || !tag) return {};
		const line = Number(match[2]);
		return { source: {
			file: match[1],
			line,
			endLine: line,
			tag,
			digest: match[3]
		} };
	};
	const doSave = async () => {
		if (stale || !ready) return;
		const session = getWPToken() || "";
		const key = noteKey;
		setState((s) => ({
			...s,
			saving: true,
			error: void 0
		}));
		const anchor = await stableAnchor();
		const r = await save({ data: {
			key: noteKey,
			scope,
			page,
			label,
			title,
			id: selected,
			create: creating,
			verified,
			text,
			...anchor
		} }).catch((e) => ({ error: String(e) }));
		if (session !== (getWPToken() || "")) return;
		if ("note" in r && r.note) {
			inspectorNotesCache.put(session, r.note);
			oneCache.delete(`${session}|${key}`);
			if (activeKey.current !== key) return;
			setSaved(r.note.text);
			onChange?.(r.note.text);
			setState({ at: r.note.updatedAt });
			setSelected(r.note.id);
			setChoice(r.note.id);
			setTitle(r.note.title || title);
			setSavedTitle(r.note.title || title);
			setVerified(!!r.note.verified);
			setSavedVerified(!!r.note.verified);
			setCreating(false);
		} else if (activeKey.current === key) setState({ error: r.error || "保存失败" });
	};
	const lockChoice = async () => {
		if (!choice || !ready) return;
		const key = noteKey;
		const session = getWPToken() || "";
		setState((s) => ({
			...s,
			saving: true,
			error: void 0
		}));
		try {
			const result = await select({ data: {
				key,
				id: choice,
				scope,
				page,
				label,
				...await stableAnchor()
			} });
			if (session !== (getWPToken() || "") || activeKey.current !== key) return;
			if (!result.note) throw new Error(result.error || "选择未保存");
			inspectorNotesCache.put(session, result.note);
			oneCache.delete(`${session}|${key}`);
			setSelected(result.note.id);
			setText(result.note.text);
			setSaved(result.note.text);
			setTitle(result.note.title || "");
			setSavedTitle(result.note.title || "");
			setVerified(!!result.note.verified);
			setSavedVerified(!!result.note.verified);
			onChange?.(result.note.text);
			setState({ at: result.note.updatedAt });
		} catch (e) {
			if (activeKey.current === key) setState({ error: String(e) });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/inspector/ManualNotes.tsx:313:5:b1f18a37d975d9c811c87faa13092e4c6f2e817c89a40122dbcb6f24eecfaf4d:1",
		className: "space-y-2 text-xs",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/ManualNotes.tsx:314:7:ba83621fc5269eb64553adf077c34db2488c754d91a4563e51430e5d631921c7:1",
				className: "text-muted-foreground",
				children: state.loading ? "正在读取已保存的注释…" : selected ? `当前注释：${savedTitle} · CCT324 #${selected}` : "当前没有已保存的注释"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/ManualNotes.tsx:321:7:379d77194854700f5f426c480d28f7077b2b0c156b7d71c05b381d83bd1a421d:1",
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
						open,
						onOpenChange: setOpen,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								disabled: state.loading || state.saving,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "mr-1 h-3 w-3" }), "选择其他注释"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
							"data-rw-inspector": true,
							className: "z-[10001] w-80 p-0",
							onOpenAutoFocus: (e) => e.preventDefault(),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteSearchList, {
								onClose: () => setOpen(false),
								onPick: (n) => {
									setChoice(n.id);
									setPicked(n);
									setOpen(false);
								}
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						disabled: !ready || !choice || choice === selected || state.saving,
						onClick: lockChoice,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mr-1 h-3 w-3" }), "锁定选择"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						disabled: state.loading || state.saving,
						onClick: () => {
							setCreating(true);
							setSelected(void 0);
							setChoice(void 0);
							setTitle(label.slice(0, 240));
							setSavedTitle("");
							setVerified(false);
							setSavedVerified(false);
							setText("");
							setSaved("");
							onChange?.("");
							setState({});
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3 w-3" }), "新建"]
					})
				]
			}),
			choice && choice !== selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-inspector-source": "components/inspector/ManualNotes.tsx:380:9:860ca9ec03dc6f31e5b9c8fc1a6ec1cd03530a688a1b0ef84c12ce898700511b:1",
				children: [
					"待锁定：",
					picked?.id === choice ? picked.title : "",
					" · #",
					choice,
					" ·",
					" ",
					picked?.id === choice && picked.verified ? "已手动核对" : "未手动核对"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				"aria-label": "注释名字",
				value: title,
				onChange: (e) => setTitle(e.target.value),
				maxLength: 240,
				disabled: state.loading || state.saving
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: text,
				onChange: (e) => setText(e.target.value),
				rows: 8,
				disabled: state.loading,
				placeholder: state.loading ? "读取中…" : "写下这里应该怎么读写、怎么判定…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				"data-inspector-source": "components/inspector/ManualNotes.tsx:403:7:52fbadb032c81c0b00ca864246d22a706ed002e72bd867bbbba6674e879461b6:1",
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: verified,
						onCheckedChange: setVerified,
						disabled: state.loading || state.saving,
						"aria-label": "已手动核对"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "components/inspector/ManualNotes.tsx:410:9:35fb2abb7b1519522a05518e8757407b16f95e271263c82713ecfb3010040b69:1",
						children: verified ? "已手动核对" : "未手动核对"
					}),
					verified !== savedVerified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "components/inspector/ManualNotes.tsx:412:11:b7c6e5b3f11c0036e5baaf68962c92b80d7fc716dcb968e272e1311d662c4df7:1",
						className: "text-muted-foreground",
						children: "（未保存）"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/ManualNotes.tsx:415:7:dccebd96e52ebef85654c30d1426c65b69bfb3c87def3969adc422a297fcddd9:1",
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: doSave,
						disabled: !ready || stale || state.loading || state.saving || !title.trim() || selected !== void 0 && text === saved && title === savedTitle && verified === savedVerified,
						children: state.saving ? "保存中…" : "保存注释"
					}),
					text !== saved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-inspector-source": "components/inspector/ManualNotes.tsx:434:11:73d23f58004326d8f5438b9f935a49407fb18dba5d42b8760e8b618ca9342e70:1",
						className: "text-muted-foreground",
						children: "有未保存的修改"
					}),
					text === saved && state.at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-source": "components/inspector/ManualNotes.tsx:437:11:f793f1ec1ee998c7b777b7edd08bd7b4ae40e14cda43509866a067e489190d81:1",
						className: "text-muted-foreground",
						children: ["已保存 ", new Date(state.at).toLocaleString()]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				disabled: state.loading || state.saving || ai.loading || !selected || !buildEvidence || !evidenceReady,
				onClick: analyzeNotes,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1 h-3 w-3" }), ai.loading ? "AI 分析中…" : !evidenceReady ? "等这页数据和代码读完…" : "AI 分析：注释、关联注释与实际读写"]
			}),
			ai.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/ManualNotes.tsx:463:9:d3947c382ef068c97626ce7a6f4574ddd3d4e267ed22bbb4bfede272d3bc90d2:1",
				role: "alert",
				className: "text-destructive",
				children: ai.error
			}),
			ai.report && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConflictReportView, { report: ai.report }),
			selected && !creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelatedNotes, { noteId: selected }) : !state.loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/ManualNotes.tsx:472:11:11b85f0640744a32d505d506962b601849428066e6552927e8ea88fd0cdb8721:1",
				className: "rounded-md border p-2 text-muted-foreground",
				children: "关联注释：这个元素还没有自己的注释。先写好并点\"保存注释\"（或用\"选择其他注释\"再\"锁定选择\"），下面就会出现\"关联已有注释\"（可搜索名字或编号）和\"新建关联注释\"。"
			}),
			state.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/ManualNotes.tsx:478:9:3201d6271da754cfae874d4144b03e586dd547db112aec00f65cece517cbce53:1",
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					"data-inspector-source": "components/inspector/ManualNotes.tsx:479:11:e6441047e7fe131fa9d3dd53f1c0eb6087b0ea874dfcfc29979e37454524145c:1",
					className: "text-destructive",
					children: state.error
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => {
						inspectorNotesCache.reset();
						oneCache.clear();
						setRetry((n) => n + 1);
					},
					children: "重新读取"
				})]
			})
		]
	});
}
/**
* Reads what the browser already knows about a clicked element: its source
* locations (dev builds tag JSX with data-tsd-source), React component names,
* click/submit handler code, link target, and which recorded WordPress row
* fields hold the exact text it shows.
*/
function componentName(f) {
	const type = f?.type;
	if (!(typeof type === "function" || type && typeof type === "object" && (type.render || type.type))) return "";
	const name = type.displayName || type.name || type.render?.name || type.type?.name || "";
	return name && !SKIP_COMPONENTS.test(name) ? name : "";
}
/**
* One identity for an element in every build: the app's own component names around it plus its position
* in the rendered markup of the nearest two components (tag + n-th of that tag; list items by fixed slot
* key, data rows as "*" so one list's rows share a note). No source file, no line number, no build marker.
*/
function stableAnchor(el) {
	const scope = el.closest("[data-inspector-scope]");
	const scopeName = scope?.getAttribute("data-inspector-scope");
	if (scope && scopeName) {
		const steps = [];
		for (let node = el; node; node = node.parentElement) {
			const tag = node.tagName.toLowerCase();
			if (node === scope) {
				steps.push(tag);
				break;
			}
			const siblings = node.parentElement ? [...node.parentElement.children].filter((c) => c.tagName === node.tagName && !c.closest("[data-rw-inspector]")) : [node];
			steps.push(`${tag}${siblings.indexOf(node)}`);
		}
		return {
			names: [`scope:${scopeName}`],
			path: steps.reverse().join(">")
		};
	}
	const names = [];
	const hosts = [];
	let f = fiberOf(el);
	const collecting = () => (names.length < 2 || hosts.length < 4) && hosts.length < 20;
	let open = true;
	for (let depth = 0; f && depth < 160 && (names.length < 4 || open); depth++, f = f.return) {
		if (typeof f.type === "string") {
			open = collecting();
			if (open && f.stateNode instanceof Element) hosts.push({
				node: f.stateNode,
				key: f.key
			});
			continue;
		}
		const last = hosts[hosts.length - 1];
		if (open && last && last.key == null && f.key != null) last.key = f.key;
		const n = componentName(f);
		if (n && !names.includes(n) && names.length < 4) names.push(n);
	}
	return {
		names,
		path: hosts.map(({ node, key }) => {
			const tag = node.tagName.toLowerCase();
			if (key != null) return `${tag}[${staticSlotKey(key) ?? "*"}]`;
			const sibs = node.parentElement ? [...node.parentElement.children].filter((c) => c.tagName === node.tagName && !c.closest("[data-rw-inspector]")) : [node];
			return `${tag}${Math.max(0, sibs.indexOf(node))}`;
		}).reverse().slice(-20).join(">")
	};
}
/** The element note key used by both builds; record ids in the page path are folded to :id. */
function stableElementKey(pathname, anchor) {
	if (anchor.names[0]?.startsWith("scope:")) return [
		"el",
		"*",
		anchor.names.join("<"),
		`@${anchor.path}`
	].join("|");
	return [
		"el",
		pathname.replace(/\/\d+(?=\/|$)/g, "/:id"),
		anchor.names.join("<"),
		`@${anchor.path}`
	].join("|");
}
function fileOf(src) {
	return normalizeFile(src.split(":")[0]);
}
/** First ancestor source in a different file than `own`: the place that used this component. */
function useSiteOf(node, own) {
	for (let n = node.parentElement; n; n = n.parentElement) {
		const s = n.getAttribute("data-inspector-source") || n.getAttribute("data-tsd-source");
		if (s && fileOf(s) !== own && !fileOf(s).startsWith("components/ui/")) return fileOf(s) + ":" + (s.split(":")[1] || "");
	}
}
/**
* A reusable component (stat card, toggle row) rendered from several places shares one JSX line,
* so the place that used it is added to the note key — but only when this page really uses that line
* from more than one place, so single-use components keep their existing notes.
*/
function sharedCallSite(owner) {
	const attr = owner?.hasAttribute("data-inspector-source") ? "data-inspector-source" : "data-tsd-source";
	const raw = owner?.getAttribute(attr);
	if (!owner || !raw) return void 0;
	const own = fileOf(raw);
	const mine = useSiteOf(owner, own);
	if (!mine) return void 0;
	const sites = /* @__PURE__ */ new Set();
	document.querySelectorAll(`[${attr}="${CSS.escape(raw)}"]`).forEach((n) => {
		if (!n.closest("[data-rw-inspector]")) sites.add(useSiteOf(n, own) || "");
	});
	return sites.size > 1 ? mine : void 0;
}
/** A list item's React key names a fixed slot (stat card label) rather than a data row (post id, uuid). */
function staticSlotKey(key) {
	if (typeof key !== "string") return void 0;
	const k = key.trim();
	if (!k || k.length > 60 || !/[A-Za-z\u4e00-\u9fff]/.test(k) || /\d{2,}/.test(k) || /^[A-Za-z]+[-_:#]\d+$/.test(k) || /^[0-9a-f-]{16,}$/i.test(k)) return void 0;
	return k;
}
var SKIP_COMPONENTS = /^(Primitive|Slot|SlotClone|Presence|Portal|Provider|Consumer|Context|Lazy|Match|Outlet|ErrorBoundary|Suspense|Fragment|Popper|FocusScope|DismissableLayer|Collection|RovingFocus|_c\d*|[a-z])/;
function fiberOf(el) {
	const key = Object.keys(el).find((k) => k.startsWith("__reactFiber"));
	return key ? el[key] : null;
}
function cleanText(el) {
	const input = el;
	return ("value" in input && typeof input.value === "string" && input.value ? input.value : el.innerText || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 300);
}
function norm(v) {
	return String(v ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
/** Times a stored value can appear as on screen: "08:00" → 8:00 / 8:00 AM; epoch seconds → local HH:MM and date. */
function displayForms(raw) {
	const forms = [];
	const hm = (h, m) => {
		const mm = String(m).padStart(2, "0");
		const h12 = h % 12 || 12;
		const ap = h >= 12 ? "pm" : "am";
		const zh = h >= 12 ? "下午" : "上午";
		forms.push(`${h}:${mm}`, `${String(h).padStart(2, "0")}:${mm}`, `${h12}:${mm} ${ap}`, `${zh}${h12}:${mm}`);
		if (m === 0) forms.push(`${h12} ${ap}`, `${h12}${ap}`, `${zh}${h12}时`, `${h}时`);
	};
	const t = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
	if (t) hm(+t[1], +t[2]);
	if (/^\d{10}$|^\d{13}$/.test(raw)) {
		const d = /* @__PURE__ */ new Date(raw.length === 10 ? +raw * 1e3 : +raw);
		if (!isNaN(+d)) {
			hm(d.getHours(), d.getMinutes());
			forms.push(d.toISOString().slice(0, 10), d.toLocaleDateString());
		}
	}
	const dt = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/);
	if (dt) {
		hm(+dt[2], +dt[3]);
		forms.push(dt[1]);
	}
	return forms.map((f) => f.toLowerCase());
}
function matchValues(text, requests) {
	const out = [];
	if (!text || text.length < 1 || text.length > 160) return out;
	const want = text.toLowerCase();
	const seen = /* @__PURE__ */ new Set();
	for (const req of requests) {
		if (req.method !== "GET" || !req.rows) continue;
		const target = decodeEndpoint(req.method, req.endpoint);
		const rows = Array.isArray(req.rows) ? req.rows : [req.rows];
		for (const row of rows) {
			if (!row || typeof row !== "object") continue;
			const rowId = String(row["_ID"] ?? row["id"] ?? row["child_object_id"] ?? row["parent_object_id"] ?? "?");
			const scan = (obj, prefix, def) => {
				for (const [k, v] of Object.entries(obj)) {
					if (k === "_ID" || k === "id" || k.startsWith("cct_")) continue;
					if (v && typeof v === "object" && !Array.isArray(v)) {
						if (k === "meta") scan(v, "meta.", target.rel);
						continue;
					}
					const s = norm(Array.isArray(v) ? v.join(", ") : v);
					if (!s) continue;
					const low = s.toLowerCase();
					let how = "";
					if (low === want) how = "完全相同 / exact";
					else if (low.length >= 2 && !/^\d{1,3}$/.test(low) && want.includes(low)) how = "包含在显示文字中 / part of the text";
					else if (want.length >= 4 && low.includes(want) && low.length <= want.length * 3) how = "显示的是其中一部分 / shown in part";
					else {
						const f = displayForms(s).find((x) => want.includes(x));
						if (f) how = `换算显示为 / shown as ${f}`;
					}
					if (!how) continue;
					const key = `${target.key}|${rowId}|${prefix}${k}`;
					if (seen.has(key)) continue;
					seen.add(key);
					out.push({
						target,
						row: rowId,
						field: prefix + k,
						fieldName: fieldName(def, k),
						option: optionName(def, k, v),
						value: `${s.slice(0, 120)}（${how}）`,
						request: req
					});
				}
			};
			scan(row, "", target.cct);
			if (out.length > 40) return out;
		}
	}
	return out;
}
function inspectElement(el, requests) {
	const sources = [];
	let firstTagged = null;
	for (let n = el; n && sources.length < 12; n = n.parentElement) {
		const s = n.getAttribute("data-inspector-source") || n.getAttribute("data-tsd-source");
		if (s && !firstTagged) firstTagged = n;
		if (s) {
			const f = normalizeFile(s.split(":")[0]) + ":" + (s.split(":")[1] || "");
			if (!sources.includes(f)) sources.push(f);
		}
	}
	const components = [];
	const handlers = [];
	const dataProps = [];
	const pending = [];
	let link;
	let owner = "";
	let f = fiberOf(el);
	for (let depth = 0; f && depth < 60; depth++, f = f.return) {
		const type = f.type;
		if (typeof type === "function" || type && typeof type === "object" && (type.render || type.type)) {
			const name = type.displayName || type.name || type.render?.name || type.type?.name || "";
			if (name && !SKIP_COMPONENTS.test(name) && !components.includes(name)) components.push(name);
			if (name && !owner) owner = name;
			const fp = f.memoizedProps;
			if (name && !SKIP_COMPONENTS.test(name) && fp && typeof fp === "object" && dataProps.length < 12 && components.length <= 4) for (const [k, v] of Object.entries(fp)) {
				if (k === "children" || k === "className" || k === "style" || k.startsWith("data-") || k.startsWith("aria-") || typeof v === "function" || v == null || v.$$typeof) continue;
				if (typeof v === "object" || typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
					let txt;
					try {
						txt = JSON.stringify(v, (_k, x) => typeof x === "function" ? void 0 : x && x.$$typeof ? "[element]" : x);
					} catch {
						txt = String(v);
					}
					if (txt && txt.length > 1) dataProps.push({
						component: name,
						prop: k,
						value: txt.slice(0, 600)
					});
				}
			}
		}
		const props = f.memoizedProps;
		if (props && typeof props === "object" && depth < 25) {
			for (const prop of [
				"onClick",
				"onSubmit",
				"onSelect",
				"onValueChange",
				"onCheckedChange",
				"onChange",
				"onPointerDown"
			]) {
				const fn = props[prop];
				if (typeof fn === "function" && handlers.length < 4 && !handlers.some((h) => h.code === String(fn))) {
					const code = String(fn);
					if (code.length > 20 && !/\[native code\]/.test(code)) pending.push({
						prop,
						code: code.slice(0, 1600)
					});
				}
			}
			if (!link && typeof props.to === "string") link = props.to;
			if (!link && typeof props.href === "string") link = props.href;
		}
	}
	if (!link) {
		const a = el.closest("a");
		if (a?.getAttribute("href")) link = a.getAttribute("href");
	}
	const text = cleanText(el);
	let box = el.closest("button, a, li, tr, [role=button], [role=row], [role=listitem]");
	if (!box) {
		box = el;
		for (let i = 0; i < 2 && box.parentElement && cleanText(box.parentElement).length < 200; i++) box = box.parentElement;
	}
	const cardText = cleanText(box);
	let itemIndex = -1;
	let itemSlot;
	for (let n = el; n && n.parentElement && itemIndex < 0; n = n.parentElement) {
		const src = n.getAttribute("data-tsd-source");
		if (!src) continue;
		const sibs = [...n.parentElement.children].filter((c) => c.getAttribute("data-tsd-source") === src);
		if (sibs.length > 1) {
			itemIndex = sibs.indexOf(n);
			const parentFiber = fiberOf(n.parentElement);
			for (let fb = fiberOf(n), i = 0; fb && fb !== parentFiber && i < 8; fb = fb.return, i++) if (fb.key != null) {
				itemSlot = staticSlotKey(fb.key);
				break;
			}
		}
	}
	if (itemIndex < 0) {
		const ownKey = (n) => {
			const parentFiber = n.parentElement ? fiberOf(n.parentElement) : null;
			for (let fb = fiberOf(n), i = 0; fb && fb !== parentFiber && i < 8; fb = fb.return, i++) if (fb.key != null) return fb.key;
			return null;
		};
		for (let n = el, depth = 0; n && n.parentElement && depth < 8; n = n.parentElement, depth++) {
			const key = ownKey(n);
			if (key == null) continue;
			const sibs = [...n.parentElement.children].filter((c) => c.tagName === n.tagName && ownKey(c) != null);
			if (sibs.length > 1) {
				itemIndex = sibs.indexOf(n);
				itemSlot = staticSlotKey(key);
				break;
			}
		}
	}
	const around = cardText.toLowerCase();
	const files = sources.map((x) => x.split(":")[0].split("/").pop().replace(/\.tsx?$/, ""));
	const writer = components.find((c) => files.includes(c)) || owner || "?";
	for (const h of pending) if (handlers.length < 4 && !handlers.some((x) => x.code === h.code)) handlers.push({
		...h,
		owner: writer
	});
	return {
		tag: el.tagName.toLowerCase(),
		text,
		sources,
		components: components.slice(0, 12),
		handlers,
		link,
		props: dataProps,
		matches: rank(matchValues(text, requests), around, text.toLowerCase()),
		card: cardText,
		itemIndex,
		itemSlot,
		callSite: sharedCallSite(firstTagged),
		anchor: stableAnchor(el),
		sourceFingerprint: el.getAttribute("data-inspector-source") || void 0
	};
}
function rank(matches, around, own) {
	for (const m of matches) {
		const row = (Array.isArray(m.request.rows) ? m.request.rows : [m.request.rows]).find((r) => r && String(r["_ID"] ?? r["id"] ?? "") === m.row);
		if (!row) continue;
		m.sameCard = Object.entries(row).some(([k, v]) => !k.startsWith("cct_") && k !== m.field.replace(/^meta\./, "") && k !== m.field && !k.startsWith("_") && typeof v === "string" && v.length >= 2 && !/^\d{1,3}$/.test(v) && !own.includes(v.toLowerCase()) && (around.includes(v.toLowerCase()) || displayForms(v).some((f) => f.length >= 4 && !own.includes(f) && around.includes(f))));
	}
	return [...matches].sort((a, b) => Number(!!b.sameCard) - Number(!!a.sameCard));
}
/** Every source file that rendered something on the current page. */
function pageSourceFiles() {
	const set = /* @__PURE__ */ new Set();
	document.querySelectorAll("[data-tsd-source]").forEach((n) => {
		if (n.closest("[data-rw-inspector]")) return;
		set.add(normalizeFile(n.getAttribute("data-tsd-source").split(":")[0]));
	});
	return [...set].filter((f) => !f.startsWith("components/ui/"));
}
/**
* Decision-logic trace for one rendered element, read live from current source:
*  1. the JSX expression that prints the element (its data-tsd-source line),
*  2. where each value it prints is assigned in that file (e.g. `status:`),
*  3. the definitions of functions those lines call, following imports,
* with every fallback (`||`, `??`, `catch`, default branches) flagged so
* redundant or wrong fallbacks are visible.
*/
var FALLBACK = /\|\||\?\?|\bcatch\b|\bdefault\s*:|\?[^:?]+:\s*(?:null|undefined|""|''|\[\]|\{\}|0|false|["'`][^"'`]*["'`])\s*[,;)}]?\s*$/;
var GENERIC = /* @__PURE__ */ new Set([
	"data",
	"isLoading",
	"error",
	"props",
	"value",
	"item",
	"items",
	"result",
	"res",
	"row",
	"rows"
]);
var KEYWORDS = /* @__PURE__ */ new Set([
	"if",
	"for",
	"while",
	"switch",
	"return",
	"typeof",
	"new",
	"await",
	"function",
	"catch",
	"map",
	"filter",
	"forEach",
	"find",
	"some",
	"every",
	"reduce",
	"push",
	"includes",
	"slice",
	"split",
	"join",
	"replace",
	"String",
	"Number",
	"Boolean",
	"parseInt",
	"parseFloat",
	"JSON",
	"Object",
	"Array",
	"Math",
	"Date",
	"Promise",
	"useMemo",
	"useState",
	"useEffect",
	"useCallback",
	"t",
	"cn"
]);
function block(lines, start, max = 30) {
	let depth = 0;
	const code = [];
	for (let i = start; i < lines.length && code.length < max; i++) {
		const l = lines[i];
		code.push(l);
		for (const ch of l) if (ch === "{" || ch === "(" || ch === "[") depth++;
		else if (ch === "}" || ch === ")" || ch === "]") depth--;
		if (depth <= 0 && i > start && /[;,)}]\s*$/.test(l)) break;
		if (depth <= 0 && i === start && /[;,]\s*$/.test(l)) break;
	}
	return {
		from: start,
		code
	};
}
function step(file, from, title, code) {
	return {
		file,
		line: from + 1,
		title,
		code,
		fallbacks: code.map((l, i) => FALLBACK.test(l) ? i : -1).filter((i) => i >= 0)
	};
}
function importsOf(file, text) {
	const map = /* @__PURE__ */ new Map();
	for (const m of text.matchAll(/import\s*\{([^}]+)\}\s*from\s*["'`]([^"'`]+)["'`]/g)) {
		const target = resolveImport(file, m[2]);
		if (!target) continue;
		for (const part of m[1].split(",")) {
			const name = part.trim().split(/\s+as\s+/).pop().replace(/^type\s+/, "");
			if (name) map.set(name, target);
		}
	}
	for (const m of text.matchAll(/import\(\s*["'`]([^"'`]+)["'`]\s*\)\s*\)?\s*\.\s*([A-Za-z_$][\w$]*)/g)) {
		const target = resolveImport(file, m[1]);
		if (target && !map.has(m[2])) map.set(m[2], target);
	}
	for (const m of text.matchAll(/(?:const|let)\s*\{([^}]+)\}\s*=\s*await\s+import\(\s*["'`]([^"'`]+)["'`]\s*\)/g)) {
		const target = resolveImport(file, m[2]);
		if (!target) continue;
		for (const part of m[1].split(",")) {
			const name = part.trim().split(/\s*:\s*/).pop();
			if (name && !map.has(name)) map.set(name, target);
		}
	}
	return map;
}
function findDefinition(lines, name) {
	const re = new RegExp(`(?:function\\s+${name}\\b|(?:const|let|var)\\s+(?:\\{[^}=]*[\\s{,:]|\\[[^\\]=]*[\\s\\[,])?${name}\\b[^=]*=(?!=)|^\\s*${name}\\s*\\([^)]*\\)\\s*\\{)`);
	return lines.findIndex((l) => re.test(l));
}
var squash = (x) => x.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, "");
/** In an item list (`[{ label: t("dashboard.pendingTasks"), value: … }]`) pick the item whose label is the text beside the clicked value. */
function focusLines(hits, lines, shown, card) {
	const rest = card.replace(shown, " ").replace(/\s+/g, " ").trim();
	const phrases = [rest, ...rest.split(/[\s·|/]+/)].map(squash).filter((w) => w.length > 2 && !/^\d+$/.test(w));
	const words = shown.split(/\s+/).map(squash).filter((w) => w.length > 2 && !/^\d+$/.test(w));
	const whole = [squash(shown)].filter((w) => w.length > 2 && !/^\d+$/.test(w));
	for (const [n, set] of [
		whole,
		phrases.slice(0, 1),
		phrases.slice(1),
		words
	].entries()) {
		if (!set.length) continue;
		const f = hits.filter((i) => {
			const t = squash(expandLine(lines, i));
			return set.some((w) => t.includes(w));
		});
		if (f.length && (n < 2 || f.length === 1)) return f;
	}
	return [];
}
/** `n` is defined in the clicked component before the shown line, or at file top level (not inside some other function). */
function inScopeDef(lines, n, from, at, self) {
	const re = new RegExp(`(?:const|let|var)\\s+(?:\\{[^}=]*[\\s{,:]|\\[[^\\]=]*[\\s\\[,])?${n}\\b[^=]*=(?!=)|function\\s+${n}\\b`);
	return lines.some((l, i) => i !== self && re.test(l) && (i >= from && i < at || /^(export\s+)?(const|let|function|async)/.test(l)));
}
/** A line plus the definitions of the local labels it uses (label: careGroupsLabel → const careGroupsLabel = … "Care Teams"). */
function expandLine(lines, i) {
	let out = lines[i];
	for (const id of lines[i].matchAll(/(?<![.\w$])([a-z_$][\w$]*(?:Label|Text|Title|Name))\b/g)) {
		const d = findDefinition(lines, id[1]);
		if (d >= 0 && d !== i) out += " " + lines.slice(d, d + 3).join(" ");
	}
	return out;
}
/** Identifiers in the expression given to `key:` on one line (`value: loading ? "—" : myPendingTasks.length`). */
function exprIds(line, key) {
	const m = line.match(new RegExp(`\\b${key}\\s*:\\s*(.+?)(?:,\\s*\\w+\\s*:|\\s*\\}\\s*[,\\]]?|$)`));
	if (!m) return [];
	return [...m[1].replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "").matchAll(/(?<![.\w$])([a-z_$][\w$]*)\b/g)].map((x) => x[1]).filter((n) => !KEYWORDS.has(n) && n.length > 2);
}
/** `isDone ? "line-through opacity-60" : "text-foreground"`: a style choice, not shown data. */
function isCssOnly(e) {
	e = e.replace(/[!=]==?\s*(["'`])(?:\\.|(?!\1).)*\1/g, "");
	const strs = [...e.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/g)].map((x) => x[2]);
	return strs.length > 0 && strs.every((x) => /^[a-z0-9:/\-[\]. ]*$/.test(x) && /-/.test(x));
}
/** Fixed bilingual wording (Z("签到", "Check-In"), isCN ? "讨论" : "Discussion", site.navLabels.x): not data. */
function isStaticLabel(e) {
	return [...e.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "").replace(/\b(?:Z|t)\s*\(/g, "(").replace(/\bas any\b/g, "").matchAll(/[A-Za-z_$][\w$.]*/g)].every((m) => /^(isCN|isZh|isChinese|zh|i18n(\.language)?|site(\.[\w$]+)*|defaultValue|startsWith)$/.test(m[0]));
}
/** The expression that decides a computed value, for showing "this number is X.length". */
function decidingExpression(steps, shownText = "") {
	for (const st of steps) {
		const m = st.code.join(" ").match(/\bvalue\s*:\s*(.+?)(?:,\s*\w+\s*:|\s*\}\s*[,\]]|$)/);
		if (m && /“value”/.test(st.title)) return m[1].trim();
	}
	const strip = (l) => (!/^\s*\$\{/.test(l) ? l : l.replace(/\$\{[^{}]*\}/g, "")).replace(/[\w-]+=\{`[^`]*`\}/g, "").replace(/[\w-]+=\{[^{}]*\}/g, "");
	let shownLine = strip((steps[0]?.code || []).map(strip).find((l) => /\{[^{}]*[A-Za-z_$][^{}]*\}/.test(l)) || "");
	if (shownText && !/\d|—/.test(shownText)) {
		shownLine = shownLine.replace(/^[^<]*<[\w.]+(?:[^>]|=>)*>/, "");
		for (let k = 0; k < 4; k++) shownLine = shownLine.replace(/<([A-Za-z][\w.]*)\b[^<>]*>([^<>]*)<\/\1>/g, (all, _tag, inner) => /length|count|Count|total|badge|"—"/.test(inner) ? "" : inner);
		shownLine = shownLine.replace(/\{[^{}]*&&\s*\}/g, "");
	}
	const exprs = [...shownLine.matchAll(/\{([^{}]+)\}/g)].map((x) => x[1].trim()).filter((e) => !/^`|className|^\s*$|=>|^defaultValue/.test(e) && !isCssOnly(e) && !isStaticLabel(e) && /[A-Za-z_$][\w$]*/.test(e.replace(/\bt\([^()]*\)/g, "").replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "")));
	return exprs.length ? exprs.join("  ·  ").slice(0, 400) : null;
}
async function traceLogic(source, maxSteps = 50, parents = [], shownText = "", childName = "", cardText = "", itemIndex = -1) {
	const [file, lineStr] = source.split(":");
	const text = file ? await readSource(file) : null;
	if (!file || !text) return [];
	const lines = text.split("\n");
	const at = Math.max(0, Number(lineStr || 1) - 1);
	const steps = [];
	const seen = /* @__PURE__ */ new Set();
	const render = lines.slice(at, at + 4);
	steps.push(step(file, at, "显示这段内容的代码 / Code that renders it", render));
	const renderText = render.join(" ").replace(/className=\{`[^`]*`\}/g, "").replace(/className=\{[^{}]*\}/g, "");
	const props = /* @__PURE__ */ new Set();
	for (const m of renderText.matchAll(/\{([^{}]+)\}/g)) for (const id of m[1].replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "").replace(/(^|[{,])\s*[A-Za-z_$][\w$]*\s*:(?!:)/g, "$1").matchAll(/(?:\.|\b)([A-Za-z_$][\w$]*)\b(?!\s*\()/g)) if (!KEYWORDS.has(id[1]) && id[1].length > 1) props.add(id[1]);
	const above = lines.slice(Math.max(0, at - 40), at + 1).join("\n");
	for (const m of above.matchAll(/([A-Za-z_$][\w$]*)\s*(?:\|\|\s*\[\]\s*)?\)?(?:\.\w+\([^()]*\))*\.map\(\s*\(?\s*([A-Za-z_$][\w$]*)/g)) {
		const [, list, param] = m;
		if (new RegExp(`\\b${param}\\.`).test(renderText)) {
			for (const id of renderText.matchAll(new RegExp(`\\b${param}\\??\\.([A-Za-z_$][\\w$]*)`, "g"))) props.delete(id[1]);
			props.delete(param);
			props.add(list);
		}
	}
	for (const x of [
		"className",
		"variant",
		"size",
		"style",
		"key",
		"type"
	]) props.delete(x);
	const calls = /* @__PURE__ */ new Set();
	const queue = [...props];
	const done = /* @__PURE__ */ new Set();
	let comp = null;
	let compStart = 0;
	for (let i = at; i >= Math.max(0, at - 400); i--) {
		const m = lines[i].match(/(?:function\s+([A-Z]\w*)\s*\(|const\s+([A-Z]\w*)\s*=\s*(?:\w+\()?\()\s*\{([^}]*)\}?/);
		if (m) {
			compStart = i;
			comp = {
				name: m[1] || m[2],
				params: (m[3] || "").split(",").map((x) => x.trim().split(/[:=\s]/)[0]).filter(Boolean)
			};
			break;
		}
	}
	if (comp) {
		for (const m of renderText.matchAll(/\b([A-Za-z_$][\w$]*)\??\.([A-Za-z_$][\w$]*)/g)) if (comp.params.includes(m[1]) && m[2] !== m[1]) {
			const i = queue.indexOf(m[2]);
			if (i >= 0) queue.splice(i, 1);
		}
	}
	const localBudget = Math.max(8, maxSteps - 20);
	while (queue.length && steps.length < localBudget) {
		const p = queue.shift();
		if (done.has(p)) continue;
		done.add(p);
		if (comp && comp.params.includes(p)) {
			const uses = lines.map((_, i) => i).filter((i) => i !== at && lines[i].includes(`<${comp.name}`) && new RegExp(`\\b${p}=\\{`).test(lines.slice(i, i + 8).join(" "))).slice(0, 3);
			for (const use of uses) {
				const key = `${file}:${use}`;
				if (!seen.has(key)) {
					seen.add(key);
					steps.push(step(file, use, `本文件里把“${p}”传给 ${comp.name} / “${p}” handed to ${comp.name}`, lines.slice(Math.max(0, use - 1), use + 3)));
				}
				const handed = lines.slice(use, use + 8).join(" ").match(new RegExp(`\\b${p}=\\{\\s*([A-Za-z_$][\\w$]*)`));
				const near = lines.slice(Math.max(0, use - 12), use + 1).join("\n");
				const loop = handed && [...near.matchAll(/([A-Za-z_$][\w$]*)\s*(?:\|\|\s*\[\]\s*)?\)?(?:\.\w+\([^()]*\))*\??\.map\(\s*\(?\s*(\{[^}]*\}|[A-Za-z_$][\w$]*)/g)].reverse().find((x) => new RegExp(`\\b${handed[1]}\\b`).test(x[2]));
				if (loop && !done.has(loop[1])) queue.unshift(loop[1]);
				else if (handed && handed[1] !== p && !done.has(handed[1])) queue.unshift(handed[1]);
			}
			if (uses.length) continue;
		}
		const re = new RegExp(`(?:(?<![-\\w.])${p}\\s*:(?!:)|(?:const|let|var)\\s+(?:\\{[^}]*\\b)?${p}\\b[^=]*=|(?<![-\\w.])${p}\\s*=[^=>])`);
		let hits = lines.map((l, i) => i).filter((i) => i !== at && re.test(lines[i]));
		const defRe = new RegExp(`(?:const|let|var)\\s+(?:\\{[^}=]*[\\s{,:]|\\[[^\\]=]*[\\s\\[,])?${p}\\b[^=]*=(?!=)|function\\s+${p}\\b`);
		const defs = hits.filter((i) => defRe.test(lines[i]));
		if (defs.length) {
			const inScope = defs.filter((i) => i >= compStart && i < at);
			const top = defs.filter((i) => /^(export\s+)?(const|let|function|async)/.test(lines[i]));
			hits = inScope.length ? [inScope[inScope.length - 1]] : top.length ? [top[0]] : [defs[0]];
		}
		const run = hits.filter((i) => i > at - 40 && i < at && /^\s*(?:\.\.\.\(.*\[)?\{\s*\w+\s*:/.test(lines[i]));
		const byIndex = itemIndex >= 0 && run.length > itemIndex && run.every((i, k) => k === 0 || i - run[k - 1] <= 2) ? [run[itemIndex]] : [];
		const focused = byIndex.length ? byIndex : focusLines(hits, lines, shownText, cardText);
		const use = new Set(focused.length ? focused : hits);
		lines.forEach((l, i) => {
			if (steps.length >= maxSteps || !use.has(i)) return;
			const key = `${file}:${i}`;
			if (seen.has(key)) return;
			seen.add(key);
			const b = block(lines, i, /useMemo\(|useCallback\(|=>\s*\{\s*$|function\b/.test(lines[i]) ? 90 : 12);
			steps.push(step(file, b.from, `“${p}” 在这里被赋值 / “${p}” is decided here`, b.code));
			const joined = b.code.join(" ");
			for (const c of joined.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) if (!KEYWORDS.has(c[1])) calls.add(c[1]);
			const rhs = joined.match(new RegExp(`\\b${p}\\s*[:=]\\s*([A-Za-z_$][\\w$]*)\\s*[,;]`));
			if (rhs && !KEYWORDS.has(rhs[1]) && !done.has(rhs[1])) queue.push(rhs[1]);
			if (focused.length) {
				for (const id of exprIds(l, p)) if (!done.has(id)) queue.push(id);
			}
			for (const id of joined.matchAll(/(?<![.\w$])([a-z_$][\w$]*)\b/g)) {
				const n = id[1];
				if (n !== p && !KEYWORDS.has(n) && !GENERIC.has(n) && !done.has(n) && n.length > 2 && (inScopeDef(lines, n, compStart, at, i) || !!comp?.params.includes(n))) queue.push(n);
			}
		});
	}
	let frontier = [...calls].map((name) => ({
		name,
		file,
		text
	}));
	const parentFiles = [...new Set(parents.map((x) => x.split(":")[0]).filter((f) => f && f !== file && !/^(components\/layout\/|routes\/__root|components\/ui\/)/.test(f)))];
	for (const pf of parentFiles.slice(0, 3)) {
		const pt = await readSource(pf);
		if (!pt) continue;
		const pl = pt.split("\n");
		const pending = [...done];
		const pdone = /* @__PURE__ */ new Set();
		while (pending.length && steps.length < maxSteps) {
			const name = pending.shift();
			if (pdone.has(name) || GENERIC.has(name)) continue;
			const first = pdone.size === 0 || done.has(name);
			pdone.add(name);
			const re = first ? new RegExp(`\\b${name}=\\{([^}]*)\\}|(?:const|let)\\s+(?:\\{[^}]*\\b)?${name}\\b[^=]*=`) : new RegExp(`(?:const|let)\\s+(?:\\{[^}]*\\b)?${name}\\b[^=]*=`);
			let handed = false;
			pl.forEach((l, i) => {
				const m = l.match(re);
				if (!m || steps.length >= maxSteps) return;
				if (m[1] != null && (handed || childName && !pl.slice(Math.max(0, i - 8), i + 1).join(" ").includes(`<${childName}`))) return;
				if (m[1] != null) handed = true;
				const key = `${pf}:${i}`;
				if (seen.has(key)) return;
				seen.add(key);
				const code = m[1] != null ? [l.trim().slice(Math.max(0, l.trim().indexOf(`${name}=`) - 10), l.trim().indexOf(`${name}=`) + name.length + m[1].length + 40)] : block(pl, i, 12).code;
				steps.push(step(pf, i, m[1] != null ? `父组件传入“${name}” / parent passes “${name}”` : `“${name}” 在父组件这里被算出 / computed in parent`, code));
				const expr = m[1] ?? code.join(" ");
				for (const id of expr.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)) if (!KEYWORDS.has(id[1]) && id[1].length > 2 && !pdone.has(id[1])) pending.push(id[1]);
				for (const c of expr.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) if (!KEYWORDS.has(c[1])) frontier.push({
					name: c[1],
					file: pf,
					text: pt
				});
			});
		}
	}
	const dataFirst = (a, b) => +!/^(use|fetch|load|list|read|get)[A-Z]/.test(a.name) - +!/^(use|fetch|load|list|read|get)[A-Z]/.test(b.name) || +/^use(Site|Translation|Language|Hydrated)$/.test(a.name) - +/^use(Site|Translation|Language|Hydrated)$/.test(b.name);
	for (let hop = 0; hop < 3 && frontier.length && steps.length < maxSteps; hop++) {
		frontier.sort(dataFirst);
		const next = [];
		for (const { name, file: f, text: t } of frontier) {
			if (steps.length >= maxSteps) break;
			let defFile = f;
			let defText = t;
			const via = [];
			let ls = defText.split("\n");
			let idx = findDefinition(ls, name);
			if (idx < 0) {
				let target = importsOf(f, t).get(name);
				for (let hopRe = 0; target && hopRe < 4; hopRe++) {
					if (hopRe > 0) via.push(defFile);
					defFile = target;
					defText = await readSource(target);
					if (!defText) break;
					ls = defText.split("\n");
					idx = findDefinition(ls, name);
					if (idx >= 0) break;
					const re = [...defText.matchAll(/export\s*\{([^}]+)\}\s*from\s*["'`]([^"'`]+)["'`]/g)].find((m) => m[1].split(",").some((x) => x.trim().split(/\s+as\s+/).pop() === name));
					const star = [...defText.matchAll(/export\s*\*\s*from\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);
					target = re ? resolveImport(defFile, re[2]) ?? void 0 : star.length ? resolveImport(defFile, star[0]) ?? void 0 : void 0;
				}
				if (!defText || idx < 0) continue;
			}
			const key = `${defFile}:${idx}`;
			if (seen.has(key)) continue;
			seen.add(key);
			const b = block(ls, idx, 30);
			steps.push({
				...step(defFile, b.from, `调用的判定函数 ${name}() / Called logic ${name}()`, b.code),
				via
			});
			for (const c of b.code.join(" ").matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) if (!KEYWORDS.has(c[1]) && c[1] !== name) next.push({
				name: c[1],
				file: defFile,
				text: defText
			});
			const imported = importsOf(defFile, defText);
			for (const c of b.code.join(" ").matchAll(/(?<![.\w$])([a-z_$][\w$]*)\b(?!\s*\()/g)) if (imported.has(c[1]) && c[1] !== name && /^(fetch|load|get|list|read|use)/.test(c[1])) next.push({
				name: c[1],
				file: defFile,
				text: defText
			});
		}
		frontier = next;
	}
	return steps;
}
function relIds(r) {
	const out = [];
	const walk = (v) => {
		if (Array.isArray(v)) {
			v.forEach(walk);
			return;
		}
		if (v && typeof v === "object") {
			const o = v;
			for (const k of [
				"child_object_id",
				"parent_object_id",
				"child_id",
				"parent_id",
				"_ID",
				"id"
			]) if (o[k] != null) out.push(String(o[k]));
			for (const val of Object.values(o)) if (typeof val === "object") walk(val);
		} else if (typeof v === "string" || typeof v === "number") out.push(String(v));
	};
	walk(r.rows);
	return out;
}
function relRead(r) {
	const m = r.endpoint.match(/^jet-rel\/(\d+)\/(children|parents)\/(\d+)/);
	return m ? {
		rel: m[1],
		side: m[2],
		from: m[3]
	} : null;
}
function describeAnchor(id, path) {
	const me = getStoredWPUser();
	if (me && String(me.user_id) === id) return `当前登录用户 (WordPress 用户 #${id}) / signed-in user`;
	if (path.split("/").filter(Boolean).includes(id)) return `当前页面地址里的编号 #${id}（${path}）/ id in the page address`;
	return null;
}
/** Chain for one matched row (`rowId`) found in request `found`. */
function traceRow(rowId, found, all, path) {
	const steps = [{
		text: `显示的是 ${decodeEndpoint(found.method, found.endpoint).label.replace(/ #\d+$/, "")} 第 #${rowId} 行 / shown row`,
		detail: `${found.method} ${found.endpoint}`
	}];
	let id = rowId;
	const seen = /* @__PURE__ */ new Set();
	for (let hop = 0; hop < 5; hop++) {
		const anchor = describeAnchor(id, path);
		if (anchor && hop > 0) {
			steps.push({ text: `起点 / starts at: ${anchor}` });
			return steps;
		}
		const via = all.find((r) => {
			const rr = relRead(r);
			return rr && !seen.has(r.endpoint) && rr.from !== id && relIds(r).includes(id);
		});
		if (!via) {
			if (anchor) steps.push({ text: `起点 / starts at: ${anchor}` });
			else steps.push({ text: hop === 0 ? "这一行不是通过关联查到的（直接按编号/列表读取）/ read directly, not through a relation" : `#${id} 之前的来源没有被记录 / earlier source not recorded` });
			return steps;
		}
		seen.add(via.endpoint);
		const rr = relRead(via);
		const def = relById(rr.rel);
		const parentSide = rr.side === "children";
		steps.push({
			text: `↑ 通过 REL ${rr.rel}（${def ? `${def.parent} → ${def.child}` : "字典里找不到"}）：${parentSide ? `父项 #${rr.from} 的子项包含 #${id}` : `子项 #${rr.from} 的父项包含 #${id}`}`,
			detail: `GET ${via.endpoint}`
		});
		id = rr.from;
	}
	return steps;
}
/** Shared infrastructure files: requests whose first app caller is one of these are not "this element's" data. */
function ownerFile(r) {
	return r.callers.find((c) => !/^(features\/shared\/|lib\/|integrations\/|services\/wp-|features\/inspector\/)/.test(c));
}
var INFRA = /^(contexts\/|components\/layout\/|routes\/__root|components\/ui\/|lib\/|integrations\/|features\/shared\/|services\/wp-auth|hooks\/use-mobile)/;
/**
* Plain-language summary of where a shown value really comes from:
* the field it was read from, the CCT/REL reads (with their filters and row counts),
* the calculation and the conditions the decision logic applies. Built only from
* what was recorded and the live code trace — nothing is guessed from field codes.
*/
var COND = /\.filter\(|\.find\(|\.some\(|\.every\(|===|!==|>=|<=|\s[<>]\s|\bif\s*\(|\?\s*[^:]+:/;
function annotate(code, defs) {
	return code.replace(/(["'`.])([a-z]{1,2}\d{1,3})\b/g, (all, pre, c) => {
		for (const d of defs) {
			const n = fieldName(d, c);
			if (n) return `${pre}${c}（${n}）`;
		}
		return all;
	});
}
function filterText(r, def) {
	const p = r.params;
	if (!p || !Object.keys(p).length) return "";
	return Object.entries(p).map(([k, v]) => {
		const code = k.replace(/^.*\[|\]$/g, "");
		const n = fieldName(def, code);
		const o = optionName(def, code, v);
		return `${k}${n ? `（${n}）` : ""} = ${String(v)}${o ? `（即 ${o}）` : ""}`;
	}).join("，");
}
var SKIP = /^(isCN|isZh|length|true|false|null|undefined|String|Number|Math|data|filter|map|status|const|return|number|string|boolean|any|t)$/;
/** Follow how each name in the shown expression is defined (variables, props passed by the parent, hook results), step by step. */
function derivation(expr, srcs, defs) {
	const out = [];
	const done = /* @__PURE__ */ new Set();
	const queue = [...new Set(expr.match(/[A-Za-z_$][\w$]*/g) || [])];
	while (queue.length && out.length < 14) {
		const name = queue.shift();
		if (done.has(name) || SKIP.test(name)) continue;
		done.add(name);
		const pats = [
			new RegExp(`(?:const|let|var)\\s+${name}\\s*(?::[^=]+)?=\\s*\\S`),
			new RegExp(`(?:const|let|var)\\s+[{[][^=]*\\b${name}\\b[^=]*[}\\]]\\s*=\\s*\\S`),
			new RegExp(`\\b${name}=\\{`),
			new RegExp(`^\\s*${name}\\s*:\\s*(?!number|string|boolean|any\\b|[A-Z]\\w*(?:\\[\\])?\\s*[;,]?$)\\S`)
		];
		let hit = false;
		for (const pat of pats) {
			for (const st of srcs) {
				const j = st.code.findIndex((l) => pat.test(l) && !/^\s*(\/\/|\*|import\b|interface\b|type\b)/.test(l));
				if (j < 0) continue;
				let text;
				if (pat.source.includes("=\\{")) {
					const l = st.code[j];
					const i = l.indexOf(`${name}={`) + name.length + 2;
					let d = 1;
					let k = i;
					while (k < l.length && d) {
						if (l[k] === "{") d++;
						else if (l[k] === "}") d--;
						k++;
					}
					text = `父组件传进来：${name} = ${l.slice(i, k - 1)}`;
				} else {
					let depth = 0;
					const body = [];
					for (let k = j; k < st.code.length && body.length < 14; k++) {
						const l = st.code[k];
						body.push(l.trim());
						for (const c of l) if ("({[".includes(c)) depth++;
						else if (")}]".includes(c)) depth--;
						if (depth <= 0) break;
					}
					text = body.join(" ").replace(/\s+/g, " ");
				}
				out.push(`${name}：${annotate(text, defs).slice(0, 400)}  （${st.file}:${st.line + j}）`);
				const rhs = text.includes("=") ? text.slice(text.indexOf("=") + 1) : text;
				for (const id of rhs.match(/[A-Za-z_$][\w$]*/g) || []) if (!done.has(id) && id.length > 2) queue.push(id);
				hit = true;
				break;
			}
			if (hit) break;
		}
	}
	return out;
}
function OriginSummary({ text, matches, reads, pageRequests, path, logic, expr, account, files }) {
	const [full, setFull] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		let live = true;
		Promise.all((files || []).slice(0, 5).map(async (f) => ({
			file: f,
			line: 1,
			code: (await readSource(f) || "").split("\n")
		}))).then((r) => {
			if (live) setFull(r);
		});
		return () => {
			live = false;
		};
	}, [(files || []).join("|")]);
	const lines = [];
	const shown = `「${text.slice(0, 40)}」`;
	for (const m of matches.slice(0, 6)) {
		const chain = traceRow(m.row, m.request, pageRequests, path).map((s) => s.text).join(" → ");
		lines.push(`显示的${shown}直接读自 ${m.target.label} 第 #${m.row} 行的 ${m.field} 列${m.fieldName ? `（${m.fieldName}）` : ""}，存的值是 “${m.value}”${m.option ? `，按字典即「${m.option}」` : ""}。${chain ? `这一行是这样找到的：${chain}。` : ""}`);
	}
	if (!matches.length && account.length) lines.push(`显示的${shown}来自登录时 WordPress 返回的账号信息：${account.join("，")}。`);
	if (!matches.length && expr) lines.push(`显示的${shown}不是存出来的，而是代码算出来的：${shown} = ${expr}${/\.length\b/.test(expr) ? "，也就是下面这些读取结果经过条件筛选后剩下的条数" : ""}。`);
	const seen = /* @__PURE__ */ new Map();
	for (const r of reads) {
		const t = decodeEndpoint(r.method, r.endpoint);
		const k = t.key + t.action + JSON.stringify(r.params || {});
		const rows = Array.isArray(r.rows) ? r.rows.length : r.rows ? 1 : 0;
		const id = r.endpoint.match(/\/(\d+)(?:\?|$)/)?.[1];
		const e = seen.get(k);
		if (e) {
			e.n++;
			e.rows += rows;
			if (id) e.ids.push(id);
		} else seen.set(k, {
			r,
			n: 1,
			rows,
			ids: id ? [id] : []
		});
	}
	const defs = [];
	const readLines = [...seen.values()].map(({ r, n, rows, ids }, i) => {
		const t = decodeEndpoint(r.method, r.endpoint);
		const def = t.cct || t.rel;
		if (def) defs.push(def);
		const f = filterText(r, def);
		const times = n > 1 ? `（读了 ${n} 次${t.kind === "cct" && ids.length > 1 ? `，逐行读取 #${ids.join("、#")}，每次返回 1 行` : ""}）` : "";
		if (t.kind === "cct" && ids.length > 1) return `${i + 1}. 逐行读取 ${t.label.replace(/\s*#\d+$/, "")}，共 ${ids.length} 行：#${ids.join("、#")}，每次 1 行`;
		if (t.kind === "rel") return `${i + 1}. 经 JetEngine 关联 ${t.label} 查关联对象${f ? `，条件 ${f}` : ""}，得到 ${rows} 条${times}`;
		if (t.kind === "cct") return `${i + 1}. 读取 ${t.label}${f ? `，条件 ${f}` : "，不带筛选条件"}，返回 ${rows} 行${times}`;
		return `${i + 1}. ${t.action} ${t.label}${f ? `，条件 ${f}` : ""}，返回 ${rows} 条${times}`;
	});
	const steps = !matches.length && expr && logic ? derivation(expr, [...logic, ...full], defs) : [];
	const STATIC_ID = /^(isCN|isZh|isChinese|zh|t|i18n|language|startsWith|useSite|useTranslation|site|const|let|var|return|defaultValue|true|false|null|undefined|key|title|subtitle|icon|label|description)$/;
	const fbm = !matches.length ? [expr || "", ...steps].join("\n").match(/([A-Za-z_$][\w$]*(?:\??\.[\w$]+)*)\s*(?:\|\||\?\?)\s*([^\n;]{1,80})/) : null;
	const altLits = fbm ? [...fbm[2].matchAll(/(["'`])((?:\\.|(?!\1).)+)\1/g)].map((x) => x[2]) : [];
	const shownIsAlt = !!fbm && !/^\s*[\w$.?]+\s*\?/.test(fbm[2]) && (altLits.some((l) => text.includes(l)) || !altLits.some((l) => /\p{L}/u.test(l)) && /\b(site\.|t\(|Z\()/.test(fbm[2]) || /\bsite\.\w+/.test(fbm[2]) && !text.match(/\p{Script=Han}/u));
	const fallbackOf = fbm && shownIsAlt && !STATIC_ID.test(fbm[1].split(/\??\./)[0]) ? {
		data: fbm[1],
		alt: fbm[2].trim()
	} : null;
	const staticWords = !fallbackOf && steps.length > 0 && steps.every((x) => {
		return !(x.replace(/^[^：]+：/, "").replace(/（[^）]*）\s*$/, "").replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "").replace(/\.\s*[A-Za-z_$][\w$]*/g, "").replace(/\b[\w$]+\s*:/g, "").match(/[A-Za-z_$][\w$]*/g) || []).some((id) => !STATIC_ID.test(id) && !/^[A-Z]/.test(id));
	});
	const clockOnly = !matches.length && !!expr && /new Date\(\s*\)|Date\.now\(\)/.test(expr) && !/\b(row|item|data|event|log|task|med|a\d+)\b/.test(expr);
	const noSource = !matches.length && !expr && !account.length && !!logic;
	if (fallbackOf) lines.push(`显示的${shown}是兜底值：代码先取数据 ${fallbackOf.data}，它为空，于是改用 ${fallbackOf.alt}。要显示真实内容，需要 ${fallbackOf.data} 对应的数据有值。`);
	if (staticWords) lines.splice(0, lines.length, `显示的${shown}是界面固定文字（双语文案 / 翻译词条 / 站点品牌设置），不读任何数据、不做计算。`);
	if (clockOnly) lines.splice(0, lines.length, `显示的${shown}是这台设备当前的日期/时间（浏览器时钟）：${expr}。不读任何数据。`);
	if (noSource) lines.push(`没有找到${shown}读取的数据或计算式：按当前代码它是界面固定文字或代码生成的标签（如时间刻度），下面只列出它所在位置的判定条件。`);
	if (staticWords || clockOnly || noSource) readLines.length = 0;
	const conds = [];
	const falls = [];
	for (const st of logic || []) st.code.forEach((l, j) => {
		const s = l.trim();
		if (!s || s.startsWith("//") || s.startsWith("*")) return;
		const a = `${annotate(s, defs).slice(0, 160)}  （${st.file}:${st.line + j}）`;
		if (st.fallbacks.includes(j)) {
			if (!falls.includes(a)) falls.push(a);
		} else if (COND.test(s) && !/className|class=|\b(isCN|isZh)\s*\?|label\s*:/.test(s) && !conds.includes(a)) conds.push(a);
	});
	if (!lines.length && !readLines.length && !conds.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		"data-inspector-source": "components/inspector/OriginSummary.tsx:133:12:bdad0cfcb5f187d68c3ab7c9c9e0947f65865005d0fe1e8e39b4bf030689af1e:1",
		className: "text-xs text-muted-foreground",
		children: logic ? "这段是界面固定文字（双语文案或配置），没有读取任何数据，也没有计算。" : "正在现场读取代码… / Reading live code…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/inspector/OriginSummary.tsx:136:5:a2c9f88192f122161696039d0495c610b895b8b6f230e9141a6ac4c41fd36ecd:1",
		className: "space-y-2 rounded border border-primary/40 bg-primary/5 p-2 text-xs leading-relaxed",
		children: [
			lines.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/OriginSummary.tsx:137:28:79d698b79970e18a8323ddb0644ea075c10e120cac4bbb9c0bcc98d28e08ef1f:1",
				children: l
			}, i)),
			readLines.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/OriginSummary.tsx:138:32:823f5733fa7f765e746a8c77a23698ded04ea0198879fc925ff50c14fa1a8cf8:0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/inspector/OriginSummary.tsx:138:37:823f5733fa7f765e746a8c77a23698ded04ea0198879fc925ff50c14fa1a8cf8:0",
					className: "font-medium",
					children: "数据从哪读（当前登录用户起，按顺序）："
				}), readLines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/inspector/OriginSummary.tsx:138:113:823f5733fa7f765e746a8c77a23698ded04ea0198879fc925ff50c14fa1a8cf8:0",
					children: l
				}, l))]
			}),
			!readLines.length && !staticWords && !clockOnly && (matches.length || expr) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/inspector/OriginSummary.tsx:139:86:fd67301cfc8ec3fd8f85248b5ba0e35a4d9597cffa8dabb415b194be738eca8d:1",
				className: "text-muted-foreground",
				children: "本页没有记录到这个元素代码的读取（可能数据在别页已读好或还没加载）。"
			}) : null,
			steps.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/OriginSummary.tsx:140:28:5c3ccd88ad8a44412a3f40ad6167a1093aa244f9442cc04194637fe088ab6fa4:0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/inspector/OriginSummary.tsx:140:33:5c3ccd88ad8a44412a3f40ad6167a1093aa244f9442cc04194637fe088ab6fa4:0",
					className: "font-medium",
					children: "计算过程（逐个变量往上追，现场代码原文）："
				}), steps.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/inspector/OriginSummary.tsx:140:110:5c3ccd88ad8a44412a3f40ad6167a1093aa244f9442cc04194637fe088ab6fa4:0",
					className: "break-all font-mono text-[10px]",
					children: [
						i + 1,
						". ",
						c
					]
				}, c))]
			}),
			conds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/OriginSummary.tsx:141:28:01ede04a28c2312683ed7f6ec3c0695faee07fae586429a05b44b4f23d3af71b:0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/inspector/OriginSummary.tsx:141:33:01ede04a28c2312683ed7f6ec3c0695faee07fae586429a05b44b4f23d3af71b:0",
					className: "font-medium",
					children: "判定/筛选条件（现场代码原文，列名按数据字典标注）："
				}), conds.slice(0, 14).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/inspector/OriginSummary.tsx:141:125:01ede04a28c2312683ed7f6ec3c0695faee07fae586429a05b44b4f23d3af71b:0",
					className: "break-all font-mono text-[10px]",
					children: ["• ", c]
				}, c))]
			}),
			falls.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/OriginSummary.tsx:142:28:06831207ebd71e8b13aee05b26d543ad7e5785005febf6d61cc2df7ae0064a01:0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/inspector/OriginSummary.tsx:142:33:06831207ebd71e8b13aee05b26d543ad7e5785005febf6d61cc2df7ae0064a01:0",
					className: "font-medium text-destructive",
					children: "兜底/默认值（读不到或为空时改用的值）："
				}), falls.slice(0, 8).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/inspector/OriginSummary.tsx:142:135:06831207ebd71e8b13aee05b26d543ad7e5785005febf6d61cc2df7ae0064a01:0",
					className: "break-all font-mono text-[10px]",
					children: ["• ", c]
				}, c))]
			})
		]
	});
}
var normaliseSitePath = (path) => {
	const [pathname, search = ""] = path.split("?");
	const site = new URLSearchParams(search).get("__site");
	return (pathname?.replace(/\/\d+(?=\/|$)/g, "/:id").replace(/\$[\w]+/g, ":id").replace(/:[\w]+/g, ":id").replace(/\/$/, "") || "/") + (site ? `?__site=${encodeURIComponent(site)}` : "");
};
/** Route source and explicit bindings both contribute; unbound routes must remain visible. */
function siteInventory(routes, bindings) {
	const pages = /* @__PURE__ */ new Map();
	const get = (path) => {
		const key = normaliseSitePath(path);
		let page = pages.get(key);
		if (!page) {
			page = {
				path: key,
				files: [],
				noteIds: [],
				elementNotes: 0,
				pageNotes: 0
			};
			pages.set(key, page);
		}
		return page;
	};
	for (const route of routes) get(route.path).files.push(...route.files);
	for (const binding of bindings) {
		const parts = binding.key.split("|");
		if (parts[0] !== "page" && parts[0] !== "el") continue;
		const path = parts[1] || binding.page;
		if (!path) continue;
		const page = get(path);
		if (binding.id) page.noteIds.push(binding.id);
		if (parts[0] === "page") {
			page.pageNotes++;
			if (binding.id) page.pageNoteIds = [.../* @__PURE__ */ new Set([...page.pageNoteIds || [], binding.id])];
		} else page.elementNotes++;
		const file = binding.source?.file || (parts[0] === "el" ? parts[2]?.replace(/:\d+(?::\d+)?$/, "") : void 0);
		if (file && /\.(ts|tsx)$/.test(file)) page.files.push(file.replace(/^\/?src\//, ""));
	}
	return [...pages.values()].map((page) => ({
		...page,
		files: [...new Set(page.files)],
		noteIds: [...new Set(page.noteIds)]
	})).sort((a, b) => a.path.localeCompare(b.path));
}
/** No silent truncation: every source line appears in a labelled evidence chunk. */
function splitSiteEvidence(sources, max = 35e3) {
	const chunks = [];
	let current = "";
	for (const source of sources) for (const [index, line] of source.text.split("\n").entries()) {
		const entry = `${source.file}:${index + 1} ${line}\n`;
		if (entry.length > max) throw new Error(`${source.file}:${index + 1} 单行超过分析容量，未截断。`);
		if (current.length + entry.length > max) {
			chunks.push(current);
			current = "";
		}
		current += entry;
	}
	if (current) chunks.push(current);
	return chunks;
}
function siteTotals(pages, results, expected) {
	const completed = results.filter((r) => r.report).length;
	const findings = results.flatMap((r) => r.report?.findings || []);
	const grouped = /* @__PURE__ */ new Map();
	for (const result of results) {
		const key = `${result.page}|${result.noteId || "unbound"}`;
		grouped.set(key, [...grouped.get(key) || [], result]);
	}
	const completeNotes = [...grouped.values()].filter((group) => {
		const first = group[0];
		if (!first?.noteId) return false;
		return group.length === first.chunks && new Set(group.map((r) => r.chunk)).size === first.chunks && group.every((r) => r.chunks === first.chunks && r.chunk >= 1 && r.chunk <= first.chunks && r.report?.codeCompared && r.report.comparedCodeNoteIds.includes(first.noteId || "") && !r.error && !r.report.findings.some((f) => f.kind === "missing_evidence"));
	}).length;
	const boundNotes = pages.reduce((sum, page) => sum + page.noteIds.length, 0);
	return {
		pages: pages.length,
		processed: results.length,
		completed,
		expected,
		completeNotes,
		boundNotes,
		failures: results.filter((r) => r.error).length,
		findings: findings.length,
		complete: expected > 0 && results.length === expected && completed === expected && completeNotes === boundNotes && !findings.some((f) => f.kind === "missing_evidence")
	};
}
function siteMarkdownReport(pages, results, expected) {
	const totals = siteTotals(pages, results, expected);
	const lines = [
		"# 全站读写冲突报告",
		`生成时间：${(/* @__PURE__ */ new Date()).toISOString()}`,
		"",
		"范围：当前源代码、保存的整页与元素注释及各自直接 REL325 关联注释。不是逐页真实运行测试；未关联注释不作任意两两比较。",
		"",
		`页面范围 ${totals.pages}；已返回 ${totals.processed}/${totals.expected} 项；失败 ${totals.failures} 项；冲突或疑点 ${totals.findings} 项；证据完整的注释 ${totals.completeNotes}/${totals.boundNotes}。`,
		`完成状态：${totals.complete ? "本次静态核查范围已完成" : "未完成，不能认定全站一致"}`
	];
	for (const page of pages) {
		lines.push("", `## ${page.path}`, `整页绑定 ${page.pageNotes}；元素绑定 ${page.elementNotes}`);
		const rows = results.filter((r) => r.page === page.path);
		if (!rows.length) lines.push("尚未分析。");
		for (const row of rows) {
			lines.push("", `### 注释 ${row.noteId ? `#${row.noteId}` : "未绑定"} · 代码分片 ${row.chunk}/${row.chunks}`);
			if (row.error) lines.push(`未完成：${row.error}`);
			if (row.report) {
				lines.push(row.report.summary, `比对注释：${row.report.comparedNoteIds.map((id) => `#${id}`).join("、")}；注释两两比较 ${row.report.comparedPairs.length} 组。`);
				for (const [index, finding] of row.report.findings.entries()) lines.push("", `#### ${index + 1}. ${finding.title}（${finding.kind}）`, `涉及注释：${finding.noteIds.map((id) => `#${id}`).join("、") || "无"}`, `证据：${finding.evidence}`, `判定：${finding.verdict}`, `建议：${finding.fix}`);
			}
		}
	}
	return lines.join("\n\n");
}
var ROUTES = /* #__PURE__ */ Object.assign({
	"/src/routes/$.tsx": () => import("../_-C2misPks.mjs").then((m) => m["default"]),
	"/src/routes/accompanied/$id.tsx": () => import("../_id-DgvLLoWq.mjs").then((m) => m["default"]),
	"/src/routes/accompanied/index.tsx": () => import("./accompanied-C40Kfiqw.mjs").then((m) => m["default"]),
	"/src/routes/ai-companion.tsx": () => import("./ai-companion-DrW8g0mm.mjs").then((m) => m["default"]),
	"/src/routes/ai.tsx": () => import("./ai-CAWm2sJJ.mjs").then((m) => m["default"]),
	"/src/routes/appointments.tsx": () => import("./appointments-37FYyWmZ.mjs").then((m) => m["default"]),
	"/src/routes/articles/$id.tsx": () => import("../_id-C4NtTG3Y.mjs").then((m) => m["default"]),
	"/src/routes/articles/index.tsx": () => import("./articles-C-C8D57j.mjs").then((m) => m["default"]),
	"/src/routes/assistant.tsx": () => import("./assistant-DNeBIHlF.mjs").then((m) => m["default"]),
	"/src/routes/auth.tsx": () => import("./auth-rz3pqF3E.mjs").then((m) => m["default"]),
	"/src/routes/awared/$id.tsx": () => import("../_id-YSaN6Rob.mjs").then((m) => m["default"]),
	"/src/routes/awared/index.tsx": () => import("./awared-NCwAEd45.mjs").then((m) => m["default"]),
	"/src/routes/become-caregiver.tsx": () => import("./become-caregiver-CkpLGkRN.mjs").then((m) => m["default"]),
	"/src/routes/bookings.tsx": () => import("./bookings-QNxoigRF.mjs").then((m) => m["default"]),
	"/src/routes/brand-compare.tsx": () => import("./brand-compare-Cn_Md-Rg.mjs").then((m) => m["default"]),
	"/src/routes/calendar.tsx": () => import("./calendar-XGp7Pp-A.mjs").then((m) => m["default"]),
	"/src/routes/care-circle.tsx": () => import("./care-circle-DEAPb6jM.mjs").then((m) => m["default"]),
	"/src/routes/care-circle_.$groupId.tsx": () => import("./care-circle_._groupId-36XDs3gt.mjs").then((m) => m["default"]),
	"/src/routes/cared/$id.tsx": () => import("../_id-BPiiMv4x.mjs").then((m) => m["default"]),
	"/src/routes/cared/index.tsx": () => import("./cared-C-olKKVx.mjs").then((m) => m["default"]),
	"/src/routes/cared-ones/$personId/$card.tsx": () => import("../_card-D7GxsJ5P.mjs").then((m) => m["default"]),
	"/src/routes/cared-ones/$personId/index.tsx": () => import("../_personId-BvZTdubd.mjs").then((m) => m["default"]),
	"/src/routes/cared-ones/index.tsx": () => import("./cared-ones-C2jWBcVw.mjs").then((m) => m["default"]),
	"/src/routes/caregiver/$id.tsx": () => import("../_id-Cz-2G8xF.mjs").then((m) => m["default"]),
	"/src/routes/caregiver-setting.tsx": () => import("./caregiver-setting-V9rWED5f.mjs").then((m) => m["default"]),
	"/src/routes/cart.tsx": () => import("./cart-BmoU1cGm.mjs").then((m) => m["default"]),
	"/src/routes/chat.tsx": () => import("./chat-BVptk7af.mjs").then((m) => m["default"]),
	"/src/routes/check-ins.tsx": () => import("./check-ins-6VJXu1Az.mjs").then((m) => m["default"]),
	"/src/routes/checkin.tsx": () => import("./checkin-BiVcyxLO.mjs").then((m) => m["default"]),
	"/src/routes/community/$id.tsx": () => import("../_id-CuwUnP9g.mjs").then((m) => m["default"]),
	"/src/routes/community/index.tsx": () => import("./community-CnavtSen.mjs").then((m) => m["default"]),
	"/src/routes/companion.tsx": () => import("./companion-DmMKkMa0.mjs").then((m) => m["default"]),
	"/src/routes/coped/$id.tsx": () => import("../_id-DXmAXUhh.mjs").then((m) => m["default"]),
	"/src/routes/coped/index.tsx": () => import("./coped-B-sLP47E.mjs").then((m) => m["default"]),
	"/src/routes/dashboard.tsx": () => import("./dashboard-DCaA7UNj.mjs").then((m) => m["default"]),
	"/src/routes/delete-after-read.tsx": () => import("./delete-after-read-Dc2j9FBo.mjs").then((m) => m["default"]),
	"/src/routes/documents.tsx": () => import("./documents-hksL6dEs.mjs").then((m) => m["default"]),
	"/src/routes/facilities/$id/edit.tsx": () => import("./edit-OYy_8M9q.mjs").then((m) => m["default"]),
	"/src/routes/facilities/new.tsx": () => import("./new-BfU1AZWG.mjs").then((m) => m["default"]),
	"/src/routes/facility/$id.tsx": () => import("../_id-CtqginFI.mjs").then((m) => m["default"]),
	"/src/routes/favorite-caregiver.tsx": () => import("./favorite-caregiver-DbbgXmqQ.mjs").then((m) => m["default"]),
	"/src/routes/find.tsx": () => import("./find-B5RWSvrp.mjs").then((m) => m["default"]),
	"/src/routes/get-started.tsx": () => import("./get-started-CcLkmMt_.mjs").then((m) => m["default"]),
	"/src/routes/group/$groupId.tsx": () => import("../_groupId-DRDvplao.mjs").then((m) => m["default"]),
	"/src/routes/help.tsx": () => import("./help-D6i1z6RT.mjs").then((m) => m["default"]),
	"/src/routes/how-it-works.tsx": () => import("./how-it-works-TuUo7-5R.mjs").then((m) => m["default"]),
	"/src/routes/inbox.tsx": () => import("./inbox-B4TW6FCJ.mjs").then((m) => m["default"]),
	"/src/routes/index.tsx": () => import("./routes-QfOm3G2N.mjs").then((m) => m["default"]),
	"/src/routes/join/$code.tsx": () => import("../_code-96-J3fuP.mjs").then((m) => m["default"]),
	"/src/routes/learn.tsx": () => import("./learn-c0Xf7hva.mjs").then((m) => m["default"]),
	"/src/routes/medicine.tsx": () => import("./medicine-B32993hb.mjs").then((m) => m["default"]),
	"/src/routes/messages.tsx": () => import("./messages-C1jc253j.mjs").then((m) => m["default"]),
	"/src/routes/notifications.tsx": () => import("./notifications-CUzCtJny.mjs").then((m) => m["default"]),
	"/src/routes/onboarding.tsx": () => import("./onboarding-m7EDmr6i.mjs").then((m) => m["default"]),
	"/src/routes/order-confirmation.tsx": () => import("./order-confirmation-Bu79cLpd.mjs").then((m) => m["default"]),
	"/src/routes/places.tsx": () => import("./places-DlZMgCvr.mjs").then((m) => m["default"]),
	"/src/routes/profile.tsx": () => import("./profile-USZa4THl.mjs").then((m) => m["default"]),
	"/src/routes/reset-password.tsx": () => import("./reset-password-DsSfGfVR.mjs").then((m) => m["default"]),
	"/src/routes/resources.tsx": () => import("./resources-TNBTsCso.mjs").then((m) => m["default"]),
	"/src/routes/safed/$id.tsx": () => import("../_id-DRyOg1su.mjs").then((m) => m["default"]),
	"/src/routes/safed/index.tsx": () => import("./safed-BrulMAdH.mjs").then((m) => m["default"]),
	"/src/routes/search-care-facility.tsx": () => import("./search-care-facility-BPK7A4MX.mjs").then((m) => m["default"]),
	"/src/routes/search-caregiver.tsx": () => import("./search-caregiver-HN1_gvfH.mjs").then((m) => m["default"]),
	"/src/routes/search-local-caregiver.tsx": () => import("./search-local-caregiver-CkNJEX6h.mjs").then((m) => m["default"]),
	"/src/routes/search-remote-caregiver.tsx": () => import("./search-remote-caregiver-DrOZTQs6.mjs").then((m) => m["default"]),
	"/src/routes/search.tsx": () => import("./search-BqotzKOQ.mjs").then((m) => m["default"]),
	"/src/routes/settings.tsx": () => import("./settings-nkVBq9-2.mjs").then((m) => m["default"]),
	"/src/routes/share/card/$token.tsx": () => import("../_token-CN46iLYc.mjs").then((m) => m["default"]),
	"/src/routes/share/note.tsx": () => import("./note-DkEPHJIN.mjs").then((m) => m["default"]),
	"/src/routes/sync-test-draftbit.tsx": () => import("./sync-test-draftbit-B-wCeDIf.mjs").then((m) => m["default"]),
	"/src/routes/tasks.tsx": () => import("./tasks-DG0msbf_.mjs").then((m) => m["default"]),
	"/src/routes/trust-safety.tsx": () => import("./trust-safety-U-9F-YEe.mjs").then((m) => m["default"]),
	"/src/routes/welcome.tsx": () => import("./welcome-DJzr3I0f.mjs").then((m) => m["default"]),
	"/src/routes/xianyu-listings.tsx": () => import("./xianyu-listings-Cn6pigE4.mjs").then((m) => m["default"])
});
var APPS = /* #__PURE__ */ Object.assign({
	"/src/pages/consent/ConsentApp.tsx": () => import("./ConsentApp-Cb3qrzxE.mjs").then((m) => m["default"]),
	"/src/pages/esm/EsmApp.tsx": () => import("./EsmApp-BsvtH12d.mjs").then((m) => m["default"]),
	"/src/pages/researcher/ResearcherApp.tsx": () => import("./ResearcherApp-D_t5xhgl.mjs").then((m) => m["default"]),
	"/src/pages/safety/SafetyApp.tsx": () => import("./SafetyApp-DK_KSYOk.mjs").then((m) => m["default"]),
	"/src/pages/sick/SickApp.tsx": () => import("./SickApp-dElIkLUz.mjs").then((m) => m["default"])
});
async function discoverSitePages(bindings) {
	const routes = [];
	const routeEntries = Object.entries(ROUTES);
	for (let index = 0; index < routeEntries.length; index += 6) await Promise.all(routeEntries.slice(index, index + 6).map(async ([file, load]) => {
		const path = (await load()).match(/createFileRoute\(["']([^"']+)["']\)/)?.[1];
		if (path && path !== "/$") routes.push({
			path: path.replace(/_\//g, "/").replace(/\/$/, "") || "/",
			files: [file.replace("/src/", "")]
		});
	}));
	for (const [file, load] of Object.entries(APPS)) {
		const text = await load();
		const site = text.match(/__site[=",\s]+([a-z_]+)/)?.[1] || (file.includes("/safety/") ? "notchsafety" : file.includes("/esm/") ? "esm_survey" : file.split("/")[3]) || "unknown";
		const paths = [...text.matchAll(/<Route\s+path=["']([^"']+)["']/g)].map((m) => m[1]).filter((path) => !!path && path !== "*");
		for (const path of paths.length ? paths : ["/"]) routes.push({
			path: `${path}?__site=${site}`,
			files: [file.replace("/src/", "")]
		});
	}
	return siteInventory(routes, bindings);
}
/** Traverse current local imports, not a saved code map. Runtime state is not fabricated. */
async function buildSiteEvidence(page, read = readSource) {
	const seen = /* @__PURE__ */ new Set();
	const sources = [];
	const omissions = [];
	let frontier = page.files;
	while (frontier.length) {
		const batch = frontier.filter((file) => !seen.has(file));
		frontier = [];
		for (let index = 0; index < batch.length; index += 6) await Promise.all(batch.slice(index, index + 6).map(async (file) => {
			if (seen.has(file)) return;
			seen.add(file);
			if (/^(components\/ui\/|components\/inspector\/|i18n\/locales\/)/.test(file)) return;
			const text = await read(file);
			if (text === null) {
				omissions.push(`无法读取 ${file}`);
				return;
			}
			sources.push({
				file,
				text
			});
			for (const match of text.matchAll(/(?:import|export)[^"'`]*?from\s*["'`]([^"'`]+)["'`]|import\(\s*["'`]([^"'`]+)["'`]\s*\)/g)) {
				const spec = match[1] || match[2];
				if (spec && /^(?:@\/|\.)/.test(spec) && !resolveImport(file, spec) && !/\.(?:css|json|jpg|png|webp|asset\.json)$/.test(spec)) omissions.push(`未解析本地依赖 ${file} → ${spec}；不能据此认定完整一致。`);
			}
			frontier.push(...analyse(file, text).i.filter((next) => !seen.has(next)));
		}));
	}
	if (!sources.length) omissions.push("没有当前源代码证据");
	omissions.push("本次为全站源代码与保存注释核查，未逐页执行真实账户输入、弹窗、提交和定时任务；不代表运行状态已测试。");
	return {
		chunks: splitSiteEvidence(sources.sort((a, b) => a.file.localeCompare(b.file))),
		omissions: [...new Set(omissions)],
		files: sources.length
	};
}
function SiteAnalysis() {
	const load = useServerFn(loadAllInspectorNotes);
	const analyze = useServerFn(analyzeSiteNote);
	const [pages, setPages] = (0, import_react.useState)([]);
	const [results, setResults] = (0, import_react.useState)([]);
	const [phase, setPhase] = (0, import_react.useState)("");
	const [running, setRunning] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [expected, setExpected] = (0, import_react.useState)(0);
	const stop = (0, import_react.useRef)(false);
	const work = (0, import_react.useRef)([]);
	const cursor = (0, import_react.useRef)(0);
	const totals = siteTotals(pages, results, expected);
	const process = async () => {
		for (; cursor.current < work.current.length; cursor.current++) {
			if (stop.current) break;
			const task = work.current[cursor.current];
			if (!task) break;
			setPhase(`${task.page} · ${task.noteId ? `注释 #${task.noteId}` : "没有绑定注释"} · 代码 ${task.chunk}/${task.chunks}`);
			if (!task.noteId) {
				setResults((previous) => [...previous, {
					page: task.page,
					chunk: 1,
					chunks: 1,
					report: {
						summary: "此页面没有绑定的整页或元素注释，不能比对。",
						comparedNoteIds: [],
						comparedCodeNoteIds: [],
						comparedPairs: [],
						codeCompared: false,
						findings: [{
							kind: "missing_evidence",
							title: "缺少页面注释",
							noteIds: [],
							evidence: task.page,
							verdict: "未完成核查",
							fix: "为页面及可见动态读写元素绑定注释后重新分析。"
						}]
					}
				}]);
				continue;
			}
			let result;
			try {
				result = await analyze({ data: {
					...task,
					noteId: task.noteId
				} });
			} catch (e) {
				result = { error: e instanceof Error ? e.message : String(e) };
			}
			setResults((previous) => [...previous, {
				page: task.page,
				noteId: task.noteId,
				chunk: task.chunk,
				chunks: task.chunks,
				...result
			}]);
			if (result.error) {
				cursor.current++;
				setError(`${result.error}；已暂停，失败项不会自动重发。`);
				break;
			}
		}
	};
	const run = async (resume = false) => {
		stop.current = false;
		setRunning(true);
		setError("");
		try {
			if (!resume) {
				setResults([]);
				work.current = [];
				cursor.current = 0;
				setExpected(0);
				setPhase("读取全站页面和最新保存注释…");
				const response = await load({ data: void 0 });
				if (response.error) throw new Error(response.error);
				const inventory = await discoverSitePages(response.compressedNotes ? await decodeNotes(response.compressedNotes) : response.notes || []);
				setPages(inventory);
				const sourceReads = /* @__PURE__ */ new Map();
				const readForRun = (file) => {
					const existing = sourceReads.get(file);
					if (existing) return existing;
					const pending = readSource(file);
					sourceReads.set(file, pending);
					return pending;
				};
				for (const page of inventory) {
					if (stop.current) {
						work.current = [];
						throw new Error("清单准备已停止；尚未执行 AI，可重新开始。");
					}
					setPhase(`读取当前代码：${page.path}`);
					const evidence = await buildSiteEvidence(page, readForRun);
					if (!page.noteIds.length) work.current.push({
						page: page.path,
						evidence: "",
						chunk: 1,
						chunks: 1,
						omissions: evidence.omissions
					});
					else for (const noteId of page.noteIds) for (const [index, text] of (evidence.chunks.length ? evidence.chunks : ["无代码证据"]).entries()) work.current.push({
						page: page.path,
						noteId,
						pageNoteIds: page.pageNoteIds || [],
						evidence: text,
						chunk: index + 1,
						chunks: Math.max(1, evidence.chunks.length),
						omissions: [...evidence.omissions, ...evidence.chunks.length > 1 ? [`当前只提供 ${index + 1}/${evidence.chunks.length} 代码分片；单项不代表整页核查完成。`] : []]
					});
				}
				setExpected(work.current.length);
			}
			await process();
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setRunning(false);
			setPhase(stop.current ? "已停止；已返回结果保留" : "本轮处理已结束");
		}
	};
	const download = () => {
		const payload = siteMarkdownReport(pages, results, expected);
		const url = URL.createObjectURL(new Blob([payload], { type: "text/markdown;charset=utf-8" }));
		const a = document.createElement("a");
		a.href = url;
		a.download = "全站读写冲突报告.md";
		a.click();
		URL.revokeObjectURL(url);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-inspector-source": "components/inspector/SiteAnalysis.tsx:69:10:07d63d3be9eb4847c99791d614df37c89eae92ccfca1c66a32d73d0e71f80955:1",
		className: "space-y-3 text-xs",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/SiteAnalysis.tsx:70:5:8e10409f839855cc6577c6c2b7970c22dd8534c08bd96734207af1c8fb25b9a8:1",
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => void run(),
						disabled: running,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "mr-1 h-4 w-4" }), "一键全站 AI 分析"]
					}),
					running && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => {
							stop.current = true;
							setPhase("停止排队中；当前分析返回后停止");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "mr-1 h-4 w-4" }), "停止"]
					}),
					!running && cursor.current < work.current.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => void run(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "mr-1 h-4 w-4" }), "继续未分析项"]
					}),
					results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: download,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 h-4 w-4" }), "下载报告"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-inspector-source": "components/inspector/SiteAnalysis.tsx:76:5:8b8a17b39c03124681ea5868d8ca541a243c361355dee9046954a7815fcd7565:1",
				children: [
					"全站 ",
					totals.pages,
					" 个页面范围；已返回 ",
					totals.processed,
					"/",
					totals.expected,
					" 项，成功返回 ",
					totals.completed,
					" 项，失败 ",
					totals.failures,
					" 项，冲突或疑点 ",
					totals.findings,
					" 项。"
				]
			}),
			expected > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-inspector-source": "components/inspector/SiteAnalysis.tsx:77:22:28b047b914f023795bf20f3cbd248c5b5c94414bdfe0ad2f55d0f28e11d74ead:1",
				className: totals.complete ? "text-foreground" : "text-destructive",
				children: [
					"证据完整的注释 ",
					totals.completeNotes,
					"/",
					totals.boundNotes,
					"；",
					totals.complete ? "本次静态核查范围已完成" : "未完成，不能认定全站一致",
					"。"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/SiteAnalysis.tsx:78:5:b06a1108ca30884a4ff1dba2505179ac8765845d59aca861622b8d307d075cf8:1",
				role: "status",
				children: phase
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/SiteAnalysis.tsx:79:15:158f23aafad35dee3b4331498be0256e5b68d9f813521fb3a0deef868c9b065e:1",
				role: "alert",
				className: "text-destructive",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/SiteAnalysis.tsx:80:5:5ce1ead425b28f1a2bb71a6cef9a912915f49dbfbb1aa8bdce7c6f57e2ba2b98:1",
				className: "text-muted-foreground",
				children: "范围：全部页面代码、已绑定整页／元素注释及各自直接关联注释。未绑定页面、缺失代码和未实测状态列为未完成；无关联注释不作任意两两比较。逐项分析会产生 AI 费用。"
			}),
			pages.map((page) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				"data-inspector-source": "components/inspector/SiteAnalysis.tsx:81:24:a331861415775fbc580d67a005890f65df59ef0243e9068d748e1ff54add4bc9:1",
				className: "border-b border-border pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
					"data-inspector-source": "components/inspector/SiteAnalysis.tsx:82:7:38bf1eb6c9522414bd72a5f7f355277dbd7a92cff09b57284f6dbddc23aa1165:1",
					className: `cursor-pointer break-words ${results.some((r) => r.page === page.path && (r.error || r.report?.findings.length)) ? "text-destructive" : ""}`,
					children: [
						page.path,
						" · 整页绑定 ",
						page.pageNotes,
						" · 元素绑定 ",
						page.elementNotes,
						" · 已返回 ",
						results.filter((r) => r.page === page.path).length,
						" 项 · 冲突或疑点 ",
						results.filter((r) => r.page === page.path).reduce((sum, r) => sum + (r.report?.findings.length || (r.error ? 1 : 0)), 0)
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-source": "components/inspector/SiteAnalysis.tsx:83:7:6390be98a10a2403c6186c7212bb87d2993aed5bb3eb67c7ab89bbf0503d2ace:0",
					className: "mt-2 space-y-2",
					children: results.filter((r) => r.page === page.path).map((result, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/inspector/SiteAnalysis.tsx:83:105:6390be98a10a2403c6186c7212bb87d2993aed5bb3eb67c7ab89bbf0503d2ace:0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								"data-inspector-source": "components/inspector/SiteAnalysis.tsx:84:9:66c854ae3db4b78082e41f5dd5522a7c860b4d300708f104898ef5f6e6238329:1",
								children: [
									"注释 ",
									result.noteId ? `#${result.noteId}` : "未绑定",
									" · 代码分片 ",
									result.chunk,
									"/",
									result.chunks
								]
							}),
							result.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/inspector/SiteAnalysis.tsx:85:26:76f817382d19bee25f419421984a17c2a3ddd96a4e720621ca2efebe8d0096d8:1",
								role: "alert",
								className: "text-destructive",
								children: result.error
							}),
							result.report && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConflictReportView, { report: result.report })
						]
					}, index))
				})]
			}, page.path))
		]
	});
}
/** Text that comes from the signed-in account saved at login (no request on this page). */
function accountMatches(text) {
	const me = getStoredWPUser();
	if (!me || !text) return [];
	const low = text.toLowerCase();
	return Object.entries(me).filter(([k, v]) => typeof v === "string" && v.length >= 2 && !/token/i.test(k) && low.includes(v.toLowerCase())).map(([k, v]) => `${k} = “${String(v).slice(0, 60)}”`);
}
function useRecorded() {
	return (0, import_react.useSyncExternalStore)(subscribeRecorder, getRecorded, getRecorded);
}
function currentPath() {
	return window.location.pathname + window.location.search;
}
function describeBody(req) {
	const body = req.body;
	if (!body || typeof body !== "object") return [];
	const t = decodeEndpoint(req.method, req.endpoint);
	const def = t.cct || t.rel;
	const lines = [];
	const walk = (obj, prefix, d) => {
		for (const [k, v] of Object.entries(obj)) {
			if (v && typeof v === "object" && !Array.isArray(v)) {
				walk(v, `${prefix}${k}.`, k === "meta" ? t.rel : d);
				continue;
			}
			const name = fieldName(d, k);
			const opt = optionName(d, k, v);
			lines.push(`${prefix}${k}${name ? ` (${name})` : ""} = ${JSON.stringify(v).slice(0, 80)}${opt ? ` → ${opt}` : ""}`);
		}
	};
	walk(body, "", def);
	return lines;
}
function rowCount(req) {
	return Array.isArray(req.rows) ? req.rows.length : req.rows ? 1 : 0;
}
function returnedFields(req) {
	const first = (Array.isArray(req.rows) ? req.rows : req.rows ? [req.rows] : [])[0];
	if (!first || typeof first !== "object") return "";
	const t = decodeEndpoint(req.method, req.endpoint);
	const keys = Object.keys(first).filter((k) => !k.startsWith("cct_")).slice(0, 30);
	const meta = first["meta"] && typeof first["meta"] === "object" ? Object.keys(first["meta"]).map((k) => `meta.${k}${fieldName(t.rel, k) ? ` (${fieldName(t.rel, k)})` : ""}`) : [];
	return [...keys.filter((k) => k !== "meta").map((k) => `${k}${fieldName(t.cct, k) ? ` (${fieldName(t.cct, k)})` : ""}`), ...meta].join(" · ");
}
function DataChain({ requests }) {
	if (!requests.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:149:7:bb886ba25ccefeda96b9d19c2568999d5bf74f474c14a8f3781465b8a2933d96:1",
		className: "text-xs text-muted-foreground",
		children: "这个元素用到的代码在本页没有读取数据（可能是固定文字或数据还没加载）。 / No reads by this element's code on this page."
	});
	const seen = /* @__PURE__ */ new Set();
	const steps = [];
	for (const r of requests) {
		const t = decodeEndpoint(r.method, r.endpoint);
		const k = t.key + t.action;
		const e = steps.find((x) => x.t.key + x.t.action === k);
		if (e) e.n++;
		else if (!seen.has(k)) {
			seen.add(k);
			steps.push({
				t,
				r,
				n: 1
			});
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
		"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:171:5:40b0485093c80cb1cbef8288a42f17679e196c57a3b06de8b1744458e8992faa:1",
		className: "space-y-1 text-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:172:7:755135e9d8fd59ec94beb61ea881963cdb62c2706d34b7c19d43d35e76895266:1",
			className: "rounded border border-border p-1",
			children: "① 当前登录用户 / Signed-in WordPress user"
		}), steps.map(({ t, r, n }, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:176:9:3935d75dcef7ec28fa4b9a10badc01cdea1b4d585df02194761729c35887b5b6:1",
			className: "rounded border border-border p-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:177:11:894d90225d4afb24e1063827cebf395ce891bf5a9eb1642e414c2a1ab5335fff:1",
					className: "font-medium",
					children: [[
						"②",
						"③",
						"④",
						"⑤",
						"⑥",
						"⑦",
						"⑧",
						"⑨"
					][i] || "·", " "]
				}),
				t.kind === "rel" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["经关联 / via ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
					"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:182:25:b95713e5103bbd3881ed328dc069eb5d216e11722c4829feb5912174cc2a45b7:1",
					children: t.label
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					t.action,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:186:26:05e65cc2a81b3a5561878977c8bf086ed613d19cbc23f51d09ed1f2b1e3fb021:1",
						children: t.label
					})
				] }),
				n > 1 && ` ×${n}`,
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:190:11:f793f1ec1ee998c7b777b7edd08bd7b4ae40e14cda43509866a067e489190d81:1",
					className: "text-muted-foreground",
					children: [
						"→ 返回 ",
						rowCount(r),
						" 行 / ",
						rowCount(r),
						" rows"
					]
				}),
				r.params && Object.keys(r.params).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:194:13:eafa74dc5e8ddab5b400192332d758e1d1b5ebf6a6d924aaa5f48b63c9637ad1:1",
					className: "font-mono text-[10px] text-muted-foreground",
					children: [
						"条件 / filter:",
						" ",
						new URLSearchParams(r.params).toString()
					]
				}),
				t.kind !== "rel" && returnedFields(r) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:202:13:ed910e0dd0e053da5e319032ea4ffe6435d14f780a4e5f2c9848483b8b8e1b88:1",
					className: "text-[10px]",
					children: ["字段 / fields: ", returnedFields(r)]
				})
			]
		}, r.id))]
	});
}
function RequestList({ requests }) {
	if (!requests.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:215:7:bb886ba25ccefeda96b9d19c2568999d5bf74f474c14a8f3781465b8a2933d96:1",
		className: "text-xs text-muted-foreground",
		children: "没有记录到请求 / No requests recorded."
	});
	const groups = /* @__PURE__ */ new Map();
	for (const r of requests) {
		const t = decodeEndpoint(r.method, r.endpoint);
		const k = `${r.method}|${t.key}|${t.action}`;
		groups.set(k, [...groups.get(k) || [], r]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:226:5:41096a8c8f4a4f3fb3c729bec4edfcfec83a9b50a208eab3314850d6c9dc4d6f:1",
		className: "space-y-2",
		children: [...groups.values()].map((list) => {
			const r = list[0];
			const t = decodeEndpoint(r.method, r.endpoint);
			const write = r.method !== "GET";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:232:11:103c342ff36b6ad9c1aa4b26bc6a6747b0e82ccbd244caacef7e43759363beeb:1",
				className: `rounded-md border p-2 text-xs ${write ? "border-destructive/40 bg-destructive/5" : "border-border bg-muted/30"}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:236:13:11a228acec99be44ce55dfd4a6a69e5358db2d6989c0637871fc9195762aa3ec:1",
						className: "flex flex-wrap items-center gap-1 font-medium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:237:15:c17fbea58afc1a620347220040d4ca01d78a6bfc65d303b882ac6075ff2e3064:1",
								className: `rounded px-1 ${write ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`,
								children: t.action
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:242:15:643b98132419c8d78996e81a5c2130739628ea2faef30b4a9cda928664b10ac8:1",
								children: t.label
							}),
							list.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:244:17:dad61bde05e8ca38e8e0f63f80c807e5253c7b85c61c2f1796fe71fb1ae5a379:1",
								className: "text-muted-foreground",
								children: ["×", list.length]
							}),
							r.blocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:247:17:cfa31cd25fd27a9359660309d09894ce7b565121f0b78b35f30a74d5eef72d48:1",
								className: "rounded bg-secondary px-1 text-secondary-foreground",
								children: "已拦截未写入 / held back"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:252:13:4775ad4989a61e6d5e03e90ef82a3b0c812f05eb3e1cc97f5296225d552e1451:1",
						className: "mt-1 break-all font-mono text-[10px] text-muted-foreground",
						children: [
							r.method,
							" ",
							r.endpoint,
							r.params && Object.keys(r.params).length ? ` ?${new URLSearchParams(r.params).toString()}` : ""
						]
					}),
					write && describeBody(r).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:259:15:600eeecb028ae4eae96d9b0a7caae2130bdcd6c42cf27ac01433d7a4622803d0:1",
						className: "mt-1 font-mono text-[10px]",
						children: describeBody(r).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:261:19:652f46d5180c31e42da3b77f1a597d6a5397445655c0616ed0dce7e74294a043:1",
							children: l
						}, l))
					}),
					!write && returnedFields(r) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:266:15:d7ed77c5683e617ada42739b84af1d55e7defa37ee351d9a9e6f2413b95a480d:1",
						className: "mt-1 text-[10px]",
						children: ["返回字段 / fields: ", returnedFields(r)]
					}),
					r.callers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:271:15:9c438bd51900fe975893d45b4e744127fb0e3acfbae11b11d48f252f8ef20592:1",
						className: "mt-1 text-[10px] text-muted-foreground",
						children: ["调用代码 / called from: ", r.callers.slice(0, 4).join(" ← ")]
					})
				]
			}, r.id);
		})
	});
}
function RefList({ refs }) {
	const writes = refs.filter((r) => r.kind === "write");
	const reads = refs.filter((r) => r.kind !== "write");
	const uniqReads = [...new Map(reads.map((r) => [r.label, r])).values()];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:287:5:b1f18a37d975d9c811c87faa13092e4c6f2e817c89a40122dbcb6f24eecfaf4d:1",
		className: "space-y-2 text-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:288:7:9fc1f7e500d2375b8730a7ef6d7d83ceb3c514bd7bf088bf3b6c3bf6462f7049:1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:289:9:6cf4a1a9dd1aa9b9c4e46c9119ada0e908e597a91fc5f59360e5c1adfed89054:1",
				className: "font-medium",
				children: [
					"代码里会写入的地方 / Writes in code (",
					writes.length,
					")"
				]
			}), writes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:293:11:fb41c9d4ac1b729a58f3e9975201a2bfe104859e981c900d0accb8329b096ea1:1",
				className: "text-muted-foreground",
				children: "无 / none"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:295:11:e9f11039b5b99af5b89b85532966870516fadbaf61a92daa0a582bd7db0f88c5:1",
				className: "space-y-1",
				children: writes.slice(0, 40).map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:297:15:ffe12e8cf07c9d3d18ba2360b921903a3454f621db78228db5d80ee364ec7af0:1",
					className: "rounded border border-destructive/30 p-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:298:17:2d5561d6c66cdb25b037c8d442978dde8e75288029cf79425b7fa707a37b0342:1",
						className: "font-mono text-[10px] text-muted-foreground",
						children: [
							r.file,
							":",
							r.line,
							r.depth ? ` (引用深度 ${r.depth})` : ""
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:302:17:ee90e6af5961b08a69f4ee84fd50dc8333ed058f6ae2fcbd1df9bf440b5dca7e:1",
						className: "break-all font-mono text-[10px]",
						children: r.snippet
					})]
				}, i))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:310:7:9fc1f7e500d2375b8730a7ef6d7d83ceb3c514bd7bf088bf3b6c3bf6462f7049:1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:311:9:6cf4a1a9dd1aa9b9c4e46c9119ada0e908e597a91fc5f59360e5c1adfed89054:1",
				className: "font-medium",
				children: [
					"代码里引用的表和关系 / Data referenced in code (",
					uniqReads.length,
					")"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:314:9:b98cc8e578a2c4087bff1f37e1f4c5596bcda67378942fe4a619bbdaa6543ef5:1",
				className: "space-y-0.5",
				children: uniqReads.slice(0, 60).map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:316:13:af2a50b3fae27839a32985ae8b86738e879d51e9c8612e3c5830d506bc6e27a1:1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:317:15:33e4827ca1577c9d7edb3694560c2e4a6f7c33467e509d363470802996704809:1",
							children: r.label
						}),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:318:15:960985802d4fbb6e9c699133d42f3efd999da995d063609012be046488d3363b:1",
							className: "font-mono text-[10px] text-muted-foreground",
							children: [
								r.file,
								":",
								r.line
							]
						})
					]
				}, i))
			})]
		})]
	});
}
function AiExplain({ build, mode = "full", label, ready = true, noteKeys }) {
	const explain = useServerFn(explainReadWrite);
	const [state, setState] = (0, import_react.useState)({});
	const run = async () => {
		setState({ loading: true });
		try {
			const context = build();
			const res = await explain({ data: {
				context,
				mode,
				...noteKeys ? { noteKeys } : {}
			} });
			setState(res.report ? { report: res.report } : { error: res.error || "失败 / failed" });
		} catch (e) {
			setState({ error: e instanceof Error ? e.message : String(e) });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:365:5:954989aec5bc28108d3f74e6e8f75cff7728bacab4bf7c691adc1e118c59562c:1",
		className: "space-y-2 rounded-md border border-primary/40 p-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				onClick: run,
				disabled: state.loading || !ready,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1 h-4 w-4" }), !ready ? "等这页数据和代码读完… / Loading evidence…" : state.loading ? "AI 解读中… / Explaining…" : label || "AI 解读 / Explain with AI"]
			}),
			state.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:379:23:39b91662bfe7443af2a5519b048afb93b0f8bca606d5e0a9965bf468e81b7e4c:1",
				className: "text-xs text-destructive",
				children: state.error
			}),
			state.report && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConflictReportView, { report: state.report })
		]
	});
}
function ReadWriteInspector() {
	const [on, setOn] = (0, import_react.useState)(inspectModeOn());
	const [interact, setInteract] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("element");
	const [sub, setSub] = (0, import_react.useState)("rw");
	const [notes, setNotes] = (0, import_react.useState)({
		element: "",
		page: ""
	});
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [hoverBox, setHoverBox] = (0, import_react.useState)(null);
	const [selBox, setSelBox] = (0, import_react.useState)(null);
	const [path, setPath] = (0, import_react.useState)(currentPath());
	const requests = useRecorded();
	const panelRef = (0, import_react.useRef)(null);
	const [box, setBox] = (0, import_react.useState)(() => {
		const w = Math.min(440, window.innerWidth - 16);
		return {
			x: window.innerWidth - w - 8,
			y: 64,
			w,
			h: Math.min(window.innerHeight - 80, 640)
		};
	});
	const [scale, setScale] = (0, import_react.useState)(1);
	const startResize = (e, d) => {
		e.preventDefault();
		e.stopPropagation();
		const sx = e.clientX;
		const sy = e.clientY;
		const b0 = { ...box };
		const move = (ev) => {
			const dx = ev.clientX - sx;
			const dy = ev.clientY - sy;
			const b = { ...b0 };
			if (d.includes("e")) b.w = Math.max(280, b0.w + dx);
			if (d.includes("s")) b.h = Math.max(200, b0.h + dy);
			if (d.includes("w")) {
				b.w = Math.max(280, b0.w - dx);
				b.x = b0.x + (b0.w - b.w);
			}
			if (d.includes("n")) {
				b.h = Math.max(200, b0.h - dy);
				b.y = b0.y + (b0.h - b.h);
			}
			setBox(b);
		};
		const up = () => {
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
	};
	const startDrag = (e) => {
		if (e.button !== 0) return;
		const t = e.target;
		if (t.closest("button,input,textarea,select,a,label,[role=button],[role=option],[role=switch],[role=tab],[role=combobox],[role=checkbox],[contenteditable=\"\"],[contenteditable=true],[data-no-drag]")) return;
		if (e.nativeEvent.offsetX > t.clientWidth && t.clientWidth > 0) return;
		const el = panelRef.current;
		if (!el) return;
		const sx = e.clientX;
		const sy = e.clientY;
		const r = el.getBoundingClientRect();
		const dx = e.clientX - r.left;
		const dy = e.clientY - r.top;
		let dragging = false;
		const move = (ev) => {
			if (!dragging) {
				if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 4) return;
				dragging = true;
				window.getSelection()?.removeAllRanges();
				document.body.style.userSelect = "none";
			}
			setBox((b) => ({
				x: Math.max(0, Math.min(window.innerWidth - 80, ev.clientX - dx)),
				y: Math.max(0, Math.min(window.innerHeight - 40, ev.clientY - dy)),
				w: el.offsetWidth,
				h: el.offsetHeight || b.h
			}));
		};
		const up = () => {
			document.body.style.userSelect = "";
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
	};
	(0, import_react.useEffect)(() => {
		const inside = (n) => n instanceof Element && !!n.closest("[data-rw-inspector]");
		const guard = (e) => {
			if (!inspectModeOn()) return;
			const rel = e.relatedTarget ?? null;
			if (inside(e.target) || e.type === "focusout" && inside(rel)) e.stopImmediatePropagation();
		};
		const evs = [
			"pointerdown",
			"mousedown",
			"touchstart",
			"focusin",
			"focusout",
			"wheel",
			"touchmove",
			"keydown"
		];
		evs.forEach((ev) => document.addEventListener(ev, guard));
		return () => evs.forEach((ev) => document.removeEventListener(ev, guard));
	}, []);
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => setPath(currentPath()), 700);
		return () => clearInterval(t);
	}, []);
	const toggle = () => {
		const next = !on;
		setInspectMode(next);
		setOn(next);
		if (!next) {
			setSelected(null);
			setHoverBox(null);
		}
	};
	(0, import_react.useEffect)(() => {
		if (!on || interact) return;
		const inPanel = (t) => t instanceof Element && !!t.closest("[data-rw-inspector]");
		const stop = (e) => {
			if (inPanel(e.target)) return;
			e.preventDefault();
			e.stopPropagation();
		};
		const click = (e) => {
			if (inPanel(e.target)) return;
			e.preventDefault();
			e.stopPropagation();
			const el = e.target;
			setSelected(el);
			setClickNo((n) => n + 1);
			setSelBox(el.getBoundingClientRect());
			setTab("element");
		};
		const move = (e) => {
			if (inPanel(e.target)) {
				setHoverBox(null);
				return;
			}
			setHoverBox(e.target.getBoundingClientRect());
		};
		const evs = [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"submit",
			"keydown"
		];
		evs.forEach((ev) => document.addEventListener(ev, stop, true));
		document.addEventListener("click", click, true);
		document.addEventListener("mousemove", move, true);
		return () => {
			evs.forEach((ev) => document.removeEventListener(ev, stop, true));
			document.removeEventListener("click", click, true);
			document.removeEventListener("mousemove", move, true);
			setHoverBox(null);
		};
	}, [on, interact]);
	(0, import_react.useEffect)(() => {
		if (!selected) return;
		const update = () => setSelBox(selected.isConnected ? selected.getBoundingClientRect() : null);
		window.addEventListener("scroll", update, true);
		window.addEventListener("resize", update);
		return () => {
			window.removeEventListener("scroll", update, true);
			window.removeEventListener("resize", update);
		};
	}, [selected]);
	const pageRequests = (0, import_react.useMemo)(() => requests.filter((r) => r.path === path || path.startsWith(r.path.split("?")[0] + "/") && r.path.split("?")[0].length > 1), [requests, path]);
	const info = (0, import_react.useMemo)(() => selected ? inspectElement(selected, requests) : null, [selected, requests]);
	const [elementRefs, setElementRefs] = (0, import_react.useState)([]);
	const [clickNo, setClickNo] = (0, import_react.useState)(0);
	const [logic, setLogic] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let live = true;
		setLogic(null);
		if (info?.sources[0]) traceLogic(info.sources[0], 60, info.sources.slice(1), info.text, info.components.find((c) => !/^(Card|CardContent|Button|div|p|span)$/.test(c)) || "", info.card, info.itemIndex).then((r) => {
			if (live) setLogic(r);
		});
		return () => {
			live = false;
		};
	}, [selected, clickNo]);
	(0, import_react.useEffect)(() => {
		let live = true;
		setElementRefs([]);
		if (info) codeRefs([...new Set(info.sources.map((s) => s.split(":")[0]))].slice(0, 2), 1).then((r) => {
			if (live) setElementRefs(r);
		});
		return () => {
			live = false;
		};
	}, [selected, clickNo]);
	const pageFiles = (0, import_react.useMemo)(() => on && tab === "page" ? pageSourceFiles() : [], [
		on,
		tab,
		path,
		requests.length
	]);
	const [pageRefs, setPageRefs] = (0, import_react.useState)([]);
	const [pageRefsDone, setPageRefsDone] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let live = true;
		setPageRefs([]);
		setPageRefsDone(false);
		if (!pageFiles.length) {
			setPageRefsDone(true);
			return () => {
				live = false;
			};
		}
		codeRefs(pageFiles, 1).then((r) => {
			if (live) setPageRefs(r);
		}).finally(() => {
			if (live) setPageRefsDone(true);
		});
		return () => {
			live = false;
		};
	}, [pageFiles]);
	const [closure, setClosure] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let live = true;
		setClosure(null);
		const own = info?.sources[0]?.split(":")[0];
		if (own && logic) (() => {
			const pageFiles = new Set(info.sources.map((x) => x.split(":")[0]));
			const helpers = [...new Set(logic.flatMap((st) => [st.file, ...st.via || []]))].filter((f) => !pageFiles.has(f) && !/^(lib\/|integrations\/|features\/shared\/|components\/ui\/|components\/layout\/|routes\/__root)/.test(f));
			return helpers.length ? Promise.resolve(new Set(helpers)) : importClosure([own], 1).then((c) => new Set([...c].filter((f) => !INFRA.test(f))));
		})().then((c) => {
			if (live) setClosure(c);
		});
		return () => {
			live = false;
		};
	}, [
		selected,
		clickNo,
		logic
	]);
	const relatedRequests = (0, import_react.useMemo)(() => {
		if (!info || !closure) return [];
		const session = requests.filter((r) => r.path !== path && r.method === "GET" && /^contexts\//.test(ownerFile(r) || "") && closure.has(ownerFile(r)));
		const logicText = (logic || []).map((st) => st.code.join("\n")).join("\n");
		const own = pageRequests.filter((r) => {
			if (r.via === "server-fn") {
				const fn = r.endpoint.split("/")[1] || "";
				return !!fn && new RegExp(`\\b${fn}\\s*\\(`).test(logicText);
			}
			const app = r.callers.filter((c) => !/^(features\/shared\/|lib\/|integrations\/|services\/wp-|features\/inspector\/)/.test(c));
			const ownFile = info.sources[0]?.split(":")[0];
			return app.slice(0, 2).some((c, i) => closure.has(c) && (i === 0 || !/^hooks\//.test(c)) || i === 0 && c === ownFile);
		});
		const base = [...session, ...own];
		const proven = /* @__PURE__ */ new Map();
		for (const r of base) {
			const m = r.endpoint.match(/^jet-rel\/(\d+)/);
			const def = m ? relById(m[1]) : void 0;
			if (!def || !r.rows) continue;
			const ids = /* @__PURE__ */ new Set();
			const walk = (v) => {
				if (Array.isArray(v)) v.forEach(walk);
				else if (v && typeof v === "object") {
					const o = v;
					for (const k of ["child_object_id", "parent_object_id"]) if (o[k] != null) ids.add(String(o[k]));
					Object.values(o).forEach((x) => typeof x === "object" && walk(x));
				} else if (v != null) ids.add(String(v));
			};
			walk(r.rows);
			for (const side of [def.parent, def.child]) {
				const n = side.match(/^(\d+)\./)?.[1];
				if (n) {
					const set = proven.get(n) || /* @__PURE__ */ new Set();
					ids.forEach((x) => set.add(x));
					proven.set(n, set);
				}
			}
		}
		const orphans = [...new Map(requests.filter((r) => {
			if (r.method !== "GET" || !pageRequests.includes(r) || base.includes(r)) return false;
			const m = r.endpoint.match(/^jet-cct\/([a-z0-9_]+)\/(\d+)/);
			const def = m ? cctBySlug(m[1]) : void 0;
			return !!def && !!proven.get(String(def.id))?.has(m[2]);
		}).map((r) => [r.endpoint, r])).values()];
		return [...base, ...orphans];
	}, [
		info,
		pageRequests,
		closure,
		requests,
		path,
		logic
	]);
	const relatedIds = (0, import_react.useMemo)(() => new Set(relatedRequests.map((r) => `${r.method} ${r.endpoint} ${JSON.stringify(r.params || {})}`)), [relatedRequests]);
	const tinyText = !!info && /^(\d{1,3}|—|-)$/.test(info.text.trim());
	const keep = (0, import_react.useCallback)((m) => relatedIds.has(`${m.request.method} ${m.request.endpoint} ${JSON.stringify(m.request.params || {})}`) && (!tinyText || !!m.sameCard), [relatedIds, tinyText]);
	const realMatches = (0, import_react.useMemo)(() => info ? info.matches.filter(keep) : [], [info, keep]);
	const strayMatches = (0, import_react.useMemo)(() => info ? info.matches.filter((m) => !keep(m)) : [], [info, keep]);
	const summaryRef = (0, import_react.useRef)(null);
	const narrRef = (0, import_react.useRef)(null);
	const pageNarrRef = (0, import_react.useRef)(null);
	const pathname = path.split("?")[0];
	const elementKey = info ? stableElementKey(pathname, info.anchor) : "";
	const legacyKey = info?.anchor.names[0]?.startsWith("scope:") ? [
		"el",
		pathname.replace(/\/\d+(?=\/|$)/g, "/:id"),
		info.anchor.names.join("<"),
		`@${info.anchor.path}`
	].join("|") : info?.sources[0] ? `el|${pathname}|${info.sources[0] || info.components.join("<")}|${info.tag}${info.callSite ? `@${info.callSite}` : ""}${info.itemSlot ? `|${info.itemSlot}` : ""}` : "";
	const elementAliasKey = info ? elementAlias(pathname, info.components, info.tag, info.itemSlot) : "";
	const fingerprint = info?.sourceFingerprint && !info.itemSlot && !info.callSite && [...document.querySelectorAll("[data-inspector-source]")].filter((el) => el.getAttribute("data-inspector-source") === info.sourceFingerprint && !el.closest("[data-rw-inspector]")).length === 1 ? info.sourceFingerprint : void 0;
	const elementLabel = info ? `<${info.tag}> ${info.text.slice(0, 60)} · ${info.components[0] || ""}` : "";
	const queryClient = useQueryClient();
	const fitContext = (value) => JSON.stringify(value);
	const cachedResults = (0, import_react.useCallback)(() => {
		const text = (logic || []).map((st) => st.code.join("\n")).join("\n") + "\n" + (summaryRef.current?.innerText || "");
		return queryClient.getQueryCache().findAll().filter((q) => {
			const k = q.queryKey[0];
			return typeof k === "string" && k.length > 2 && /^[\w$]+$/.test(k) && new RegExp(`(?<![\\w$])${k}(?![\\w$])`).test(text);
		}).slice(0, 15).map((q) => {
			const d = q.state.data;
			return {
				queryKey: q.queryKey,
				status: q.state.status,
				length: Array.isArray(d) ? d.length : void 0,
				value: JSON.stringify(d ?? null, (_k, v) => v instanceof Map ? Object.fromEntries(v) : v instanceof Set ? [...v] : v).slice(0, 1500),
				size: d instanceof Map || d instanceof Set ? d.size : void 0
			};
		});
	}, [queryClient, logic]);
	const elementContext = (0, import_react.useCallback)(() => fitContext({
		manualNotes: {
			element: notes.element || null,
			page: notes.page || null
		},
		deterministicSummary: ((narrRef.current?.innerText || "") + "\n" + (summaryRef.current?.innerText || "")).slice(0, 7e3) || null,
		cachedQueryResults: cachedResults(),
		otherCachedQueries: queryClient.getQueryCache().findAll().map((q) => String(q.queryKey[0])).filter((k, i, a) => a.indexOf(k) === i).slice(0, 60),
		dictionary: Object.fromEntries([...new Map(pageRequests.map((r) => {
			const t = decodeEndpoint(r.method, r.endpoint);
			const d = t.cct || t.rel;
			return [t.label.replace(/\s*#\d+$/, "").replace(/ (?:parents|children) of \d+$/, ""), d ? {
				columns: d.f,
				fieldTypes: t.cct ? Object.fromEntries(Object.values(t.cct.f || {}).map((c) => [c, fieldType(t.cct, c) || "?"])) : void 0,
				options: d.opt
			} : null];
		}).filter(([, d]) => d)).entries()].slice(0, 30)),
		page: path,
		uiLanguage: document.documentElement.lang || navigator.language,
		element: info && {
			tag: info.tag,
			text: info.text,
			sources: info.sources,
			components: info.components,
			link: info.link,
			handlers: info.handlers,
			shownValueExpression: logic ? decidingExpression(logic, info.text) : null,
			anchor: info.anchor,
			decisionLogic: (logic || []).map((st) => ({
				title: st.title,
				at: `${st.file}:${st.line}`,
				code: st.code.join("\n"),
				fallbackLines: st.fallbacks.map((j) => st.line + j)
			})),
			props: info.props,
			unrelatedSameText: strayMatches.map((m) => m.target.label + " #" + m.row),
			pageValueMatches: (info?.matches || []).slice(0, 12).map((m) => ({
				related: realMatches.includes(m),
				sameCard: !!m.sameCard,
				target: m.target.label,
				row: m.row,
				field: m.field,
				fieldName: m.fieldName,
				value: m.value,
				chain: traceRow(m.row, m.request, pageRequests, path).map((x) => x.text)
			})),
			fieldMatches: realMatches.map((m) => ({
				chain: traceRow(m.row, m.request, pageRequests, path).map((x) => x.text),
				target: m.target.label,
				row: m.row,
				field: m.field,
				fieldName: m.fieldName,
				option: m.option,
				value: m.value
			}))
		},
		otherPageReads: pageRequests.filter((r) => !relatedRequests.includes(r)).slice(0, 100).map((r) => ({
			target: decodeEndpoint(r.method, r.endpoint).label,
			endpoint: r.endpoint,
			returnedRows: r.rows === void 0 ? "not loaded" : Array.isArray(r.rows) ? r.rows.length : 1,
			rowSample: r.rows === void 0 ? void 0 : JSON.stringify(r.rows).slice(0, 300),
			callers: (r.callers || []).slice(0, 2)
		})),
		liveRequests: relatedRequests.map((r) => ({
			method: r.method,
			endpoint: r.endpoint,
			target: decodeEndpoint(r.method, r.endpoint).label,
			blocked: r.blocked,
			body: describeBody(r),
			fields: returnedFields(r),
			returnedRows: r.rows === void 0 ? "not loaded" : Array.isArray(r.rows) ? r.rows.length : 1,
			rowSample: r.rows === void 0 ? void 0 : JSON.stringify(r.rows).slice(0, 800),
			callers: r.callers
		})),
		codeRefs: elementRefs.slice(0, 80).map((r) => ({
			kind: r.kind,
			label: r.label,
			file: `${r.file}:${r.line}`,
			snippet: r.snippet
		}))
	}), [
		path,
		info,
		relatedRequests,
		elementRefs,
		logic,
		realMatches,
		strayMatches,
		pageRequests,
		cachedResults,
		notes
	]);
	const pageContext = (0, import_react.useCallback)(() => fitContext({
		page: path,
		files: pageFiles,
		manualNotes: { page: notes.page || null },
		descriptiveSummary: pageNarrRef.current?.innerText.slice(0, 8e3) || null,
		dictionary: Object.fromEntries([...new Map(pageRequests.map((r) => {
			const t = decodeEndpoint(r.method, r.endpoint);
			const d = t.cct || t.rel;
			return [t.label.replace(/\s*#\d+$/, "").replace(/ (?:parents|children) of \d+$/, ""), d ? {
				columns: d.f,
				fieldTypes: t.cct ? Object.fromEntries(Object.values(t.cct.f || {}).map((c) => [c, fieldType(t.cct, c) || "?"])) : void 0,
				options: d.opt
			} : null];
		}).filter(([, d]) => d)).entries()].slice(0, 30)),
		liveRequests: pageRequests.map((r) => ({
			method: r.method,
			endpoint: r.endpoint,
			target: decodeEndpoint(r.method, r.endpoint).label,
			blocked: r.blocked,
			body: describeBody(r),
			fields: returnedFields(r),
			callers: r.callers
		})),
		codeRefs: pageRefs.slice(0, 150).map((r) => ({
			kind: r.kind,
			label: r.label,
			file: `${r.file}:${r.line}`,
			snippet: r.snippet
		}))
	}), [
		path,
		pageFiles,
		pageRequests,
		pageRefs,
		notes
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1115:5:b9ddb6787a7c5c524db349a4f858cc8f6f4cd99757e88cdfe8dc75d832427671:1",
		"data-rw-inspector": true,
		style: { pointerEvents: "auto" },
		children: [
			!on && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1117:9:531de094e543e84b931063f332398a1934478c8e89ae2777f66c01dc07111df8:1",
				type: "button",
				onClick: toggle,
				"data-rw-inspector": true,
				style: { pointerEvents: "auto" },
				className: `fixed right-3 top-16 z-[10000] flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium shadow-md ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanSearch, { className: "h-4 w-4" }), "读写核对 / Inspect"]
			}),
			on && !interact && hoverBox && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1129:9:00bae1692957e1022daa639ea3433aae2c2234ac6674d1c6517aedfc1f36bf19:1",
				className: "pointer-events-none fixed z-[9998] border-2 border-dashed border-primary/70",
				style: {
					left: hoverBox.left,
					top: hoverBox.top,
					width: hoverBox.width,
					height: hoverBox.height
				}
			}),
			on && selBox && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1140:9:00bae1692957e1022daa639ea3433aae2c2234ac6674d1c6517aedfc1f36bf19:1",
				className: "pointer-events-none fixed z-[9998] border-2 border-primary bg-primary/10",
				style: {
					left: selBox.left,
					top: selBox.top,
					width: selBox.width,
					height: selBox.height
				}
			}),
			on && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1151:9:00bae1692957e1022daa639ea3433aae2c2234ac6674d1c6517aedfc1f36bf19:1",
				ref: panelRef,
				className: "fixed z-[9999] flex flex-col overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-2xl",
				style: {
					left: box.x,
					top: box.y,
					width: box.w,
					height: box.h,
					pointerEvents: "auto"
				},
				onPointerDown: startDrag,
				children: [
					[
						"n",
						"s",
						"e",
						"w",
						"ne",
						"nw",
						"se",
						"sw"
					].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1164:13:fa57c5eef02c89773b2e766e44a02483d2a1bf0a1cc17a5fe84bea858f0142ea:1",
						onPointerDown: (e) => startResize(e, d),
						className: "absolute z-10",
						style: {
							...d.includes("n") ? { top: 0 } : d.includes("s") ? { bottom: 0 } : {
								top: 8,
								bottom: 8
							},
							...d.includes("w") ? { left: 0 } : d.includes("e") ? { right: 0 } : {
								left: 8,
								right: 8
							},
							width: d.length === 2 || d === "e" || d === "w" ? 8 : void 0,
							height: d.length === 2 || d === "n" || d === "s" ? 8 : void 0,
							cursor: `${d}-resize`,
							touchAction: "none"
						}
					}, d)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1187:11:8777458440cfbef8877513571cfac714f6a9cb8baba9bf068b5ec4f7d8441c47:1",
						className: "flex cursor-move touch-none select-none items-center gap-2 border-b border-border p-3",
						title: "面板任意空白处都可拖动 / Drag anywhere to move",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onPointerDown: (e) => e.stopPropagation(),
								onClick: () => setScale((z) => Math.max(.6, +(z - .1).toFixed(1))),
								"aria-label": "缩小 / Smaller",
								children: "A−"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onPointerDown: (e) => e.stopPropagation(),
								onClick: () => setScale((z) => Math.min(1.4, +(z + .1).toFixed(1))),
								"aria-label": "放大 / Larger",
								children: "A+"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1213:13:fb718e4876fa2e8780c4cebd8f7719f11ac7835811c8bc8c0e383243e787e383:1",
								className: "flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1214:15:14117aa5fd668299b1c283fe8db45148c6ac6147a5a7a93f85354f3cc36f2f9c:1",
									className: "text-sm font-semibold",
									children: "读写核对器 / Read-write inspector"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								onPointerDown: (e) => e.stopPropagation(),
								onClick: toggle,
								"aria-label": "关闭 / Close",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1228:11:a9cdcec8cbab1de5e249732f125a5f4e5a2119b33b1213f163ce30b904507a0f:1",
						className: "flex gap-1 border-b border-border p-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: interact ? "outline" : "default",
								onClick: () => setInteract(false),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointerClick, { className: "mr-1 h-4 w-4" }), "选择 / Select"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: interact ? "default" : "outline",
								onClick: () => setInteract(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "mr-1 h-4 w-4" }), "浏览 / Browse"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: clearRecorded,
								"aria-label": "清空记录 / Clear",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1254:11:232d54c25f42512a070a68526048effbda8ddb628d325f49a736df0b948e880c:1",
						className: "flex gap-1 border-b border-border p-2 text-xs",
						children: [
							"element",
							"page",
							"site"
						].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: tab === t ? "secondary" : "ghost",
							onClick: () => setTab(t),
							children: t === "element" ? "元素 / Element" : t === "page" ? "整页 / Page" : "全站 / Site"
						}, t))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1270:11:8777458440cfbef8877513571cfac714f6a9cb8baba9bf068b5ec4f7d8441c47:1",
						className: tab === "site" ? "hidden" : "flex gap-1 border-b border-border p-2 text-xs",
						children: [
							"rw",
							"ai",
							"notes"
						].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1278:15:d28290e03c35730f2c3304a925423562ff2093be356c903abb6ad4b64f783fba:1",
							type: "button",
							onClick: () => setSub(t),
							className: `rounded-md border px-2 py-1 ${sub === t ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`,
							children: t === "rw" ? "读写分析" : t === "ai" ? "AI 分析" : `手动注释${(tab === "element" ? notes.element : notes.page) ? " ●" : ""}`
						}, t))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1292:11:8777458440cfbef8877513571cfac714f6a9cb8baba9bf068b5ec4f7d8441c47:1",
						className: "flex-1 space-y-4 overflow-y-auto p-3 text-sm",
						style: { zoom: scale },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1296:13:395f06d2d0856d30fceb004ae9a36676540896ef716fa787d616abfafc44a723:1",
								className: tab === "site" ? "" : "hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteAnalysis, {})
							}),
							interact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1300:15:ba3965696a3ecc53c2fef246d4da64b679a7222512e73b41a638294850bb3062:1",
								className: "rounded-md bg-muted p-2 text-xs",
								children: "浏览模式：可以正常点击和跳转。要查看某个元素，切回「选择」。 / Browse mode: navigate freely."
							}),
							tab === "element" && !info && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1306:15:330a532565ca707d7287923fe79c41c9fea5e36376ae8c6995c1c871a5a49a79:1",
								className: "text-xs text-muted-foreground",
								children: "在「选择」模式下点页面上任意元素。 / In Select mode, click any element on the page."
							}),
							tab === "element" && info && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1313:17:0827e7d1558fdc7341bc0d74f068efcf53c12709fdc21836b5e624318ad86862:1",
									className: "space-y-1 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1314:19:3889edd1afb181296ccbc1c5577145ae21e15717928b1c3251a7da4f3858e0ed:1",
											className: "font-medium",
											children: [
												"元素 / Element: <",
												info.tag,
												">",
												" ",
												info.text && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1317:23:c7a32d18fee1d52867a671b404c298a35d55d3d27e79801389fc9d3710f712b7:1",
													className: "text-muted-foreground",
													children: [
														"“",
														info.text.slice(0, 80),
														"”"
													]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1322:19:1bc93ee7afa00675b5eaacf65fb77591ecc6a1e0b98a66b196f925023f85861e:1",
											children: [
												"组件 / Components:",
												" ",
												info.components.join(" ← ") || "未识别 / unknown"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1326:19:8e5af8709bcdb523255714243c7cf4c9d36f54b1b796c58febac7f1fd965dd35:1",
											className: "break-all font-mono text-[10px]",
											children: [
												"源文件 / Source:",
												" ",
												info.sources.join(" ← ") || "分析时从当前页面代码读取 / Resolved from deployment source during analysis"
											]
										}),
										info.link && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1332:21:2d98207b73cc711122b21ea133d0df667fd847f6b0ed27d1bf599dc88361f69c:1",
											children: [
												"跳转 / Goes to:",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1334:23:7d9e0fd346b62143b40ebc610748dbc4c3187e1249e50fb35cc531ddf92a3b0f:1",
													className: "font-mono",
													children: info.link
												})
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1338:17:10ae28dbd68b7adf2e699377ad96f2330ef5171327641d1871f8d267a5055a4c:1",
									className: sub === "ai" ? "" : "hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiExplain, {
										build: elementContext,
										mode: "origin",
										ready: !!info,
										label: "生成 AI 分析 / Generate AI analysis",
										noteKeys: [
											elementKey,
											legacyKey,
											`page|${pathname}`
										]
									}, `o-${elementKey}-${info.text}`)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1348:17:b769c951546e460f3b91b27eb3ca280297185bcc07a0572b944d08611975ee68:1",
									className: sub === "notes" ? "" : "hidden",
									"data-note-key": elementKey,
									"data-note-label": elementLabel,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManualNotes, {
										noteKey: elementKey,
										legacyKey: info.anchor.names[0]?.startsWith("scope:") ? legacyKey : void 0,
										legacySourceKey: info.anchor.names[0]?.startsWith("scope:") ? void 0 : legacyKey,
										fingerprint,
										alias: elementAliasKey,
										scope: "element",
										page: pathname,
										label: elementLabel,
										source: info.itemSlot || info.callSite ? void 0 : info.sources[0],
										tag: info.tag,
										buildEvidence: elementContext,
										evidenceReady: !!info,
										onChange: (t) => setNotes((n) => ({
											...n,
											element: t
										}))
									}, elementKey)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1382:17:817dfdb76a8c09cb2df2f5485e668b5fae0f0465efa945f7d7346ff4949df93c:1",
									className: sub === "rw" ? "space-y-4" : "hidden",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1383:19:42b414d7a6b4030b0bd4eb2b70e7e5defab888c835a9e432c955e764febcab7a:1",
											ref: narrRef,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadWriteNarrative, {
												scope: "element",
												text: info.text,
												matches: realMatches,
												requests: relatedRequests,
												refs: elementRefs,
												handlers: info.handlers
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1393:19:236bbcbcc4fd43dd52b7b9837870555a96f7ba051b48e909bad911d5138c62ab:1",
											className: "space-y-1",
											ref: summaryRef,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1394:21:02da0f65790678c0d388850e26ce6f390e7f7783d7f3bdf17aa3082ee574b477:1",
												className: "text-xs font-medium",
												children: "显示的值来自 / Shown value comes from"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OriginSummary, {
												text: info.text,
												matches: realMatches,
												reads: closure ? relatedRequests.filter((r) => r.method === "GET") : [],
												pageRequests,
												path,
												logic,
												expr: logic ? decidingExpression(logic, info.text) : null,
												account: realMatches.length ? [] : accountMatches(info.text),
												files: [...new Set(info.sources.map((x) => x.split(":")[0]))]
											})]
										}),
										strayMatches.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1418:21:2fefa22f4bd72a69bb7ec225f41fd0d11ac84a7d881f8fc6f04188bc657acc52:1",
											className: "text-[10px] text-muted-foreground",
											children: [
												"另有 ",
												strayMatches.length,
												" 条同文字数据来自别的功能（如",
												" ",
												strayMatches[0].target.label,
												"），与这个元素无关，已排除。 / Same text found in unrelated data, excluded."
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1425:19:c11b80360167205d3dc98d5b30199edf30313c87cb28ee4b2a5b2c3c706b74ec:1",
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1426:21:02da0f65790678c0d388850e26ce6f390e7f7783d7f3bdf17aa3082ee574b477:1",
												className: "text-xs font-medium",
												children: [
													"数据链 / Data chain",
													" ",
													closure ? `(${relatedRequests.filter((r) => r.method === "GET").length})` : "…"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataChain, { requests: relatedRequests.filter((r) => r.method === "GET") })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1438:19:c11b80360167205d3dc98d5b30199edf30313c87cb28ee4b2a5b2c3c706b74ec:1",
											className: "space-y-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1439:21:02da0f65790678c0d388850e26ce6f390e7f7783d7f3bdf17aa3082ee574b477:1",
													className: "text-xs font-medium",
													children: [
														"判定逻辑 / Decision logic",
														" ",
														logic ? `(${logic.length})` : "…"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1443:21:2fefa22f4bd72a69bb7ec225f41fd0d11ac84a7d881f8fc6f04188bc657acc52:1",
													className: "text-[10px] text-muted-foreground",
													children: "现场读取当前代码：显示这段内容的代码、它的值在哪里被决定、调用了哪些判定函数。红色行是兜底/默认值（|| ?? catch 默认分支）。 / Read live from current code; red lines are fallbacks."
												}),
												logic?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1449:23:7e1c1a5c15ada4211a8e2b66b99486853c4689a2e9a0ed690cc64b2b63c95ecd:1",
													className: "text-xs text-muted-foreground",
													children: "没找到 / none found"
												}),
												logic?.map((st, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1454:23:c242448a68ecc0c83df1e5c79fd580e5401ced1cebbf9b339e723d2f51e46045:1",
													className: "rounded border border-border",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1455:25:5eac3b57f720c462d365e7de5f73c31b2ef978587eb914f28e3216dffab03903:1",
														className: "border-b border-border bg-muted/50 px-2 py-0.5 text-[10px]",
														children: [
															st.title,
															" ·",
															" ",
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1457:27:b43ac879ce658cac48d6509c328888e5cc7b47b00fca4ce445e39db8566a4d96:1",
																className: "font-mono",
																children: [
																	st.file,
																	":",
																	st.line
																]
															}),
															st.fallbacks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1461:29:badf26fb6ba1e4c79efa222f0e1a0bcd8564d658d14ddd76f212d4e7b68f2c08:1",
																className: "ml-1 rounded bg-destructive px-1 text-destructive-foreground",
																children: ["兜底 fallback ×", st.fallbacks.length]
															})
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
														"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1466:25:d42bd4931806b39cdbf81b1cd249684450e12a33635a85323bb733e799f47f42:1",
														className: "max-h-56 overflow-auto p-1 font-mono text-[10px] leading-snug",
														children: st.code.map((l, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1468:29:180493401df7220e9efe17e6f96ef53be1b38f896a4d7414c6a5340a70c90744:1",
															className: st.fallbacks.includes(j) ? "bg-destructive/15" : "",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1476:31:f7f791b9ef6b12e2c1bc082f3be907cf37f36dea69baa7a76b4524f66351b194:1",
																className: "mr-2 select-none text-muted-foreground",
																children: st.line + j
															}), l]
														}, j))
													})]
												}, i))
											]
										}),
										info.props.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1487:21:53ecbca21423966cfc607f66dd16973839e1904fba82aa023ef5fb6924998862:1",
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1488:23:f38d79ee59742570433aedf2b323652061ee9a8c1ef6515911e6a70160eb6623:1",
												className: "text-xs font-medium",
												children: "组件拿到的数据 / Data passed to the component"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1491:23:0a3e0bf3e0880e8cfa5ae22b91948d96c84588964c7840d94e6d92c9497c36e1:1",
												className: "space-y-1",
												children: info.props.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
													"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1493:27:8173bb0792497d85453672fa70cd6062b8b3954712cd895bffc22ef894871aa5:1",
													className: "break-all rounded bg-muted p-1 font-mono text-[10px]",
													children: [
														p.component,
														".",
														p.prop,
														" = ",
														p.value
													]
												}, i))
											})]
										}),
										info.handlers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1504:21:53ecbca21423966cfc607f66dd16973839e1904fba82aa023ef5fb6924998862:1",
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1505:23:f38d79ee59742570433aedf2b323652061ee9a8c1ef6515911e6a70160eb6623:1",
												className: "text-xs font-medium",
												children: "点击时会执行 / On click runs (未执行 / not run)"
											}), info.handlers.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("pre", {
												"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1509:25:5698034508f9aa8bd8a713aff1e7a6c3ff9ed24486b8b65968ccb7762e2a8f57:1",
												className: "max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 font-mono text-[10px]",
												children: [
													h.prop,
													" @ ",
													h.owner,
													"\n",
													h.code
												]
											}, i))]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1520:19:c11b80360167205d3dc98d5b30199edf30313c87cb28ee4b2a5b2c3c706b74ec:1",
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1521:21:02da0f65790678c0d388850e26ce6f390e7f7783d7f3bdf17aa3082ee574b477:1",
												className: "text-xs font-medium",
												children: "这个组件实际发出的请求 / Live requests from this component"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestList, { requests: relatedRequests })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1526:19:117ab0a4547f928c878e8f24cd99e545d31a5ca8b6242f843347824d0ce80c8e:1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefList, { refs: elementRefs })
										})
									]
								})
							] }),
							tab === "page" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1534:17:1531b9d618334126bb0356bccedc3749f279024bc27451c6c11aa9cd68481679:1",
									className: "text-xs",
									children: ["页面 / Page: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1535:30:09575b82a3558475911176b9695a5e8d2cb119c91ab2d050959b5fc28fe44f99:1",
										className: "font-mono",
										children: path
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1537:17:10ae28dbd68b7adf2e699377ad96f2330ef5171327641d1871f8d267a5055a4c:1",
									className: sub === "ai" ? "" : "hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiExplain, {
										build: pageContext,
										ready: pageRefsDone,
										label: "生成整页 AI 分析 / Generate page AI analysis",
										noteKeys: [`page|${pathname}`]
									}, `p-${pathname}`)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1546:17:817dfdb76a8c09cb2df2f5485e668b5fae0f0465efa945f7d7346ff4949df93c:1",
									className: sub === "rw" ? "space-y-4" : "hidden",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1547:19:e46e95e1db38588fc26efa85f044da34b2b1beae70c51859c9c3fe5a3445dba9:1",
											ref: pageNarrRef,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadWriteNarrative, {
												scope: "page",
												matches: [],
												requests: pageRequests,
												refs: pageRefs
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1555:19:c11b80360167205d3dc98d5b30199edf30313c87cb28ee4b2a5b2c3c706b74ec:1",
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1556:21:02da0f65790678c0d388850e26ce6f390e7f7783d7f3bdf17aa3082ee574b477:1",
												className: "text-xs font-medium",
												children: [
													"本页实际读写 / Live reads and writes on this page (",
													pageRequests.length,
													")"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestList, { requests: pageRequests })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1562:19:e3b6e734b47617aad7298476712d366d959f129ce7ad5de0d2500aeb1cfe0db0:1",
											className: "space-y-1 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1563:21:18d887cb4a133448cc67e820aaa32014ab5369ddf2093ecb4678c70ab73693f1:1",
												className: "font-medium",
												children: [
													"本页用到的源文件 / Source files on this page (",
													pageFiles.length,
													")"
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1567:21:d5733dca717f20a355180af65c68764abe358b68fbbdffea8414b6adeeed8a95:1",
												className: "break-all font-mono text-[10px] text-muted-foreground",
												children: pageFiles.join(" · ") || "分析时从当前页面代码读取 / Resolved from deployment source during analysis"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
											"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1572:19:117ab0a4547f928c878e8f24cd99e545d31a5ca8b6242f843347824d0ce80c8e:1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefList, { refs: pageRefs })
										})
									]
								})
							] }),
							on && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-source": "components/inspector/ReadWriteInspector.tsx:1579:15:e5232daef8c2d07e939e94c37a42cc2b6c906e30a7ca6d939b9ad099833ed7d9:1",
								className: tab === "page" && sub === "notes" ? "" : "hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManualNotes, {
									noteKey: `page|${pathname}`,
									scope: "page",
									page: pathname,
									label: pathname,
									buildEvidence: pageContext,
									evidenceReady: pageRefsDone,
									onChange: (t) => setNotes((n) => ({
										...n,
										page: t
									}))
								}, `page|${pathname}`)
							})
						]
					})
				]
			})
		]
	});
}
//#endregion
export { ReadWriteInspector as default };
