# WordPress JetEngine Schema — Source of Truth

Auto-extracted via /jet-engine/v2/get-content-types and /get-relations on careconnected subsite.
**47 CCTs, 58 relations.**

## CCT Field Mappings

### `activity_log` — Activity Log (id 25)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `cared_one_id` | Cared one id | number |  |
| `user_id` | User id | number |  |
| `activity_type` | Activity type | select |  |
| `title` | Title | text |  |
| `description` | Description | textarea |  |
| `duration_minutes` | Duration minutes | number |  |
| `activity_date` | Activity date | datetime |  |

### `care_community_post` — 70. Care community post (id 70)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Title | text |  |
| `a56` | Content | textarea |  |
| `a57` | Language | radio | b55→English; b56→Simplified Chinese |
| `a58` | app area | checkbox | b55→Global English; b56→China |
| `a59` | Care community post category | checkbox | b55→Discussion; b56→Article |

### `care_document` — 23. Cared one's care document (id 23)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Name | text |  |
| `a56` | Content | textarea |  |

### `care_facility` — 64. Care Facility (id 64)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | name | text |  |
| `a56` | detail | textarea |  |
| `a57` | Care facility type | checkbox | b55→Adult Day Care; b56→Assisted living; b57→Home Care; b58→Hospice; b59→Independent living; b60→Memory care; b61→Nursing homes; b62→Residential care homes; b63→Senior Apartments |
| `a58` | Care facility can care for dementia stage | checkbox | b55→Early-stage; b56→Middle-stage; b57→Late-stage |
| `a59` | Care facility room type | checkbox | b55→Studio; b56→One Bed Room; b57→Two Bed Room; b58→More Than Two Bed Room |
| `a60` | Care facility provides room facility | text | b55→Balcony; b56→Toilet; b57→Kitchen |
| `a61` | Care facility provides community facility | text | b55→swimming pool; b56→active lifestyle; b57→entertainment venue; b58→laundry |
| `a62` | Care facility people number | text | b55→Less than 5; b56→5-20; b57→20-50; b58→More than 50 |
| `a63` | location | text |  |
| `a64` | address | text |  |

### `care_group` — 9. Care Group (id 9)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Name | text |  |
| `a56` | Description | textarea |  |
| `a57` | Group type | radio | b55→Public; b56→Private |
| `a58` | Join code | text |  |
| `a59` | Status | radio | b55→Active; b56→No |

### `care_group_gallery` — 14. Care Group Gallery (id 14)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Image | media |  |
| `a56` | Image description | textarea |  |
| `a57` | Taken at | datetime-local |  |

### `care_group_invite` — 160. Care group invite (id 160)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Token | text |  |
| `a56` | Name | text |  |
| `a57` | Expires_at | datetime-local |  |
| `a58` | Max_uses | number |  |
| `a59` | Use count | number |  |
| `a60` | Is revoked | switcher |  |

### `care_group_not_too_special_post` — 76. The related not too special posts of one care group (id 76)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | type | checkbox |  |
| `a56` | title | text |  |
| `a57` | content | text |  |
| `a58` | is pinned | radio | b55→Yes; b56→No |
| `a59` | scheduled at | datetime-local |  |

### `care_group_private_member_group` — 74. The related private member groups of one care group (id 74)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | name | text |  |
| `a56` | description | textarea |  |
| `a57` | color | colorpicker |  |

### `care_job` — 139. Care Job (id 139)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | title | text |  |
| `a56` | description | textarea |  |
| `a57` | Due date | datetime-local |  |
| `a58` | Completed at | datetime-local |  |
| `a59` | Status | radio | b55→pending; b56→in progress; b57→completed |

### `care_note` — 22. Cared one’s care note (id 22)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Title | text |  |
| `a56` | Content | textarea |  |

### `care_plan` — 20. Cared one's care plan (id 20)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Title | text |  |
| `a56` | Content | textarea |  |
| `a57` | Is pinned | radio | b55→Yes; b56→No |

### `care_plan_goal` — Care Plan Goal (id 21)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `care_plan_id` | Care plan id | number |  |
| `title` | Title | text |  |
| `status` | Status | select |  |
| `sort_order` | Sort order | number |  |

