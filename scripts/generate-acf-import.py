#!/usr/bin/env python3
"""
Generate ACF field group JSON for import into the CareConnected WP subsite.
Each field group targets a specific CPT and contains all ACF fields
the frontend app needs, matching Supabase naming conventions.
"""
import json
import hashlib

def field_key(group_key, field_name):
    """Generate a deterministic ACF field key."""
    raw = f"{group_key}_{field_name}"
    h = hashlib.md5(raw.encode()).hexdigest()[:13]
    return f"field_{h}"

def group_key(name):
    h = hashlib.md5(name.encode()).hexdigest()[:13]
    return f"group_{h}"

def text_field(gk, name, label, required=0):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "text", "required": required}

def textarea_field(gk, name, label, required=0):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "textarea", "required": required}

def number_field(gk, name, label, required=0):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "number", "required": required}

def email_field(gk, name, label, required=0):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "email", "required": required}

def url_field(gk, name, label, required=0):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "url", "required": required}

def true_false_field(gk, name, label, default=0):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "true_false", "default_value": default}

def select_field(gk, name, label, choices, required=0):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "select", "choices": choices, "required": required}

def date_field(gk, name, label, required=0):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "date_picker", "display_format": "Y-m-d", "return_format": "Y-m-d", "required": required}

def datetime_field(gk, name, label, required=0):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "date_time_picker", "display_format": "Y-m-d H:i:s", "return_format": "Y-m-d H:i:s", "required": required}

def image_field(gk, name, label):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "image", "return_format": "url"}

def file_field(gk, name, label):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "file", "return_format": "url"}

def user_field(gk, name, label, required=0):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "user", "return_format": "id", "required": required}

def post_field(gk, name, label, post_type, required=0):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "post_object", "post_type": [post_type], "return_format": "id", "required": required}

def relationship_field(gk, name, label, post_type):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "relationship", "post_type": [post_type], "return_format": "id"}

def color_field(gk, name, label):
    return {"key": field_key(gk, name), "label": label, "name": name, "type": "color_picker"}

def make_group(title, cpt_name, fields):
    gk = group_key(title)
    return {
        "key": gk,
        "title": title,
        "fields": fields,
        "location": [[{"param": "post_type", "operator": "==", "value": cpt_name}]],
        "menu_order": 0,
        "position": "normal",
        "style": "default",
        "label_placement": "top",
        "instruction_placement": "label",
        "hide_on_screen": "",
        "active": True,
        "description": "",
    }

groups = []

# ─── Cared One Details ───────────────────────────────────────
gk = group_key("Cared One Details")
groups.append(make_group("Cared One Details", "cared_one", [
    text_field(gk, "first_name", "First Name"),
    text_field(gk, "last_name", "Last Name"),
    date_field(gk, "date_of_birth", "Date of Birth"),
    select_field(gk, "gender", "Gender", {"male": "Male", "female": "Female", "other": "Other"}),
    text_field(gk, "relationship", "Relationship"),
    image_field(gk, "avatar_url", "Avatar"),
    select_field(gk, "dementia_stage", "Dementia Stage", {
        "early": "Early", "middle": "Middle", "late": "Late", "none": "None"
    }),
    text_field(gk, "blood_type", "Blood Type"),
    textarea_field(gk, "allergies", "Allergies"),
    textarea_field(gk, "medical_conditions", "Medical Conditions"),
    text_field(gk, "primary_doctor", "Primary Doctor"),
    textarea_field(gk, "insurance_info", "Insurance Info"),
    select_field(gk, "care_level", "Care Level", {
        "independent": "Independent", "minimal": "Minimal", "moderate": "Moderate", "extensive": "Extensive", "total": "Total"
    }),
    user_field(gk, "created_by", "Created By"),
]))

# ─── Cared One Relation ──────────────────────────────────────
gk = group_key("Cared One Relation Details")
groups.append(make_group("Cared One Relation Details", "cared_one_relation", [
    post_field(gk, "cared_one_id", "Cared One", "cared_one", 1),
    user_field(gk, "user_id", "User", 1),
    text_field(gk, "relationship", "Relationship"),
]))

