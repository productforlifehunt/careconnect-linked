// AUTO-GENERATED from /mnt/documents/最新数据字典.md — DO NOT EDIT BY HAND.
// Source of truth: scripts/build-truth.mjs → docs/wp-truth.json
// Re-run `node scripts/gen-wp-constants.mjs` after updating the dictionary.

export const WP = {
  cct: {
    /** User's extended profile */
    "110": {
      id: 110,
      name: "User's extended profile",
      fields: {
        "ALLOW_EMERGENCY_LOCATION_REQUEST": "a55",  // Radio  {"b55":"Yes","b56":"No"}
        "LOCATION_SHARE_IS_ON": "a56",  // Radio  {"b55":"Yes","b56":"No"}
        "NOTIFICATION_PREFERENCE": "a57",  // 
        "GENERAL_USER_ROLE": "a58",  // Checkbox  {"b55":"cared one","b56":"caring one"}
        "IS_CARE_PROVIDER": "a59",  // Radio  {"b55":"Yes","b56":"No"}
        "CARE_PROVIDER_IS_ACTIVE": "a60",  // Radio  {"b55":"Yes","b56":"No"}
        "CARE_PROVIDER_IS_BACKGROUND_CHECKED": "a61",  // Radio  {"b55":"Yes","b56":"No"}
        "CARE_PROVIDER_S_BACKGROUND_CHECK_DETAIL": "a62",  // Text
        "CARE_PROVIDER_S_CANCELLATION_POLICY": "a63",  // 
        "CARE_PROVIDER_S_SERVICE_AREA": "a64",  // 
        "CARE_PROVIDER_S_STARTS_HOURLY_RATE": "a65",  // Number
        "CARE_PROVIDER_OFFERS_IN_PERSON_SERVICE": "a66",  // Radio  {"b55":"Yes","b56":"No"}
        "CARE_PROVIDER_OFFERS_VIRTUAL_SERVICE": "a67",  // Radio  {"b55":"Yes","b56":"No"}
        "CARE_PROVIDER_OFFERS_CARE_SERVICE_GENERAL_TYPE": "a68",  // Checkbox  {"b55":"Pet care and companion","b56":"Child care and companion","b57":"Adult care and companion","b58":"Elderly care and companion","b59":"Tutoring","b60":"Dementia care and companion","b61":"Housekeeping","b62":"Errand","b63":"Transportation","b64":"Medical Escort","b65":"In-person checkin","b66":"Remote checkin and medicine supervision"}
        "CARE_PROVIDER_OFFERS_PET_CARE_FOR": "a69",  // Checkbox  {"b55":"Dogs","b56":"Cats","b57":"Small mammals","b58":"Birds","b59":"Fish"}
        "CARE_PROVIDER_OFFERS_DEMENTIA_CARE_TYPE": "a70",  // Checkbox  {"b55":"In-person day care","b56":"In-person overnight care","b57":"In-person companion","b58":"In-person checkin","b59":"Household help","b60":"Remote companion","b61":"Remote medicine management","b62":"Remote checkin"}
        "CARE_PROVIDER_OFFERS_ELDERLY_CARE_SERVICE": "a71",  // 
        "CARE_PROVIDER_OFFERS_SPECIAL_NEEDS_CARE_SERVICE": "a72",  // Checkbox
        "CARE_PROVIDER_OFFERS_HOUSEHOLD_HELP_SERVICE": "a73",  // Checkbox  {"b55":"Housekeeping","b56":"Gardening"}
        "CARE_PROVIDER_OFFERS_ERRAND_SERVICE": "a74",  // 
        "CARE_PROVIDER_OFFERS_TRANSPORTATION_SERVICE": "a75",  // 
        "CARE_PROVIDER_OFFERS_MEDICAL_ESCORT_SERVICE": "a76",  // 
        "CARE_PROVIDER_OFFERS_CHILDCARE_SERVICE_AS": "a77",  // Checkbox  {"b55":"Babysitter","b56":"Nanny","b57":"Childminder"}
        "CARE_PROVIDER_OFFERS_CHILDCARE_SERVICE": "a78",  // Checkbox  {"b55":"Cooking / Meal preparation","b56":"Pick-up / Drop off","b57":"Light housekeeping","b58":"Activities (e.g. swimming)","b59":"Putting kids to bed","b60":"Homework help","b61":"Bathing","b62":"Virtual Care"}
        "CARE_PROVIDER_OFFERS_DOG_CARE_SERVICE_TYPE": "a79",  // Checkbox  {"b55":"Dog sitting","b56":"Dog walking","b57":"Dog feeding","b58":"Dog day care","b59":"Dog transportation","b60":"Dog overnight sitting","b61":"Dog training","b62":"Dog grooming"}
        "CARE_PROVIDER_OFFERS_CAT_CARE_SERVICE": "a80",  // Checkbox  {"b55":"Cat sitting","b56":"Cat walking","b57":"Cat feeding","b58":"Cat day care","b59":"Cat transportation","b60":"Cat overnight sitting","b61":"Cat training","b62":"Cat grooming"}
        "CARE_PROVIDER_OFFERS_SMALL_MAMMAL_CARE_SERVICE_TYPE": "a81",  // 
        "CARE_PROVIDER_OFFERS_BIRD_CARE_SERVICE": "a82",  // 
        "CARE_PROVIDER_OFFERS_FISH_CARE_SERVICE": "a83",  // 
        "CARE_PROVIDER_IS_A_DOCTOR_AND_OFFERS_CARE_TIP_CONSULTANCY": "a84",  // 
        "CARE_PROVIDER_IS_A_DOCTOR_AND_OFFERS_ACCOMPANY_TIP_CONSULTANCY": "a85",  // 
        "CARE_PROVIDES_CAN_DRIVE": "a86",  // Radio  {"b55":"Yes","b56":"No"}
        "CARE_PROVIDES_HAS_OWN_TRANSPORTATION": "a87",  // Radio  {"b55":"Yes","b56":"No"}
        "CARE_PROVIDER_IS_A_NON_SMOKER": "a88",  // Radio  {"b55":"Yes","b56":"No"}
        "CARE_PROVIDER_IS_EXPERIENCED_WITH": "a89",  // Checkbox  {"b55":"Newborn (up to 12 months)","b56":"Toddler (1-3 years)","b57":"Early School Age (4-6 years)","b58":"Primary school age (7-12 years)","b59":"Teenager (12+ years)","b60":"Twins/Multiples","b61":"Special Needs Children"}
        "CARED_ONE_S_AI_SYSTEM_PROMPT": "a90",  // Text
        "USER_ENABLED_PUSH_NOTIFICATION": "a91",  // Radio  {"b55":"Yes","b56":"No"}
        "USER_ENABLED_EMAIL_NOTIFICATION": "a92",  // Radio  {"b55":"Yes","b56":"No"}
        "USER_ENABLED_SMS_NOTIFICATION": "a93",  // Radio  {"b55":"Yes","b56":"No"}
      },
    },
    /** Cared one's information card */
    "125": {
      id: 125,
      name: "Cared one's information card",
      fields: {
        "CARED_ONE_S_NAME": "a55",  // Text
        "CARED_ONE_S_DESCRIPTION": "a56",  // Textarea
        "CARED_ONE_S_INFORMATION_CARD_NAME": "a57",  // Text
        "STATUS": "a58",  // Radio  {"b55":"Draft","b56":"Active","b57":"Paused"}
        "DISPLAYS_LOCATION": "a59",  // Radio  {"b55":"Yes","b56":"No"}
        "SHARE_TOKEN": "a60",  // Text
        "SHARE_EXPIRES_AT": "a61",  // Datetime
        "SHARE_VISIBILITY": "a62",  // Radio  {"b55":"Visible to public","b56":"Visible to the care group of the cared one","b57":"Visible to caregivers of the cared one","b58":"Visible to author"}
      },
    },
    /** User's calendar event */
    "128": {
      id: 128,
      name: "User's calendar event",
      fields: {
        "TITLE": "a55",  // Text
        "DESCRIPTION": "a56",  // Textarea
        "START_AT": "a57",  // Datetime
        "END_AT": "a58",  // Datetime
        "ALL_DAY": "a59",  // Checkbox
        "EVENT_TYPE": "a60",  // Text
        "LOCATION": "a61",  // Text
        "TIMEZONE": "a62",  // Text
        "STATUS": "a63",  // Select  {"b55":"confirmed","b56":"tentative","b57":"cancelled"}
        "PRIORITY": "a64",  // Select  {"b55":"normal","b56":"low","b57":"normal","b58":"high","b59":"urgent"}
        "COLOR": "a65",  // Colorpicker
        "RRULE": "a66",  // Text
        "RRULE_UNTIL": "a67",  // Datetime
        "EXDATES": "a68",  // Textarea
        "RDATES": "a69",  // Textarea
        "RECURRENCE_ID": "a70",  // Text
        "SHOW_AS": "a71",  // Select  {"b55":"busy","b56":"free","b57":"tentative","b58":"oof"}
        "VISIBILITY": "a72",  // Select  {"b55":"default","b56":"public","b57":"private","b58":"confidential"}
        "REMINDERS": "a73",  // Textarea
        "IS_AVAILABILITY": "a74",  // Radio  {"b55":"Yes","b56":"No"}
        "AVAILABILITY_NOTE": "a75",  // Text
        "RSVP_REQUIRED": "a76",  // Radio  {"b55":"Yes","b56":"No"}
        "ALLOW_COMMENTS": "a77",  // Radio  {"b55":"Yes","b56":"No"}
        "EXTERNAL_SOURCE": "a78",  // Select  {"b55":"internal","b56":"google","b57":"outlook","b58":"apple"}
        "ICAL_UID": "a79",  // Text
        "SEQUENCE": "a80",  // Text
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
      },
    },
    /** Care group invite */
    "160": {
      id: 160,
      name: "Care group invite",
      fields: {
        "TOKEN": "a55",  // Text
        "NAME": "a56",  // Text
        "EXPIRES_AT": "a57",  // Datetime
        "MAX_USES": "a58",  // Number
        "USE_COUNT": "a59",  // Number
        "IS_REVOKED": "a60",  // Switcher
      },
    },
    /** The related private member groups of one care group */
    "74": {
      id: 74,
      name: "The related private member groups of one care group",
      fields: {
        "NAME": "a55",  // Text
        "DESCRIPTION": "a56",  // Textarea
        "COLOR": "a57",  // Colorpicker
      },
    },
    /** The related not too special posts of one care group */
    "76": {
      id: 76,
      name: "The related not too special posts of one care group",
      fields: {
        "TYPE": "a55",  // Checkbox  {"b55":"discussion","b56":"announcement"}
        "TITLE": "a56",  // Text
        "CONTENT": "a57",  // Text
        "IS_PINNED": "a58",  // Radio  {"b55":"Yes","b56":"No"}
        "SCHEDULED_AT": "a59",  // Datetime
      },
    },
    /** Care Group Gallery */
    "14": {
      id: 14,
      name: "Care Group Gallery",
      fields: {
        "IMAGE": "a55",  // Media
        "IMAGE_DESCRIPTION": "a56",  // Textarea
        "TAKEN_AT": "a57",  // Datetime
      },
    },
    /** Care Task */
    "162": {
      id: 162,
      name: "Care Task",
      fields: {
        "TITLE": "a55",  // Text
        "DESCRIPTION": "a56",  // Textarea
        "TASK_TYPE": "a57",  // Checkbox  {"b55":"Preparing Meals","b56":"Giving Rides","b57":"Shopping","b58":"Childcare","b59":"Visits","b60":"Coverage","b61":"Medications & Medical Care","b62":"Miscellaneous","b63":"Occasions"}
        "PEOPLE_NEEDED": "a58",  // Number
        "LOCATION": "a59",  // Text
        "PHOTO": "a60",  // 
        "DATE_OF_THE_TASK": "a61",  // Date
        "TASK_START_TIME": "a62",  // Datetime
        "TASK_END_TIME": "a63",  // Datetime
        "TASK_COMPLETED_AT": "a64",  // Datetime
        "TASK_HELP_STATUS": "a65",  // Radio  {"b55":"Task doesn't need help","b56":"Task needs help","b57":"Task has found help"}
        "TASK_FINISH_STATUS": "a66",  // Radio  {"b55":"Not finished","b56":"Finished"}
      },
    },
    /** Notification */
    "146": {
      id: 146,
      name: "Notification",
      fields: {
        "NOTIFICATION_TYPE": "a55",  // Radio  {"b55":"User chat","b56":"Booking","b57":"System","b58":"Location alert"}
        "NOTIFICATION_TITLE": "a56",  // Text
        "NOTIFICATION_CONTENT": "a57",  // Textarea
        "ACTION_URL": "a58",  // Text
        "NOTIFICATION_IS_READ": "a59",  // Radio  {"b55":"Yes","b56":"No"}
      },
    },
    /** User's notification token */
    "147": {
      id: 147,
      name: "User's notification token",
      fields: {
        "ENDPOINT_OR_TOKEN": "a55",  // Text
        "NOTIFICATION_PROVIDER": "a56",  // Radio  {"b55":"Web push notification","b56":"Firebase FCM","b57":"Apple APN","b58":"J Push","b59":"WeChat"}
        "DEVICE_LABEL": "a57",  // Text
        "AUTH_KEY": "a58",  // Text
        "P256DH": "a59",  // Text
        "IS_ACTIVE": "a60",  // Radio  {"b55":"Yes","b56":"No"}
      },
    },
    /** Medicine schedule */
    "15": {
      id: 15,
      name: "Medicine schedule",
      fields: {
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
        "IS_ACTIVE": "a65",  // Radio  {"b55":"Yes","b56":"No"}
        "NOTE": "a66",  // Textarea
        "STOCK_COUNT": "a67",  // Number
        "REFILL_THRESHOLD": "a68",  // Number
      },
    },
    /** Medicine log */
    "16": {
      id: 16,
      name: "Medicine log",
      fields: {
        "STATUS": "a55",  // Radio  {"b55":"Taken","b56":"Skipped","b57":"Missed"}
        "NOTE": "a56",  // Textarea
      },
    },
    /** Checkin schedule */
    "138": {
      id: 138,
      name: "Checkin schedule",
      fields: {
        "NAME": "a55",  // Text
        "DETAIL": "a56",  // Text
        "FREQUENCY": "a57",  // Text
        "TIME_SLOT": "a58",  // Textarea
        "INSTRUCTIONS": "a59",  // Text
        "START_DATE": "a60",  // Date
        "IS_ACTIVE": "a61",  // Radio  {"b55":"Yes","b56":"No"}
        "NOTE": "a62",  // Textarea
      },
    },
    /** Checkin log */
    "17": {
      id: 17,
      name: "Checkin log",
      fields: {
        "STATUS": "a55",  // Radio  {"b55":"Checked","b56":"Skipped","b57":"Missed"}
        "NOTE": "a56",  // Textarea
        "CHECKED_BY_AI": "a57",  // Radio  {"b55":"Yes","b56":"No"}
      },
    },
    /** Cared one's care note */
    "22": {
      id: 22,
      name: "Cared one's care note",
      fields: {
        "TITLE": "a55",  // Text
        "CONTENT": "a56",  // Textarea
      },
    },
    /** Cared one's care tip */
    "19": {
      id: 19,
      name: "Cared one's care tip",
      fields: {
        "TITLE": "a55",  // Text
        "CONTENT": "a56",  // Textarea
        "CATEGORY": "a57",  // Radio  {"b55":"tip","b56":"avoid"}
        "IS_PINNED": "a58",  // Radio  {"b55":"Yes","b56":"No"}
      },
    },
    /** Cared one's care plan */
    "20": {
      id: 20,
      name: "Cared one's care plan",
      fields: {
        "TITLE": "a55",  // Text
        "CONTENT": "a56",  // Textarea
        "IS_PINNED": "a57",  // Radio  {"b55":"Yes","b56":"No"}
      },
    },
    /** Cared one's emergency contact person */
    "24": {
      id: 24,
      name: "Cared one's emergency contact person",
      fields: {
        "NAME": "a55",  // Text
        "CONTENT": "a56",  // Textarea
        "PHONE": "a57",  // Text
        "ADDRESS": "a58",  // Text
        "RELATIONSHIP": "a59",  // Text
        "NOTE": "a60",  // Text
      },
    },
    /** Cared one's care document */
    "23": {
      id: 23,
      name: "Cared one's care document",
      fields: {
        "NAME": "a55",  // Text
        "CONTENT": "a56",  // Textarea
      },
    },
    /** The current location of one user */
    "112": {
      id: 112,
      name: "The current location of one user",
      fields: {
        "LATITUDE": "a55",  // Text
        "LONGITUDE": "a56",  // Text
        "ACCURACY_METERS": "a57",  // Text
        "ALTITUDE_METERS": "a58",  // Text
        "HEADING_DEGREES": "a59",  // Text
        "SPEED": "a60",  // Text
        "IS_MOVING": "a61",  // Text
        "MOVING_TYPE": "a62",  // Text
        "PLATFORM": "a63",  // Text
        "BATTERY_LEVEL": "a64",  // Text
        "PHONE_IS_CHARGING": "a65",  // Text
        "ADDRESS_TEXT": "a66",  // Text
        "CAPTURED_AT": "a67",  // Datetime
        "IS_EMERGENCY_NO_PERMISSION_NEEDED": "a68",  // Radio  {"b55":"Yes","b56":"No"}
      },
    },
    /** Safe Zone (含安全区与危险区) */
    "116": {
      id: 116,
      name: "Safe Zone (含安全区与危险区)",
      fields: {
        "ZONE_TYPE": "a55",  // Radio  {"b55":"Safe","b56":"Danger"}
        "SHAPE_TYPE": "a56",  // Radio  {"b55":"Radius","b56":"Polygon"}
        "CUSTOM_NAME": "a57",  // Text
        "CUSTOM_DESCRIPTION": "a58",  // Textarea
        "CUSTOM_COLOR": "a59",  // Colorpicker
        "LATITUDE": "a60",  // Text
        "LONGITUDE": "a61",  // Text
        "RADIUS_METERS": "a62",  // Number
        "POLYGON_POINTS": "a63",  // Textarea
        "NOTIFY_ON_ENTER": "a64",  // Radio  {"b55":"Off","b56":"On"}
        "NOTIFY_ON_EXIT": "a65",  // Radio  {"b55":"Off","b56":"On"}
        "SCHEDULE_ENABLED": "a66",  // Radio  {"b55":"Off","b56":"On"}
        "SCHEDULE_START_TIME": "a67",  // Datetime
        "SCHEDULE_END_TIME": "a68",  // Datetime
        "IS_ACTIVE": "a69",  // Radio  {"b55":"Yes","b56":"No"}
      },
    },
    /** Care Facility */
    "64": {
      id: 64,
      name: "Care Facility",
      fields: {
        "NAME": "a55",  // Text
        "DETAIL": "a56",  // Textarea
        "CARE_FACILITY_TYPE": "a57",  // Checkbox  {"b55":"Adult Day Care","b56":"Assisted living","b57":"Home Care","b58":"Hospice","b59":"Independent living","b60":"Memory care","b61":"Nursing homes","b62":"Residential care homes","b63":"Senior Apartments"}
        "CARE_FOR_DEMENTIA_STAGE": "a58",  // Checkbox  {"b55":"Early-stage","b56":"Middle-stage","b57":"Late-stage"}
        "ROOM_TYPE": "a59",  // Checkbox  {"b55":"Studio","b56":"One Bed Room","b57":"Two Bed Room","b58":"More Than Two Bed Room"}
        "ROOM_FACILITY": "a60",  // Checkbox  {"b55":"Balcony","b56":"Toilet","b57":"Kitchen"}
        "COMMUNITY_FACILITY": "a61",  // Checkbox  {"b55":"swimming pool","b56":"active lifestyle","b57":"entertainment venue","b58":"laundry"}
        "PEOPLE_NUMBER": "a62",  // Checkbox  {"b55":"Less than 5","b58":"More than 50"}
        "LOCATION": "a63",  // 
        "ADDRESS": "a64",  // 
      },
    },
    /** Review */
    "65": {
      id: 65,
      name: "Review",
      fields: {
        "TITLE": "a55",  // Text
        "CONTENT": "a56",  // Textarea
        "RATING": "a57",  // Number
      },
    },
    /** Care Job */
    "139": {
      id: 139,
      name: "Care Job",
      fields: {
        "TITLE": "a55",  // Text
        "DESCRIPTION": "a56",  // Textarea
        "DUE_DATE": "a57",  // Datetime
        "COMPLETED_AT": "a58",  // Datetime
        "STATUS": "a59",  // Radio  {"b55":"pending","b56":"in progress","b57":"completed"}
      },
    },
    /** Care community post */
    "70": {
      id: 70,
      name: "Care community post",
      fields: {
        "TITLE": "a55",  // Text
        "CONTENT": "a56",  // Textarea
        "LANGUAGE": "a57",  // Radio  {"b55":"English","b56":"Simplified Chinese"}
        "APP_AREA": "a58",  // Checkbox  {"b55":"Global English","b56":"China"}
        "CATEGORY": "a59",  // Checkbox  {"b55":"Discussion","b56":"Article"}
      },
    },
    /** Challenged App Content */
    "100": {
      id: 100,
      name: "Challenged App Content",
      fields: {
        "TITLE": "a55",  // Text
        "CONTENT": "a56",  // Textarea
        "LANGUAGE": "a57",  // Radio  {"b55":"English","b56":"Simplified Chinese"}
        "APP_AREA": "a58",  // Checkbox  {"b55":"Global English","b56":"China"}
        "APP_CONTENT_TYPE": "a59",  // Radio  {"b55":"Learn","b56":"Care and accompany tips","b57":"Find tips"}
        "LEARN_MODULE_NUMBER": "a60",  // Number
        "LEARN_LESSON_NUMBER": "a61",  // Number
        "CARE_AND_ACCOMPANY_TIPS_CATEGORY": "a62",  // Radio  {"b55":"Eating and drinking","b56":"Toileting and continence","b57":"Memory loss","b58":"Aggression","b60":"Difficulty sleeping","b61":"Delusions and hallucinations","b62":"Repetitive behaviour","b63":"Changes in judgement"}
        "FIND_TIPS_CATEGORY": "a63",  // Radio  {"b55":"Wondering","b56":"Getting lost","b57":"Unwilling to return home"}
      },
    },
    /** User's study notes */
    "122": {
      id: 122,
      name: "User's study notes",
      fields: {
        "TITLE": "a55",  // Text
        "CONTENT": "a56",  // Textarea
      },
    },
  },
  rel: {
    /** One user can have one 110. user's extended profile */
    "111": { id: 111, name: "One user can have one 110. user's extended profile" },
    /** One user can have many related cared ones */
    "79": { id: 79, name: "One user can have many related cared ones" },
    /** One cared one can have many related 125. cared one's information cards */
    "126": { id: 126, name: "One cared one can have many related 125. cared one's information cards" },
    /** One cared one's information card can have many related cared one's emergency contact persons */
    "127": { id: 127, name: "One cared one's information card can have many related cared one's emergency contact persons" },
    /** One user can have many related user's calendar events */
    "129": { id: 129, name: "One user can have many related user's calendar events" },
    /** One user's calendar event can have many related invited users */
    "130": { id: 130, name: "One user's calendar event can have many related invited users" },
    /** One care task can have many related user's calendar events */
    "131": { id: 131, name: "One care task can have many related user's calendar events", fields: {
      "NAME": "a55",
      "DESCRIPTION": "a56",
      "GROUP_TYPE": "a57",  // {"b55":"Public","b56":"Private"}
      "JOIN_CODE": "a58",
      "STATUS": "a59",  // {"b55":"Active","b56":"No"}
    } },
    /** One care group can have many related 160. care group invites */
    "161": { id: 161, name: "One care group can have many related 160. care group invites" },
    /** One care group can have many related care group members */
    "72": { id: 72, name: "One care group can have many related care group members", fields: {
      "CARE_GROUP_S_MEMBER_DISPLAY_NAME": "a55",
      "CARE_GROUP_S_MEMBER_TYPES": "a56",  // {"b55":"nothing special","b56":"owner","b57":"admin"}
      "CARE_GROUP_S_MEMBER_ROLES": "a57",  // {"b55":"nothing special","b56":"cared one"}
      "CARE_GROUP_S_MEMBER_INVITATION_STATUS": "a58",  // {"b55":"accepted","b56":"pending"}
    } },
    /** One care group can have many related private member groups */
    "47": { id: 47, name: "One care group can have many related private member groups" },
    /** One care group's private member group can have related members */
    "75": { id: 75, name: "One care group's private member group can have related members", fields: {
      "CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_TYPES": "a55",  // {"b55":"nothing special","b56":"owner","b57":"admin"}
      "CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_INVITATION_STATUS": "a56",  // {"b55":"accepted","b56":"pending"}
    } },
    /** One care group can have many related not too special posts */
    "77": { id: 77, name: "One care group can have many related not too special posts" },
    /** One related not too special post can have many related care group's private member groups it's visible to */
    "103": { id: 103, name: "One related not too special post can have many related care group's private member groups it's visible to" },
    /** One related not too special post can have many related users it's visible to */
    "104": { id: 104, name: "One related not too special post can have many related users it's visible to" },
    /** One related not too special post can have many related comments */
    "78": { id: 78, name: "One related not too special post can have many related comments" },
    /** One care group can have many related 14. care group galleries */
    "46": { id: 46, name: "One care group can have many related 14. care group galleries" },
    /** One 162. care task can have many related cared ones */
    "141": { id: 141, name: "One 162. care task can have many related cared ones" },
    /** One 162. care task can have many related assigned caregivers */
    "108": { id: 108, name: "One 162. care task can have many related assigned caregivers", fields: {
      "ASSIGNED_CAREGIVER_STATUS": "a55",  // {"b55":"pending","b56":"accepted","b57":"rejected"}
    } },
    /** One care group can have many related 162. care tasks */
    "48": { id: 48, name: "One care group can have many related 162. care tasks" },
    /** One care task can have many related care group's private member groups it's visible to */
    "109": { id: 109, name: "One care task can have many related care group's private member groups it's visible to" },
    /** One 162. care task can have many related users it's only visible to */
    "81": { id: 81, name: "One 162. care task can have many related users it's only visible to" },
    /** One care task can have many related comments */
    "82": { id: 82, name: "One care task can have many related comments", fields: {
      "CHAT_TYPE": "a55",  // {"b55":"One to One","b56":"Many users","b57":"AI"}
      "CHAT_NAME": "a56",
      "AI_CHAT_MODE": "a57",
      "LAST_MESSAGE_AT": "a58",
    } },
    /** One care group can have one related group live chat conversation */
    "140": { id: 140, name: "One care group can have one related group live chat conversation" },
    /** One chat conversation can have many related chatters */
    "142": { id: 142, name: "One chat conversation can have many related chatters", fields: {
      "THE_USER_JOINED_THIS_CHAT_CONVERSATION_AT_THIS_TIME": "a55",
      "THE_USER_LAST_READ_THIS_CHAT_CONVERSATION_AT_THIS_TIME": "a56",
      "THE_USER_HAS_FUCKING_MUTED_THIS_CHAT": "a57",  // {"b55":"Yes","b56":"No"}
      "CHAT_MESSAGE_CONTENT": "a55",
      "CHAT_MESSAGE_TYPE": "a56",  // {"b55":"Text","b56":"Image","b57":"AI","b58":"System message","b59":"Price card"}
    } },
    /** One chat conversation can have many related chat messages */
    "143": { id: 143, name: "One chat conversation can have many related chat messages" },
    /** One chat message can have one parent chat message it is specifically replying to */
    "144": { id: 144, name: "One chat message can have one parent chat message it is specifically replying to" },
    /** One user can have many related notifications to receive */
    "148": { id: 148, name: "One user can have many related notifications to receive" },
    /** One user can have many related notification tokens */
    "149": { id: 149, name: "One user can have many related notification tokens" },
    /** One cared one can have many related cared one's medicine schedules */
    "83": { id: 83, name: "One cared one can have many related cared one's medicine schedules" },
    /** One cared one's medicine schedule can have many related care one's medicine logs */
    "121": { id: 121, name: "One cared one's medicine schedule can have many related care one's medicine logs" },
    /** One cared one can have many related cared one's checkin schedules */
    "145": { id: 145, name: "One cared one can have many related cared one's checkin schedules" },
    /** One cared one's checkin schedule can have many related care one's checkin logs */
    "151": { id: 151, name: "One cared one's checkin schedule can have many related care one's checkin logs" },
    /** One cared one can have many related cared one's care notes */
    "92": { id: 92, name: "One cared one can have many related cared one's care notes" },
    /** One cared one can have many related cared one's care tips */
    "88": { id: 88, name: "One cared one can have many related cared one's care tips" },
    /** One cared one can have many related cared one's care plans */
    "97": { id: 97, name: "One cared one can have many related cared one's care plans" },
    /** One cared one can have many related cared one's emergency contact persons */
    "63": { id: 63, name: "One cared one can have many related cared one's emergency contact persons" },
    /** One cared one can have many related cared one's care documents */
    "95": { id: 95, name: "One cared one can have many related cared one's care documents" },
    /** One user can have many related current location snapshots */
    "117": { id: 117, name: "One user can have many related current location snapshots", fields: {
      "USER_TYPE": "a55",  // {"b55":"Not someone special","b56":"Cared one"}
    } },
    /** One user can have many related safe zones */
    "118": { id: 118, name: "One user can have many related safe zones" },
    /** One care facility can have many related facility members */
    "107": { id: 107, name: "One care facility can have many related facility members", fields: {
      "FACILITY_MEMBER_TYPE": "a55",  // {"b55":"nothing special","b56":"owner","b57":"admin"}
      "FACILITY_MEMBER_ROLE": "a56",
    } },
    /** One care facility can have many related reviews — CCT 64 → CCT 65 */
    "66": { id: 66, name: "One care facility can have many related reviews — CCT 64 → CCT 65" },
    /** One review can have many related comments — CCT 65 → CCT 67 (Comment), 1:M */
    "68": { id: 68, name: "One review can have many related comments — CCT 65 → CCT 67 (Comment), 1:M" },
    /** One comment can have many related comments — 子评论 */
    "69": { id: 69, name: "One comment can have many related comments — 子评论" },
    /** One care community post can have many related comments — CCT 70 → CCT 67 (1:M) */
    "71": { id: 71, name: "One care community post can have many related comments — CCT 70 → CCT 67 (1:M)" },
    /** One user can have many related finished ChallengeD learn content */
    "157": { id: 157, name: "One user can have many related finished ChallengeD learn content", fields: {
      "USER_HAS_FINISHED_LEARNING_THIS_LESSON": "a55",  // {"b55":"Yes","b56":"No"}
    } },
    /** One Challenged App Content can have many related user's study notes */
    "158": { id: 158, name: "One Challenged App Content can have many related user's study notes" },
    /** One Challenged App Content can have many related cared one's care tips */
    "159": { id: 159, name: "One Challenged App Content can have many related cared one's care tips" },
  },
} as const;

// Convenience: get the opaque option code for an option label, per field.
export function optionCode(ctx: { ccts?: keyof typeof WP.cct; rel?: keyof typeof WP.rel }, _fieldKey: string, _optionLabel: string): string | null {
  // Look-ups happen at call-site using the inline maps in this file.
  return null;
}
