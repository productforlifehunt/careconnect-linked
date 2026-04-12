#!/usr/bin/env python3
"""
Generate the canonical CPT UI JSON for the CareConnected subsite
and import it via the CPT UI tools page.
"""
import json

def cpt(name, label, singular, description, supports=None):
    if supports is None:
        supports = ["title", "editor", "thumbnail", "custom-fields"]
    return {
        "name": name,
        "label": label,
        "singular_label": singular,
        "description": description,
        "public": "true",
        "publicly_queryable": "true",
        "show_ui": "true",
        "show_in_nav_menus": "true",
        "delete_with_user": "false",
        "show_in_rest": "true",
        "rest_base": "",
        "rest_controller_class": "",
        "rest_namespace": "",
        "has_archive": "false",
        "has_archive_string": "",
        "exclude_from_search": "false",
        "capability_type": "post",
        "hierarchical": "false",
        "can_export": "true",
        "rewrite": "true",
        "rewrite_slug": "",
        "rewrite_withfront": "true",
        "query_var": "true",
        "query_var_slug": "",
        "menu_position": "",
        "show_in_menu": "true",
        "show_in_menu_string": "",
        "menu_icon": None,
        "register_meta_box_cb": None,
        "supports": supports,
        "taxonomies": [],
        "labels": {k: "" for k in [
            "menu_name","all_items","add_new","add_new_item","edit_item","new_item",
            "view_item","view_items","search_items","not_found","not_found_in_trash",
            "parent_item_colon","featured_image","set_featured_image","remove_featured_image",
            "use_featured_image","archives","insert_into_item","uploaded_to_this_item",
            "filter_items_list","items_list_navigation","items_list","attributes",
            "name_admin_bar","item_published","item_published_privately",
            "item_reverted_to_draft","item_trashed","item_scheduled","item_updated","template_name"
        ]},
        "custom_supports": "",
        "enter_title_here": "",
    }

# ─── Canonical CPTs ──────────────────────────────────────────────
cpts = {}

# Core care domain
cpts["cared_one"] = cpt("cared_one", "Cared Ones", "Cared One",
    "Care recipient profiles managed by family or caregivers.")

cpts["cared_one_relation"] = cpt("cared_one_relation", "Cared One Relations", "Cared One Relation",
    "Links a user to a cared one with a relationship type.",
    supports=["title", "custom-fields"])

cpts["care_group"] = cpt("care_group", "Care Groups", "Care Group",
    "Groups of caregivers coordinating care for a loved one.")

cpts["care_group_member"] = cpt("care_group_member", "Care Group Members", "Care Group Member",
    "Membership records linking users to care groups.",
    supports=["title", "custom-fields"])

cpts["care_group_post"] = cpt("care_group_post", "Care Group Posts", "Care Group Post",
    "Posts shared within a care group.")

cpts["care_group_gallery"] = cpt("care_group_gallery", "Care Group Gallery", "Care Group Gallery Item",
    "Photos/files shared within a care group.",
    supports=["title", "thumbnail", "custom-fields"])

cpts["care_group_invite"] = cpt("care_group_invite", "Care Group Invitations", "Care Group Invitation",
    "Invitations to join a care group.",
    supports=["title", "custom-fields"])

cpts["member_category"] = cpt("member_category", "Member Categories", "Member Category",
    "Custom categories for organizing care group members.",
    supports=["title", "custom-fields"])

# Care tasks
cpts["care_task"] = cpt("care_task", "Care Tasks", "Care Task",
    "Tasks assigned within care groups.")

# Health tracking
cpts["checkin"] = cpt("checkin", "Check-ins", "Check-in",
    "Daily check-in logs for cared ones.",
    supports=["title", "editor", "custom-fields"])

cpts["medicine"] = cpt("medicine", "Medicines", "Medicine",
    "Medications prescribed to cared ones.",
    supports=["title", "custom-fields"])