# ─── Care Group Details ──────────────────────────────────────
gk = group_key("Care Group Details v2")
groups.append(make_group("Care Group Details v2", "care_group", [
    true_false_field(gk, "is_private", "Is Private"),
    number_field(gk, "member_count", "Member Count"),
    user_field(gk, "owner_id", "Owner"),
    image_field(gk, "cover_image", "Cover Image"),
    true_false_field(gk, "is_active", "Is Active", 1),
    number_field(gk, "max_members", "Max Members"),
    text_field(gk, "join_code", "Join Code"),
    relationship_field(gk, "linked_cared_ones", "Linked Cared Ones", "cared_one"),
]))

# ─── Care Group Member ───────────────────────────────────────
gk = group_key("Care Group Member Details")
groups.append(make_group("Care Group Member Details", "care_group_member", [
    post_field(gk, "care_group_id", "Care Group", "care_group", 1),
    user_field(gk, "user_id", "User", 1),
    true_false_field(gk, "is_admin", "Is Admin"),
    true_false_field(gk, "is_cared_one", "Is Cared One"),
    true_false_field(gk, "is_owner", "Is Owner"),
    select_field(gk, "invitation_status", "Invitation Status", {
        "pending": "Pending", "accepted": "Accepted", "declined": "Declined"
    }),
]))

# ─── Care Group Post ─────────────────────────────────────────
gk = group_key("Care Group Post Details")
groups.append(make_group("Care Group Post Details", "care_group_post", [
    post_field(gk, "care_group_id", "Care Group", "care_group", 1),
    user_field(gk, "author_id", "Author"),
    select_field(gk, "post_type", "Post Type", {
        "update": "Update", "question": "Question", "announcement": "Announcement", "milestone": "Milestone"
    }),
    select_field(gk, "visibility", "Visibility", {"all": "All Members", "admins": "Admins Only"}),
    true_false_field(gk, "is_pinned", "Is Pinned"),
]))

# ─── Care Group Gallery ──────────────────────────────────────
gk = group_key("Care Group Gallery Details")
groups.append(make_group("Care Group Gallery Details", "care_group_gallery", [
    post_field(gk, "care_group_id", "Care Group", "care_group", 1),
    user_field(gk, "uploaded_by", "Uploaded By"),
    file_field(gk, "file_url", "File"),
    text_field(gk, "file_type", "File Type"),
    textarea_field(gk, "caption", "Caption"),
]))

# ─── Care Group Invitation ───────────────────────────────────
gk = group_key("Care Group Invitation Details")
groups.append(make_group("Care Group Invitation Details", "care_group_invite", [
    post_field(gk, "care_group_id", "Care Group", "care_group", 1),
    user_field(gk, "invited_by_user_id", "Invited By"),
    email_field(gk, "invitee_email", "Invitee Email"),
    select_field(gk, "status", "Status", {
        "pending": "Pending", "accepted": "Accepted", "declined": "Declined", "expired": "Expired"
    }),
]))

# ─── Member Category ─────────────────────────────────────────
gk = group_key("Member Category Details")
groups.append(make_group("Member Category Details", "member_category", [
    post_field(gk, "care_group_id", "Care Group", "care_group", 1),
    color_field(gk, "color", "Color"),
    user_field(gk, "created_by", "Created By"),
]))

# ─── Care Task Details ───────────────────────────────────────
gk = group_key("Care Task Details v2")
groups.append(make_group("Care Task Details v2", "care_task", [
    post_field(gk, "care_group_id", "Care Group", "care_group"),
    user_field(gk, "assigned_to", "Assigned To"),
    select_field(gk, "status", "Status", {
        "pending": "Pending", "in_progress": "In Progress", "completed": "Completed", "cancelled": "Cancelled"
    }),
    select_field(gk, "priority", "Priority", {
        "low": "Low", "medium": "Medium", "high": "High", "urgent": "Urgent"
    }),
    date_field(gk, "due_date", "Due Date"),
    textarea_field(gk, "description", "Description"),
    user_field(gk, "created_by", "Created By"),
]))

# ─── Check-in Details ────────────────────────────────────────
gk = group_key("Check-in Details v2")
groups.append(make_group("Check-in Details v2", "checkin", [
    post_field(gk, "cared_one_id", "Cared One", "cared_one", 1),
    select_field(gk, "mood", "Mood", {
        "great": "Great", "good": "Good", "okay": "Okay", "poor": "Poor", "bad": "Bad"
    }),
    number_field(gk, "energy_level", "Energy Level (1-10)"),
    number_field(gk, "pain_level", "Pain Level (1-10)"),
    number_field(gk, "sleep_hours", "Sleep Hours"),
    textarea_field(gk, "note", "Notes"),
    user_field(gk, "recorded_by", "Recorded By"),
]))

