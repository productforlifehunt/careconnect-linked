# Location note update — 2026-11-11

## Scope and verification

- Read the complete current CCT324 catalogue: 10,604 rows.
- Updated 618 existing unlocked notes selected by location feature/component bindings, location-specific titles, or existing CCT327/REL330 references. Unrelated commerce addresses and Afresh high-risk-place features are excluded.
- Immediate API readback: 618/618 exact bodies.
- Independent full-catalogue readback: 618/618 exact bodies; zero untargeted body changes; all titles and a59 position bindings unchanged.
- Locked notes #10658, #6861, #6859 and #6856: exact unchanged bodies.
- JetEngine normalized empty a65/a66 representations on 605 rows; all remain empty, no lock or to-do switch enabled.
- Existing REL325 catalogue was read before/after; no relation writes were performed.
- No app behavior, plugin setting, schema, test account or deployment changed in this request. No new runtime tests claimed.

## Newly added structures to record

### CCT327 — Location bubble (`location_bubble`)

| Field | Meaning | GUI type |
|---|---|---|
| a55 | Bubble center latitude | Text |
| a56 | Bubble center longitude | Text |
| a57 | Radius in meters | Number |
| a58 | Starts at, ISO UTC | Text |
| a59 | Ends at, ISO UTC | Text |
| a60 | Status: b55 active; b56 creator/exit ended; b57 burst/emergency | Radio |

### Existing CCT199 — added field

- a60: Members can use bubbles, Radio; b55 yes / b56 no; empty currently treated as yes.

### JetEngine relations

- REL328: parent Users → child CCT327; one-to-many; bubble creator.
- REL329: parent CCT199 → child CCT327; one-to-many; bubble circle.
- REL330: parent Users → child CCT199; many-to-many; row exists = sharing paused for this circle; restore disconnects the row. No extra fields.

No additional CCT258 fields: existing a55 emergency permission and a56 live sharing are reused. Existing CCT213/REL247 snapshots, CCT214/REL248 zones and CCT185/REL188 notifications remain in use. Location check-in and low battery need no new table. REL290 location alert recipients is unchanged.

## Important corrected descriptions

- `/find` Me check-in reads local coordinates and sends notifications, without saving a position snapshot. GPSTracking check-in also writes a snapshot.
- `/find` My groups filters paused people per selected circle; REL219 My people is not removed by a circle pause. Combined circle map permits visibility through another unpaused shared circle.
- Bubble masks are client-side display transformations, not proof that direct WordPress API consumers cannot obtain exact coordinates. Relationship-read catches remain an unverified privacy gap; notes do not claim all failure paths are protected.
- Expiry stops considering the bubble active on reads; leaving its area ends it on the owner's next position update. Emergency updates trigger bursting.
- Battery warning depends on supported device battery readings and local deduplication, not a background scheduler. Real-device low-battery acceptance remains unverified.
- Existing test evidence covers the test1 pause/hide/restore flow in challenged's My groups page, not every group-location surface.

## Version evidence

Source baseline and locally recorded Draftbit ref: c2c81c4f. Remote Draftbit revision not fetched or independently confirmed. Project: c85459d8-8acf-4fc5-a8e4-d5448f6ae818.
## Updated record IDs (618)