cpts["medicine_log"] = cpt("medicine_log", "Medicine Logs", "Medicine Log",
    "Logs of medicine administration.",
    supports=["title", "custom-fields"])

cpts["health_vital"] = cpt("health_vital", "Health Vitals", "Health Vital",
    "Vital sign recordings for cared ones.",
    supports=["title", "custom-fields"])

cpts["symptom_log"] = cpt("symptom_log", "Symptom Logs", "Symptom Log",
    "Symptom tracking for cared ones.",
    supports=["title", "custom-fields"])

cpts["care_tip"] = cpt("care_tip", "Care Tips", "Care Tip",
    "Tips and advice for caring for loved ones.")

cpts["care_plan"] = cpt("care_plan", "Care Plans", "Care Plan",
    "Structured care plans for cared ones.")

cpts["care_plan_goal"] = cpt("care_plan_goal", "Care Plan Goals", "Care Plan Goal",
    "Individual goals within a care plan.",
    supports=["title", "editor", "custom-fields"])

cpts["care_note"] = cpt("care_note", "Care Notes", "Care Note",
    "Notes and observations about cared ones.")

cpts["emergency_contact"] = cpt("emergency_contact", "Emergency Contacts", "Emergency Contact",
    "Emergency contacts for cared ones.",
    supports=["title", "custom-fields"])

cpts["care_document"] = cpt("care_document", "Care Documents", "Care Document",
    "Documents (medical records, insurance, etc.) for cared ones.",
    supports=["title", "custom-fields"])

cpts["activity_log"] = cpt("activity_log", "Activity Logs", "Activity Log",
    "Activity tracking for cared ones.",
    supports=["title", "custom-fields"])

# Caregiver wellness
cpts["wellness_log"] = cpt("wellness_log", "Caregiver Wellness Logs", "Wellness Log",
    "Wellness and self-care tracking for caregivers.",
    supports=["title", "custom-fields"])

# Location & safety
cpts["location_share"] = cpt("location_share", "Location Shares", "Location Share",
    "Real-time location sharing for care coordination.",
    supports=["title", "custom-fields"])

cpts["safe_zone"] = cpt("safe_zone", "Safe Zones", "Safe Zone",
    "Geographic safe zones for cared ones.",
    supports=["title", "editor", "custom-fields"])

cpts["safe_zone_alert"] = cpt("safe_zone_alert", "Safe Zone Alerts", "Safe Zone Alert",
    "Alerts triggered when a cared one enters/exits a safe zone.",
    supports=["title", "custom-fields"])

# Chat / Conversations
cpts["chat_conversation"] = cpt("chat_conversation", "Chat Conversations", "Chat Conversation",
    "Direct message conversations between users.",
    supports=["title", "custom-fields"])

cpts["chat_message"] = cpt("chat_message", "Chat Messages", "Chat Message",
    "Individual messages within a conversation.",
    supports=["title", "editor", "custom-fields"])

cpts["chat_participant"] = cpt("chat_participant", "Chat Participants", "Chat Participant",
    "Participants in a chat conversation.",
    supports=["title", "custom-fields"])

# Notifications
cpts["notification"] = cpt("notification", "Notifications", "Notification",
    "User notifications for the CareConnected app.",
    supports=["title", "editor", "custom-fields"])

# Providers & marketplace
cpts["care_facility"] = cpt("care_facility", "Care Facilities", "Care Facility",
    "Care homes, clinics, and other care facilities.")

cpts["saved_provider"] = cpt("saved_provider", "Saved Providers", "Saved Provider",
    "Users' saved/bookmarked care providers.",
    supports=["title", "custom-fields"])

# Jobs
cpts["job_posting"] = cpt("job_posting", "Job Postings", "Job Posting",
    "Care job postings by families or facilities.")

cpts["job_application"] = cpt("job_application", "Job Applications", "Job Application",
    "Applications submitted for care jobs.",
    supports=["title", "editor", "custom-fields"])

print(json.dumps(cpts, indent=2))