# ─── Medicine Details ────────────────────────────────────────
gk = group_key("Medicine Details v2")
groups.append(make_group("Medicine Details v2", "medicine", [
    post_field(gk, "cared_one_id", "Cared One", "cared_one", 1),
    text_field(gk, "dosage", "Dosage"),
    text_field(gk, "frequency", "Frequency"),
    text_field(gk, "time_slot", "Time Slots (comma-separated)"),
    textarea_field(gk, "note", "Notes"),
    text_field(gk, "form", "Form (tablet, liquid, etc.)"),
    text_field(gk, "category", "Category"),
    true_false_field(gk, "is_active", "Is Active", 1),
    text_field(gk, "prescribing_doctor", "Prescribing Doctor"),
    text_field(gk, "pharmacy", "Pharmacy"),
    date_field(gk, "start_date", "Start Date"),
    date_field(gk, "end_date", "End Date"),
    textarea_field(gk, "side_effects", "Side Effects"),
]))

# ─── Medicine Log ────────────────────────────────────────────
gk = group_key("Medicine Log Details")
groups.append(make_group("Medicine Log Details", "medicine_log", [
    post_field(gk, "medicine_id", "Medicine", "medicine", 1),
    post_field(gk, "cared_one_id", "Cared One", "cared_one", 1),
    select_field(gk, "status", "Status", {
        "taken": "Taken", "missed": "Missed", "skipped": "Skipped", "late": "Late"
    }),
    textarea_field(gk, "note", "Notes"),
    user_field(gk, "logged_by", "Logged By"),
    date_field(gk, "log_date", "Log Date"),
]))

# ─── Health Vital Details ────────────────────────────────────
gk = group_key("Health Vital Details v2")
groups.append(make_group("Health Vital Details v2", "health_vital", [
    post_field(gk, "cared_one_id", "Cared One", "cared_one", 1),
    select_field(gk, "vital_type", "Vital Type", {
        "blood_pressure": "Blood Pressure", "heart_rate": "Heart Rate", "temperature": "Temperature",
        "blood_sugar": "Blood Sugar", "weight": "Weight", "oxygen": "Oxygen Saturation", "other": "Other"
    }),
    text_field(gk, "value", "Value", 1),
    text_field(gk, "unit", "Unit"),
    textarea_field(gk, "note", "Notes"),
    user_field(gk, "recorded_by", "Recorded By"),
]))

# ─── Symptom Log ─────────────────────────────────────────────
gk = group_key("Symptom Log Details")
groups.append(make_group("Symptom Log Details", "symptom_log", [
    post_field(gk, "cared_one_id", "Cared One", "cared_one", 1),
    text_field(gk, "symptom_type", "Symptom Type", 1),
    number_field(gk, "severity", "Severity (1-10)"),
    textarea_field(gk, "notes", "Notes"),
    text_field(gk, "trigger", "Trigger"),
    user_field(gk, "recorded_by", "Recorded By"),
]))

# ─── Care Tip Details ────────────────────────────────────────
gk = group_key("Care Tip Details v2")
groups.append(make_group("Care Tip Details v2", "care_tip", [
    post_field(gk, "cared_one_id", "Cared One", "cared_one"),
    text_field(gk, "category", "Category"),
    true_false_field(gk, "is_pinned", "Is Pinned"),
    user_field(gk, "created_by", "Created By"),
]))

# ─── Care Plan Details ───────────────────────────────────────
gk = group_key("Care Plan Details v2")
groups.append(make_group("Care Plan Details v2", "care_plan", [
    post_field(gk, "cared_one_id", "Cared One", "cared_one", 1),
    select_field(gk, "status", "Status", {
        "draft": "Draft", "active": "Active", "completed": "Completed", "archived": "Archived"
    }),
    user_field(gk, "created_by", "Created By"),
]))

# ─── Care Plan Goal ──────────────────────────────────────────
gk = group_key("Care Plan Goal Details")
groups.append(make_group("Care Plan Goal Details", "care_plan_goal", [
    post_field(gk, "care_plan_id", "Care Plan", "care_plan", 1),
    select_field(gk, "status", "Status", {
        "not_started": "Not Started", "in_progress": "In Progress", "completed": "Completed"
    }),
]))

# ─── Care Note Details ───────────────────────────────────────
gk = group_key("Care Note Details v2")
groups.append(make_group("Care Note Details v2", "care_note", [
    post_field(gk, "cared_one_id", "Cared One", "cared_one", 1),
    text_field(gk, "category", "Category"),
    user_field(gk, "created_by", "Created By"),
]))