### `care_task_real` — 162. Care Task (id 162)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Title | text |  |
| `a56` | Description | textarea |  |
| `a57` | Task type | checkbox | b55→Preparing Meals; b56→Giving Rides; b57→Shopping; b58→Childcare; b59→Visits; b60→Coverage; b61→Medications & Medical Care; b62→Miscellaneous; b63→Occasions |
| `a58` | People needed | number |  |
| `a59` | Location | text |  |
| `a60` | Photo | text |  |
| `a61` | Date of the task | date |  |
| `a62` | Task start time | datetime-local |  |
| `a63` | Task end time | datetime-local |  |
| `a64` | Task completed at | datetime-local |  |
| `a65` | Task help status | radio | b55→Task doesn't need help; b56→Task needs help; b57→Task has found help |
| `a66` | Task finish status | radio | b55→Not finished; b56→Finished |

### `care_tip` — 19. Cared one's care tip (id 19)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Title | text |  |
| `a56` | Content | textarea |  |
| `a57` | Category | radio | b55→tip; b56→avoid |
| `a58` | Is pinned | radio | b55→Yes; b56→No |

### `cared_ones_informat` — 125. Cared one’s information card (id 125)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Cared one’s name | text |  |
| `a56` | Cared one’s description | textarea |  |
| `a57` | Cared one’s information card name | text |  |
| `a58` | Status | radio | b55→Draft; b56→Active; b57→Paused |
| `a59` | Displays location | radio | b55→Yes; b56→No |
| `a60` | Share token | text |  |
| `a61` | Share expires at | datetime-local |  |
| `a62` | Share visibility | radio | b55→Visible to public; b56→Visible to the care group of the cared one; b57→Visible to caregivers of the cared one; b58→Visible to author |

### `caregiver_wellness_log` — Caregiver Wellness Log (id 101)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `moodmood` | Mood | text |  |
| `stress_levelstress_level` | Stress Level | text |  |
| `notesnotes` | Notes | text |  |
| `logged_atlogged_at` | Logged At | text |  |

### `cc_vote` — Vote (id 33)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `entity_type` | Entity type | select |  |
| `entity_id` | Entity id | number |  |
| `user_id` | User id | number |  |
| `vote_type` | Vote type | select |  |

### `challenged_content` — 100. Challenged App Content (id 100)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Title | text |  |
| `a56` | Content | textarea |  |
| `a57` | Language | radio | b55→English; b56→Simplified Chinese |
| `a58` | app area | checkbox | b55→Global English; b56→China |
| `a59` | App content type | radio | b55→Learn; b56→Care and accompany tips; b57→Find tips |
| `a60` | Learn module number | number |  |
| `a61` | Learn lesson number | number |  |
| `a62` | Care and accompany tips category | radio | b55→Eating and drinking; b56→Toileting and continence; b57→Memory loss; b58→Aggression; b59→Depression, anxiety and apathy; b60→Difficulty sleeping; b61→Delusions and hallucinations; b62→Repetitive behaviour; b63→Changes in judgement |
| `a63` | Find tips category | radio | b55→Wondering; b56→Getting lost; b57→Unwilling to return home |

### `chat_conversation` — 26. Chat Conversation (id 26)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Chat type | radio | b55→One to One; b56→Many users; b57→AI |
| `a56` | Chat name | text |  |
| `a57` | AI chat mode | text |  |
| `a58` | Last message at | datetime-local |  |

### `chat_message` — 27. Chat Message (id 27)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Chat message content | text |  |
| `a56` | Chat message type | radio | b55→Text; b56→Image; b57→AI; b58→System message; b59→Price card |

### `checkin_log` — 17. Checkin log (id 17)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Status | radio | b55→Checked; b56→Skipped; b57→Missed |
| `a56` | Note | textarea |  |
| `a57` | Checked by AI | radio | b55→Yes; b56→No |