10643, 10642, 10641, 10640, 10639, 10638, 10637, 10636, 10598, 10584, 10583, 10550, 10549, 10548, 10547, 10522, 10521, 10520, 10519, 10507, 10496, 10495, 10494, 10487, 10409, 10408, 8389, 8384, 8378, 8373, 8370, 8369, 8368, 8367, 8366, 8365, 8364, 8363, 8074, 8073, 8072, 8071, 8070, 8069, 8068, 8067, 7781, 7780, 7779, 7778, 7777, 7776, 7545, 6866, 6535, 6534, 6529, 6528, 6520, 6510, 6500, 6493, 6485, 6483, 6465, 6457, 6445, 6419, 6396, 6334, 6328, 6308, 6296, 6295, 6285, 6277, 6270, 6264, 6261, 6256, 6251, 6236, 6230, 6223, 6215, 6212, 6186, 6183, 6167, 6166, 6163, 6157, 6151, 6131, 6061, 5545, 5207, 5206, 5205, 5202, 5201, 5200, 5199, 5198, 5197, 5196, 5195, 5194, 5193, 5192, 5191, 5190, 5189, 5188, 5187, 5186, 5185, 5184, 5183, 5182, 5181, 5180, 5179, 5178, 5174, 4219, 3827, 3771, 3770, 3767, 3766, 3391, 3276, 3121, 3119, 3110, 3109, 3106, 2985, 2980, 1246, 1245, 1242, 1239, 1238, 1236, 1235, 1215, 1214, 1213, 1212, 1209, 1204, 1201, 1200, 1199, 1198, 1197, 1196, 1195, 1194, 1193, 1192, 1191, 1190, 1189, 1188, 1187, 1184, 1153, 1152, 1151, 1150, 1149, 1148, 1147, 1146, 1145, 1144, 1143, 1142, 1141, 1140, 1139, 1138, 1105, 1104, 1103, 1102, 1101, 1100, 1099, 1098, 1097, 1096, 1095, 1094, 1093, 1092, 1091, 1086, 1057, 1056, 1055, 1053, 1052, 1051, 1050, 1048, 1047, 1046, 1044, 1033, 1025, 1023, 1021, 1016, 1009, 1008, 1007, 1006, 1004, 1001, 999, 997, 996, 995, 993, 992, 989, 986, 984, 981, 961, 960, 959, 958, 957, 956, 955, 954, 953, 952, 951, 950, 949, 948, 947, 946, 945, 944, 943, 942, 941, 940, 939, 938, 937, 936, 935, 934, 933, 932, 931, 930, 913, 912, 911, 910, 909, 908, 907, 906, 905, 904, 903, 902, 901, 900, 899, 898, 897, 896, 895, 894, 893, 892, 891, 890, 889, 888, 887, 886, 885, 884, 883, 882, 881, 880, 877, 874, 872, 871, 869, 867, 866, 863, 862, 860, 859, 858, 857, 853, 852, 850, 848, 847, 842, 841, 839, 838, 836, 832, 830, 829, 826, 825, 824, 823, 822, 821, 817, 816, 815, 809, 805, 800, 799, 797, 796, 795, 793, 792, 791, 788, 787, 786, 783, 781, 777, 776, 774, 772, 769, 768, 764, 760, 759, 757, 752, 751, 749, 746, 735, 733, 731, 729, 728, 726, 724, 723, 720, 715, 714, 713, 712, 711, 710, 709, 706, 440, 439, 438, 435, 434, 433, 432, 431, 430, 429, 428, 427, 426, 425, 424, 423, 422, 421, 420, 419, 418, 417, 416, 415, 414, 413, 412, 411, 410, 409, 408, 407, 406, 405, 404, 403, 402, 401, 400, 399, 398, 397, 396, 395, 394, 393, 392, 391, 390, 389, 388, 387, 386, 385, 384, 383, 382, 381, 380, 379, 378, 377, 376, 375, 374, 373, 372, 371, 370, 369, 368, 367, 366, 365, 364, 363, 362, 361, 360, 359, 358, 357, 356, 355, 354, 353, 352, 351, 350, 349, 348, 347, 346, 345, 344, 343, 342, 341, 340, 339, 338, 337, 336, 335, 334, 333, 332, 331, 330, 329, 328, 327, 326, 325, 324, 323, 322, 321, 320, 319, 318, 317, 316, 315, 314, 313, 312, 311, 310, 309, 308, 307, 306, 305, 304, 303, 302, 301, 300, 299, 298, 297, 296, 295, 294, 293, 292, 291, 290, 289, 288, 287, 286, 285, 284, 283, 282, 281, 280, 279, 278, 277, 276, 275, 274, 273, 272, 271, 270, 269, 268, 267, 266, 265, 264, 263, 262, 261, 260, 259, 258, 257, 256, 255, 254, 253, 252, 251, 250, 249, 248, 247, 246, 245, 244, 243, 242, 241, 240, 239, 238, 237, 236, 235, 234, 233, 232, 231, 230, 229, 228, 227, 226, 225, 224, 223, 222, 221, 220, 219, 218, 217, 216, 215, 214, 213, 212, 211, 210, 209, 208, 207, 206, 205, 204, 203, 202, 196