# ─── Emergency Contact Details ───────────────────────────────
gk = group_key("Emergency Contact Details v2")
groups.append(make_group("Emergency Contact Details v2", "emergency_contact", [
    post_field(gk, "cared_one_id", "Cared One", "cared_one", 1),
    text_field(gk, "phone", "Phone", 1),
    email_field(gk, "email", "Email"),
    text_field(gk, "relationship", "Relationship"),
    true_false_field(gk, "is_primary", "Is Primary"),
]))

# ─── Care Document Details ───────────────────────────────────
gk = group_key("Care Document Details v2")
groups.append(make_group("Care Document Details v2", "care_document", [
    post_field(gk, "cared_one_id", "Cared One", "cared_one", 1),
    text_field(gk, "document_type", "Document Type"),
    file_field(gk, "file_url", "File"),
    textarea_field(gk, "notes", "Notes"),
    user_field(gk, "uploaded_by", "Uploaded By"),
    date_field(gk, "expiry_date", "Expiry Date"),
]))

# ─── Activity Log ────────────────────────────────────────────
gk = group_key("Activity Log Details")
groups.append(make_group("Activity Log Details", "activity_log", [
    post_field(gk, "cared_one_id", "Cared One", "cared_one", 1),
    text_field(gk, "activity_type", "Activity Type", 1),
    textarea_field(gk, "description", "Description"),
    number_field(gk, "duration_minutes", "Duration (minutes)"),
    user_field(gk, "user_id", "Logged By"),
]))

# ─── Caregiver Wellness Log ──────────────────────────────────
gk = group_key("Wellness Log Details")
groups.append(make_group("Wellness Log Details", "wellness_log", [
    user_field(gk, "user_id", "User"),
    select_field(gk, "mood", "Mood", {
        "great": "Great", "good": "Good", "okay": "Okay", "poor": "Poor", "bad": "Bad"
    }),
    number_field(gk, "stress_level", "Stress Level (1-10)"),
    number_field(gk, "sleep_hours", "Sleep Hours"),
    textarea_field(gk, "notes", "Notes"),
]))

# ─── Location Share ──────────────────────────────────────────
gk = group_key("Location Share Details")
groups.append(make_group("Location Share Details", "location_share", [
    user_field(gk, "user_id", "User"),
    text_field(gk, "user_name", "User Name"),
    url_field(gk, "user_avatar", "User Avatar URL"),
    number_field(gk, "latitude", "Latitude"),
    number_field(gk, "longitude", "Longitude"),
    true_false_field(gk, "is_sharing_enabled", "Is Sharing Enabled", 1),
]))

# ─── Safe Zone ───────────────────────────────────────────────
gk = group_key("Safe Zone Details")
groups.append(make_group("Safe Zone Details", "safe_zone", [
    post_field(gk, "cared_one_id", "Cared One", "cared_one", 1),
    number_field(gk, "latitude", "Latitude", 1),
    number_field(gk, "longitude", "Longitude", 1),
    number_field(gk, "radius_meters", "Radius (meters)"),
    select_field(gk, "zone_type", "Zone Type", {
        "home": "Home", "hospital": "Hospital", "school": "School", "park": "Park", "custom": "Custom"
    }),
    select_field(gk, "shape_type", "Shape Type", {"circle": "Circle", "polygon": "Polygon"}),
    textarea_field(gk, "polygon_points", "Polygon Points (JSON)"),
    text_field(gk, "category", "Category"),
    color_field(gk, "color", "Color"),
    true_false_field(gk, "notify_on_enter", "Notify on Enter", 1),
    true_false_field(gk, "notify_on_exit", "Notify on Exit", 1),
    true_false_field(gk, "is_active", "Is Active", 1),
    user_field(gk, "creator_id", "Creator"),
]))

# ─── Safe Zone Alert ─────────────────────────────────────────
gk = group_key("Safe Zone Alert Details")
groups.append(make_group("Safe Zone Alert Details", "safe_zone_alert", [
    post_field(gk, "safe_zone_id", "Safe Zone", "safe_zone", 1),
    post_field(gk, "cared_one_id", "Cared One", "cared_one", 1),
    true_false_field(gk, "is_read", "Is Read"),
    user_field(gk, "acknowledged_by", "Acknowledged By"),
    datetime_field(gk, "acknowledged_at", "Acknowledged At"),
]))

