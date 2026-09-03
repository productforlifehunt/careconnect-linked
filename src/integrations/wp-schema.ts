// AUTO-GENERATED — DO NOT EDIT BY HAND.
// Dictionary:  /mnt/documents/最新数据字典-2026-08.txt
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
    /** 140. Product */
    "140": {
      id: 140,
      slug: "nicotine_product",
      name: "Product",
      f: {
        "NAME": "a55",  // Text
        "DESCRIPTION": "a56",  // Textarea
        "PRODUCT_TYPE": "a57",  // Checkbox
        "THE_SUPPLEMENT_IS_GLP_1": "a571",  // Radio
        "GLP_1_PRODUCT_CATEGORY": "a572",  // ?
        "THE_SUPPLEMENT_IS_PEPTIDES": "a573",  // Radio
        "SUPPLEMENT_PRODUCT_CATEGORY": "a574",  // Radio
        "THE_FOOD_SUPPLEMENT_CONTAINS_CAFFEINE": "a575",  // Radio
        "THE_FOOD_SUPPLEMENT_CONTAINS_PROTEIN": "a576",  // Radio
        "GIFTCARD_TYPE": "a577",  // Radio
        "GIFTCARD_PRICE": "a578",  // Number
        "DIGITAL_PRODUCT_PLATFORM": "a579",  // ?
        "DIGITAL_PRODUCT_CATEGORY": "a580",  // ?
        "THE_PRODUCT_IS_A_NRT_PRODUCT": "a58",  // Radio
        "NRT_CERTIFICATION_INSTITUTE": "a59",  // Checkbox
        "THE_NICOTINE_PRODUCT_IS_A_SMOKELESS_NICOTINE_PRODUCT": "a60",  // Radio
        "NICOTINE_PRODUCT_CATEGORY": "a61",  // Radio
        "THE_PRODUCT_CONTAINS_TOBACCO": "a62",  // Radio
        "NICOTINE_STRENGTH_IN_MG": "a63",  // Number
        "SMOKELESS_PRODUCT_STRENGTH_CATEGORY": "a64",  // Radio
        "NRT_PRODUCT_STAGE_CATEGORY": "a65",  // Radio
        "THE_PRODUCT_IS_APPROVED": "a66",  // Radio
        "HOW_MANY_PRODUCTS_IN_A_PACK": "a67",  // Number
        "IMAGES": "a68",  // Gallery
        "GOOGLE_PRODUCT_CATEGORY_ID": "a69",  // Text
        "COIN_ALLOWANCE": "a70",  // Number
        "CUSTOM_FOOD_DETAIL": "a71",  // Textarea
        "CUSTOM_RECIPE_DETAIL": "a711",  // Textarea
        "CUSTOM_WORKOUT_DETAIL": "a712",  // Textarea
        "CUSTOM_MEDICINE_DETAIL": "a713",  // Textarea
        "ALCOHOL_PRODUCT_CATEGORY": "a72",  // Checkbox
        "ALCOHOL_PERCENTAGE": "a73",  // Number
        "ALCOHOL_VOLUME_PER_BOTTLE": "a74",  // Number
        "PRODUCT_LISTING_TYPE": "a75",  // Checkbox
      },
      opt: {
        "PRODUCT_TYPE": { "NICOTINE_PRODUCT": "b55", "ALCOHOL_PRODUCT": "b56", "FOOD": "b57", "SUPPLEMENT": "b58", "MEDICINE": "b59", "GEAR": "b60", "GIFTCARD": "b61", "DIGITAL_PRODUCT": "b62" },
        "THE_SUPPLEMENT_IS_GLP_1": { "YES": "b55", "NO": "b56" },
        "THE_SUPPLEMENT_IS_PEPTIDES": { "YES": "b55", "NO": "b56" },
        "THE_FOOD_SUPPLEMENT_CONTAINS_CAFFEINE": { "YES": "b55", "NO": "b56" },
        "THE_FOOD_SUPPLEMENT_CONTAINS_PROTEIN": { "YES": "b55", "NO": "b56" },
        "GIFTCARD_TYPE": { "AMAZON": "b55" },
        "THE_PRODUCT_IS_A_NRT_PRODUCT": { "YES": "b55", "NO": "b56" },
        "THE_NICOTINE_PRODUCT_IS_A_SMOKELESS_NICOTINE_PRODUCT": { "YES": "b55", "NO": "b56" },
        "NICOTINE_PRODUCT_CATEGORY": { "CIGARETTE": "b55", "CIGAR": "b56", "CIGARILLO": "b57", "PIPE": "b58", "HOOKAH": "b59", "HAND_ROLL": "b60", "HEATED_TOBACCO": "b61", "VAPE": "b62", "MOIST_SNUFF_DIP": "b63", "NASAL_SNUFF": "b64", "TOBACCO_POUCH_SNUS": "b65", "CHEWING_TOBACCO": "b66", "NICOTINE_POUCH": "b67", "NICOTINE_GUM": "b68", "NICOTINE_STRIP": "b69", "NICOTINE_LOZENGE_MINT": "b70", "NICOTINE_SUBLINGUAL_TABLET": "b71", "NICOTINE_NASAL_SPRAY": "b72", "NICOTINE_COTTON": "b73", "NICOTINE_HARD_CANDY": "b74", "NICOTINE_PEARL": "b75", "NICOTINE_TOOTHPICK": "b76", "NICOTINE_MOUTH_SPRAY": "b77", "NICOTINE_INHALER": "b78", "NICOTINE_GEL": "b79", "NICOTINE_LOLLIPOPS_SUCKERS": "b80" },
        "THE_PRODUCT_CONTAINS_TOBACCO": { "YES": "b55", "NO": "b56" },
        "THE_PRODUCT_IS_APPROVED": { "YES": "b55", "NO": "b56" },
        "ALCOHOL_PRODUCT_CATEGORY": { "BEER": "b55", "CIDER": "b56", "WINE": "b57", "FORTIFIED_WINE": "b58", "SPIRITS": "b59", "ALCOPOPS": "b60", "PROSECCO_CHAMPAGNE": "b61" },
        "PRODUCT_LISTING_TYPE": { "OUR_NON_SPECIFIC_CATEGORY_PRODUCT_CUSTOMIZABLE_BY_USERS": "b55", "USER_S_PERSONAL_PRODUCTS": "b56" },
      },
    },
    /** 146. Product’s brand */
    "146": {
      id: 146,
      slug: "nicotine_products_b",
      name: "Product’s brand",
      f: {
        "BRAND_NAME": "a55",  // Text
        "BRAND_IMAGE": "a56",  // Gallery
        "BRAND_IS_APPROVED": "a57",  // Radio
        "BRAND_IS_STILL_ACTIVE": "a58",  // Radio
      },
      opt: {
        "BRAND_IS_APPROVED": { "YES": "b55", "NO": "b56" },
        "BRAND_IS_STILL_ACTIVE": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 114. Product's flavor */
    "114": {
      id: 114,
      slug: "nicotine_products_fl",
      name: "Product's flavor",
      f: {
        "FLAVOR_NAME": "a55",  // Text
        "FLAVOR_IS_APPROVED": "a56",  // Radio
        "FLAVOR_IS_STILL_ACTIVE": "a57",  // Radio
      },
      opt: {
        "FLAVOR_IS_APPROVED": { "YES": "b55", "NO": "b56" },
        "FLAVOR_IS_STILL_ACTIVE": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 174. Product's ingredient */
    "174": {
      id: 174,
      slug: "products_ingredient",
      name: "Product's ingredient",
      f: {
        "INGREDIENT_NAME": "a55",  // Text
        "INGREDIENT_IS_APPROVED": "a56",  // Radio
        "INGREDIENT_IS_STILL_ACTIVE": "a57",  // Radio
      },
      opt: {
        "INGREDIENT_IS_APPROVED": { "YES": "b55", "NO": "b56" },
        "INGREDIENT_IS_STILL_ACTIVE": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 288. Ownership claim */
    "288": {
      id: 288,
      slug: "ownership_claim",
      name: "Ownership claim",
      f: {
        "CLAIM": "a55",  // Text
        "PROOF": "a56",  // Gallery
        "STATUS": "a57",  // Radio
        "IS_DISPUTE": "a58",  // Radio
        "REPLY": "a59",  // Text
      },
      opt: {
        "STATUS": { "PENDING": "b55", "APPROVED": "b56", "REJECTED": "b57" },
        "IS_DISPUTE": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 168. Recipe */
    "168": {
      id: 168,
      slug: "recipe",
      name: "Recipe",
      f: {
        "NAME": "a55",  // Text
        "SERVINGS": "a56",  // Text
        "RECIPE_DETAIL": "a57",  // Textarea
        "IMAGE": "a58",  // ?
      },
      opt: {
      },
    },
    /** 2. Shop */
    "2": {
      id: 2,
      slug: "shop",
      name: "Shop",
      f: {
        "SHOP_NAME": "a55",  // Text
        "SHOP_DESCRIPTION": "a56",  // Text
        "SHOP_WEBSITE": "a57",  // Text
        "SHOP_COUNTRY": "a58",  // Text
        "SHOP_ADDRESS": "a59",  // Text
        "SHOP_PHONE": "a60",  // Text
        "SHOP_EMAIL": "a61",  // Text
        "SHOP_IS_ONLINE": "a62",  // Radio
        "ONLINE_SHOP_TYPE": "a63",  // Checkbox
        "SHOP_IS_LOCAL_PHYSICAL": "a64",  // Radio
        "LOCAL_PHYSICAL_SHOP_TYPE": "a65",  // Checkbox
        "SHOP_S_SHIPPING_REGIONS": "a66",  // Checkbox
        "SHOP_IS_APPROVED": "a67",  // Radio
        "SHOP_IS_STILL_ACTIVE": "a68",  // Radio
        "THIS_SHOP_IS_ONE_OF_OUR_OFFICIAL_SHOPS": "a69",  // Radio
        "OWNER_USER_ID": "a70",  // Text
        "CLAIM_STATUS": "a71",  // Text
        "CLAIM_EMAIL": "a72",  // Text
        "CLAIM_PROOF": "a73",  // Text
        "PHONE": "a74",  // Text
        "DEFAULT_COIN_ALLOWANCE": "a75",  // Number
        "THE_SHOP_HAS_JOINED_OUR_MARKETPLACE_AS_A_MARKETPLACE_SELLER": "a76",  // Radio
        "THIS_IS_THE_HIDDEN_SHOP_TO_STORE_TYPE_4_PRICE_FOR_SHOP_THAT_IS_ON_OUR_DIRECTORY_LIST_AND_ALSO_CHOOSES_TO_SELL_ON_OUR_MARKET_PLACE": "a77",  // Radio
        "THIS_SHOP_CHOOSES_TO_SELL_ON_OUR_MARKETPLACE_BUT_DOESN_T_DESERVE_TO_BE_LISTED_ON_OUR_DIRECTORY": "a78",  // Radio
      },
      opt: {
        "SHOP_IS_ONLINE": { "YES": "b55", "NO": "b56" },
        "ONLINE_SHOP_TYPE": { "YES": "b55", "NO": "b56" },
        "SHOP_IS_LOCAL_PHYSICAL": { "YES": "b55", "NO": "b56" },
        "LOCAL_PHYSICAL_SHOP_TYPE": { "YES": "b55", "NO": "b56" },
        "SHOP_IS_APPROVED": { "YES": "b55", "NO": "b56" },
        "SHOP_IS_STILL_ACTIVE": { "YES": "b55", "NO": "b56" },
        "THIS_SHOP_IS_ONE_OF_OUR_OFFICIAL_SHOPS": { "YES": "b55", "NO": "b56" },
        "THE_SHOP_HAS_JOINED_OUR_MARKETPLACE_AS_A_MARKETPLACE_SELLER": { "YES": "b55", "NO": "b56" },
        "THIS_IS_THE_HIDDEN_SHOP_TO_STORE_TYPE_4_PRICE_FOR_SHOP_THAT_IS_ON_OUR_DIRECTORY_LIST_AND_ALSO_CHOOSES_TO_SELL_ON_OUR_MARKET_PLACE": { "YES": "b55", "NO": "b56" },
        "THIS_SHOP_CHOOSES_TO_SELL_ON_OUR_MARKETPLACE_BUT_DOESN_T_DESERVE_TO_BE_LISTED_ON_OUR_DIRECTORY": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 149. Community post */
    "149": {
      id: 149,
      slug: "afresh_community_pos",
      name: "Community post",
      f: {
        "TITLE": "a55",  // Text
        "CONTENT": "a56",  // Textarea
        "COMMUNITY_TYPE": "a57",  // Radio
        "LANGUAGE": "a58",  // Radio
        "APP_AREA": "a59",  // Checkbox
        "COMMUNITY_POST_CATEGORY": "a60",  // Radio
      },
      opt: {
        "COMMUNITY_TYPE": { "AFRESH": "b55", "NRTLIST": "b56", "POUCHLIST": "b57", "CHALLENGED": "b58", "CARE_CNC": "b59" },
        "LANGUAGE": { "ENGLISH": "b55", "SIMPLIFIED_CHINESE": "b56" },
        "APP_AREA": { "GLOBAL_ENGLISH": "b55", "CHINA": "b56" },
        "COMMUNITY_POST_CATEGORY": { "DISCUSSION": "b55", "ARTICLE": "b56" },
      },
    },
    /** 141. Comment */
    "141": {
      id: 141,
      slug: "comment",
      name: "Comment",
      f: {
        "TITLE": "a55",  // text
        "CONTENT": "a56",  // textarea
      },
      opt: {
      },
    },
    /** 30. Vote */
    "30": {
      id: 30,
      slug: "vote",
      name: "Vote",
      f: {
        "UPVOTE_OR_DOWNVOTE": "a55",  // Radio
      },
      opt: {
        "UPVOTE_OR_DOWNVOTE": { "UPVOTE": "b55", "DOWNVOTE": "b56" },
      },
    },
    /** 31. Review */
    "31": {
      id: 31,
      slug: "review",
      name: "Review",
      f: {
        "TITLE": "a55",  // text
        "CONTENT": "a56",  // textarea
        "RATING": "a57",  // number
        "PRODUCT_FLAVOR_RATING": "a58",  // number
        "NICOTINE_PRODUCT_NICOTINE_HIT_RATING": "a59",  // number
        "NICOTINE_PRODUCT_NICOTINE_RELEASE_RATING": "a60",  // number
        "NICOTINE_PRODUCT_GUM_FRIENDLINESS_RATING": "a61",  // number
      },
      opt: {
      },
    },
    /** 151. User‘s extended profile */
    "151": {
      id: 151,
      slug: "users_extended_prof",
      name: "User‘s extended profile",
      f: {
        "USER_NAME_FOR_AFRESH": "a55",  // Text
        "USER_NAME_FOR_ADRY": "a551",  // Text
        "USER_NAME_FOR_ABLOCKED": "a552",  // Text
        "USER_NAME_FOR_NRTLIST": "a553",  // Text
        "USER_NAME_FOR_SMOKELESSLIST": "a554",  // Text
        "USER_NAME_FOR_BENOTCH": "a555",  // Text
        "USER_NAME_FOR_CHALLENGED": "a556",  // Text
        "USER_NAME_FOR_CARECNC": "a557",  // Text
        "USER_NAME_IN_AFRESH_COMMUNITY": "a56",  // Text
        "TIMEZONE": "a57",  // Text
        "LANGUAGE": "a58",  // Text
        "CURRENCY": "a59",  // Text
        "USER_S_GENERAL_ROLE_FOR_AFRESH": "a60",  // Checkbox
        "USER_S_GOAL_FOR_QUIT_SMOKING": "a61",  // Radio
        "USER_S_GOAL_FOR_QUIT_DRINKING_ALCOHOL": "a611",  // Radio
        "USER_S_GOAL_FOR_QUIT_PORN": "a612",  // Radio
        "AI_TONE": "a62",  // Radio
        "CUSTOM_AI_TONE": "a63",  // Text
        "ALLOWS_SPEAKING_F_WORD_IN_FELLA_MODE": "a64",  // Radio
        "HOW_SHOULD_FELLA_CALL_YOU": "a65",  // Text
        "HOW_MUCH_FELLA_NESS_SHOULD_OUR_FELLA_BE": "a66",  // Number
        "AI_STRICTNESS_LEVEL": "a67",  // Number
        "CUSTOM_AI_SYSTEM_PROMPT": "a68",  // Textarea
        "QUIT_SMOKING_START_DATE": "a69",  // Timedate
        "QUIT_DRINKING_ALCOHOL_START_DATE": "a691",  // Timedate
        "USER_FINISHED_OR_SKIPPED_ONBOARDING_FOR_AFRESH": "a70",  // Radio
        "USER_FINISHED_OR_SKIPPED_ONBOARDING_FOR_ADRY": "a71",  // Radio
        "USER_FINISHED_OR_SKIPPED_ONBOARDING_FOR_BENOTCH": "a72",  // Radio
        "USER_S_BASELINE_PORN_WATCH_TIME_PER_DAY": "a74",  // Number
        "USER_S_BASELINE_PORN_WATCHING_CATEGORY": "a75",  // Text
        "USER_S_BASELINE_PORN_WATCHING_DETAIL": "a76",  // Text
        "QUIT_PORN_START_DATE": "a77",  // Datetime
        "USER_S_GOLD_FRESHCOIN_BALANCE": "a78",  // Number
        "USER_S_SILVER_FRESHCOIN_BALANCE": "a781",  // Number
        "USER_S_GOLD_DRYCOIN_BALANCE": "a79",  // Number
        "USER_S_SILVER_DRYCOIN_BALANCE": "a791",  // Number
        "USER_S_GOLD_BLOCKED_COIN_BALANCE": "a80",  // Number
        "USER_S_SILVER_BLOCKED_COIN_BALANCE": "a801",  // Number
        "USER_S_GOLD_NOTCH_COIN_BALANCE": "a81",  // Number
        "USER_S_SILVER_NOTCH_COIN_BALANCE": "a811",  // Number
        "USER_S_BIOLOGICALSEX": "a82",  // Radio
        "USER_S_OTHER_SEX_DETAIL": "a821",  // Text
        "USER_S_SEX_DETAIL": "a822",  // Text
        "USER_S_DATEOFBIRTH": "a83",  // Datetime
        "USER_S_BLOODTYPE": "a84",  // Radio
        "FITZPATRICKSKINTYPE": "a85",  // Radio
        "WHEELCHAIRUSE": "a86",  // Radio
        "USER_S_APP_SETTING_FOR_AFRESH": "a87",  // Textarea
        "USER_S_APP_SETTING_FOR_ADRY": "a88",  // Textarea
        "USER_S_APP_SETTING_FOR_ABLOCKED": "a89",  // Textarea
        "USER_S_APP_SETTING_FOR_BENOTCH": "a90",  // Textarea
        "USER_S_AI_CREDITS_FOR_AFRESH": "a91",  // Number
        "USER_S_AI_CREDITS_FOR_ADRY": "a92",  // Number
        "USER_S_AI_CREDITS_FOR_ABLOCKED": "a93",  // Number
        "USER_S_AI_CREDITS_FOR_BENOTCH": "a94",  // Number
        "USER_S_APP_SETTING_FOR_CHALLENGED": "a95",  // Textarea
        "USER_S_APP_SETTING_FOR_CARECNC": "a96",  // Textarea
      },
      opt: {
        "USER_S_GENERAL_ROLE_FOR_AFRESH": { "QUITTER": "b55", "DOCTOR": "b56", "RESEARCHER": "b57" },
        "USER_S_GOAL_FOR_QUIT_SMOKING": { "GET_AFRESH": "b55", "GET_FRESHER": "b56", "STAY_FRESH": "b57" },
        "USER_S_GOAL_FOR_QUIT_DRINKING_ALCOHOL": { "GET_ADRY": "b55", "GET_DRYER": "b56", "STAY_DRY": "b57" },
        "USER_S_GOAL_FOR_QUIT_PORN": { "GET_ABLOCKED": "b55", "GET_MORE_BLOCKED": "b56", "STAY_BLOCKED": "b57" },
        "AI_TONE": { "COACH": "b55", "FRIEND": "b56", "BUTLER": "b57", "FELLA": "b58", "CUSTOM": "b59" },
        "ALLOWS_SPEAKING_F_WORD_IN_FELLA_MODE": { "YES": "b55", "NO": "b56" },
        "USER_FINISHED_OR_SKIPPED_ONBOARDING_FOR_AFRESH": { "YES": "b55", "NO": "b56" },
        "USER_FINISHED_OR_SKIPPED_ONBOARDING_FOR_ADRY": { "YES": "b55", "NO": "b56" },
        "USER_FINISHED_OR_SKIPPED_ONBOARDING_FOR_BENOTCH": { "YES": "b55", "NO": "b56" },
        "USER_S_BIOLOGICALSEX": { "NOTSET_0": "b55", "FEMALE_1": "b56", "MALE_2": "b57", "OTHER_3": "b58" },
        "USER_S_BLOODTYPE": { "NOTSET_0": "b55", "APOSITIVE_1": "b56", "ABPOSITIVE_5": "b57", "ABNEGATIVE_6": "b58", "ONEGATIVE_8": "b59" },
        "FITZPATRICKSKINTYPE": { "NOTSET_0": "b55", "I_1": "b56", "V_5": "b57", "VI_6": "b58", "IV_4": "b59" },
        "WHEELCHAIRUSE": { "NOTSET_0": "b55", "NO_1": "b56", "YES_2": "b57" },
      },
    },
    /** 258. User‘s extended profile 2 */
    "258": {
      id: 258,
      slug: "user_ext_profile_2",
      name: "User‘s extended profile 2",
      f: {
        "ALLOW_EMERGENCY_LOCATION_REQUEST": "a55",  // Radio
        "LOCATION_SHARE_IS_ON": "a56",  // Radio
        "NOTIFICATION_PREFERENCE": "a57",  // ?
        "GENERAL_USER_ROLE": "a58",  // Checkbox
        "IS_PAID_CARE_PROVIDER": "a59",  // Radio
        "CARE_PROVIDER_IS_ACTIVE": "a60",  // Radio
        "CARE_PROVIDER_IS_BACKGROUND_CHECKED": "a61",  // Radio
        "CARE_PROVIDER_S_BACKGROUND_CHECK_DETAIL": "a62",  // Text
        "CARE_PROVIDER_S_CANCELLATION_POLICY": "a63",  // ?
        "CARE_PROVIDER_S_LOCATION": "a64",  // ?
        "CARE_PROVIDER_OFFERS_SERVICE_TYPE": "a65",  // Checkbox
        "CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE": "a66",  // Number
        "CARE_PROVIDER_S_HOURLY_RATE_FOR_REMOTE_SERVICE": "a67",  // Number
        "CARE_PROVIDER_OFFERS_CARE_SERVICE_TYPE": "a68",  // Checkbox
        "CARE_PROVIDER_S_RATE_FOR_REMOTE_CHECKINS": "a69",  // Number
        "CARE_PROVIDER_S_RATE_FOR_REMOTE_MEDICINE_SUPERVISION": "a70",  // Number
        "CARE_PROVIDES_CAN_DRIVE": "a86",  // Radio
        "CARE_PROVIDES_HAS_OWN_TRANSPORTATION": "a87",  // Radio
        "CARE_PROVIDER_IS_A_NON_SMOKER": "a88",  // Radio
        "CARE_PROVIDER_IS_EXPERIENCED_WITH": "a89",  // Checkbox
        "CARED_ONE_S_AI_SYSTEM_PROMPT": "a90",  // Text
        "CARED_ONE_S_LOW_BATTERY_LEVEL_TO_NOTIFY": "a102",  // Number
        "CARED_ONE_S_TIME_NOT_REPORTING_TO_NOTIFY": "a103",  // Number
        "CARED_ONE_S_CONDITION_TYPE": "a104",  // Checkbox
        "CARED_ONE_S_CUSTOM_CONDITION_NAME": "a105",  // Text
      },
      opt: {
        "ALLOW_EMERGENCY_LOCATION_REQUEST": { "YES": "b55", "NO": "b56" },
        "LOCATION_SHARE_IS_ON": { "YES": "b55", "NO": "b56" },
        "GENERAL_USER_ROLE": { "CARED_ONE": "b55", "CARING_ONE": "b56" },
        "IS_PAID_CARE_PROVIDER": { "YES": "b55", "NO": "b56" },
        "CARE_PROVIDER_IS_ACTIVE": { "YES": "b55", "NO": "b56" },
        "CARE_PROVIDER_IS_BACKGROUND_CHECKED": { "YES": "b55", "NO": "b56" },
        "CARE_PROVIDER_OFFERS_SERVICE_TYPE": { "IN_PERSON": "b55", "VIRTURE": "b56" },
        "CARE_PROVIDER_OFFERS_CARE_SERVICE_TYPE": { "PET_CARE_AND_COMPANION": "b55", "IN_PERSON_CHILD_CARE_AND_COMPANION": "b56", "REMOTE_CHILD_COMPANION": "b57", "ADULT_CARE_AND_COMPANION": "b58", "ADULT_REMOTE_COMPANION": "b59", "IN_PERSON_ELDERLY_CARE_AND_COMPANION": "b60", "REMOTE_ELDERLY_COMPANION": "b61", "HOUSEKEEPING": "b62", "ERRAND_AND_DELIVERY": "b63", "TRANSPORTATION": "b64", "MEDICAL_ESCORT": "b65", "IN_PERSON_CHECKIN": "b66", "REMOTE_CHECKIN": "b67", "REMOTE_MEDICINE_SUPERVISION": "b68" },
        "CARE_PROVIDES_CAN_DRIVE": { "YES": "b55", "NO": "b56" },
        "CARE_PROVIDES_HAS_OWN_TRANSPORTATION": { "YES": "b55", "NO": "b56" },
        "CARE_PROVIDER_IS_A_NON_SMOKER": { "YES": "b55", "NO": "b56" },
        "CARE_PROVIDER_IS_EXPERIENCED_WITH": { "NEWBORN_UP_TO_12_MONTHS": "b55", "TODDLER_1_3_YEARS": "b56", "EARLY_SCHOOL_AGE_4_6_YEARS": "b57", "PRIMARY_SCHOOL_AGE_7_12_YEARS": "b58", "TEENAGER_12_YEARS": "b59", "TWINS_MULTIPLES": "b60", "SPECIAL_NEEDS_CHILDREN": "b61" },
        "CARED_ONE_S_CONDITION_TYPE": { "SUBSTANCE_USE": "b55", "SUBSTANCE_USE_DISORDER": "b56", "BRAIN_CANCER": "b57", "BREAST_CANCER": "b58", "COLORECTAL_CANCER": "b59", "ENDOMETRIAL_UTERINE": "b60", "KIDNEY_BLADDER_CANCER": "b61", "LEUKEMIA": "b62", "LIVER_CANCER": "b63", "LUNG_CANCER": "b64", "LYMPHOMA": "b65", "MYELOMA_CANCER": "b66", "NEUROBLASTOMA": "b67", "ORAL_CANCER": "b68", "OSTEOSARCOMA": "b69", "OTHER_CANCER": "b70", "OVARIAN_CANCER": "b71", "PANCREATIC_CANCER": "b72", "PROSTATE_CANCER": "b73", "SKIN_MELANOMA_CANCER": "b74", "STOMACH_ESOPHAGEAL_CANCER": "b75", "THYROID_CANCER": "b76", "ANEURYSM": "b77", "ARTERY_DISEASE": "b78", "CARDIOVASCULAR_STROKE": "b79", "CONGENITAL_HEART_DISEASE": "b80", "HEART_ATTACK": "b81", "HEART_FAILURE": "b82", "HEART_SURGERY": "b83", "OTHER_CARDIOVASCULAR_STROKE": "b84", "STROKE": "b85", "CONGENITAL_IMMUNE_DISORDER": "b86", "COVID_19": "b87", "CYSTIC_FIBROSIS": "b89", "HEART_DEFECT": "b90", "HIV_AIDS": "b91", "LUPUS": "b92", "OTHER_CONGENITAL_IMMUNE_DISORDER": "b93", "ADOPTION": "b94", "COMPLICATIONS": "b95", "HIGH_RISK_PREGNANCY": "b96", "INFANT_CHILDBIRTH": "b97", "OTHER_INFANT_CHILDBIRTH": "b98", "PREMATURE_BIRTH": "b99", "BRAIN_INJURY": "b100", "BROKEN_BONES_INTERNAL_INJURY": "b101", "BURN": "b102", "INJURY": "b103", "MOTOR_VEHICLE_INJURY": "b104", "OTHER_INJURY": "b105", "SPINAL_CORD_INJURY": "b106", "WAR_INJURY": "b107", "ALS_AMYOTROPHIC_LATERAL_SCLEROSIS": "b108", "BRAIN_DAMAGE": "b110", "BRAIN_TUMOR_NON_CANCER": "b111", "CEREBRAL_PALSY": "b112", "DEMENTIA": "b113", "EPILEPSY_SEIZURE_DISORDERS": "b114", "MENTAL_ILLNESS": "b115", "MULTIPLE_SCLEROSIS": "b116", "NEUROLOGICAL_CONDITION": "b117", "OTHER_NEUROLOGICAL_CONDITION": "b118", "OTHER_CONDITION": "b120", "PREFER_NOT_TO_SAY": "b121", "BONE_MARROW_TRANSPLANT": "b122", "ORGAN_TRANSPLANT": "b123", "OTHER_SURGERY_TRANSPLANTATION": "b124", "SURGERY": "b125", "SURGERY_TRANSPLANTATION": "b126", "CROHNS_COLITIS_IBS": "b88", "ALZHEIMERS": "b109", "PARKINSONS": "b119" },
      },
    },
    /** 181. User‘s reason to quit */
    "181": {
      id: 181,
      slug: "users_reason_to_qui",
      name: "User‘s reason to quit",
      f: {
        "NAME": "a55",  // Text
        "DETAIL": "a56",  // Textarea
        "REASONS_TO_QUIT_WHAT": "a57",  // Radio
        "REASONS_TYPE": "a58",  // Radio
        "OTHER_NAME": "a59",  // Text
      },
      opt: {
        "REASONS_TO_QUIT_WHAT": { "QUIT_SMOKING": "b55", "QUIT_DRINKING": "b56", "QUIT_PORN": "b57" },
        "REASONS_TYPE": { "MY_HEALTH": "b55", "MY_FAMILY": "b56", "MY_WELL_BEING": "b57", "TO_SAVE_MONEY": "b58", "TO_HAVE_A_CHILD": "b59", "MY_FREEDOM": "b60", "OTHER": "b61" },
      },
    },
    /** 153. User's quit plan */
    "153": {
      id: 153,
      slug: "users_quit_plan",
      name: "User's quit plan",
      f: {
        "PLAN_NAME": "a55",  // Text
        "QUIT_SMOKING_PLAN_TYPE": "a56",  // Radio
        "QUIT_DRINKING_PLAN_TYPE": "a561",  // Radio
        "QUIT_PORN_PLAN_TYPE": "a562",  // Radio
        "AFRESH_METHOD": "a57",  // Radio
        "ADRY_METHOD": "a571",  // Radio
        "ABLOCKED_METHOD": "a572",  // Radio
        "GRADUALLY_AFRESH_TIME_TARGET": "a59",  // Number
        "GET_FRESHER_TARGET": "a60",  // Number
        "COMBINES_WITH_NRT": "a61",  // Radio
        "COMBINES_WITH_QUITTING_MEDICINE": "a62",  // Radio
        "STATUS": "a63",  // Radio
        "CUSTOM_AI_SYSTEM_PROMPT": "a64",  // Textarea
      },
      opt: {
        "QUIT_SMOKING_PLAN_TYPE": { "GET_AFRESH": "b55", "GET_FRESHER": "b56", "STAY_FRESH": "b57" },
        "QUIT_DRINKING_PLAN_TYPE": { "GET_ADRY": "b55", "GET_DRYER": "b56", "STAY_DRY": "b57" },
        "QUIT_PORN_PLAN_TYPE": { "GET_ABLOCKED": "b55", "GET_MORE_BLOCKED": "b56", "STAY_BLOCKED": "b57" },
        "AFRESH_METHOD": { "COLD_TURKEY_AFRESH": "b55", "GRADUALLY_AFRESH": "b56" },
        "ADRY_METHOD": { "GET_ADRY_NOW": "b55", "GRADUALLY_ADRY": "b56" },
        "ABLOCKED_METHOD": { "GET_ABLOCKED_NOW": "b55", "GRADUALLY_ABLOCKED": "b56" },
        "COMBINES_WITH_NRT": { "YES": "b55", "NO": "b56" },
        "COMBINES_WITH_QUITTING_MEDICINE": { "YES": "b55", "NO": "b56" },
        "STATUS": { "DRAFT": "b55", "ACTIVE": "b56", "PAUSED": "b57", "COMPLETED": "b58", "ABANDONED": "b59" },
      },
    },
    /** 51. User's blocked keyword and domain */
    "51": {
      id: 51,
      slug: "blocked_keyword",
      name: "User's blocked keyword and domain",
      f: {
        "PURPOSE_OF_BLOCK": "a55",  // Radio
        "OTHER_PURPOSE_NAME": "a56",  // Text
        "BLOCKED_KEYWORDS": "a57",  // Text
        "BLOCKED_DOMAINS": "a58",  // Text
      },
      opt: {
        "PURPOSE_OF_BLOCK": { "QUIT_SMOKING": "b55", "QUIT_DRINKING": "b56", "QUIT_PORN": "b57", "OTHER": "b58" },
      },
    },
    /** 171. User's apple health or google health log event */
    "171": {
      id: 171,
      slug: "apple_health_or_goog",
      name: "User's apple health or google health log event",
      f: {
        "APPLE_HEALTH_OR_GOOGLE_HEALTH_LOG_TYPE_SLUG": "a55",  // Text
        "APPLE_HEALTH_OR_GOOGLE_HEALTH_LOG_TYPE_VALUE": "a56",  // Textarea
        "START_TIME": "a57",  // Datetime
        "END_TIME": "a58",  // Datetime
        "TIME": "a59",  // Datetime
        "SOURCE": "a60",  // Radio
        "APPLE_HEALTH_OR_GOOGLE_HEALTH_LOG_UUID": "a61",  // Text
        "RECORDING_DEVICE": "a62",  // Text
      },
      opt: {
        "SOURCE": { "APPLE_HEALTH": "b55", "GOOGLE_HEALTH": "b56" },
        "RECORDING_DEVICE": { "SLEEPCHANGES": "b56", "HAIRLOSS": "b57", "SORETHROAT": "b58", "SINUSCONGESTION": "b59", "WHEEZING": "b60", "GENERALIZEDBODYACHE": "b61", "HOTFLASHES": "b62", "WATERSPORTS": "b63", "RUGBY": "b64", "SOCCER": "b65", "SOFTBALL": "b66", "VOLLEYBALL": "b67", "CROSSTRAINING": "b68", "MIXEDCARDIO": "b69", "HIGHINTENSITYINTERVALTRAINING": "b70", "JUMPROPE": "b71", "STAIRCLIMBING": "b72", "STAIRS": "b73", "STEPTRAINING": "b74", "FITNESSGAMING": "b75", "DIETARYPANTOTHENICACID": "b76", "DIETARYPHOSPHORUS": "b77", "DIETARYPOTASSIUM": "b78", "DIETARYPROTEIN": "b79", "DIETARYRIBOFLAVIN": "b80", "DIETARYSELENIUM": "b81", "DIETARYSODIUM": "b82", "DIETARYSUGAR": "b83", "DIETARYTHIAMIN": "b84", "DIETARYVITAMINA": "b85", "DIETARYVITAMINB12": "b86", "DIETARYVITAMINB6": "b87", "DIETARYVITAMINC": "b88", "DIETARYVITAMIND": "b89", "DIETARYVITAMINE": "b90", "DIETARYVITAMINK": "b91", "DIETARYWATER": "b92", "DIETARYZINC": "b93" },
      },
    },
    /** 161. User’s other log event */
    "161": {
      id: 161,
      slug: "users_log_event",
      name: "User’s other log event",
      f: {
        "LOG_EVENT_NAME": "a55",  // Text
        "LOG_EVENT_CONTENT": "a56",  // Textarea
        "LOG_EVENT_TYPE": "a57",  // Radio
        "LOG_SMOKING_TYPE": "a58",  // Radio
        "LOG_DRINKING_ALCOHOL_TYPE": "a59",  // Radio
        "LOG_PORN_TYPE": "a60",  // Radio
        "LOG_EVENT_TIME": "a61",  // Datetime
        "MOOD_DETAIL": "a62",  // Textarea
        "CRAVING_INTENSITY_BEFORE_CRAVING": "a63",  // Number
        "CRAVING_SMOKING_CONTEXT": "a64",  // Checkbox
        "OTHER_CRAVING_SMOKING_CONTEXT_CONTENT": "a65",  // Text
        "ENERGY_LEVEL": "a66",  // Number
        "SLEEP_QUALITY": "a67",  // Text
        "STRESS_LEVEL": "a68",  // Text
        "CRAVING_SMOKINGTRIGGER_CATEGORY": "a69",  // Radio
        "OTHER_CRAVING_SMOKING_TRIGGER": "a70",  // Text
        "LOCATION_CATEGORY": "a71",  // Radio
        "LOCATION_DETAIL": "a72",  // Textarea
        "CBT_THOUGHT_RECORD": "a73",  // Textarea
        "CBT_REFRAMED_THOUGHT": "a75",  // Textarea
        "CRAVING_INTENSITY_AFTER_CRAVING_SMOKING_OR_WHATEVER_SHIT": "a76",  // Number
        "NOTE_CONTENT": "a77",  // Textarea
        "MEAL_TYPE": "a78",  // Radio
        "CUSTOM_FOOD_MEAL_OR_SUPPLEMENT_DETAIL": "a79",  // Textarea
        "CUSTOM_RECIPE_DETAIL": "a80",  // Textarea
        "CUSTOM_WORKOUT_DETAIL": "a81",  // Textarea
        "CUSTOM_MEDICINE_DETAIL": "a82",  // Textarea
        "LOG_MEDICINE_LOG_TYPE": "a83",  // Radio
        "LOG_MEDICINE_NOTE": "a84",  // Text
      },
      opt: {
        "LOG_EVENT_TYPE": { "SMOKING": "b55", "DRINKING_ALCOHOL": "b56", "PORN": "b57", "WATER": "b58", "FOOD": "b59", "BREATHING_EXERCISE": "b60", "WORKOUT": "b61", "MOTIVATION": "b62", "PLEDGE": "b63", "MEMORY": "b64", "SLEEP": "b65", "MOOD": "b66", "APPLE_HEALTH_SYMPTOMS": "b67", "CUSTOM_HEALTH_SYMPTOMS": "b68", "CUSTOM_MEDICINE": "b69" },
        "LOG_SMOKING_TYPE": { "SMOKED": "b55", "RESISTED": "b56" },
        "LOG_DRINKING_ALCOHOL_TYPE": { "DRANK": "b55", "RESISTED": "b56" },
        "LOG_PORN_TYPE": { "WATCHED": "b55", "RESISTED": "b56" },
        "CRAVING_SMOKING_CONTEXT": { "I_M_TAKING_A_BREAK": "b56", "OTHER": "b57", "IM_DRINKING_A_GLASS_OF_ALCOHOL": "b55" },
        "CRAVING_SMOKINGTRIGGER_CATEGORY": { "STRESS": "b55", "SOCIAL": "b56", "BOREDOM": "b57", "ALCOHOL": "b58", "COFFEE": "b59", "MEAL": "b60", "EMOTION": "b61", "HABIT": "b62", "OTHER": "b63" },
        "LOCATION_CATEGORY": { "HOME": "b55", "WORK": "b56", "BAR": "b57", "RESTAURANT": "b58", "CAR": "b59", "OUTDOOR": "b60" },
        "MEAL_TYPE": { "BREAKFAST": "b55", "LUNCH": "b56", "DINNER": "b57", "SNACK": "b58" },
        "LOG_MEDICINE_LOG_TYPE": { "TAKEN": "b55", "SKIPPED": "b56", "MISSED": "b57" },
      },
    },
    /** 177. User’s custom workout */
    "177": {
      id: 177,
      slug: "users_custom_workout",
      name: "User’s custom workout",
      f: {
        "CUSTOM_WORKOUT_NAME": "a55",  // Text
      },
      opt: {
      },
    },
    /** 178. User’s custom symptom */
    "178": {
      id: 178,
      slug: "users_custom_sympto",
      name: "User’s custom symptom",
      f: {
        "CUSTOM_SYMPTOM_NAME": "a55",  // Text
      },
      opt: {
      },
    },
    /** 162. Use's non-custom and custom choice and alternative choice */
    "162": {
      id: 162,
      slug: "choice_and_alternative_choice",
      name: "Use's non-custom and custom choice and alternative choice",
      f: {
        "THIS_CHOICE_IS_A_NON_CUSTOM_CHOICE": "a55",  // Radio
        "NON_CUSTOM_CHOICE_AND_ALTERNATIVE_CHOICE_NAME": "a56",  // Text
        "NON_CUSTOM_CHOICE_AND_ALTERNATIVE_CHOICE_DISPLAY_ORDER": "a57",  // Text
        "CUSTOM_CHOICE_AND_ALTERNATIVE_CHOICE_NAME": "a58",  // Text
        "CUSTOM_ALTERNATIVE_STRATEGY_ICON": "a59",  // Text
      },
      opt: {
        "THIS_CHOICE_IS_A_NON_CUSTOM_CHOICE": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 121. Chat Conversation */
    "121": {
      id: 121,
      slug: "chat_conversation",
      name: "Chat Conversation",
      f: {
        "CHAT_TYPE": "a55",  // Radio
        "CHAT_NAME": "a56",  // Text
        "LAST_MESSAGE_AT": "a57",  // Datetime
        "APP": "a58",  // Radio
      },
      opt: {
        "CHAT_TYPE": { "ONE_TO_ONE": "b55", "MANY_USERS": "b56", "AI": "b57" },
        "APP": { "AFRESH": "b55", "ADRY": "b56", "ABLOCKED": "b57", "BENOTCH": "b58", "CHALLENGED": "b59", "CARECNC": "b60" },
      },
    },
    /** 126. Chat Message */
    "126": {
      id: 126,
      slug: "chat_message",
      name: "Chat Message",
      f: {
        "CHAT_MESSAGE_CONTENT": "a55",  // Text
        "CHAT_MESSAGE_TYPE": "a56",  // Radio
        "IMAGE_URL": "a57",  // Text
        "PRICE_CARD_DATA": "a58",  // Textarea
      },
      opt: {
        "CHAT_MESSAGE_TYPE": { "TEXT": "b55", "IMAGE": "b56", "AI": "b57", "SYSTEM_MESSAGE": "b58", "PRICE_CARD": "b59" },
      },
    },
    /** 185. Notification */
    "185": {
      id: 185,
      slug: "users_notification",
      name: "Notification",
      f: {
        "NOTIFICATION_TYPE": "a55",  // Radio
        "NOTIFICATION_TITLE": "a56",  // Text
        "NOTIFICATION_CONTENT": "a57",  // Textarea
        "ACTION_URL": "a58",  // Text
        "NOTIFICATION_IS_READ": "a59",  // Radio
        "THIS_IS_THE_NOTIFICATION_FOR_APP": "a60",  // Radio
      },
      opt: {
        "NOTIFICATION_TYPE": { "USER_CHAT": "b55", "BOOKING": "b56", "SYSTEM": "b57", "LOCATION_ALERT": "b58", "CHECK_IN": "b59", "MEDICINE": "b60" },
        "NOTIFICATION_IS_READ": { "YES": "b55", "NO": "b56" },
        "THIS_IS_THE_NOTIFICATION_FOR_APP": { "AFRESH": "b55", "ADRY": "b56", "ABLOCKED": "b57", "BENOTCH": "b58", "CHALLENGED": "b59", "CARECNC": "b60" },
      },
    },
    /** 186. User's notification token */
    "186": {
      id: 186,
      slug: "users_notif_token",
      name: "User's notification token",
      f: {
        "ENDPOINT_OR_TOKEN": "a55",  // Text
        "NOTIFICATION_PROVIDER": "a56",  // Radio
        "DEVICE_LABEL": "a57",  // Text
        "AUTH_KEY": "a58",  // Text
        "P256DH": "a59",  // Text
        "IS_ACTIVE": "a60",  // Radio
        "APP": "a61",  // Radio
      },
      opt: {
        "NOTIFICATION_PROVIDER": { "WEB_PUSH_NOTIFICATION": "b55", "FIREBASE_FCM": "b56", "APPLE_APN": "b57", "J_PUSH": "b58", "WECHAT": "b59" },
        "IS_ACTIVE": { "YES": "b55", "NO": "b56" },
        "APP": { "AFRESH": "b55", "ADRY": "b56", "ABLOCKED": "b57", "BENOTCH": "b58", "CHALLENGED": "b59", "CARECNC": "b60" },
      },
    },
    /** 187. User's calendar event */
    "187": {
      id: 187,
      slug: "users_calendar_event",
      name: "User's calendar event",
      f: {
        "TITLE": "a55",  // Text
        "DESCRIPTION": "a56",  // Textarea
        "START_AT": "a57",  // Datetime
        "END_AT": "a58",  // Datetime
        "ALL_DAY": "a59",  // Radio
        "CUSTOM_EVENT_TYPE": "a60",  // Radio
        "LOCATION": "a61",  // Text
        "TIMEZONE": "a62",  // Text
        "STATUS": "a63",  // Radio
        "PRIORITY": "a64",  // Number
        "COLOR": "a65",  // Colorpicker
        "RRULE": "a66",  // Textarea
        "EXDATES": "a68",  // Textarea
        "RDATES": "a69",  // Textarea
        "RECURRENCE_ID": "a70",  // Text
        "SHOW_AS": "a71",  // Radio
        "VISIBILITY": "a72",  // Radio
        "REMINDERS": "a73",  // Textarea
        "IS_AVAILABILITY": "a74",  // Radio
        "AVAILABILITY_NOTE": "a75",  // Text
        "RSVP_REQUIRED": "a76",  // Radio
        "ALLOW_COMMENTS": "a77",  // Radio
        "EXTERNAL_SOURCE": "a78",  // Radio
        "ICAL_UID": "a79",  // Text
        "SEQUENCE": "a80",  // Number
        "ETAG": "a81",  // Text
        "GOOGLE_EVENT_ID": "a82",  // Text
        "MEETING_URL": "a83",  // Text
        "ATTACHMENTS": "a84",  // Textarea
        "LAST_SYNC_AT": "a85",  // Datetime
        "SYNC_TOKEN": "a86",  // Text
        "GEO_LAT": "a87",  // Text
        "GEO_LNG": "a88",  // Text
        "TAGS": "a89",  // Text
        "CUSTOM_DATA": "a90",  // Textarea
        "APP": "a91",  // Radio
        "MEDICATION_CONCEPT_IDENTIFIER": "a92",  // Text
        "MEDICATION_DOSE_QUANTITY": "a93",  // Number
        "MEDICATION_DOSE_UNIT": "a94",  // Text
        "MEDICATION_SCHEDULE_TYPE": "a95",  // Radio
        "MEDICINE_LOG_TYPE": "a96",  // Radio
        "CHECKIN_LOG_TYPE": "a97",  // Radio
        "MEDICINE_STOCK": "a98",  // Number
        "MEDICINE_REFILL": "a99",  // Number
        "MEDICINE_PRESCRIBER": "a100",  // Text
        "MEDICINE_BOUGHT_PHARMACY": "a101",  // Text
        "MEDICINE_CHECKIN_TO_REMIND_CAREGIVER_TIME_AFTER_MISSING": "a102",  // Number
      },
      opt: {
        "ALL_DAY": { "YES": "b55", "NO": "b56" },
        "CUSTOM_EVENT_TYPE": { "MEDICINE_SCHEDULE": "b55", "HEALTH_CHECKIN": "b56", "HABIT": "b57", "TODO": "b58" },
        "STATUS": { "CONFIRMED": "b55", "TENTATIVE": "b56", "CANCELLED": "b57" },
        "SHOW_AS": { "BUSY": "b55", "FREE": "b56", "TENTATIVE": "b57", "UNAVAILABLE": "b58" },
        "VISIBILITY": { "DEFAULT": "b55", "PUBLIC": "b56", "PRIVATE": "b57", "CONFIDENTIAL": "b58" },
        "IS_AVAILABILITY": { "YES": "b55", "NO": "b56" },
        "RSVP_REQUIRED": { "YES": "b55", "NO": "b56" },
        "ALLOW_COMMENTS": { "YES": "b55", "NO": "b56" },
        "EXTERNAL_SOURCE": { "INTERNAL": "b55", "GOOGLE": "b56", "OUTLOOK": "b57", "APPLE": "b58" },
        "APP": { "AFRESH": "b55", "ADRY": "b56", "ABLOCKED": "b57", "BENOTCH": "b58", "CHALLENGED": "b59", "CARECNC": "b60" },
        "MEDICATION_SCHEDULE_TYPE": { "ASNEEDED": "b55", "SCHEDULE": "b56" },
        "MEDICINE_LOG_TYPE": { "AI": "b55", "HUMAN": "b56" },
        "CHECKIN_LOG_TYPE": { "AI": "b55", "HUMAN": "b56" },
      },
    },
    /** 6. FreshCoin Transaction */
    "6": {
      id: 6,
      slug: "freshcoin_transaction",
      name: "FreshCoin Transaction",
      f: {
        "AMOUNT": "a55",  // Number
      },
      opt: {
      },
    },
    /** 192. User's subscription */
    "192": {
      id: 192,
      slug: "users_subscription",
      name: "User's subscription",
      f: {
        "PRODUCT_ID": "a55",  // Text
        "PLATFORM": "a56",  // Radio
        "STATUS": "a57",  // Radio
        "ORIGINAL_TRANSACTION_ID": "a58",  // Text
        "PURCHASED_AT": "a59",  // Datetime
        "EXPIRES_AT": "a60",  // Datetime
        "AUTO_RENEW": "a61",  // Radio
        "ENVIRONMENT": "a62",  // Radio
        "LAST_EVENT_AT": "a63",  // datetime
        "STORE_PAYLOAD": "a64",  // textarea
        "PLAN": "a65",  // Radio
        "THE_SUBSCRIPTION_IS_FOR_APP": "a66",  // Radio
      },
      opt: {
        "PLATFORM": { "APPLE_APP_STORE": "b55", "GOOGLE_PLAY": "b56", "STRIPE": "b57", "MANUAL": "b58", "PROMO": "b59" },
        "STATUS": { "ACTIVE": "b55", "IN_TRIAL": "b56", "IN_GRACE_PERIOD": "b57", "IN_BILLING_RETRY": "b58", "CANCELLED_BUT_NOT_EXPIRED": "b59", "EXPIRED": "b60", "REFUNDED_OR_REVOKED": "b61", "PAUSED": "b62" },
        "AUTO_RENEW": { "YES": "b55", "NO": "b56" },
        "ENVIRONMENT": { "PRODUCTION": "b55", "SANDBOX": "b56" },
        "PLAN": { "MONTHLY": "b55", "QUARTERLY": "b56", "ANNUAL": "b57", "LIFETIME": "b58" },
        "THE_SUBSCRIPTION_IS_FOR_APP": { "AFRESH": "b55", "ADRY": "b56", "ABLOCKED": "b57", "BENOTCH": "b58" },
      },
    },
    /** 193. User's ai credit */
    "193": {
      id: 193,
      slug: "users_credit_ledger",
      name: "User's ai credit",
      f: {
        "PRODUCT_ID": "a55",  // Text
        "PLATFORM": "a56",  // Radio
        "ORIGINAL_TRANSACTION_ID": "a57",  // Text
        "AMOUNT": "a58",  // Number
        "REASON": "a59",  // Radio
        "PURCHASED_AT": "a60",  // Datetime
        "EXPIRES_AT": "a61",  // Datetime
        "ENVIRONMENT": "a62",  // Radio
        "STORE_PAYLOAD": "a63",  // textarea
        "THE_SUBSCRIPTION_IS_FOR_APP": "a64",  // Radio
      },
      opt: {
        "PLATFORM": { "APPLE_APP_STORE": "b55", "GOOGLE_PLAY": "b56", "STRIPE": "b57", "MANUAL": "b58", "PROMO": "b59" },
        "REASON": { "PURCHASE": "b55", "SUBSCRIPTION_GRANT": "b56", "PROMO_OR_GIFT": "b57", "REFUND_OR_REVOKE": "b58", "SPEND_ON_CHAT": "b59", "SPEND_ON_SCAN": "b60", "MANUAL_ADJUSTMENT": "b61", "SIGN_UP_REWARD": "b62", "INVITE_REWARD": "b63" },
        "ENVIRONMENT": { "PRODUCTION": "b55", "SANDBOX": "b56" },
        "THE_SUBSCRIPTION_IS_FOR_APP": { "AFRESH": "b55", "ADRY": "b56", "ABLOCKED": "b57", "BENOTCH": "b58" },
      },
    },
    /** 198. Cared one's information card */
    "198": {
      id: 198,
      slug: "cared_one_info_card",
      name: "Cared one's information card",
      f: {
        "CARED_ONE_S_NAME": "a55",  // Text
        "CARED_ONE_S_DESCRIPTION": "a56",  // Textarea
        "CARED_ONE_S_INFORMATION_CARD_NAME": "a57",  // Text
        "STATUS": "a58",  // Radio
        "DISPLAYS_LOCATION": "a59",  // Radio
        "SHARE_TOKEN": "a60",  // Text
        "SHARE_EXPIRES_AT": "a61",  // Datetime
        "SHARE_VISIBILITY": "a62",  // Radio
      },
      opt: {
        "STATUS": { "DRAFT": "b55", "ACTIVE": "b56", "PAUSED": "b57" },
        "DISPLAYS_LOCATION": { "YES": "b55", "NO": "b56" },
        "SHARE_VISIBILITY": { "VISIBLE_TO_PUBLIC": "b55", "VISIBLE_TO_THE_CARE_GROUP_OF_THE_CARED_ONE": "b56", "VISIBLE_TO_CAREGIVERS_OF_THE_CARED_ONE": "b57", "VISIBLE_TO_AUTHOR": "b58" },
      },
    },
    /** 199. Care Group */
    "199": {
      id: 199,
      slug: "care_group",
      name: "Care Group",
      f: {
        "NAME": "a55",  // Text
        "DESCRIPTION": "a56",  // Textarea
        "GROUP_TYPE": "a57",  // Radio
        "JOIN_CODE": "a58",  // Text
        "STATUS": "a59",  // Radio
      },
      opt: {
        "GROUP_TYPE": { "PUBLIC": "b55", "PRIVATE": "b56" },
        "STATUS": { "ACTIVE": "b55", "NO": "b56" },
      },
    },
    /** 200. Care group invite */
    "200": {
      id: 200,
      slug: "care_group_invite",
      name: "Care group invite",
      f: {
        "TOKEN": "a55",  // Text
        "NAME": "a56",  // Text
        "EXPIRES_AT": "a57",  // Datetime
        "MAX_USES": "a58",  // Number
        "USE_COUNT": "a59",  // Number
        "IS_REVOKED": "a60",  // Switcher
      },
      opt: {
      },
    },
    /** 201. The related private member groups of one 199. care group */
    "201": {
      id: 201,
      slug: "care_group_pmg",
      name: "The related private member groups of one 199. care group",
      f: {
        "NAME": "a55",  // Text
        "DESCRIPTION": "a56",  // Textarea
        "COLOR": "a57",  // Colorpicker
      },
      opt: {
      },
    },
    /** 202. The related not too special posts of one care group */
    "202": {
      id: 202,
      slug: "care_group_post",
      name: "The related not too special posts of one care group",
      f: {
        "TYPE": "a55",  // Radio
        "TITLE": "a56",  // Text
        "CONTENT": "a57",  // Text
        "IS_PINNED": "a58",  // Radio
        "SCHEDULED_AT": "a59",  // Datetime
      },
      opt: {
        "TYPE": { "DISCUSSION": "b55", "ANNOUNCEMENT": "b56", "WISH": "b57" },
        "IS_PINNED": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 203. Care Group Gallery */
    "203": {
      id: 203,
      slug: "care_group_gallery",
      name: "Care Group Gallery",
      f: {
        "IMAGE": "a55",  // Media
        "IMAGE_DESCRIPTION": "a56",  // Textarea
        "TAKEN_AT": "a57",  // Datetime
      },
      opt: {
      },
    },
    /** 204. Care Task */
    "204": {
      id: 204,
      slug: "care_task",
      name: "Care Task",
      f: {
        "TITLE": "a55",  // Text
        "DESCRIPTION": "a56",  // textarea
        "TASK_TYPE": "a57",  // Checkbox
        "PEOPLE_NEEDED": "a58",  // Number
        "LOCATION": "a59",  // Text
        "PHOTO": "a60",  // ?
        "DATE_OF_THE_TASK": "a61",  // Date
        "TASK_START_TIME": "a62",  // Datetime
        "TASK_END_TIME": "a63",  // Datetime
        "TASK_COMPLETED_AT": "a64",  // Datetime
        "TASK_HELP_STATUS": "a65",  // Radio
        "TASK_FINISH_STATUS": "a66",  // Radio
      },
      opt: {
        "TASK_TYPE": { "PREPARING_MEALS": "b55", "GIVING_RIDES": "b56", "SHOPPING": "b57", "CHILDCARE": "b58", "VISITS": "b59", "COVERAGE": "b60", "MEDICATIONS_MEDICAL_CARE": "b61", "MISCELLANEOUS": "b62", "OCCASIONS": "b63" },
        "TASK_HELP_STATUS": { "TASK_DOESN_T_NEED_HELP": "b55", "TASK_NEEDS_HELP": "b56", "TASK_HAS_FOUND_HELP": "b57" },
        "TASK_FINISH_STATUS": { "NOT_FINISHED": "b55", "FINISHED": "b56" },
      },
    },
    /** 205. Medicine schedule */
    "205": {
      id: 205,
      slug: "medicine_schedule",
      name: "Medicine schedule",
      f: {
        "NAME": "a55",  // Text
        "DOSAGE": "a56",  // Text
        "FREQUENCY": "a57",  // Text
        "TIME_SLOT": "a58",  // Textarea
        "INSTRUCTIONS": "a59",  // Textarea
        "PRESCRIBING_DOCTOR": "a60",  // Text
        "PHARMACY": "a61",  // Text
        "SIDE_EFFECTS": "a62",  // Textarea
        "START_DATE": "a63",  // Date
        "END_DATE": "a64",  // Date
        "IS_ACTIVE": "a65",  // Radio
        "NOTE": "a66",  // Textarea
        "STOCK_COUNT": "a67",  // Number
        "REFILL_THRESHOLD": "a68",  // Number
        "REMINDER_TIME_BEFORE": "a69",  // Number
        "TIME_TO_SEND_TO_CAREGIVER": "a70",  // Number
        "TIME_TO_BE_CONSIDERED_AS_MISSING": "a71",  // Number
        "CHECK_IN_TYPE": "a72",  // Checkbox
      },
      opt: {
        "IS_ACTIVE": { "YES": "b55", "NO": "b56" },
        "CHECK_IN_TYPE": { "AI": "b55", "HUMAN": "b56" },
      },
    },
    /** 206. Medicine log */
    "206": {
      id: 206,
      slug: "medicine_log",
      name: "Medicine log",
      f: {
        "DOSE_EVENT_LOG_STATUS": "a55",  // Radio
        "DOSE_EVENT_NOTE": "a56",  // Textarea
        "DOSE_QUANTITY": "a57",  // Number
        "SCHEDULED_DOSE_QUANTITY": "a58",  // Number
        "DOSE_UNIT": "a59",  // Text
        "SCHEDULED_DATE": "a60",  // Datetime
        "SCHEDULE_TYPE": "a61",  // Radio
        "CONCEPT_IDENTIFIER": "a62",  // Text
        "CONCEPT_DISPLAY_TEXT": "a63",  // Text
        "CONCEPT_GENERAL_FORM": "a64",  // Text
        "CLINICAL_CODING_SYSTEM": "a65",  // Text
        "CLINICAL_CODING_CODE": "a66",  // Text
        "CLINICAL_CODING_VERSION": "a67",  // Text
        "DOSE_LOGGED_TIME": "a68",  // Datetime
      },
      opt: {
        "DOSE_EVENT_LOG_STATUS": { "NOTINTERACTED": "b55", "NOTLOGGED": "b56", "NOTIFICATIONNOTSENT": "b57", "SKIPPED": "b58", "SNOOZED": "b59", "TAKEN": "b60" },
        "SCHEDULE_TYPE": { "ASNEEDED": "b55", "SCHEDULE": "b56" },
      },
    },
    /** 207. Checkin schedule */
    "207": {
      id: 207,
      slug: "checkin_schedule",
      name: "Checkin schedule",
      f: {
        "NAME": "a55",  // Text
        "DETAIL": "a56",  // Text
        "FREQUENCY": "a57",  // Text
        "TIME_SLOT": "a58",  // Textarea
        "INSTRUCTIONS": "a59",  // Text
        "START_DATE": "a60",  // Date
        "IS_ACTIVE": "a61",  // Radio
        "NOTE": "a62",  // Textarea
        "REMINDER_TIME_BEFORE": "a63",  // Number
        "TIME_TO_SEND_TO_CAREGIVER": "a64",  // Number
        "TIME_TO_BE_CONSIDERED_AS_MISSING": "a65",  // Number
        "CHECK_IN_TYPE": "a66",  // Checkbox
        "CHECKED_BY_AI": "a67",  // Radio
      },
      opt: {
        "IS_ACTIVE": { "YES": "b55", "NO": "b56" },
        "CHECK_IN_TYPE": { "AI": "b55", "HUMAN": "b56" },
        "CHECKED_BY_AI": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 208. Checkin log */
    "208": {
      id: 208,
      slug: "checkin_log",
      name: "Checkin log",
      f: {
        "STATUS": "a55",  // Radio
        "NOTE": "a56",  // Textarea
        "CHECKED_BY_AI": "a57",  // Radio
      },
      opt: {
        "STATUS": { "CHECKED": "b55", "SKIPPED": "b56", "MISSED": "b57" },
        "CHECKED_BY_AI": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 197. Cared one's care note */
    "197": {
      id: 197,
      slug: "care_note",
      name: "Cared one's care note",
      f: {
        "TITLE": "a55",  // Text
        "CONTENT": "a56",  // Textarea
      },
      opt: {
      },
    },
    /** 209. Cared one's care tip */
    "209": {
      id: 209,
      slug: "care_tip",
      name: "Cared one's care tip",
      f: {
        "TITLE": "a55",  // Text
        "CONTENT": "a56",  // Textarea
        "CATEGORY": "a57",  // Radio
        "IS_PINNED": "a58",  // Radio
      },
      opt: {
        "CATEGORY": { "TIP": "b55", "AVOID": "b56" },
        "IS_PINNED": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 210. Cared one's care plan */
    "210": {
      id: 210,
      slug: "care_plan",
      name: "Cared one's care plan",
      f: {
        "TITLE": "a55",  // Text
        "CONTENT": "a56",  // Textarea
        "IS_PINNED": "a57",  // Radio
      },
      opt: {
        "IS_PINNED": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 211. Cared one's emergency contact person */
    "211": {
      id: 211,
      slug: "emergency_contact",
      name: "Cared one's emergency contact person",
      f: {
        "NAME": "a55",  // Text
        "CONTENT": "a56",  // Textarea
        "PHONE": "a57",  // Text
        "ADDRESS": "a58",  // Text
        "RELATIONSHIP": "a59",  // Text
        "NOTE": "a60",  // Text
      },
      opt: {
      },
    },
    /** 212. Cared one's care document */
    "212": {
      id: 212,
      slug: "care_document",
      name: "Cared one's care document",
      f: {
        "NAME": "a55",  // Text
        "CONTENT": "a56",  // Textarea
      },
      opt: {
      },
    },
    /** 213. The current location of one user */
    "213": {
      id: 213,
      slug: "current_location",
      name: "The current location of one user",
      f: {
        "LATITUDE": "a55",  // Text
        "LONGITUDE": "a56",  // Text
        "ACCURACY_METERS": "a57",  // Number
        "ALTITUDE_METERS": "a58",  // Number
        "HEADING_DEGREES": "a59",  // Number
        "SPEED": "a60",  // Number
        "MOVING_TYPE": "a62",  // Radio
        "PLATFORM": "a63",  // Radio
        "BATTERY_LEVEL": "a64",  // Number
        "PHONE_IS_CHARING": "a65",  // Radio
        "ADDRESS_TEXT": "a66",  // Text
        "CAPTURED_AT": "a67",  // Datetime
        "IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION": "a68",  // Radio
      },
      opt: {
        "MOVING_TYPE": { "STATIONARY": "b55", "WALKING": "b56", "RUNNING": "b57", "CYCLING": "b58", "AUTOMOTIVE": "b59", "UNKNOWN": "b60" },
        "PLATFORM": { "IOS": "b55", "ANDROID": "b56", "WEB": "b57" },
        "PHONE_IS_CHARING": { "YES": "b55", "NO": "b56" },
        "IS_SO_MUCH_OF_AN_EMERGENCY_THAT_WE_DON_T_BOTHER_TO_ASK_FOR_THE_CARED_ONE_S_PERMISSION": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 214. Safe Zone */
    "214": {
      id: 214,
      slug: "safe_zone",
      name: "Safe Zone",
      f: {
        "ZONE_TYPE": "a55",  // Radio
        "SHAPE_TYPE": "a56",  // Radio
        "ZONE_NAME": "a57",  // Text
        "CUSTOM_DESCRIPTION": "a58",  // Text
        "CUSTOM_COLOR": "a59",  // Colorpicker
        "LATITUDE": "a60",  // Text
        "LONGITUDE": "a61",  // Text
        "RADIUS_METERS": "a62",  // Number
        "POLYGON_POINTS": "a63",  // Textarea
        "NOTIFY_ON_ENTER": "a64",  // Radio
        "NOTIFY_ON_EXIT": "a65",  // Radio
        "SCHEDULE_ENABLED": "a66",  // Radio
        "SCHEDULE_START_TIME": "a67",  // Textarea
        "SCHEDULE_END_TIME": "a68",  // Textarea
        "IS_ACTIVE": "a69",  // Radio
      },
      opt: {
        "ZONE_TYPE": { "SAFE": "b55", "DANGER": "b56", "CUSTOM": "b57" },
        "SHAPE_TYPE": { "RADIUS": "b55", "POLYGON": "b56" },
        "NOTIFY_ON_ENTER": { "OFF": "b55", "ON": "b56" },
        "NOTIFY_ON_EXIT": { "OFF": "b55", "ON": "b56" },
        "SCHEDULE_ENABLED": { "OFF": "b55", "ON": "b56" },
        "IS_ACTIVE": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 215. Care Facility */
    "215": {
      id: 215,
      slug: "care_facility",
      name: "Care Facility",
      f: {
        "NAME": "a55",  // text
        "DETAIL": "a56",  // textarea
        "CARE_FACILITY_TYPE": "a57",  // Checkbox
        "CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE": "a58",  // Checkbox
        "CARE_FACILITY_ROOM_TYPE": "a59",  // Checkbox
        "CARE_FACILITY_PROVIDES_ROOM_FACILITY": "a60",  // Checkbox
        "CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY": "a61",  // Checkbox
        "CARE_FACILITY_PEOPLE_NUMBER": "a62",  // Radio
        "LOCATION": "a63",  // Text
        "ADDRESS": "a64",  // Text
        "FACILITY_IS_APPROVED": "a65",  // Radio
        "PHONE": "a66",  // Text
        "EMAIL": "a67",  // text
      },
      opt: {
        "CARE_FACILITY_TYPE": { "ADULT_DAY_CARE": "b55", "ASSISTED_LIVING": "b56", "HOME_CARE": "b57", "HOSPICE": "b58", "INDEPENDENT_LIVING": "b59", "MEMORY_CARE": "b60", "NURSING_HOMES": "b61", "RESIDENTIAL_CARE_HOMES": "b62", "SENIOR_APARTMENTS": "b63" },
        "CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE": { "EARLY_STAGE": "b55", "MIDDLE_STAGE": "b56", "LATE_STAGE": "b57" },
        "CARE_FACILITY_ROOM_TYPE": { "STUDIO": "b55", "ONE_BED_ROOM": "b56", "TWO_BED_ROOM": "b57", "MORE_THAN_TWO_BED_ROOM": "b58" },
        "CARE_FACILITY_PROVIDES_ROOM_FACILITY": { "BALCONY": "b55", "TOILET": "b56", "KITCHEN": "b57" },
        "CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY": { "SWIMMING_POOL": "b55", "ACTIVE_LIFESTYLE": "b56", "ENTERTAINMENT_VENUE": "b57", "LAUNDRY": "b58" },
        "CARE_FACILITY_PEOPLE_NUMBER": { "LESS_THAN_5": "b55", "5_20": "b56", "20_50": "b57", "MORE_THAN_50": "b58" },
        "FACILITY_IS_APPROVED": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 216. Care Job */
    "216": {
      id: 216,
      slug: "care_job",
      name: "Care Job",
      f: {
        "TITLE": "a55",  // Text
        "DESCRIPTION": "a56",  // textarea
        "DUE_DATE": "a57",  // Datetime
        "COMPLETED_AT": "a58",  // Datetime
        "STATUS": "a59",  // Radio
        "NEEDS_PAYMENT": "a60",  // Radio
        "PRICE": "a61",  // Text
      },
      opt: {
        "STATUS": { "PENDING": "b55", "IN_PROGRESS": "b56", "COMPLETED": "b57" },
        "NEEDS_PAYMENT": { "YES": "b55", "NO": "b56" },
      },
    },
    /** 217. Challenged App Content */
    "217": {
      id: 217,
      slug: "challenged_content",
      name: "Challenged App Content",
      f: {
        "TITLE": "a55",  // Text
        "CONTENT": "a56",  // Textarea
        "LANGUAGE": "a57",  // Radio
        "APP_AREA": "a58",  // Checkbox
        "APP_CONTENT_TYPE": "a59",  // Radio
        "LEARN_MODULE_NUMBER": "a60",  // Number
        "LEARN_LESSON_NUMBER": "a61",  // Number
        "CARE_AND_ACCOMPANY_TIPS_CATEGORY": "a62",  // Radio
        "FIND_TIPS_CATEGORY": "a63",  // Radio
      },
      opt: {
        "LANGUAGE": { "ENGLISH": "b55", "SIMPLIFIED_CHINESE": "b56" },
        "APP_AREA": { "GLOBAL_ENGLISH": "b55", "CHINA": "b56" },
        "APP_CONTENT_TYPE": { "LEARN": "b55", "CARE_AND_ACCOMPANY_TIPS": "b56", "FIND_TIPS": "b57" },
        "CARE_AND_ACCOMPANY_TIPS_CATEGORY": { "EATING_AND_DRINKING": "b55", "TOILETING_AND_CONTINENCE": "b56", "MEMORY_LOSS": "b57", "AGGRESSION": "b58", "DEPRESSION_ANXIETY_AND_APATHY": "b59", "DIFFICULTY_SLEEPING": "b60", "DELUSIONS_AND_HALLUCINATIONS": "b61", "REPETITIVE_BEHAVIOUR": "b62", "CHANGES_IN_JUDGEMENT": "b63" },
        "FIND_TIPS_CATEGORY": { "WONDERING": "b55", "GETTING_LOST": "b56", "UNWILLING_TO_RETURN_HOME": "b57" },
      },
    },
    /** 218. User's study notes */
    "218": {
      id: 218,
      slug: "study_notes",
      name: "User's study notes",
      f: {
        "TITLE": "a55",  // Text
        "CONTENT": "a56",  // Textarea
      },
      opt: {
      },
    },
  },
  rel: {
    /** 117. One product can have many related woo products to be sold through woo on each shop — 140. Product -> Products （CPT Products，即woo commerce products) (One to many) */
    "117": { id: 117, parent: "140. Product", child: "Products （CPT Products，即woo commerce products)", type: "One to many" },
    /** 147. One 140. product can have many related 146. product’s brand — 140. Product -> 146. Product’s brand (One to many) */
    "147": { id: 147, parent: "140. Product", child: "146. Product’s brand", type: "One to many" },
    /** 112. One 140. product can have many related 114. product’s flavor — 140. Product -> 114. Product's flavor (One to many) */
    "112": { id: 112, parent: "140. Product", child: "114. Product's flavor", type: "One to many" },
    /** 175. One 140. product can have many related 174. product’s ingredients — 140. Product -> 174. product’s ingredients (One to many) */
    "175": { id: 175, parent: "140. Product", child: "174. product’s ingredients", type: "One to many" },
    /** 287. One 140. product can have many related product members — 140. Product -> Users (Many to many) */
    "287": { id: 287, parent: "140. Product", child: "Users", type: "Many to many", f: { "PRODUCT_MEMBER": "a55", "PRODUCT_MEMBER_ROLE": "a56" }, opt: { "PRODUCT_MEMBER": { "NOTHING_SPECIAL": "b55", "OWNER": "b56", "ADMIN": "b57" } } },
    /** 169. One 168. recipe can have many related 140. products — 168. recipe -> 140. Product (One to many) */
    "169": { id: 169, parent: "168. recipe", child: "140. Product", type: "One to many" },
    /** 148. One directory marketplace shop like amazon can have many related vendors selling on it — 2. Shop -> 2. Shop (One to many) */
    "148": { id: 148, parent: "2. Shop", child: "2. Shop", type: "One to many" },
    /** 286. One 2. Shop can have many related facility members — 2. Shop -> Users (Many to many) */
    "286": { id: 286, parent: "2. Shop", child: "Users", type: "Many to many", f: { "SHOP_MEMBER": "a55", "SHOP_MEMBER_ROLE": "a56" }, opt: { "SHOP_MEMBER": { "NOTHING_SPECIAL": "b55", "OWNER": "b56", "ADMIN": "b57" } } },
    /** 116. One shop can have many related products to sell and here we also store the price of the product on this nicotine shop — 2. Shop -> 140. Product (Many to many) */
    "116": { id: 116, parent: "2. Shop", child: "140. Product", type: "Many to many", f: { "PRICE_ONE_UNIT": "a55", "PRICE_FIVE_UNIT": "a56", "PRICE_TEN_UNIT": "a57", "PRICE_MAX_UNIT": "a58", "MAX_UNITS": "a59", "PRODUCT_URL": "a60", "IN_STOCK": "a61", "SHOP_TYPE": "a62", "COIN_ALLOWANCE": "a63", "REGIONS_SHIPS_TO": "a64", "REGIONS_DOESN_T_SHIP_TO": "a65", "CURRENCY": "a66", "MSRP_REGION": "a67", "PRICE_RECORDED_TIME": "a68" }, opt: { "IN_STOCK": { "YES": "b55", "NO": "b56" }, "SHOP_TYPE": { "MSRP": "b55", "DIRECTORY_DISPLAY_NOT_PURCHASABLE": "b56", "ONE_OF_OUR_OFFICIAL_SHOPS_PURCHASABLE": "b57", "ONE_OF_OUR_MARKETPLACE_SHOPS_PURCHASABLE": "b58" } } },
    /** 276. One 275. product price history can have many related 2. shops — 275. product price history -> 2. shop (many to many) */
    "276": { id: 276, parent: "275. product price history", child: "2. shop", type: "many to many" },
    /** 118. One user can have one dokan shop and here we relate it to its one and only related nicotine shop — Users -> 2. Shop (One to one) */
    "118": { id: 118, parent: "Users", child: "2. Shop", type: "One to one" },
    /** 119. One nicotine shop that is already listed on our directory can have one related hidden nicotine shop to store price if the shop also chooses to sell on our app — 2. Shop -> 2. Shop (One to one) */
    "119": { id: 119, parent: "2. Shop", child: "2. Shop", type: "One to one" },
    /** 150. One 149. Community post can have many related comments — 149. Community post -> 141. Comment (One to Many) */
    "150": { id: 150, parent: "149. Community post", child: "141. Comment", type: "One to Many" },
    /** 142. One comment can have many related comments — 141. Comment -> 141. Comment (Many to Many) */
    "142": { id: 142, parent: "141. Comment", child: "141. Comment", type: "Many to Many" },
    /** 166. One 149. comment can have many related 30. Votes — 141. Community post -> 30. Votes (One to Many) */
    "166": { id: 166, parent: "141. Community post", child: "30. Votes", type: "One to Many" },
    /** 144. One product shop can have many related reviews — 2. Shop -> 31. Review (One to Many) */
    "144": { id: 144, parent: "2. Shop", child: "31. Review", type: "One to Many" },
    /** 264. One care provider can have many related 31. reviews — Users -> 31. Review (One to Many) */
    "264": { id: 264, parent: "Users", child: "31. Review", type: "One to Many" },
    /** 143. One review can have many related comments — 31. Review -> 141. Comment (One to Many) */
    "143": { id: 143, parent: "31. Review", child: "141. Comment", type: "One to Many" },
    /** 145. One nicotine product can have many related reviews — 140. Product -> 31. Review (One to Many) */
    "145": { id: 145, parent: "140. Product", child: "31. Review", type: "One to Many" },
    /** 152. One user can have one related user's extended profile — Users -> 151. User's extended profile (One to One) */
    "152": { id: 152, parent: "Users", child: "151. User's extended profile", type: "One to One" },
    /** 259. One user can have one 258. user‘s extended profile 2 — Users -> 258. User‘s extended profile 2 (One to One) */
    "259": { id: 259, parent: "Users", child: "258. User‘s extended profile 2", type: "One to One" },
    /** 182. One user can have many related user‘s 181. User‘s reason to quit — Users -> 181. User‘s reason to quit (One to Many) */
    "182": { id: 182, parent: "Users", child: "181. User‘s reason to quit", type: "One to Many" },
    /** 128. One user can have many related nicotine products — Users -> 140. Product (One to Many) */
    "128": { id: 128, parent: "Users", child: "140. Product", type: "One to Many", f: { "NICOTINE_PRODUCT_USAGE_TYPE": "a55", "USAGE_NUMBER_PER_DAY": "a56", "USAGE_NICOTINE_MG_PER_DAY": "a57", "USE_MSRP": "a58", "CUSTOM_PURCHASE_PRICE_PER_UNIT": "a59", "CUSTOM_NUMBER_PER_PACK": "a591", "CUSTOM_PURCHASE_PRICE_PER_PACK": "a592", "CUSTOM_ALCOHOL_PURCHASE_PRICE_PER_ML": "a593", "CUSTOM_ALCOHOL_PURCHASE_PRICE_PER_UNIT": "a594", "CUSTOM_ALCOHOL_UNIT_ML": "a595", "STARTED_USING_AT": "a60", "STOPPED_USING_AT": "a61", "PURCHASE_SOURCE": "a62", "PRODUCT_SOURCE": "a63", "ALCOHOL_PRODUCT_USAGE_TYPE": "a64", "ALCOHOL_GLASS_OR_SERVING_VOLUME_PER_DRINK": "a65", "NUMBER_OF_DRINKS_PER_DAY": "a66", "ADD_TO_MY_MOST_FREQUENTLY_USED_NICOTINE_PRODUCT_LIST": "a67", "ADD_TO_MY_MOST_FREQUENTLY_USED_ALCOHOL_PRODUCT_LIST": "a68", "ADD_TO_MY_MOST_FREQUENTLY_USED_ALTERNATIVE_PRODUCT_FOR_NICOTINE_PRODUCT_LIST": "a69", "ADD_TO_MY_MOST_FREQUENTLY_USED_ALTERNATIVE_PRODUCT_FOR_ALCOHOL_PRODUCT_LIST": "a70" }, opt: { "NICOTINE_PRODUCT_USAGE_TYPE": { "BASELINE_USAGE": "b55", "CURRENTLY_USING": "b56", "NRT_USAGE": "b57", "ALTERNATIVE_PRODUCT_USAGE": "b58", "MY_MOST_FREQUENTLY_USED_NICOTINE_PRODUCT": "b59" }, "USE_MSRP": { "YES": "b55", "NO": "b56" }, "PURCHASE_SOURCE": { "OUR_OFFICIAL_SHOP": "b55", "OUR_MARKETPLACE_SHOP": "b56", "OTHER": "b57" }, "PRODUCT_SOURCE": { "FROM_OUR_PRODUCT_CATALOG": "b55", "CUSTOM_PRODUCT_MADE_BY_USER": "b56", "OUR_NON_SPECIFIC_CATEGORY_PRODUCT_CUSTOMIZABLE_BY_USERS": "b57" }, "ALCOHOL_PRODUCT_USAGE_TYPE": { "BASELINE_USAGE": "b55", "CURRENTLY_USING": "b56", "ALTERNATIVE_PRODUCT_USAGE": "b57", "MY_MOST_FREQUENTLY_USED_ALCOHOL_PRODUCT": "b58" }, "ADD_TO_MY_MOST_FREQUENTLY_USED_NICOTINE_PRODUCT_LIST": { "BASELINE_USAGE": "b55", "CURRENTLY_USING": "b56", "NRT_USAGE": "b57", "MY_MOST_FREQUENTLY_USED_NICOTINE_PRODUCT": "b59" }, "ADD_TO_MY_MOST_FREQUENTLY_USED_ALCOHOL_PRODUCT_LIST": { "BASELINE_USAGE": "b55", "CURRENTLY_USING": "b56", "ALTERNATIVE_PRODUCT_USAGE": "b57", "MY_MOST_FREQUENTLY_USED_ALCOHOL_PRODUCT": "b58" }, "ADD_TO_MY_MOST_FREQUENTLY_USED_ALTERNATIVE_PRODUCT_FOR_NICOTINE_PRODUCT_LIST": { "YES": "b55", "NO": "b56", "ALTERNATIVE_PRODUCT_USAGE": "b58" }, "ADD_TO_MY_MOST_FREQUENTLY_USED_ALTERNATIVE_PRODUCT_FOR_ALCOHOL_PRODUCT_LIST": { "YES": "b55", "NO": "b56", "ALTERNATIVE_PRODUCT_USAGE": "b57" } } },
    /** 129. One user can have many user's quit plans — Users -> User‘s quit plan (One to Many) */
    "129": { id: 129, parent: "Users", child: "User‘s quit plan", type: "One to Many" },
    /** 154. One user's quit plan can have many related nicotine products — 153. User's quit plan -> 140. Product (One to Many) */
    "154": { id: 154, parent: "153. User's quit plan", child: "140. Product", type: "One to Many" },
    /** 183. One user can have many related 51. User's blocked keyword and domain — Users -> 51. User's blocked keyword and domain (One to Many) */
    "183": { id: 183, parent: "Users", child: "51. User's blocked keyword and domain", type: "One to Many" },
    /** 172. One user can have many related 171. User's apple health or google health log event — Users -> 171. User's apple health or google health log event (One to Many) */
    "172": { id: 172, parent: "Users", child: "171. User's apple health or google health log event", type: "One to Many" },
    /** 173. One user can have many related 161. User’s other log event — Users -> 161. User’s other log event (One to Many) */
    "173": { id: 173, parent: "Users", child: "161. User’s other log event", type: "One to Many" },
    /** 176. One 171. User's apple health or google health log event can have many related 161. User’s other log events — 171. User's apple health or google health log event -> 161. User’s other log event (One to Many) */
    "176": { id: 176, parent: "171. User's apple health or google health log event", child: "161. User’s other log event", type: "One to Many" },
    /** 179. One 161. User’s other log events can have many related 177. User’s custom workouts — 161. User’s other log event -> 177. User’s custom workout (One to Many) */
    "179": { id: 179, parent: "161. User’s other log event", child: "177. User’s custom workout", type: "One to Many" },
    /** 180. One 161. User’s other log events can have many related 178. User’s custom symptom — 161. User’s other log event -> 178. User’s custom symptom (One to Many) */
    "180": { id: 180, parent: "161. User’s other log event", child: "178. User’s custom symptom", type: "One to Many" },
    /** 163. One user's log event can have one related user's non-custom and custom choice and alternative choice — 161. User's log event -> 162. Use's non-custom and custom choice and alternative choice (One to One) */
    "163": { id: 163, parent: "161. User's log event", child: "162. Use's non-custom and custom choice and alternative choice", type: "One to One" },
    /** 164. One user can have many related user's custom choice and alternative choices — Users -> 162. Use's non-custom and custom choice and alternative choice (One to Many) */
    "164": { id: 164, parent: "Users", child: "162. Use's non-custom and custom choice and alternative choice", type: "One to Many" },
    /** 165. One user's log event can have many related products — 161. User's log event -> 140. Product (One to Many) */
    "165": { id: 165, parent: "161. User's log event", child: "140. Product", type: "One to Many", f: { "USER_S_LOGGED_PRODUCT_TYPE_USE_THIS_FOR_QUIT_SMOKING_AND_LOGGING_NRT": "a55", "USER_S_LOGGED_PRODUCT_QUANTITY": "a66", "USER_S_LOGGED_PRODUCT_TYPE_USE_THIS_FOR_QUIT_DRINKING": "a67", "LOG_ALCOHOL_BOUGHT_TYPE": "a68" }, opt: { "USER_S_LOGGED_PRODUCT_TYPE_USE_THIS_FOR_QUIT_SMOKING_AND_LOGGING_NRT": { "NICOTINE_PRODUCT": "b55", "NRT_PRODUCT": "b56", "OTHER_PRODUCT": "b57" }, "USER_S_LOGGED_PRODUCT_TYPE_USE_THIS_FOR_QUIT_DRINKING": { "ALCOHOL_PRODUCT": "b55" }, "LOG_ALCOHOL_BOUGHT_TYPE": { "SHOP_BOUGHT": "b55", "BAR_PUB_RESTAURANT": "b56" } } },
    /** 265. One 199. care group can have one related group live 121. chat conversation — 199. care group -> 121. Chat Conversation (One to One) */
    "265": { id: 265, parent: "199. care group", child: "121. Chat Conversation", type: "One to One" },
    /** 137. One chat conversation can have many related chatters — 121. Chat Conversation -> Users (Many to Many) */
    "137": { id: 137, parent: "121. Chat Conversation", child: "Users", type: "Many to Many", f: { "THE_USER_JOINED_THIS_CHAT_CONVERSATION_AT_THIS_TIME": "a55", "THE_USER_LAST_READ_THIS_CHAT_CONVERSATION_AT_THIS_TIME": "a56", "THE_USER_HAS_FUCKING_MUTED_THIS_CHAT": "a57" }, opt: { "THE_USER_HAS_FUCKING_MUTED_THIS_CHAT": { "YES": "b55", "NO": "b56" } } },
    /** 138. One chat conversation can have many related chat messages — 121. Chat Conversation -> 126. Chat Message (One to Many) */
    "138": { id: 138, parent: "121. Chat Conversation", child: "126. Chat Message", type: "One to Many" },
    /** 139. One chat message can have one parent chat message that it is specifically replying to — 126. Chat Message -> 126. Chat Message (One to Many) */
    "139": { id: 139, parent: "126. Chat Message", child: "126. Chat Message", type: "One to Many" },
    /** 188. One user can have many related 185. Notifications to receive — Users -> 185. Notification (One to Many) */
    "188": { id: 188, parent: "Users", child: "185. Notification", type: "One to Many" },
    /** 189. One user can have many related 186. User's notification token — Users -> 186. User's notification token (One to Many) */
    "189": { id: 189, parent: "Users", child: "186. User's notification token", type: "One to Many" },
    /** 190. One user can have many related 187. User's calendar event — Users -> 187. User's calendar event (One to Many) */
    "190": { id: 190, parent: "Users", child: "187. User's calendar event", type: "One to Many" },
    /** 262. One 187. user's calendar event can have many related invited users — 187. User's calendar event -> Users (One to Many) */
    "262": { id: 262, parent: "187. User's calendar event", child: "Users", type: "One to Many" },
    /** 191. One 187. user's calendar event can have many related 161. user's log events — 187. User's calendar event -> 161. user's log events (One to Many) */
    "191": { id: 191, parent: "187. User's calendar event", child: "161. user's log events", type: "One to Many" },
    /** 263. One care task can have many related user's calendar events — 204. Care Task -> 187. User's calendar event (One to Many) */
    "263": { id: 263, parent: "204. Care Task", child: "187. User's calendar event", type: "One to Many" },
    /** 103. One user can have many related 6. FreshCoin Transaction — Users -> 6. FreshCoin Transaction (One to Many) */
    "103": { id: 103, parent: "Users", child: "6. FreshCoin Transaction", type: "One to Many" },
    /** 194. One user can have many related 192. User's subscription — Users -> 192. User's subscription (One to Many) */
    "194": { id: 194, parent: "Users", child: "192. User's subscription", type: "One to Many" },
    /** 195. One user can have many related 193. User's ai credit — Users -> 193. User's ai credit (One to Many) */
    "195": { id: 195, parent: "Users", child: "193. User's ai credit", type: "One to Many" },
    /** 219. One user can have many related cared ones — Users -> Users (Many to Many) */
    "219": { id: 219, parent: "Users", child: "Users", type: "Many to Many" },
    /** 220. One cared one can have many related 198. cared one's information cards — Users -> 198. Cared one's information card (One to Many) */
    "220": { id: 220, parent: "Users", child: "198. Cared one's information card", type: "One to Many" },
    /** 221. One cared one's information card can have many related cared one's emergency contact persons — 198. Cared one's information card -> Users (One to Many) */
    "221": { id: 221, parent: "198. Cared one's information card", child: "Users", type: "One to Many" },
    /** 222. One 199. care group can many related 200. care group invites — 199. Care Group -> 200. Care group invite (One to Many) */
    "222": { id: 222, parent: "199. Care Group", child: "200. Care group invite", type: "One to Many" },
    /** 223. One care group can have many related care group members — 199. Care Group -> Users (Many to Many) */
    "223": { id: 223, parent: "199. Care Group", child: "Users", type: "Many to Many", f: { "CARE_GROUP_S_MEMBER_DISPLAY_NAME": "a55", "CARE_GROUP_S_MEMBER_TYPES": "a56", "CARE_GROUP_S_MEMBER_ROLES": "a57", "CARE_GROUP_S_MEMBER_INVITATION_STATUS": "a58" }, opt: { "CARE_GROUP_S_MEMBER_TYPES": { "NOTHING_SPECIAL": "b55", "OWNER": "b56", "ADMIN": "b57" }, "CARE_GROUP_S_MEMBER_ROLES": { "NOTHING_SPECIAL": "b55", "CARED_ONE": "b56" }, "CARE_GROUP_S_MEMBER_INVITATION_STATUS": { "ACCEPTED": "b55", "PENDING": "b56", "DECLINED": "b57" } } },
    /** 224. One care group can have many related private member groups — 199. Care Group -> 201. The related private member groups of one care group (One to Many) */
    "224": { id: 224, parent: "199. Care Group", child: "201. The related private member groups of one care group", type: "One to Many" },
    /** 225. One 201. care group's private member group can have related members — 201. The related private member groups of one care group -> Users (Many to Many) */
    "225": { id: 225, parent: "201. The related private member groups of one care group", child: "Users", type: "Many to Many", f: { "CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_TYPES": "a55", "CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_INVITATION_STATUS": "a56" }, opt: { "CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_TYPES": { "NOTHING_SPECIAL": "b55", "OWNER": "b56", "ADMIN": "b57" }, "CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_INVITATION_STATUS": { "ACCEPTED": "b55", "PENDING": "b56", "DECLINED": "b57" } } },
    /** 226. One care group can have many related not too special posts — 199. Care Group -> 202. The related not too special posts of one care group (One to Many) */
    "226": { id: 226, parent: "199. Care Group", child: "202. The related not too special posts of one care group", type: "One to Many" },
    /** 227. One 202. related not too special posts of one care group can have many 201. related care group's private member groups that it's visible to — 202. The related not too special posts of one care group -> 201. The related private member groups of one care group (Many to Many) */
    "227": { id: 227, parent: "202. The related not too special posts of one care group", child: "201. The related private member groups of one care group", type: "Many to Many" },
    /** 293. One 202 related not too special posts of one care group can have many related 201 care group's private member groups that it's not visible to — 202. The related not too special posts of one care group -> 201. The related private member groups of one care group (Many to Many) */
    "293": { id: 293, parent: "202. The related not too special posts of one care group", child: "201. The related private member groups of one care group", type: "Many to Many" },
    /** 228. One related not too special posts of one care group can have many related users that it's visible to — 202. The related not too special posts of one care group -> Users (Many to Many) */
    "228": { id: 228, parent: "202. The related not too special posts of one care group", child: "Users", type: "Many to Many" },
    /** 292. One related not too special posts of one care group can have many related users that it's visible to — 202. The related not too special posts of one care group -> Users (Many to Many) */
    "292": { id: 292, parent: "202. The related not too special posts of one care group", child: "Users", type: "Many to Many" },
    /** 229. One 202 related not too special posts of one care group can have many related 141. comments — 202. The related not too special posts of one care group -> 141. Comment (One to Many) */
    "229": { id: 229, parent: "202. The related not too special posts of one care group", child: "141. Comment", type: "One to Many" },
    /** 230. One care group can many related 203. care group galleries — 199. Care Group -> 203. Care Group Gallery (One to Many) */
    "230": { id: 230, parent: "199. Care Group", child: "203. Care Group Gallery", type: "One to Many" },
    /** 231. One 204. care task can have many related cared ones — 204.  Care Task -> Users (One to Many) */
    "231": { id: 231, parent: "204.  Care Task", child: "Users", type: "One to Many" },
    /** 232. One 204. care task can have many related assigned caregivers — 204. Care Task -> Users (One to Many) */
    "232": { id: 232, parent: "204. Care Task", child: "Users", type: "One to Many", f: { "ASSIGNED_CAREGIVER_STATUS": "a55" }, opt: { "ASSIGNED_CAREGIVER_STATUS": { "PENDING": "b55", "ACCEPTED": "b56", "REJECTED": "b57" } } },
    /** 233. One care group can have many related 204. care tasks — 199. Care Group -> 204. Care Task (Many to Many) */
    "233": { id: 233, parent: "199. Care Group", child: "204. Care Task", type: "Many to Many" },
    /** 234. One 204. care task can have many 201. related care group's private member groups that it's visible to — 204. Care Task -> 201. The related private member groups of one care group (One to Many) */
    "234": { id: 234, parent: "204. Care Task", child: "201. The related private member groups of one care group", type: "One to Many" },
    /** 235. One 204. care task can have many related users that it's only visible to — 204. Care Task -> Users (Many to Many) */
    "235": { id: 235, parent: "204. Care Task", child: "Users", type: "Many to Many" },
    /** 236. One 204. care task can have many related comments — 204. Care Task -> 141. Comment (One to Many) */
    "236": { id: 236, parent: "204. Care Task", child: "141. Comment", type: "One to Many" },
    /** 237. One cared one can have many related 205. cared one's medicine schedules — Users -> 205. Cared one’s medicine schedule (One to Many) */
    "237": { id: 237, parent: "Users", child: "205. Cared one’s medicine schedule", type: "One to Many" },
    /** 238. One 205. cared one's medicine schedule can have many related 206. care one's medicine logs — 205. Cared one’s medicine schedule -> 206. Care one's medicine log (One to Many) */
    "238": { id: 238, parent: "205. Cared one’s medicine schedule", child: "206. Care one's medicine log", type: "One to Many" },
    /** 239. One cared one can have many related cared one's 207. checkin schedules — Users -> 207. Checkin schedule (One to Many) */
    "239": { id: 239, parent: "Users", child: "207. Checkin schedule", type: "One to Many" },
    /** 240. One 207. cared one's checkin schedule can have many related 208. care one's checkin logs — 207. Checkin schedule -> 208. Care one's checkin log (One to Many) */
    "240": { id: 240, parent: "207. Checkin schedule", child: "208. Care one's checkin log", type: "One to Many" },
    /** 241. One check in schedule can have many related asigned check-in persons — 207. Checkin schedule -> Users (One to Many) */
    "241": { id: 241, parent: "207. Checkin schedule", child: "Users", type: "One to Many" },
    /** 260. One 207. check in schedule can have many related asigned check-in persons — 207. Checkin schedule -> Users (One to Many) */
    "260": { id: 260, parent: "207. Checkin schedule", child: "Users", type: "One to Many" },
    /** 242. One cared one can have many related 197. cared one's care notes — Users -> 197. Cared one's care note (One to Many) */
    "242": { id: 242, parent: "Users", child: "197. Cared one's care note", type: "One to Many" },
    /** 243. One cared one can have many related cared one's care tips — Users -> 209. Cared one's care tip (One to Many) */
    "243": { id: 243, parent: "Users", child: "209. Cared one's care tip", type: "One to Many" },
    /** 244. One cared one can have many related cared one's care plans — Users -> 210. Cared one's care plan (One to Many) */
    "244": { id: 244, parent: "Users", child: "210. Cared one's care plan", type: "One to Many" },
    /** 245. One cared one can have many related 211. cared one's emergency contact persons — Users -> 211. Cared one's emergency contact person (One to Many) */
    "245": { id: 245, parent: "Users", child: "211. Cared one's emergency contact person", type: "One to Many" },
    /** 246. One cared one can have many related 212. cared one's care documents — Users -> 212. Cared one's care document (One to Many) */
    "246": { id: 246, parent: "Users", child: "212. Cared one's care document", type: "One to Many" },
    /** 247. One user can have many related current location snapshots — Users -> 213. The current location of one user (One to many) */
    "247": { id: 247, parent: "Users", child: "213. The current location of one user", type: "One to many", f: { "USER_TYPE": "a55" }, opt: { "USER_TYPE": { "NOT_SOMEONE_SPECIAL": "b55", "CARED_ONE": "b56" } } },
    /** 248. One user can have many related safe zones — Users -> 214. Safe Zone (One to many) */
    "248": { id: 248, parent: "Users", child: "214. Safe Zone", type: "One to many" },
    /** 290. One cared one’s location notification can have many added related receivers — Users -> Users (One to many) */
    "290": { id: 290, parent: "Users", child: "Users", type: "One to many" },
    /** 249. One care facility can have many related facility members — 215. Care Facility -> Users (One to Many) */
    "249": { id: 249, parent: "215. Care Facility", child: "Users", type: "One to Many", f: { "FACILITY_MEMBER_TYPE": "a55", "FACILITY_MEMBER_ROLE": "a56" }, opt: { "FACILITY_MEMBER_TYPE": { "NOTHING_SPECIAL": "b55", "OWNER": "b56", "ADMIN": "b57" } } },
    /** 291. One 215. Care Facility can have many related ownership claims — 215. Care Facility -> 288. ownership claim (Many to many（使用many to many以保证后续可拓展性)) */
    "291": { id: 291, parent: "215. Care Facility", child: "288. ownership claim", type: "Many to many（使用many to many以保证后续可拓展性)" },
    /** 250. One care job can have many related cared ones — 216. Care Job -> Users (One to Many) */
    "250": { id: 250, parent: "216. Care Job", child: "Users", type: "One to Many" },
    /** 251. One 216. care job can have many assigned caregivers — 216. Care Job -> Users (One to Many) */
    "251": { id: 251, parent: "216. Care Job", child: "Users", type: "One to Many" },
    /** 252. One care group can have many related care jobs — 199. Care Group -> 216. Care Job (Many to Many) */
    "252": { id: 252, parent: "199. Care Group", child: "216. Care Job", type: "Many to Many" },
    /** 253. One 216. care job can have many related 204. care tasks — 216. Care Job -> 204. Care Task (Many to Many) */
    "253": { id: 253, parent: "216. Care Job", child: "204. Care Task", type: "Many to Many" },
    /** 254. One care job can have many related comments — 216. Care Job -> 141. Comment (One to Many) */
    "254": { id: 254, parent: "216. Care Job", child: "141. Comment", type: "One to Many" },
    /** 255. One user can many related finished ChallengeD learn content — Users -> 217. Challenged App Content (One to Many) */
    "255": { id: 255, parent: "Users", child: "217. Challenged App Content", type: "One to Many", f: { "USER_HAS_FINISHED_LEARNING_THIS_LESSON": "a55" }, opt: { "USER_HAS_FINISHED_LEARNING_THIS_LESSON": { "YES": "b55", "NO": "b56" } } },
    /** 256. One 217. Challenged App Content can have many related user’s study notes — 217. Challenged App Content -> 218. User's study notes (One to Many) */
    "256": { id: 256, parent: "217. Challenged App Content", child: "218. User's study notes", type: "One to Many" },
    /** 257. One Challenged App Content can have many related cared one's care tips — 217. Challenged App Content -> 209. Cared one's care tip (One to Many) */
    "257": { id: 257, parent: "217. Challenged App Content", child: "209. Cared one's care tip", type: "One to Many" },
    /** 66. One care facility can have many related reviews — 215. Care facility -> 31. Review (One to Many) */
    "66": { id: 66, parent: "215. Care facility", child: "31. Review", type: "One to Many" },
  },
} as const;

/**
 * Semantic CCT aliases. Frontend code MUST use these (T.careGroup.slug,
 * T.careGroup.f.NAME, T.notification.opt.THIS_IS_THE_NOTIFICATION_FOR_APP.CHALLENGED)
 * so a dictionary renumbering never touches feature code.
 */
export const T = {
  /** 140. Product */
  product: WP.cct["140"],
  /** 146. Product’s brand */
  productBrand: WP.cct["146"],
  /** 114. Product's flavor */
  productFlavor: WP.cct["114"],
  /** 174. Product's ingredient */
  productIngredient: WP.cct["174"],
  /** 288. Ownership claim */
  ownershipClaim: WP.cct["288"],
  /** 168. Recipe */
  recipe: WP.cct["168"],
  /** 2. Shop */
  shop: WP.cct["2"],
  /** 149. Community post */
  afreshCommunityPost: WP.cct["149"],
  /** 141. Comment */
  comment: WP.cct["141"],
  /** 30. Vote */
  vote: WP.cct["30"],
  /** 31. Review */
  review: WP.cct["31"],
  /** 151. User‘s extended profile */
  userProfile: WP.cct["151"],
  /** 258. User‘s extended profile 2 */
  userProfile2: WP.cct["258"],
  /** 181. User‘s reason to quit */
  userReasonToQuit: WP.cct["181"],
  /** 153. User's quit plan */
  userQuitPlan: WP.cct["153"],
  /** 51. User's blocked keyword and domain */
  blockedKeyword: WP.cct["51"],
  /** 171. User's apple health or google health log event */
  userHealthLog: WP.cct["171"],
  /** 161. User’s other log event */
  userLogEvent: WP.cct["161"],
  /** 177. User’s custom workout */
  userCustomWorkout: WP.cct["177"],
  /** 178. User’s custom symptom */
  userCustomSymptom: WP.cct["178"],
  /** 162. Use's non-custom and custom choice and alternative choice */
  userChoice: WP.cct["162"],
  /** 121. Chat Conversation */
  chatConversation: WP.cct["121"],
  /** 126. Chat Message */
  chatMessage: WP.cct["126"],
  /** 185. Notification */
  notification: WP.cct["185"],
  /** 186. User's notification token */
  notificationToken: WP.cct["186"],
  /** 187. User's calendar event */
  calendarEvent: WP.cct["187"],
  /** 6. FreshCoin Transaction */
  freshcoinTransaction: WP.cct["6"],
  /** 192. User's subscription */
  userSubscription: WP.cct["192"],
  /** 193. User's ai credit */
  userAiCredit: WP.cct["193"],
  /** 198. Cared one's information card */
  infoCard: WP.cct["198"],
  /** 199. Care Group */
  careGroup: WP.cct["199"],
  /** 200. Care group invite */
  careGroupInvite: WP.cct["200"],
  /** 201. The related private member groups of one 199. care group */
  careGroupPrivateMemberGroup: WP.cct["201"],
  /** 202. The related not too special posts of one care group */
  careGroupPost: WP.cct["202"],
  /** 203. Care Group Gallery */
  careGroupGallery: WP.cct["203"],
  /** 204. Care Task */
  careTask: WP.cct["204"],
  /** 205. Medicine schedule */
  medicineSchedule: WP.cct["205"],
  /** 206. Medicine log */
  medicineLog: WP.cct["206"],
  /** 207. Checkin schedule */
  checkinSchedule: WP.cct["207"],
  /** 208. Checkin log */
  checkinLog: WP.cct["208"],
  /** 197. Cared one's care note */
  careNote: WP.cct["197"],
  /** 209. Cared one's care tip */
  careTip: WP.cct["209"],
  /** 210. Cared one's care plan */
  carePlan: WP.cct["210"],
  /** 211. Cared one's emergency contact person */
  emergencyContact: WP.cct["211"],
  /** 212. Cared one's care document */
  careDocument: WP.cct["212"],
  /** 213. The current location of one user */
  currentLocation: WP.cct["213"],
  /** 214. Safe Zone */
  safeZone: WP.cct["214"],
  /** 215. Care Facility */
  careFacility: WP.cct["215"],
  /** 216. Care Job */
  careJob: WP.cct["216"],
  /** 217. Challenged App Content */
  challengedContent: WP.cct["217"],
  /** 218. User's study notes */
  studyNote: WP.cct["218"],
} as const;

/** Semantic JetEngine relation IDs. Use R.careGroupMembers, never a raw number. */
export const R = {
  /** 117. One product can have many related woo products to be sold through woo on each shop */
  productWooProducts: 117,
  /** 147. One 140. product can have many related 146. product’s brand */
  productBrands: 147,
  /** 112. One 140. product can have many related 114. product’s flavor */
  productFlavors: 112,
  /** 175. One 140. product can have many related 174. product’s ingredients */
  productIngredients: 175,
  /** 287. One 140. product can have many related product members */
  productMembers: 287,
  /** 169. One 168. recipe can have many related 140. products */
  recipeProducts: 169,
  /** 148. One directory marketplace shop like amazon can have many related vendors selling on it */
  shopVendors: 148,
  /** 286. One 2. Shop can have many related facility members */
  shopMembers: 286,
  /** 116. One shop can have many related products to sell and here we also store the price of the product on this nicotine shop */
  shopProducts: 116,
  /** 276. One 275. product price history can have many related 2. shops */
  productPriceHistoryShops: 276,
  /** 118. One user can have one dokan shop and here we relate it to its one and only related nicotine shop */
  userShop: 118,
  /** 119. One nicotine shop that is already listed on our directory can have one related hidden nicotine shop to store price if the shop also chooses to sell on our app */
  shopLinkedShop: 119,
  /** 150. One 149. Community post can have many related comments */
  communityPostComments: 150,
  /** 142. One comment can have many related comments */
  commentReplies: 142,
  /** 166. One 149. comment can have many related 30. Votes */
  communityPostVotes: 166,
  /** 144. One product shop can have many related reviews */
  shopReviews: 144,
  /** 264. One care provider can have many related 31. reviews */
  providerReviews: 264,
  /** 143. One review can have many related comments */
  reviewComments: 143,
  /** 145. One nicotine product can have many related reviews */
  productReviews: 145,
  /** 152. One user can have one related user's extended profile */
  userProfileRel: 152,
  /** 259. One user can have one 258. user‘s extended profile 2 */
  userProfile2Rel: 259,
  /** 182. One user can have many related user‘s 181. User‘s reason to quit */
  userReasonsToQuit: 182,
  /** 128. One user can have many related nicotine products */
  userProducts: 128,
  /** 129. One user can have many user's quit plans */
  userQuitPlans: 129,
  /** 154. One user's quit plan can have many related nicotine products */
  quitPlanProducts: 154,
  /** 183. One user can have many related 51. User's blocked keyword and domain */
  userBlockedKeywords: 183,
  /** 172. One user can have many related 171. User's apple health or google health log event */
  userHealthLogs: 172,
  /** 173. One user can have many related 161. User’s other log event */
  userLogEvents: 173,
  /** 176. One 171. User's apple health or google health log event can have many related 161. User’s other log events */
  healthLogChildLogEvents: 176,
  /** 179. One 161. User’s other log events can have many related 177. User’s custom workouts */
  logEventCustomWorkouts: 179,
  /** 180. One 161. User’s other log events can have many related 178. User’s custom symptom */
  logEventCustomSymptoms: 180,
  /** 163. One user's log event can have one related user's non-custom and custom choice and alternative choice */
  logEventChoice: 163,
  /** 164. One user can have many related user's custom choice and alternative choices */
  userChoices: 164,
  /** 165. One user's log event can have many related products */
  logEventProducts: 165,
  /** 265. One 199. care group can have one related group live 121. chat conversation */
  careGroupChat: 265,
  /** 137. One chat conversation can have many related chatters */
  conversationMembers: 137,
  /** 138. One chat conversation can have many related chat messages */
  conversationMessages: 138,
  /** 139. One chat message can have one parent chat message that it is specifically replying to */
  messageParentMessage: 139,
  /** 188. One user can have many related 185. Notifications to receive */
  userNotifications: 188,
  /** 189. One user can have many related 186. User's notification token */
  userNotificationTokens: 189,
  /** 190. One user can have many related 187. User's calendar event */
  userCalendarEvents: 190,
  /** 262. One 187. user's calendar event can have many related invited users */
  calendarEventInvitees: 262,
  /** 191. One 187. user's calendar event can have many related 161. user's log events */
  calendarEventLogEvents: 191,
  /** 263. One care task can have many related user's calendar events */
  careTaskCalendarEvents: 263,
  /** 103. One user can have many related 6. FreshCoin Transaction */
  userFreshcoinTransactions: 103,
  /** 194. One user can have many related 192. User's subscription */
  userSubscriptions: 194,
  /** 195. One user can have many related 193. User's ai credit */
  userAiCredits: 195,
  /** 219. One user can have many related cared ones */
  userCaredOnes: 219,
  /** 220. One cared one can have many related 198. cared one's information cards */
  caredOneInfoCards: 220,
  /** 221. One cared one's information card can have many related cared one's emergency contact persons */
  infoCardEmergencyContacts: 221,
  /** 222. One 199. care group can many related 200. care group invites */
  careGroupInvites: 222,
  /** 223. One care group can have many related care group members */
  careGroupMembers: 223,
  /** 224. One care group can have many related private member groups */
  careGroupPrivateMemberGroups: 224,
  /** 225. One 201. care group's private member group can have related members */
  privateMemberGroupMembers: 225,
  /** 226. One care group can have many related not too special posts */
  careGroupPosts: 226,
  /** 227. One 202. related not too special posts of one care group can have many 201. related care group's private member groups that it's visible to */
  careGroupPostPrivateGroups: 227,
  /** 293. One 202 related not too special posts of one care group can have many related 201 care group's private member groups that it's not visible to */
  careGroupPostHiddenPrivateGroups: 293,
  /** 228. One related not too special posts of one care group can have many related users that it's visible to */
  careGroupPostMentionedUsers: 228,
  /** 292. One related not too special posts of one care group can have many related users that it's visible to */
  careGroupPostHiddenUsers: 292,
  /** 229. One 202 related not too special posts of one care group can have many related 141. comments */
  careGroupPostComments: 229,
  /** 230. One care group can many related 203. care group galleries */
  careGroupGalleries: 230,
  /** 231. One 204. care task can have many related cared ones */
  careTaskCaredOnes: 231,
  /** 232. One 204. care task can have many related assigned caregivers */
  careTaskAssignees: 232,
  /** 233. One care group can have many related 204. care tasks */
  careGroupTasks: 233,
  /** 234. One 204. care task can have many 201. related care group's private member groups that it's visible to */
  careTaskPrivateMemberGroups: 234,
  /** 235. One 204. care task can have many related users that it's only visible to */
  careTaskVisibleUsers: 235,
  /** 236. One 204. care task can have many related comments */
  careTaskComments: 236,
  /** 237. One cared one can have many related 205. cared one's medicine schedules */
  caredOneMedicineSchedules: 237,
  /** 238. One 205. cared one's medicine schedule can have many related 206. care one's medicine logs */
  medicineScheduleLogs: 238,
  /** 239. One cared one can have many related cared one's 207. checkin schedules */
  caredOneCheckinSchedules: 239,
  /** 240. One 207. cared one's checkin schedule can have many related 208. care one's checkin logs */
  checkinScheduleLogs: 240,
  /** 241. One check in schedule can have many related asigned check-in persons */
  checkinScheduleAssignees: 241,
  /** 260. One 207. check in schedule can have many related asigned check-in persons */
  checkinNotificationReceivers: 260,
  /** 242. One cared one can have many related 197. cared one's care notes */
  caredOneCareNotes: 242,
  /** 243. One cared one can have many related cared one's care tips */
  caredOneCareTips: 243,
  /** 244. One cared one can have many related cared one's care plans */
  caredOneCarePlans: 244,
  /** 245. One cared one can have many related 211. cared one's emergency contact persons */
  caredOneEmergencyContacts: 245,
  /** 246. One cared one can have many related 212. cared one's care documents */
  caredOneCareDocuments: 246,
  /** 247. One user can have many related current location snapshots */
  userCurrentLocations: 247,
  /** 248. One user can have many related safe zones */
  userSafeZones: 248,
  /** 290. One cared one’s location notification can have many added related receivers */
  caredOneLocationReceivers: 290,
  /** 249. One care facility can have many related facility members */
  careFacilityMembers: 249,
  /** 291. One 215. Care Facility can have many related ownership claims */
  careFacilityOwnershipClaims: 291,
  /** 250. One care job can have many related cared ones */
  careJobCaredOnes: 250,
  /** 251. One 216. care job can have many assigned caregivers */
  careJobAssignees: 251,
  /** 252. One care group can have many related care jobs */
  careGroupJobs: 252,
  /** 253. One 216. care job can have many related 204. care tasks */
  careJobTasks: 253,
  /** 254. One care job can have many related comments */
  careJobComments: 254,
  /** 255. One user can many related finished ChallengeD learn content */
  userFinishedContent: 255,
  /** 256. One 217. Challenged App Content can have many related user’s study notes */
  contentStudyNotes: 256,
  /** 257. One Challenged App Content can have many related cared one's care tips */
  contentCareTips: 257,
  /** 66. One care facility can have many related reviews */
  facilityReviews: 66,
} as const;

/** Dictionary CCT number -> live JetEngine REST slug. */
export const CCT_SLUG: Readonly<Record<string, string>> = {
  "140": "nicotine_product",
  "146": "nicotine_products_b",
  "114": "nicotine_products_fl",
  "174": "products_ingredient",
  "288": "ownership_claim",
  "168": "recipe",
  "2": "shop",
  "149": "afresh_community_pos",
  "141": "comment",
  "30": "vote",
  "31": "review",
  "151": "users_extended_prof",
  "258": "user_ext_profile_2",
  "181": "users_reason_to_qui",
  "153": "users_quit_plan",
  "51": "blocked_keyword",
  "171": "apple_health_or_goog",
  "161": "users_log_event",
  "177": "users_custom_workout",
  "178": "users_custom_sympto",
  "162": "choice_and_alternative_choice",
  "121": "chat_conversation",
  "126": "chat_message",
  "185": "users_notification",
  "186": "users_notif_token",
  "187": "users_calendar_event",
  "6": "freshcoin_transaction",
  "192": "users_subscription",
  "193": "users_credit_ledger",
  "198": "cared_one_info_card",
  "199": "care_group",
  "200": "care_group_invite",
  "201": "care_group_pmg",
  "202": "care_group_post",
  "203": "care_group_gallery",
  "204": "care_task",
  "205": "medicine_schedule",
  "206": "medicine_log",
  "207": "checkin_schedule",
  "208": "checkin_log",
  "197": "care_note",
  "209": "care_tip",
  "210": "care_plan",
  "211": "emergency_contact",
  "212": "care_document",
  "213": "current_location",
  "214": "safe_zone",
  "215": "care_facility",
  "216": "care_job",
  "217": "challenged_content",
  "218": "study_notes",
} as const;

/** Resolve a REST slug from a dictionary CCT number. Throws when unmapped. */
export function cctSlug(id: number | string): string {
  const slug = CCT_SLUG[String(id)];
  if (!slug) throw new Error(`[wp-schema] No live CCT slug mapped for dictionary CCT ${id}`);
  return slug;
}