### `checkin_schedule` — 138. Checkin schedule (id 138)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Name | text |  |
| `a56` | Detail | text |  |
| `a57` | Frequency | text |  |
| `a58` | Time slot | textarea |  |
| `a59` | Instructions | text |  |
| `a60` | Start date | date |  |
| `a61` | Is active | radio | b55→Yes; b56→No |
| `a62` | Note | textarea |  |

### `comment` — 67. Comment (id 67)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | title | text |  |
| `a56` | content | textarea |  |

### `current_location` — 112. The current location of one user (id 112)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Latitude | text |  |
| `a56` | Longitude | text |  |
| `a57` | Accuracy meters | text |  |
| `a58` | Altitude meters | text |  |
| `a59` | Heading degrees | text |  |
| `a60` | Speed | text |  |
| `a61` | Is moving | text |  |
| `a62` | Moving type | text |  |
| `a63` | Platform | text |  |
| `a64` | Battery level | text |  |
| `a65` | Phone is charing | text |  |
| `a66` | Address text | text |  |
| `a67` | Captured at | datetime-local |  |
| `a68` | Is so much of an emergency that we don’t bother to ask for the cared one’s permission | radio | b55→Yes; b56→No |

### `emergency_contact` — 24. Cared one’s emergency contact person (id 24)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Name | text |  |
| `a56` | Content | textarea |  |
| `a57` | Phone | text |  |
| `a58` | Address | text |  |
| `a59` | Relationship | text |  |
| `a60` | Note | text |  |

### `health_vital` — Health Vital (id 18)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `cared_one_id` | Cared one id | number |  |
| `vital_type` | Vital type | select |  |
| `vital_value` | Vital value | text |  |
| `vital_unit` | Vital unit | text |  |
| `recorded_by_user_id` | Recorded by user id | number |  |
| `recorded_date` | Recorded date | datetime |  |
| `note` | Note | textarea |  |

### `job_application` — Job Application (id 30)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `job_posting_id` | Job posting id | number |  |
| `applicant_user_id` | Applicant user id | number |  |
| `cover_message` | Cover message | textarea |  |
| `status` | Status | select |  |
| `reviewed_by_user_id` | Reviewed by user id | number |  |

### `job_posting` — Job Posting (id 29)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `care_group_id` | Care group id | number |  |
| `posted_by_user_id` | Posted by user id | number |  |
| `title` | Title | text |  |
| `description` | Description | textarea |  |
| `care_type` | Care type | select |  |
| `location` | Location | text |  |
| `budget` | Budget | text |  |
| `schedule` | Schedule | text |  |
| `special_needs` | Special needs | textarea |  |
| `children_ages` | Children ages | text |  |
| `start_date` | Start date | date |  |
| `status` | Status | select |  |
| `app_area` | app_area | text |  |
| `language` | language | text |  |

### `location_request` — Location Request (id 133)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `requester_id` | Requester id | text |  |
| `target_user_id` | Target user id | text |  |
| `status` | Status | select |  |
| `message` | Message | textarea |  |
| `type` | Type | text |  |

### `medicine` — 15. Medicine schedule (id 15)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Name | text |  |
| `a56` | Dosage | text |  |
| `a57` | Frequency | text |  |
| `a58` | Time slot | textarea |  |
| `a59` | Instructions | textarea |  |
| `a60` | Prescribing doctor | text |  |
| `a61` | Pharmacy | text |  |
| `a62` | Side effects | textarea |  |
| `a63` | Start date | date |  |
| `a64` | End date | date |  |
| `a65` | Is active | radio | b55→Yes; b56→No |
| `a66` | Note | textarea |  |
| `a67` | Stock count | number |  |
| `a68` | Refill threshold | number |  |

### `medicine_log` — 16. Medicine log (id 16)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Status | radio | b55→Taken; b56→Skipped; b57→Missed |
| `a56` | Note | textarea |  |

### `notification` — 146. Notification (id 146)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Notification type | radio | b55→User chat; b56→Booking; b57→System; b58→Location alert |
| `a56` | Notification title | text |  |
| `a57` | Notification content | textarea |  |
| `a58` | Action url | text |  |
| `a59` | Notification is read | radio | b55→Yes; b56→No |