# ─── Chat Conversation ──────────────────────────────────────
gk = group_key("Chat Conversation Details v2")
groups.append(make_group("Chat Conversation Details v2", "chat_conversation", [
    select_field(gk, "type", "Type", {"direct": "Direct", "group": "Group"}),
    user_field(gk, "created_by", "Created By"),
    text_field(gk, "last_message", "Last Message"),
    datetime_field(gk, "last_message_date", "Last Message Date"),
]))

# ─── Chat Message ────────────────────────────────────────────
gk = group_key("Chat Message Details v2")
groups.append(make_group("Chat Message Details v2", "chat_message", [
    post_field(gk, "conversation_id", "Conversation", "chat_conversation", 1),
    user_field(gk, "sender_id", "Sender", 1),
    text_field(gk, "sender_name", "Sender Name"),
    url_field(gk, "sender_avatar", "Sender Avatar"),
]))

# ─── Chat Participant ────────────────────────────────────────
gk = group_key("Chat Participant Details v2")
groups.append(make_group("Chat Participant Details v2", "chat_participant", [
    post_field(gk, "conversation_id", "Conversation", "chat_conversation", 1),
    user_field(gk, "user_id", "User", 1),
]))

# ─── Notification Details ────────────────────────────────────
gk = group_key("Notification Details")
groups.append(make_group("Notification Details", "notification", [
    select_field(gk, "type", "Type", {
        "info": "Info", "warning": "Warning", "alert": "Alert",
        "task": "Task", "message": "Message", "system": "System"
    }),
    url_field(gk, "link_url", "Link URL"),
    true_false_field(gk, "is_read", "Is Read"),
    user_field(gk, "user_id", "Target User"),
]))

# ─── Care Facility ───────────────────────────────────────────
gk = group_key("Care Facility Details")
groups.append(make_group("Care Facility Details", "care_facility", [
    text_field(gk, "location", "Location"),
    textarea_field(gk, "address", "Address"),
    text_field(gk, "phone", "Phone"),
    email_field(gk, "email", "Email"),
    url_field(gk, "website", "Website"),
    number_field(gk, "rating", "Rating"),
    number_field(gk, "review_count", "Review Count"),
    text_field(gk, "type", "Facility Type"),
    text_field(gk, "country", "Country"),
    text_field(gk, "c_province", "Province"),
    text_field(gk, "c_city", "City"),
    text_field(gk, "service_category", "Service Categories (comma-separated)"),
    text_field(gk, "service_type", "Service Types (comma-separated)"),
    number_field(gk, "latitude", "Latitude"),
    number_field(gk, "longitude", "Longitude"),
]))

# ─── Saved Provider ──────────────────────────────────────────
gk = group_key("Saved Provider Details")
groups.append(make_group("Saved Provider Details", "saved_provider", [
    number_field(gk, "provider_id", "Provider ID (WP User ID)", 1),
    text_field(gk, "provider_name", "Provider Name"),
    url_field(gk, "provider_avatar", "Provider Avatar"),
    user_field(gk, "user_id", "Saved By User"),
]))

# ─── Job Posting ─────────────────────────────────────────────
gk = group_key("Job Posting Details")
groups.append(make_group("Job Posting Details", "job_posting", [
    user_field(gk, "posted_by", "Posted By"),
    text_field(gk, "location", "Location"),
    select_field(gk, "status", "Status", {
        "open": "Open", "closed": "Closed", "filled": "Filled", "draft": "Draft"
    }),
    text_field(gk, "job_source_type", "Job Source Type"),
    date_field(gk, "start_date", "Start Date"),
    text_field(gk, "poster_name", "Poster Name"),
    url_field(gk, "poster_avatar", "Poster Avatar"),
]))

# ─── Job Application ─────────────────────────────────────────
gk = group_key("Job Application Details")
groups.append(make_group("Job Application Details", "job_application", [
    post_field(gk, "job_id", "Job Posting", "job_posting", 1),
    user_field(gk, "applicant_id", "Applicant"),
    select_field(gk, "status", "Status", {
        "pending": "Pending", "reviewed": "Reviewed", "accepted": "Accepted", "rejected": "Rejected"
    }),
    text_field(gk, "applicant_name", "Applicant Name"),
    url_field(gk, "applicant_avatar", "Applicant Avatar"),
]))

print(json.dumps(groups, indent=2))