### `one_care_facility_facility_members` — 107. One care facility can have many related facility members (id 107)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Facility member type | checkbox |  |
| `a56` | Facility member role | text |  |

### `one_care_task_assigned_caregivers` — 108. One 162. care task can have many related assigned caregivers (id 108)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Assigned caregiver status | radio |  |

### `one_chat_conversation_chatters` — 142. One chat conversation can have many related chatters (id 142)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | The user joined this chat conversation at this time | datetime-local |  |
| `a56` | The user last read this chat conversation at this time | datetime-local |  |
| `a57` | The user has fucking muted this chat | radio |  |

### `one_user_current_location_snapshots` — 117. One user can have many related current location snapshots (id 117)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | User type | radio |  |

### `one_user_finished_learn_content` — 157. One user can many related finished ChallengeD learn content (id 157)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | User has finished learning this lesson | radio |  |

### `ownership_claim` — Ownership Claim (id 136)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `entity_id` | Entity id | text |  |
| `user_id` | User id | text |  |
| `claim` | Claim | textarea |  |
| `status` | Status | select |  |

### `ownership_dispute` — Ownership Dispute (id 137)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `entity_id` | Entity id | text |  |
| `user_id` | User id | text |  |
| `claim` | Claim | textarea |  |
| `status` | Status | select |  |
| `reject_reason` | Reject reason | textarea |  |

### `review` — 65. Review (id 65)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | title | text |  |
| `a56` | content | textarea |  |
| `a57` | rating | number |  |

### `safe_zone` — 116. Safe Zone (id 116)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Zone type | radio | b55→Safe; b56→Danger |
| `a56` | Shape type | radio | b55→Radius; b56→Polygon |
| `a57` | Custom name | text |  |
| `a58` | Custom description | text |  |
| `a59` | Custom color | colorpicker |  |
| `a60` | Latitude | text |  |
| `a61` | Longitude | text |  |
| `a62` | Radius meters | number |  |
| `a63` | Polygon points | textarea |  |
| `a64` | Notify on enter | radio | b55→Off; b56→On |
| `a65` | Notify on exit | radio | b55→Off; b56→On |
| `a66` | Schedule enabled | radio | b55→Off; b56→On |
| `a67` | Schedule start time | datetime-local |  |
| `a68` | Schedule end time | datetime-local |  |
| `a69` | Is active | radio | b55→Yes; b56→No |

### `safe_zone_alert` — Safe Zone Alert (id 134)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `user_id` | User id | text |  |
| `safe_zone_id` | Safe zone id | text |  |
| `alert_type` | Alert type | select |  |
| `latitude` | Latitude | text |  |
| `longitude` | Longitude | text |  |
| `message` | Message | textarea |  |
| `is_read` | Is read | checkbox |  |
| `acknowledged_at` | Acknowledged at | datetime |  |

### `users_calendar_even` — 128. User’s calendar event (id 128)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Title | text |  |
| `a56` | Description | textarea |  |
| `a57` | Start at | datetime-local |  |
| `a58` | End at | datetime-local |  |
| `a59` | All day | checkbox |  |
| `a60` | Event type | text |  |
| `a61` | Location | text |  |
| `a62` | Timezone | text |  |
| `a63` | Status | select | b55→confirmed; b56→tentative; b57→cancelled |
| `a64` | Priority | select | b55→normal; b56→low; b57→normal; b58→high; b59→urgent |
| `a65` | Color | colorpicker |  |
| `a66` | RRULE | text |  |
| `a67` | RRULE Until | datetime-local |  |
| `a68` | EXDATES | textarea |  |
| `a69` | RDATES | textarea |  |
| `a70` | Recurrence ID | text |  |
| `a71` | Show as | select | b55→busy; b56→free; b57→tentative; b58→oof |
| `a72` | Visibility | select | b55→default; b56→public; b57→private; b58→confidential |
| `a73` | Reminders | textarea |  |
| `a74` | Is availability | radio | b55→Yes; b56→No |
| `a75` | Availability note | text |  |
| `a76` | RSVP required | radio | b55→Yes; b56→No |
| `a77` | Allow comments | radio | b55→Yes; b56→No |
| `a78` | External source | select | b55→internal; b56→google; b57→outlook; b58→apple |
| `a79` | iCal UID | text |  |
| `a80` | Sequence | text |  |
| `a81` | ETag | text |  |
| `a82` | Google Event ID | text |  |
| `a83` | Meeting URL | text |  |
| `a84` | Attachments | textarea |  |
| `a85` | Last sync at | datetime-local |  |
| `a86` | Sync token | text |  |
| `a87` | Geo Lat | text |  |
| `a88` | Geo Lng | text |  |
| `a89` | Tags | text |  |
| `a90` | Custom data | textarea |  |

### `users_extended_prof` — 110. User‘s extended profile (id 110)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Allow emergency location request | radio | b55→Yes; b56→No |
| `a56` | Location share is on | radio | b55→Yes; b56→No |
| `a57` | Notification preference | text |  |
| `a58` | General user role | checkbox | b55→cared one; b56→caring one |
| `a59` | Is care provider | radio | b55→Yes; b56→No |
| `a60` | Care provider is active | radio | b55→Yes; b56→No |
| `a61` | Care provider is background checked | radio | b55→Yes; b56→No |
| `a62` | Care provider’s background check detail | text |  |
| `a63` | Care provider’s cancellation policy | text |  |
| `a64` | Care provider’s service area | text |  |
| `a65` | Care provider’s starts hourly rate | number |  |
| `a66` | Care provider offers in-person service | radio | b55→Yes; b56→No |
| `a67` | Care provider offers virtual service | radio | b55→Yes; b56→No |
| `a68` | Care provider offers care service general type | checkbox | b55→Pet care and companion; b56→Child care and companion; b57→Adult care and companion; b58→Elderly care and companion; b59→Tutoring; b60→Dementia care and companion; b61→Housekeeping; b62→Errand; b63→Transportation; b64→Medical Escort; b65→In-person checkin; b66→Remote checkin and medicine supervision |
| `a69` | Care provider offers pet care for | checkbox | b55→Dogs; b56→Cats; b57→Small mammals; b58→Birds; b59→Fish |
| `a70` | Care provider offers dementia care type | checkbox | b55→In-person day care; b56→In-person overnight care; b57→In-person companion; b58→In-person checkin; b59→Household help; b60→Remote companion; b61→Remote medicine management; b62→Remote checkin |
| `a71` | Care provider offers elderly care service | text |  |
| `a72` | Care provider offers special needs care service | checkbox |  |
| `a73` | Care provider offers household help service | checkbox | b55→Housekeeping; b56→Gardening |
| `a74` | Care provider offers errand service | text |  |
| `a75` | Care provider offers transportation service | text |  |
| `a76` | Care provider offers medical escort service | text |  |
| `a77` | Care provider offers childcare service as | checkbox | b55→Babysitter; b56→Nanny; b57→Childminder |
| `a78` | Care provider offers childcare service | checkbox | b55→Cooking / Meal preparation; b56→Pick-up / Drop off; b57→Light housekeeping; b58→Activities (e.g. swimming; b59→Putting kids to bed; b60→Homework help; b61→Bathing; b62→Virtual Care |
| `a79` | Care provider offers dog care service type | checkbox | b55→Dog sitting; b56→Dog walking; b57→Dog feeding; b58→Dog day care; b59→Dog transportation; b60→Dog overnight sitting; b61→Dog training; b62→Dog grooming |
| `a80` | Care provider offers cat care service | checkbox | b55→Cat sitting; b56→Cat walking; b57→Cat feeding; b58→Cat day care; b59→Cat transportation; b60→Cat overnight sitting; b61→Cat training; b62→Cat grooming |
| `a81` | Care provider offers small mammal care service type | text |  |
| `a82` | Care provider offers bird care service | text |  |
| `a83` | Care provider offers fish care service | text |  |
| `a84` | Care provider is a doctor and offers care tip consultancy | text |  |
| `a85` | Care provider is a doctor and offers accompany tip consultancy | text |  |
| `a86` | Care provides can drive | radio | b55→Yes; b56→No |
| `a87` | Care provides has own transportation | radio | b55→Yes; b56→No |
| `a88` | Care provider is a Non-smoker | radio | b55→Yes; b56→No |
| `a89` | Care provider is experienced with | checkbox | b55→Newborn (up to 12 months; b56→Toddler (1-3 years; b57→Early School Age (4-6 years; b58→Primary school age (7-12 years; b59→Teenager (12+ years; b60→Twins/Multiples; b61→Special Needs Children |
| `a90` | Cared one’s AI system prompt | text |  |
| `a91` | User enabled push notification | radio | b55→Yes; b56→No |
| `a92` | User enabled email notification | radio | b55→Yes; b56→No |
| `a93` | User enabled sms notification | radio | b55→Yes; b56→No |

### `users_notification_` — 147. User’s notification token (id 147)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Endpoint or token | text |  |
| `a56` | Notification provider | radio | b55→Web push notification; b56→Firebase FCM; b57→Apple APN; b58→J Push; b59→WeChat |
| `a57` | Device label | text |  |
| `a58` | Auth Key | text |  |
| `a59` | P256dh | text |  |
| `a60` | Is active | radio | b55→Yes; b56→No |

### `users_study_notes` — 122. User’s study notes (id 122)
| Code | Label | Type | Options (key→label) |
|------|-------|------|---------------------|
| `a55` | Title | text |  |
| `a56` | Content | textarea |  |

## Relations
| ID | Type | Parent | Child | Name |
|----|------|--------|-------|------|
| 41 | one_to_many | mix::users | cct::job_posting |  |
| 42 | one_to_many | mix::users | cct::job_application |  |
| 46 | one_to_many | cct::care_group | cct::care_group_gallery | 46. One care group can many related 14. care group galleries |
| 47 | one_to_many | cct::care_group | cct::care_group_private_member_group | 47. One care group can have many related private member groups |
| 48 | one_to_many | cct::care_group | cct::care_task_real | 48. One care group can have many related 162. care tasks |
| 54 | one_to_many | cct::care_plan | cct::medicine |  |
| 63 | one_to_many | mix::users | cct::emergency_contact | 63. One cared one can have many related cared one’s emergency contact persons |
| 66 | one_to_many | cct::care_facility | cct::review | 66. One care facility can have many related reviews |
| 68 | one_to_many | cct::review | cct::comment | 68. One review can have many related comments |
| 69 | many_to_many | cct::comment | cct::comment | 69. One comment can have many related comments |
| 71 | one_to_many | cct::care_community_post | cct::comment | 71. One care community post can have many related comments |
| 72 | many_to_many | cct::care_group | mix::users | 72. One care group can have many related care group members |
| 75 | many_to_many | cct::care_group_private_member_group | mix::users | 75. One care group’s private member group can have related members |
| 77 | one_to_many | cct::care_group | cct::care_group_not_too_special_post | 77. One care group can have many related not too special posts |
| 78 | one_to_many | cct::care_group_not_too_special_post | cct::comment | 78. One related not too special posts of one care group can have many related comments |
| 79 | many_to_many | mix::users | mix::users | 79. One user can have many related cared ones |
| 81 | one_to_many | cct::care_task_real | mix::users | 81. One 162. care task can have many related users that it’s only visible to |
| 82 | one_to_many | cct::care_task_real | cct::comment | 82. One 162. care task can have many related comments |
| 83 | one_to_many | mix::users | cct::medicine | 83. One cared one can have many related cared one’s medicine schedules |
| 88 | one_to_many | mix::users | cct::care_tip | 88. One cared one can have many related cared one’s care tips |
| 92 | one_to_many | mix::users | cct::care_note | 92. One cared one can have many related cared one’s care notes |
| 94 | one_to_many | mix::users | cct::activity_log |  |
| 95 | one_to_many | mix::users | cct::care_document | 95. One cared one can have many related cared one’s care documents |
| 96 | one_to_many | mix::users | cct::health_vital |  |
| 97 | one_to_many | mix::users | cct::care_plan | 97. One cared one can have many related cared one’s care plans |
| 103 | many_to_many | cct::care_group_not_too_special_post | cct::care_group_private_member_group | 103. One related not too special posts of one care group can have many related care group’s private member groups that it’s visible to |
| 104 | many_to_many | cct::care_group_not_too_special_post | mix::users | 104. One related not too special posts of one care group can have many related users that it’s visible to |
| 109 | many_to_many | cct::care_task_real | cct::care_group_private_member_group | 109. One 162. care task can have many related care group’s private member groups that it’s visible to |
| 111 | one_to_one | mix::users | cct::users_extended_prof | 111. One user can have one 110. user’s extended profile |
| 118 | one_to_many | mix::users | cct::safe_zone | 118. One user can have many related safe zones |
| 121 | one_to_many | cct::medicine | cct::medicine_log | 121. One cared one’s medicine schedule can have many related care one’s medicine logs |
| 126 | one_to_many | mix::users | cct::cared_ones_informat | 126. One cared one can have many related 125. cared one’s information cards |
| 127 | one_to_many | cct::cared_ones_informat | cct::emergency_contact | 127. One cared one’s information card can have many related cared one’s emergency contact persons |
| 129 | one_to_many | mix::users | cct::users_calendar_even | 129. One user can have many related user’s calendar events |
| 130 | one_to_many | cct::users_calendar_even | mix::users | 130. One user’s calendar event can have many related invited users |
| 131 | one_to_many | cct::care_task_real | cct::users_calendar_even | 131. One care task can have many related user’s calendar events |
| 140 | one_to_one | cct::care_group | cct::chat_conversation | 140. One care group can have one related group live chat conversation |
| 141 | one_to_many | cct::care_task_real | mix::users | 141. One 162. care task can have many related cared ones |
| 143 | one_to_many | cct::chat_conversation | cct::chat_message | 143. One chat conversation can have many related chat messages |
| 144 | one_to_many | cct::chat_message | cct::chat_message | 144. One chat message can have one parent chat message that it is specifically replying to |
| 145 | one_to_many | mix::users | posts::post | 145. One cared one can have many related cared one’s checkin schedules |
| 148 | one_to_many | mix::users | cct::notification | 148. One user can have many related notifications to receive |
| 149 | one_to_many | mix::users | cct::users_notification_ | 149. One user can have many related notification tokens |
| 150 | one_to_many | mix::users | cct::checkin_schedule | 150. One cared one can have many related cared one’s checkin schedules |
| 151 | one_to_many | cct::checkin_schedule | cct::checkin_log | 151. One cared one’s checkin schedule can have many related care one’s checkin logs |
| 152 | one_to_many | cct::care_job | mix::users | 152. One care job can have many related cared ones |
| 153 | one_to_many | cct::care_job | mix::users | 153. One care job can have many assigned caregivers |
| 154 | one_to_many | cct::care_group | cct::care_job | 154. One care group can have many related care jobs |
| 155 | many_to_many | cct::care_job | cct::universal_care_task | 155. One care job can have many related care tasks |
| 156 | one_to_many | cct::care_job | cct::comment | 156. One care job can have many related comments |
| 158 | one_to_many | cct::challenged_content | cct::users_study_notes | 158. One Challenged App Content can have many related user’s study notes |
| 159 | one_to_many | cct::challenged_content | cct::care_tip | 159. One Challenged App Content can have many related cared one’s care tips |
| 161 | one_to_many | cct::care_group | cct::care_group_invite | 161. One care group can many related 160. care group invites |
| 163 | one_to_many | cct::care_facility | mix::users | 107. One care facility can have many related facility members |
| 164 | one_to_many | cct::care_task_real | mix::users | 108. One 162. care task can have many related assigned caregivers |
| 165 | one_to_many | mix::users | cct::current_location | 117. One user can have many related current location snapshots |
| 166 | many_to_many | cct::chat_conversation | mix::users | 142. One chat conversation can have many related chatters |
| 167 | one_to_many | mix::users | cct::challenged_content | 157. One user can many related finished ChallengeD learn content |