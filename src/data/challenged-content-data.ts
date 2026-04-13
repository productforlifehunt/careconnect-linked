/**
 * Static knowledge base content for ChallengeD dementia app.
 * This serves as the default content layer — free knowledge to attract users.
 * Content is based on best practices from Alzheimer's Association, WHO, NHS, etc.
 */
import type { ChallengedContentItem } from "@/features/challenged-content/source.wordpress";

let idCounter = 1;
function article(
  category: string,
  subcategory: string,
  title: string,
  excerpt: string,
  content: string,
  readingTime = "5 min read",
  sortOrder = 0
): ChallengedContentItem {
  return {
    id: String(idCounter++),
    cct_status: "publish",
    title,
    content,
    excerpt,
    category,
    subcategory,
    featured_image: "",
    sort_order: sortOrder,
    is_published: "1",
    author_name: "ChallengeD Editorial",
    reading_time: readingTime,
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  };
}

// ═══════════════════════════════════════════════
// AwareD — Understanding Dementia
// ═══════════════════════════════════════════════

const awareArticles: ChallengedContentItem[] = [
  article("aware", "understanding",
    "What Is Dementia? A Complete Beginner's Guide",
    "Dementia is not a single disease — it's a term for a group of symptoms affecting memory, thinking, and social abilities severely enough to interfere with daily life.",
    `<h2>What Is Dementia?</h2>
<p>Dementia is an umbrella term for a group of cognitive disorders characterized by impairment of at least two brain functions, such as memory loss and judgment. It is not a normal part of aging, though the risk increases with age.</p>
<p>Worldwide, around 55 million people live with dementia, with nearly 10 million new cases every year. By 2050, that number is projected to reach 139 million.</p>

<h2>Key Facts</h2>
<ul>
<li><strong>Dementia is not just memory loss</strong> — it affects reasoning, behavior, emotions, and the ability to perform everyday activities.</li>
<li><strong>It is caused by damage to brain cells</strong> — different types of dementia are associated with damage in different parts of the brain.</li>
<li><strong>It is progressive</strong> — symptoms typically start slowly and gradually worsen over time.</li>
<li><strong>It is NOT a normal part of aging</strong> — while age is the strongest risk factor, younger-onset dementia affects people under 65.</li>
</ul>

<h2>How the Brain Changes</h2>
<p>In a healthy brain, billions of neurons communicate via electrical and chemical signals. In dementia, neurons become damaged and eventually die, disrupting these communication networks.</p>
<p>Different types of dementia damage neurons in different brain regions, which is why symptoms vary between types. For example, Alzheimer's disease typically first affects the hippocampus (memory center), while frontotemporal dementia first affects the frontal lobes (personality and behavior).</p>

<h2>When to See a Doctor</h2>
<p>See a doctor if you or a loved one experiences:</p>
<ul>
<li>Memory loss that disrupts daily life</li>
<li>Difficulty planning or solving problems</li>
<li>Confusion with time or place</li>
<li>Trouble understanding visual images</li>
<li>New problems with words in speaking or writing</li>
<li>Misplacing things and losing the ability to retrace steps</li>
<li>Changes in mood or personality</li>
</ul>

<h2>The Importance of Early Detection</h2>
<p>Early diagnosis matters because it allows access to treatments that may slow progression, time to plan for the future, opportunities to participate in clinical trials, and access to support services.</p>`,
    "8 min read", 1
  ),

  article("aware", "types",
    "The 7 Major Types of Dementia Explained",
    "From Alzheimer's disease to Lewy body dementia — understanding the different types helps families prepare for what lies ahead.",
    `<h2>1. Alzheimer's Disease (60–80% of cases)</h2>
<p>The most common form of dementia, Alzheimer's is caused by abnormal buildups of proteins (amyloid plaques and tau tangles) in and around brain cells. Early symptoms include difficulty remembering recent conversations, names, or events.</p>

<h2>2. Vascular Dementia (5–10%)</h2>
<p>Caused by conditions that block or reduce blood flow to the brain, depriving brain cells of oxygen and nutrients. Often occurs after a stroke. Symptoms include impaired judgment, difficulty planning, and slowed thinking.</p>

<h2>3. Lewy Body Dementia (5–10%)</h2>
<p>Caused by abnormal deposits of a protein called alpha-synuclein (Lewy bodies) in the brain. Distinctive symptoms include visual hallucinations, fluctuating attention, and movement problems similar to Parkinson's disease.</p>

<h2>4. Frontotemporal Dementia (FTD)</h2>
<p>Involves progressive damage to the frontal and/or temporal lobes. Often begins earlier (ages 40–65). Symptoms include dramatic personality changes, inappropriate behavior, language difficulties, and emotional indifference.</p>

<h2>5. Mixed Dementia</h2>
<p>When a person has more than one type of dementia simultaneously. Research suggests this is more common than previously thought, especially in older adults.</p>

<h2>6. Parkinson's Disease Dementia</h2>
<p>Cognitive problems that develop in people with Parkinson's disease, typically occurring a year or more after motor symptoms begin. Shares features with Lewy body dementia.</p>

<h2>7. Creutzfeldt-Jakob Disease (CJD)</h2>
<p>A rare, rapidly progressive condition caused by misfolded prion proteins. Symptoms include rapidly worsening memory, behavior changes, lack of coordination, and visual disturbances.</p>`,
    "7 min read", 2
  ),

  article("aware", "signs",
    "10 Early Warning Signs of Dementia You Shouldn't Ignore",
    "Recognizing the earliest signs of dementia can lead to earlier intervention and better outcomes for both patients and families.",
    `<h2>1. Memory Loss That Disrupts Daily Life</h2>
<p>Forgetting recently learned information, important dates or events, and repeatedly asking the same questions. This goes beyond occasionally forgetting a name or appointment.</p>

<h2>2. Challenges in Planning or Solving Problems</h2>
<p>Difficulty following a familiar recipe, keeping track of monthly bills, or concentrating on tasks that require sequential steps.</p>

<h2>3. Difficulty Completing Familiar Tasks</h2>
<p>Trouble driving to a familiar location, organizing a grocery list, or remembering the rules of a favorite game.</p>

<h2>4. Confusion with Time or Place</h2>
<p>Losing track of dates, seasons, and the passage of time. Sometimes forgetting where they are or how they got there.</p>

<h2>5. Trouble Understanding Visual Images and Spatial Relationships</h2>
<p>Difficulty reading, judging distance, determining color or contrast, which may cause problems with driving.</p>

<h2>6. New Problems with Words in Speaking or Writing</h2>
<p>Trouble following or joining a conversation, stopping in the middle of a conversation with no idea how to continue, or struggling with vocabulary.</p>

<h2>7. Misplacing Things and Losing the Ability to Retrace Steps</h2>
<p>Putting things in unusual places and being unable to go back over steps to find them. May accuse others of stealing.</p>

<h2>8. Decreased or Poor Judgment</h2>
<p>Changes in judgment or decision-making, such as giving large amounts of money to telemarketers or paying less attention to grooming.</p>

<h2>9. Withdrawal from Work or Social Activities</h2>
<p>Removing themselves from hobbies, social activities, or other engagements they previously enjoyed.</p>

<h2>10. Changes in Mood and Personality</h2>
<p>Becoming confused, suspicious, depressed, fearful, or anxious. Being easily upset at home, with friends, or when out of their comfort zone.</p>

<h3>What to Do If You Notice These Signs</h3>
<p>Don't panic — many conditions can cause similar symptoms. Schedule an appointment with a doctor for a comprehensive evaluation. Early detection allows for better planning and access to treatments.</p>`,
    "6 min read", 3
  ),

  article("aware", "stages",
    "The 7 Stages of Dementia: What to Expect",
    "Understanding the progression of dementia helps families plan ahead and provide the right level of care at each stage.",
    `<h2>Stage 1: No Cognitive Decline</h2>
<p>No symptoms are noticeable. The person functions normally. Brain changes may already be occurring at a cellular level but are not yet detectable.</p>

<h2>Stage 2: Very Mild Cognitive Decline</h2>
<p>Minor memory lapses that are often attributed to normal aging — forgetting names or where familiar objects are placed. Not detectable by medical examination.</p>

<h2>Stage 3: Mild Cognitive Decline (Early Stage)</h2>
<p>Family and close friends may notice difficulties. Problems with word-finding, planning, organization, and remembering names of new acquaintances. Can last 2–7 years.</p>

<h2>Stage 4: Moderate Cognitive Decline (Early Dementia)</h2>
<p>Clear symptoms visible in a medical interview. Reduced knowledge of recent events, difficulty with complex tasks like finances, and sometimes denial of symptoms. Lasts approximately 2 years.</p>

<h2>Stage 5: Moderately Severe Cognitive Decline (Mid-Stage)</h2>
<p>Significant gaps in memory and daily function. May need help choosing appropriate clothes. Still remembers family names and significant life details. Lasts about 1.5 years.</p>

<h2>Stage 6: Severe Cognitive Decline (Mid-to-Late Stage)</h2>
<p>Requires substantial help with daily activities. May not remember recent events or their surroundings. Personality and behavior changes become pronounced. Incontinence may develop. Lasts about 2.5 years.</p>

<h2>Stage 7: Very Severe Cognitive Decline (Late Stage)</h2>
<p>Final stage. Loss of ability to communicate, walk, or swallow. Requires 24-hour care. The brain can no longer tell the body what to do. Duration varies (1–3+ years).</p>

<h3>Important Reminders</h3>
<ul>
<li>Progression varies greatly between individuals</li>
<li>These stages are guidelines, not rigid categories</li>
<li>People may not fit neatly into one stage</li>
<li>Focus on the person, not the stage number</li>
</ul>`,
    "7 min read", 4
  ),

  article("aware", "diagnosis",
    "How Dementia Is Diagnosed: Tests & Assessments",
    "A comprehensive guide to the medical evaluation process for dementia, including cognitive tests, brain scans, and biomarkers.",
    `<h2>The Diagnostic Process</h2>
<p>There is no single test that can diagnose dementia. Doctors use a combination of assessments to determine whether a person has dementia and, if so, what type.</p>

<h2>Medical History Review</h2>
<p>The doctor will ask about symptoms, their onset and progression, family history, current medications, and other health conditions. They will often interview both the patient and a family member.</p>

<h2>Cognitive and Neuropsychological Tests</h2>
<ul>
<li><strong>Mini-Mental State Examination (MMSE)</strong> — Tests orientation, memory, attention, language, and visual-spatial skills. Scored out of 30.</li>
<li><strong>Montreal Cognitive Assessment (MoCA)</strong> — More sensitive than MMSE for detecting mild cognitive impairment. Also scored out of 30.</li>
<li><strong>Clock Drawing Test</strong> — A quick screening tool that assesses executive function and visual-spatial abilities.</li>
</ul>

<h2>Brain Imaging</h2>
<ul>
<li><strong>CT Scan</strong> — Rules out tumors, strokes, and other structural problems.</li>
<li><strong>MRI</strong> — Provides detailed images of brain structure and can show patterns of atrophy consistent with specific types of dementia.</li>
<li><strong>PET Scan</strong> — Can detect amyloid plaques (Alzheimer's) or patterns of brain metabolism.</li>
</ul>

<h2>Blood Tests & Biomarkers</h2>
<p>Blood tests rule out other conditions (thyroid problems, vitamin B12 deficiency, infections). Newer blood-based biomarkers can detect Alzheimer's-related proteins with increasing accuracy.</p>

<h2>The Importance of a Specialist</h2>
<p>Seek evaluation from a neurologist, geriatrician, or geriatric psychiatrist who specializes in dementia diagnosis and treatment.</p>`,
    "6 min read", 5
  ),

  article("aware", "prevention",
    "12 Evidence-Based Ways to Reduce Your Dementia Risk",
    "Research shows that up to 40% of dementia cases may be preventable through lifestyle modifications. Here's what the science says.",
    `<h2>The 12 Modifiable Risk Factors</h2>
<p>The Lancet Commission on Dementia identified 12 modifiable risk factors that together account for approximately 40% of worldwide dementias:</p>

<h3>Early Life (up to age 45)</h3>
<ol>
<li><strong>Less Education</strong> — Lower education is linked to higher risk. Cognitive stimulation builds "cognitive reserve."</li>
</ol>

<h3>Midlife (age 45–65)</h3>
<ol start="2">
<li><strong>Hearing Loss</strong> — Untreated hearing loss increases risk. Use hearing aids when needed.</li>
<li><strong>Traumatic Brain Injury</strong> — Protect your head. Wear seatbelts and helmets.</li>
<li><strong>Hypertension</strong> — High blood pressure damages blood vessels in the brain.</li>
<li><strong>Excessive Alcohol</strong> — More than 21 units/week increases risk.</li>
<li><strong>Obesity</strong> — BMI > 30 in midlife is associated with increased risk.</li>
</ol>

<h3>Later Life (age 65+)</h3>
<ol start="7">
<li><strong>Smoking</strong> — Smoking damages blood vessels and introduces neurotoxins.</li>
<li><strong>Depression</strong> — Treat depression — it may be both a risk factor and early symptom.</li>
<li><strong>Social Isolation</strong> — Stay socially engaged. Loneliness is a significant risk factor.</li>
<li><strong>Physical Inactivity</strong> — Aim for 150 minutes/week of moderate exercise.</li>
<li><strong>Diabetes</strong> — Type 2 diabetes increases risk. Manage blood sugar carefully.</li>
<li><strong>Air Pollution</strong> — Exposure to particulate matter is linked to increased risk.</li>
</ol>

<h2>What You Can Do Today</h2>
<ul>
<li>Exercise regularly — even walking 30 minutes a day helps</li>
<li>Follow the Mediterranean or MIND diet</li>
<li>Stay socially active</li>
<li>Challenge your brain with learning and puzzles</li>
<li>Get quality sleep (7–8 hours)</li>
<li>Manage cardiovascular risk factors</li>
<li>Address hearing loss early</li>
</ul>`,
    "7 min read", 6
  ),

  article("aware", "treatments",
    "Current Treatments for Dementia: What Works in 2026",
    "From FDA-approved medications to emerging therapies — a comprehensive overview of treatment options available today.",
    `<h2>FDA-Approved Medications</h2>

<h3>Cholinesterase Inhibitors</h3>
<ul>
<li><strong>Donepezil (Aricept)</strong> — For all stages of Alzheimer's</li>
<li><strong>Rivastigmine (Exelon)</strong> — For mild-to-moderate Alzheimer's and Parkinson's dementia</li>
<li><strong>Galantamine (Razadyne)</strong> — For mild-to-moderate Alzheimer's</li>
</ul>
<p>These work by boosting levels of acetylcholine, a chemical messenger important for memory and judgment.</p>

<h3>NMDA Receptor Antagonist</h3>
<ul>
<li><strong>Memantine (Namenda)</strong> — For moderate-to-severe Alzheimer's. Regulates glutamate activity.</li>
</ul>

<h3>Anti-Amyloid Antibodies (Disease-Modifying)</h3>
<ul>
<li><strong>Lecanemab (Leqembi)</strong> — Targets amyloid plaques; shown to slow cognitive decline by 27% in clinical trials.</li>
<li><strong>Donanemab (Kisunla)</strong> — Another anti-amyloid therapy showing promising results in slowing progression.</li>
</ul>

<h2>Non-Drug Treatments</h2>
<ul>
<li><strong>Cognitive Stimulation Therapy (CST)</strong> — Group activities to improve cognitive function</li>
<li><strong>Occupational Therapy</strong> — Helps maintain independence in daily activities</li>
<li><strong>Physical Exercise</strong> — Shown to improve mood, physical function, and possibly slow decline</li>
<li><strong>Music Therapy</strong> — Can reduce agitation and improve mood</li>
<li><strong>Art Therapy</strong> — Provides creative expression and engagement</li>
</ul>

<h2>Emerging Research</h2>
<p>Clinical trials are exploring gene therapies, anti-tau antibodies, lifestyle interventions, and combination approaches. Speak with your doctor about clinical trial eligibility.</p>`,
    "6 min read", 7
  ),
];

// ═══════════════════════════════════════════════
// CareD — Caregiving Guides
// ═══════════════════════════════════════════════

const careArticles: ChallengedContentItem[] = [
  article("care", "daily-routines",
    "Creating a Daily Routine for Someone with Dementia",
    "A structured routine provides comfort and reduces anxiety. Learn how to build one that works for your loved one.",
    `<h2>Why Routine Matters</h2>
<p>People with dementia feel safer with predictable patterns. A consistent daily routine reduces confusion, anxiety, and behavioral symptoms while maximizing the person's remaining abilities.</p>

<h2>Building a Daily Schedule</h2>
<h3>Morning (7:00 – 11:00 AM)</h3>
<ul>
<li>Wake up at the same time each day</li>
<li>Follow a consistent morning hygiene routine</li>
<li>Eat breakfast together at the table</li>
<li>Take morning medications with food</li>
<li>Light physical activity or a short walk</li>
</ul>

<h3>Midday (11:00 AM – 2:00 PM)</h3>
<ul>
<li>Engage in meaningful activities (puzzles, gardening, music)</li>
<li>Prepare and eat lunch</li>
<li>Allow rest time if needed</li>
</ul>

<h3>Afternoon (2:00 – 5:00 PM)</h3>
<ul>
<li>Light exercise or outdoor time</li>
<li>Social activity (visit, phone call, or group activity)</li>
<li>Limit napping to 20-30 minutes to protect nighttime sleep</li>
</ul>

<h3>Evening (5:00 – 9:00 PM)</h3>
<ul>
<li>Eat dinner early to allow digestion</li>
<li>Calm activities: listening to music, looking at photos</li>
<li>Begin a consistent bedtime routine</li>
<li>Reduce stimulation and dim lights gradually</li>
</ul>

<h2>Tips for Success</h2>
<ul>
<li>Write the schedule on a large whiteboard</li>
<li>Be flexible — some days will be harder than others</li>
<li>Schedule the most demanding tasks for the person's "best" time of day</li>
<li>Include activities the person has always enjoyed</li>
<li>Allow extra time for everything</li>
</ul>`,
    "6 min read", 1
  ),

  article("care", "nutrition",
    "Nutrition Guide: Feeding Someone with Dementia",
    "As dementia progresses, eating and drinking become challenging. Here's how to ensure proper nutrition at every stage.",
    `<h2>Why Nutrition Matters</h2>
<p>Malnutrition affects up to 45% of people with dementia and accelerates cognitive decline. Maintaining good nutrition improves quality of life, mood, and physical health.</p>

<h2>Common Challenges</h2>
<ul>
<li>Forgetting to eat or drink</li>
<li>Difficulty using utensils</li>
<li>Not recognizing food</li>
<li>Changes in taste preferences</li>
<li>Swallowing difficulties (dysphagia) in later stages</li>
<li>Eating non-food items (pica)</li>
</ul>

<h2>Practical Solutions</h2>

<h3>Early Stage</h3>
<ul>
<li>Encourage involvement in meal preparation</li>
<li>Follow the MIND or Mediterranean diet</li>
<li>Set regular meal times</li>
<li>Use a grocery list and meal plan</li>
</ul>

<h3>Middle Stage</h3>
<ul>
<li>Use plates that contrast with the table and food</li>
<li>Serve one course at a time to reduce confusion</li>
<li>Offer finger foods for independence</li>
<li>Use adaptive utensils with large, easy-grip handles</li>
<li>Sit together and eat — it models the behavior</li>
</ul>

<h3>Late Stage</h3>
<ul>
<li>Offer soft or pureed foods</li>
<li>Check food temperature — they may not notice if it's too hot</li>
<li>Allow ample time to eat without rushing</li>
<li>Consult a speech therapist for swallowing assessments</li>
<li>Consider fortified foods and nutritional supplements</li>
</ul>

<h2>Brain-Healthy Foods</h2>
<p>Green leafy vegetables, berries, nuts, whole grains, fish, olive oil, beans, poultry, and moderate wine consumption are associated with the MIND diet, which has shown a 53% reduction in Alzheimer's risk.</p>`,
    "7 min read", 2
  ),

  article("care", "communication",
    "How to Communicate with Someone Who Has Dementia",
    "Communication becomes increasingly difficult as dementia progresses. These evidence-based techniques can help maintain connection.",
    `<h2>General Principles</h2>
<ul>
<li><strong>Be patient</strong> — Allow extra time for responses</li>
<li><strong>Maintain eye contact</strong> — Get on the same level as the person</li>
<li><strong>Use simple sentences</strong> — One idea at a time</li>
<li><strong>Speak slowly and clearly</strong> — But don't shout</li>
<li><strong>Use names instead of pronouns</strong> — "Mom" instead of "she"</li>
</ul>

<h2>Dos and Don'ts</h2>
<h3>DO:</h3>
<ul>
<li>Approach from the front so they can see you coming</li>
<li>Use gentle touch to get attention</li>
<li>Offer limited choices: "Would you like tea or coffee?"</li>
<li>Use visual cues alongside words</li>
<li>Listen actively and validate feelings</li>
<li>Join their reality rather than correcting them</li>
</ul>

<h3>DON'T:</h3>
<ul>
<li>Don't argue or try to reason</li>
<li>Don't say "Don't you remember?"</li>
<li>Don't talk about the person as if they aren't there</li>
<li>Don't use baby talk — they are adults</li>
<li>Don't finish their sentences unless they're clearly struggling</li>
</ul>

<h2>When Words Fail</h2>
<p>In later stages, nonverbal communication becomes primary. Focus on:</p>
<ul>
<li>Tone of voice (calm, warm, reassuring)</li>
<li>Facial expressions (smile, look engaged)</li>
<li>Gentle touch (holding hands, a hug)</li>
<li>Music and singing together</li>
<li>Looking at photo albums together</li>
</ul>`,
    "5 min read", 3
  ),

  article("care", "behaviors",
    "Managing Challenging Behaviors in Dementia",
    "Aggression, wandering, sundowning, and repetition — understand why they happen and learn proven strategies to respond.",
    `<h2>Understanding Behavior as Communication</h2>
<p>People with dementia often can't express their needs verbally. Challenging behaviors are usually attempts to communicate something — pain, fear, frustration, overstimulation, or unmet needs.</p>

<h2>Common Behaviors and Strategies</h2>

<h3>Agitation and Aggression</h3>
<p><strong>Possible causes:</strong> Pain, fear, confusion, overstimulation, medication side effects.</p>
<ul>
<li>Stay calm — your anxiety increases theirs</li>
<li>Speak softly and reassuringly</li>
<li>Remove triggers (noise, crowds)</li>
<li>Redirect attention to a pleasant activity</li>
<li>Check for physical discomfort (pain, hunger, toileting needs)</li>
</ul>

<h3>Sundowning (Late-Day Confusion)</h3>
<p>Increased confusion and agitation in late afternoon/evening, affecting up to 20% of people with dementia.</p>
<ul>
<li>Increase afternoon light exposure</li>
<li>Plan activities and exercise earlier in the day</li>
<li>Reduce caffeine and sugar after noon</li>
<li>Create a calm evening environment</li>
<li>Use nightlights to reduce shadows</li>
</ul>

<h3>Repetitive Questions and Actions</h3>
<ul>
<li>Respond calmly each time — they don't remember asking</li>
<li>Write answers on a card they can refer to</li>
<li>Redirect to an activity</li>
<li>Address the underlying emotion (usually anxiety)</li>
</ul>

<h3>Wandering</h3>
<ul>
<li>Ensure they have ID on them at all times</li>
<li>Use GPS tracking devices</li>
<li>Install door alarms and secure locks</li>
<li>Maintain a regular exercise routine</li>
<li>Register with a wandering response program</li>
</ul>`,
    "8 min read", 4
  ),

  // ── Module 5: Detailed Behaviour Change Articles (WHO iSupport) ──

  article("care", "behaviors",
    "Understanding and Responding to Aggression in Dementia",
    "Verbal and physical aggression affects up to 40% of people with dementia. Learn the ABC model and proven de-escalation techniques.",
    `<h2>Why Aggression Happens</h2>
<p>Aggression in dementia is almost never intentional. The person is reacting to something they can't articulate — pain, fear, confusion, frustration, or feeling threatened. As language deteriorates, behavior becomes the primary form of communication.</p>

<h2>The ABC Model</h2>
<p>The ABC (Antecedent–Behavior–Consequence) model is the gold-standard framework used by the WHO iSupport programme:</p>
<ul>
<li><strong>A — Antecedent:</strong> What happened just before? (Were they being rushed? Was the environment noisy? Were they in pain?)</li>
<li><strong>B — Behavior:</strong> What exactly did they do? (Hitting, shouting, throwing, biting?)</li>
<li><strong>C — Consequence:</strong> What happened after? (Did they get what they needed? Did the trigger stop?)</li>
</ul>
<p>By keeping an ABC diary, patterns emerge that help you predict and prevent episodes.</p>

<h2>De-escalation Techniques</h2>
<ul>
<li><strong>Stay calm</strong> — Your body language sets the tone. Breathe slowly, relax your shoulders</li>
<li><strong>Lower your voice</strong> — Speak slowly, softly, and use short sentences</li>
<li><strong>Don't argue or reason</strong> — You cannot logic someone out of a brain disease</li>
<li><strong>Give space</strong> — Step back. Don't crowd or corner them</li>
<li><strong>Validate feelings</strong> — "I can see you're upset. I'm here to help."</li>
<li><strong>Remove triggers</strong> — Turn off the TV, reduce noise, dim lights</li>
<li><strong>Redirect</strong> — Offer a snack, suggest a walk, play familiar music</li>
<li><strong>Check for pain</strong> — Urinary tract infections, constipation, and dental pain are common hidden triggers</li>
</ul>

<h2>What NOT to Do</h2>
<ul>
<li>Never restrain physically unless safety is at immediate risk</li>
<li>Never punish or scold</li>
<li>Never take it personally — they are reacting to the disease, not to you</li>
<li>Never force compliance — try again later</li>
</ul>

<h2>When to Get Medical Help</h2>
<p>Sudden onset of aggression may indicate a medical issue (infection, pain, medication side effect). Consult the doctor if aggression is new, sudden, escalating, or accompanied by other changes like fever or confusion beyond baseline.</p>`,
    "8 min read", 5
  ),

  article("care", "behaviors",
    "Repetitive Questions, Phrases, and Actions: Why They Happen and How to Cope",
    "Being asked the same question 50 times a day is exhausting. Understanding why it happens transforms frustration into compassion.",
    `<h2>Why Repetition Occurs</h2>
<p>Repetition is one of the most common — and most frustrating — dementia behaviors. It happens because the person genuinely does not remember asking before. Their short-term memory loop is broken. Common forms include:</p>
<ul>
<li>Asking the same question repeatedly ("What day is it?" "When are we going?")</li>
<li>Telling the same story over and over</li>
<li>Performing the same action (opening/closing drawers, folding/unfolding clothes)</li>
<li>Making repetitive sounds or movements</li>
</ul>

<h2>Common Triggers</h2>
<ul>
<li><strong>Anxiety</strong> — Repetition is often driven by worry or insecurity</li>
<li><strong>Boredom</strong> — Not enough stimulation or engagement</li>
<li><strong>Comfort-seeking</strong> — The familiar phrase or action feels reassuring</li>
<li><strong>Unmet needs</strong> — Hunger, toileting, or discomfort they can't express</li>
</ul>

<h2>Strategies That Help</h2>
<ul>
<li><strong>Answer each time patiently</strong> — They truly don't remember asking. Your annoyance communicates rejection</li>
<li><strong>Write it down</strong> — A whiteboard with "Today is Tuesday. Lunch is at 12:00." can reduce questions</li>
<li><strong>Address the emotion</strong> — "Are you worried about something?" may reach the root cause</li>
<li><strong>Redirect to activity</strong> — Engage hands and mind with folding laundry, sorting objects, or music</li>
<li><strong>Use distraction</strong> — Change the subject, offer a snack, go for a walk</li>
<li><strong>Create memory aids</strong> — Clocks with day/date, daily schedule posted on the wall</li>
</ul>

<h2>Taking Care of Yourself</h2>
<p>Repetition can erode your patience to nothing. It's okay to step away briefly, use headphones during less risky tasks, or tag-team with another caregiver. Your emotional reserves matter too.</p>`,
    "6 min read", 6
  ),

  article("care", "behaviors",
    "Hallucinations, Delusions, and Paranoia in Dementia",
    "When your loved one sees things that aren't there or accuses you of stealing — understanding these symptoms helps you respond with compassion.",
    `<h2>Hallucinations vs. Delusions</h2>
<ul>
<li><strong>Hallucinations</strong> — Seeing, hearing, smelling, or feeling things that aren't there. Visual hallucinations are especially common in Lewy body dementia.</li>
<li><strong>Delusions</strong> — Fixed false beliefs. Common delusions include believing someone is stealing, that a spouse is an imposter (Capgras syndrome), or that the home is not really their home.</li>
<li><strong>Paranoia</strong> — Suspicion and mistrust, often targeting the primary caregiver ("You're poisoning my food," "You stole my wallet").</li>
</ul>

<h2>Why They Happen</h2>
<p>Brain damage affects perception and interpretation. The person is experiencing something real TO THEM. Medications, infections (especially UTIs), poor lighting, and overstimulation can trigger or worsen episodes.</p>

<h2>How to Respond</h2>
<ul>
<li><strong>Don't argue</strong> — Saying "That's not real" is unhelpful and distressing. Their experience IS real to them</li>
<li><strong>Validate the emotion</strong> — "That sounds scary. You're safe. I'm here with you."</li>
<li><strong>Don't play along with dangerous delusions</strong> — But gentle distraction is better than confrontation</li>
<li><strong>Check the environment</strong> — Remove mirrors if they cause confusion, improve lighting, reduce shadows</li>
<li><strong>Look for triggers</strong> — Certain TV shows, dark rooms, or specific times of day</li>
<li><strong>If harmless, let it be</strong> — If they see a child playing in the room and it makes them happy, there's no need to correct</li>
</ul>

<h2>When It's an Emergency</h2>
<p>Seek immediate medical help if hallucinations are sudden and new, accompanied by fever or delirium, causing danger to self or others, or associated with a medication change.</p>

<h2>Medication Considerations</h2>
<p>Antipsychotics are sometimes used but carry serious risks in dementia patients, including increased stroke risk and mortality. They should be a last resort, used at the lowest dose for the shortest time, and regularly reviewed.</p>`,
    "7 min read", 7
  ),

  article("care", "behaviors",
    "Inappropriate Sexual Behavior in Dementia: A Sensitive Guide",
    "One of the most distressing and least discussed behaviors — understanding why it happens removes shame and enables effective management.",
    `<h2>Understanding the Behavior</h2>
<p>Inappropriate sexual behavior (ISB) affects 2–17% of people with dementia. It includes public undressing, inappropriate touching, sexual comments, excessive masturbation, or making advances toward caregivers or strangers.</p>
<p>This is NOT the person's "true character" coming out. It is a direct result of brain damage to the frontal lobes (which control impulse and social behavior) and does not reflect their values or intentions.</p>

<h2>Common Causes</h2>
<ul>
<li><strong>Frontal lobe damage</strong> — Loss of social inhibition and impulse control</li>
<li><strong>Misidentification</strong> — Mistaking a caregiver for a spouse</li>
<li><strong>Discomfort</strong> — Undressing may signal that clothing is uncomfortable or they need the bathroom</li>
<li><strong>Need for touch/comfort</strong> — Craving human connection and warmth</li>
<li><strong>Boredom</strong> — Lack of stimulation or engagement</li>
</ul>

<h2>Response Strategies</h2>
<ul>
<li><strong>Stay calm</strong> — React without shock or anger. Calmly redirect</li>
<li><strong>Cover gently</strong> — If they've undressed, offer a robe without making it a confrontation</li>
<li><strong>Distract</strong> — Offer a different activity or object to hold</li>
<li><strong>Check for discomfort</strong> — Are they too hot? Do they need the bathroom?</li>
<li><strong>Provide appropriate touch</strong> — Hand massages, hugs, gentle arm-holding can meet the underlying need</li>
<li><strong>Modify clothing</strong> — Use back-fastening garments if undressing is frequent and risky</li>
<li><strong>Ensure privacy</strong> — If masturbation is the issue, guide them to a private space</li>
</ul>

<h2>Protecting Caregivers</h2>
<p>If a caregiver is being targeted, rotate caregivers, consider same-gender care for personal hygiene tasks, and ensure staff/family know this is a disease symptom, not a personal violation. Professional counseling for affected caregivers is appropriate.</p>`,
    "6 min read", 8
  ),

  article("care", "behaviors",
    "Hoarding, Rummaging, and Hiding Things in Dementia",
    "When they hide the TV remote in the freezer or stuff tissues into every pocket — understanding these common behaviors helps you respond calmly.",
    `<h2>Why These Behaviors Occur</h2>
<p>Hoarding, rummaging, and hiding objects are extremely common in mid-stage dementia. They usually reflect:</p>
<ul>
<li><strong>Need for security</strong> — Collecting things provides a sense of control in a confusing world</li>
<li><strong>Past habits</strong> — A former homemaker may compulsively fold and store</li>
<li><strong>Boredom</strong> — Rummaging gives them something to do with their hands</li>
<li><strong>Confusion</strong> — They may put items in illogical places because they've forgotten where things go</li>
<li><strong>Fear of theft</strong> — Paranoia about stealing may drive hiding valuables</li>
</ul>

<h2>Practical Strategies</h2>
<ul>
<li><strong>Learn their hiding spots</strong> — Check regularly. Most people use 2–3 favorite spots</li>
<li><strong>Keep duplicates</strong> — Extra keys, glasses, remote controls</li>
<li><strong>Secure truly important items</strong> — Lock away passports, jewelry, medications, and financial documents</li>
<li><strong>Create a rummaging box</strong> — Fill a box or drawer with safe, interesting items to sort through (old photos, fabric swatches, costume jewelry)</li>
<li><strong>Don't accuse</strong> — Instead of "Where did you put my keys?" try "Let's find the keys together"</li>
<li><strong>Check wastebaskets before emptying</strong> — Important items often end up in the trash</li>
<li><strong>Label drawers and cabinets</strong> with pictures of contents</li>
</ul>

<h2>Food Hoarding</h2>
<p>If they hoard food (common), check for spoiled food regularly, provide easy access to safe snacks, and ensure they're eating enough at meals — hoarding may indicate they feel food-insecure.</p>`,
    "5 min read", 9
  ),

  article("care", "sleep",
    "Sleep Problems and Sundowning: A Caregiver's Guide",
    "Up to 40% of people with dementia experience significant sleep disturbances. Here's how to improve sleep for everyone.",
    `<h2>Why Sleep Is Disrupted</h2>
<p>Dementia damages the brain regions that control the sleep-wake cycle. Common sleep problems include insomnia, excessive daytime sleeping, nighttime wandering, and sleep apnea.</p>

<h2>Sleep Hygiene for Dementia</h2>
<ul>
<li>Maintain consistent wake and sleep times</li>
<li>Expose to bright light during the day</li>
<li>Encourage physical activity, but not close to bedtime</li>
<li>Limit daytime naps to 20 minutes</li>
<li>Avoid caffeine after noon and alcohol in the evening</li>
<li>Create a dark, cool, quiet sleep environment</li>
<li>Use a calming bedtime routine (warm bath, soft music)</li>
</ul>

<h2>Managing Nighttime Wandering</h2>
<ul>
<li>Place motion-sensor lights in hallways and bathroom</li>
<li>Use bed alarms or door sensors</li>
<li>Ensure the path to the bathroom is clear and well-lit</li>
<li>Consider a commode by the bed</li>
<li>Install childproof locks on exterior doors</li>
</ul>

<h2>When to Seek Medical Help</h2>
<p>Consult a doctor if sleep problems are severe, as they may indicate sleep apnea (treatable with CPAP), restless leg syndrome, pain, depression, or medication side effects.</p>`,
    "5 min read", 5
  ),

  article("care", "hygiene",
    "Personal Hygiene Care for People with Dementia",
    "Bathing, dressing, and grooming can become battlegrounds. These gentle approaches preserve dignity and reduce resistance.",
    `<h2>Understanding Resistance to Hygiene</h2>
<p>A person with dementia may resist bathing or grooming because they feel cold, frightened, embarrassed, or confused about the process. They may not understand why it's necessary or may have lost the ability to perform the steps.</p>

<h2>Bathing Tips</h2>
<ul>
<li>Follow the person's previous bathing habits and preferences</li>
<li>Warm the bathroom before they enter</li>
<li>Use a handheld showerhead for gentler water flow</li>
<li>Cover parts of the body not being washed for warmth and dignity</li>
<li>Use no-rinse soap and shampoo when needed</li>
<li>Never leave them alone in the bath</li>
<li>Consider sponge baths on resistant days</li>
</ul>

<h2>Dressing Tips</h2>
<ul>
<li>Lay out clothes in the order they should be put on</li>
<li>Choose comfortable, easy-on clothing (elastic waists, Velcro)</li>
<li>Let them choose between two outfits (maintains independence)</li>
<li>Use familiar, favorite clothes</li>
</ul>

<h2>Dental Care</h2>
<ul>
<li>Use a soft toothbrush and demonstrate the action</li>
<li>Try an electric toothbrush — it does more of the work</li>
<li>Mouth swabs can help in late stages</li>
<li>Maintain regular dental checkups</li>
</ul>`,
    "5 min read", 6
  ),

  article("care", "medication",
    "Medication Management for Dementia Patients",
    "Managing multiple medications safely is critical. This guide covers organization, administration, and common pitfalls.",
    `<h2>Organizing Medications</h2>
<ul>
<li>Use a weekly pill organizer with clearly marked days/times</li>
<li>Set alarms or use medication reminder apps</li>
<li>Keep an updated medication list with dosages and schedules</li>
<li>Store medications in a locked cabinet (especially as the disease progresses)</li>
<li>Coordinate with the pharmacist for blister packs</li>
</ul>

<h2>Administration Tips</h2>
<ul>
<li>Give medications at the same time each day</li>
<li>Offer one pill at a time with water</li>
<li>If swallowing is difficult, ask the pharmacist about liquid or crushable alternatives</li>
<li>Never crush extended-release medications without consulting a pharmacist</li>
<li>Watch for side effects and report them promptly</li>
</ul>

<h2>Common Medications to Monitor</h2>
<ul>
<li><strong>Anticholinergics</strong> — Found in allergy and sleep medications; can worsen dementia symptoms</li>
<li><strong>Benzodiazepines</strong> — Increase fall risk and confusion</li>
<li><strong>Antipsychotics</strong> — Use only when truly necessary; carry serious risks in elderly patients</li>
</ul>

<h2>Working with Healthcare Providers</h2>
<p>Review all medications regularly with the doctor. Ask about deprescribing — reducing unnecessary medications that may be causing side effects.</p>`,
    "5 min read", 7
  ),

  article("care", "activities",
    "Meaningful Activities for Every Stage of Dementia",
    "Engagement improves mood, reduces agitation, and slows decline. Here are activities matched to each stage of dementia.",
    `<h2>Why Activities Matter</h2>
<p>Meaningful activities provide purpose, stimulate the brain, improve mood, reduce behavioral symptoms, and help maintain remaining abilities.</p>

<h2>Early Stage Activities</h2>
<ul>
<li>Card and board games</li>
<li>Reading clubs or discussions</li>
<li>Gardening and light yard work</li>
<li>Cooking familiar recipes together</li>
<li>Walking groups or gentle yoga</li>
<li>Volunteering in the community</li>
<li>Journaling or scrapbooking</li>
</ul>

<h2>Middle Stage Activities</h2>
<ul>
<li>Simple crafts (painting, coloring)</li>
<li>Music listening and sing-alongs</li>
<li>Looking at family photo albums</li>
<li>Folding towels or sorting items</li>
<li>Chair exercises</li>
<li>Pet therapy</li>
<li>Nature walks with supervision</li>
</ul>

<h2>Late Stage Activities</h2>
<ul>
<li>Gentle hand massage with lotion</li>
<li>Playing familiar music</li>
<li>Reading aloud to them</li>
<li>Sensory activities (textured objects, aromatherapy)</li>
<li>Watching nature videos</li>
<li>Holding a soft toy or doll</li>
</ul>

<h2>The Key Principle</h2>
<p>Focus on the process, not the outcome. It doesn't matter if the puzzle gets finished or the painting looks "good" — what matters is the engagement, enjoyment, and sense of accomplishment.</p>`,
    "5 min read", 8
  ),
];

// ═══════════════════════════════════════════════
// CopeD — Caregiver Coping
// ═══════════════════════════════════════════════

const copeArticles: ChallengedContentItem[] = [
  article("cope", "stress",
    "Caregiver Burnout: Signs, Prevention, and Recovery",
    "40–70% of dementia caregivers experience clinically significant depression. Learn to recognize burnout before it overwhelms you.",
    `<h2>What Is Caregiver Burnout?</h2>
<p>Caregiver burnout is a state of physical, emotional, and mental exhaustion caused by the prolonged stress of caring for someone with dementia. It can lead to depression, anxiety, and health problems.</p>

<h2>Warning Signs</h2>
<ul>
<li>Constant fatigue, even after rest</li>
<li>Withdrawal from friends and activities</li>
<li>Loss of interest in things you once enjoyed</li>
<li>Feeling helpless, hopeless, or resentful</li>
<li>Changes in appetite or sleep</li>
<li>Getting sick more often</li>
<li>Emotional outbursts or increased irritability</li>
<li>Neglecting your own health</li>
</ul>

<h2>Prevention Strategies</h2>
<ul>
<li><strong>Accept help</strong> — Make a list of tasks others can do and let them help</li>
<li><strong>Set realistic goals</strong> — You can't do everything perfectly</li>
<li><strong>Take breaks</strong> — Use respite care services regularly</li>
<li><strong>Stay connected</strong> — Maintain social relationships</li>
<li><strong>Join a support group</strong> — Others who understand your experience</li>
<li><strong>Exercise</strong> — Even 20 minutes helps reduce stress</li>
<li><strong>See your doctor</strong> — Don't ignore your own health needs</li>
</ul>

<h2>Recovery Steps</h2>
<p>If you're already burned out, acknowledge it without guilt. Seek professional counseling, arrange respite care, and take time to reconnect with yourself. You cannot pour from an empty cup.</p>`,
    "6 min read", 1
  ),

  article("cope", "self-care",
    "Self-Care Strategies Every Dementia Caregiver Needs",
    "You can't care for others if you don't care for yourself first. Here are practical self-care strategies that fit into a caregiver's busy day.",
    `<h2>Physical Self-Care</h2>
<ul>
<li>Schedule regular health checkups — don't postpone your own appointments</li>
<li>Eat nutritious meals at regular times</li>
<li>Exercise at least 150 minutes per week</li>
<li>Aim for 7–8 hours of sleep per night</li>
<li>Stay hydrated — keep water accessible throughout the day</li>
</ul>

<h2>Emotional Self-Care</h2>
<ul>
<li>Allow yourself to grieve — anticipatory grief is real and valid</li>
<li>Talk to a trusted friend, family member, or therapist</li>
<li>Practice mindfulness or meditation (even 5 minutes helps)</li>
<li>Keep a gratitude journal — find small moments of joy each day</li>
<li>Set boundaries — it's okay to say no to additional demands</li>
</ul>

<h2>Social Self-Care</h2>
<ul>
<li>Maintain at least one friendship outside caregiving</li>
<li>Join an online or in-person caregiver support group</li>
<li>Schedule regular "me time" — even 30 minutes a week</li>
<li>Accept invitations when possible, even briefly</li>
</ul>

<h2>Quick Stress-Relief Techniques</h2>
<ul>
<li><strong>4-7-8 Breathing</strong>: Inhale for 4 seconds, hold for 7, exhale for 8</li>
<li><strong>Progressive Muscle Relaxation</strong>: Tense and release each muscle group</li>
<li><strong>Grounding Exercise</strong>: Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste</li>
</ul>`,
    "5 min read", 2
  ),

  article("cope", "emotional",
    "The Emotional Journey of Dementia Caregiving",
    "Guilt, anger, grief, love — caregiving is an emotional rollercoaster. Understanding these emotions helps you navigate them.",
    `<h2>Common Emotions and Why They're Normal</h2>

<h3>Grief</h3>
<p>You're grieving the person you knew, even while they're still here. This "ambiguous loss" — mourning someone who is physically present but psychologically absent — is one of the most painful aspects of dementia caregiving.</p>

<h3>Guilt</h3>
<p>Caregiver guilt is nearly universal. Guilt about feeling impatient, about considering a care facility, about taking time for yourself, or about wishing it would end. Know this: feeling guilty does not make you a bad person.</p>

<h3>Anger</h3>
<p>Anger at the disease, at the person's behavior, at family who don't help, at the healthcare system. Anger is a normal response to an impossible situation.</p>

<h3>Loneliness</h3>
<p>Even when surrounded by people, caregivers often feel profoundly alone. The person they would normally confide in is the one who needs care.</p>

<h3>Love</h3>
<p>Despite everything, moments of deep love and connection break through. A smile, a squeeze of the hand, a brief moment of clarity — these moments sustain caregivers through the darkness.</p>

<h2>When to Seek Professional Help</h2>
<p>If you experience persistent sadness, hopelessness, sleep changes, appetite changes, difficulty concentrating, or thoughts of self-harm, please reach out to a mental health professional. You deserve support.</p>`,
    "6 min read", 3
  ),

  article("cope", "financial",
    "Financial & Legal Planning for Dementia Families",
    "Early planning protects both the person with dementia and the family. Here's a step-by-step guide to financial and legal preparation.",
    `<h2>Legal Documents to Prepare</h2>
<ul>
<li><strong>Durable Power of Attorney</strong> — Designates someone to manage financial affairs</li>
<li><strong>Healthcare Power of Attorney</strong> — Designates someone to make medical decisions</li>
<li><strong>Advance Directive / Living Will</strong> — Specifies wishes for end-of-life care</li>
<li><strong>Will and Estate Plan</strong> — Ensures assets are distributed according to wishes</li>
<li><strong>HIPAA Authorization</strong> — Allows family members to access medical information</li>
</ul>

<h2>Financial Planning</h2>
<ul>
<li>Review all insurance policies (health, long-term care, life)</li>
<li>Organize financial documents (bank accounts, investments, debts)</li>
<li>Set up automatic bill payments</li>
<li>Explore government programs (Medicare, Medicaid, VA benefits)</li>
<li>Consult an elder law attorney about asset protection</li>
<li>Budget for long-term care costs (home care averages $4,500–$5,000/month; memory care facilities $5,000–$8,000/month)</li>
</ul>

<h2>Paying for Care</h2>
<ul>
<li><strong>Medicare</strong> — Covers some medical costs but NOT long-term custodial care</li>
<li><strong>Medicaid</strong> — Covers nursing home care for those who qualify financially</li>
<li><strong>Long-term care insurance</strong> — Best if purchased before diagnosis</li>
<li><strong>Veterans benefits</strong> — Aid and Attendance benefit for eligible veterans</li>
<li><strong>Reverse mortgage</strong> — Convert home equity to income</li>
</ul>

<h2>Act Early</h2>
<p>The person with dementia must have legal capacity to sign documents. Once capacity is lost, the process becomes much more complicated and expensive (guardianship/conservatorship). Don't wait.</p>`,
    "7 min read", 4
  ),

  article("cope", "support",
    "Building Your Support Network as a Dementia Caregiver",
    "You don't have to do this alone. Here's how to build a strong support network around you and your loved one.",
    `<h2>Types of Support</h2>

<h3>Informal Support</h3>
<ul>
<li>Family members — Share responsibilities fairly</li>
<li>Friends and neighbors — Ask for specific help (meals, errands, sitting)</li>
<li>Faith community — Many offer practical assistance</li>
<li>Online communities — 24/7 access to others who understand</li>
</ul>

<h3>Professional Support</h3>
<ul>
<li>Home health aides</li>
<li>Adult day care programs</li>
<li>Respite care services</li>
<li>Geriatric care managers</li>
<li>Social workers</li>
<li>Therapists specializing in caregiver issues</li>
</ul>

<h3>Community Resources</h3>
<ul>
<li>Alzheimer's Association (24/7 helpline: 1-800-272-3900)</li>
<li>Area Agency on Aging</li>
<li>Meals on Wheels</li>
<li>Transportation services</li>
<li>Support groups (in-person and online)</li>
</ul>

<h2>How to Ask for Help</h2>
<p>Many caregivers struggle to ask for help. Try these approaches:</p>
<ul>
<li>Be specific: "Could you sit with Mom for 2 hours on Thursday?" works better than "I need help."</li>
<li>Use a shared calendar where family can sign up for tasks</li>
<li>Create a CaringBridge or CareCircle page to coordinate help</li>
<li>Accept help when offered — don't say "I'm fine" when you're not</li>
</ul>`,
    "5 min read", 5
  ),

  article("cope", "respite",
    "Respite Care: Taking a Break Without Guilt",
    "Respite care gives you time to rest and recharge. Here's how to find, arrange, and make the most of respite services.",
    `<h2>What Is Respite Care?</h2>
<p>Respite care provides temporary relief for primary caregivers. It can range from a few hours at home to several weeks in a residential facility.</p>

<h2>Types of Respite Care</h2>
<ul>
<li><strong>In-home respite</strong> — A trained helper comes to your home while you take a break</li>
<li><strong>Adult day centers</strong> — Provide socialization, meals, and activities during daytime hours</li>
<li><strong>Residential respite</strong> — Short-term stay in a care facility</li>
<li><strong>Informal respite</strong> — Family or friends take over caregiving temporarily</li>
</ul>

<h2>How to Find Respite Care</h2>
<ul>
<li>Contact your local Area Agency on Aging</li>
<li>Ask your doctor's office for referrals</li>
<li>Call the Alzheimer's Association helpline</li>
<li>Check with local churches and community organizations</li>
<li>Search the ARCH National Respite Locator</li>
</ul>

<h2>Overcoming Guilt</h2>
<p>Remember: taking a break makes you a BETTER caregiver, not a worse one. Research shows that caregivers who use respite care provide better quality care and continue caregiving longer.</p>`,
    "4 min read", 6
  ),

  article("cope", "grief",
    "Anticipatory Grief: Mourning Before Death",
    "Grieving someone who is still alive is a unique pain of dementia caregiving. Understanding it helps you process these difficult emotions.",
    `<h2>What Is Anticipatory Grief?</h2>
<p>Anticipatory grief is the mourning that occurs before a death. In dementia, you grieve the progressive loss of the person's personality, memories, abilities, and your relationship — all while they are still physically present.</p>

<h2>How It Manifests</h2>
<ul>
<li>Sadness when they don't recognize you</li>
<li>Mourning shared activities you can no longer do together</li>
<li>Grief for the future you planned together</li>
<li>Feeling you've already lost them</li>
<li>Guilt about feeling relief at the thought of the end</li>
</ul>

<h2>Coping Strategies</h2>
<ul>
<li><strong>Acknowledge your grief</strong> — Don't minimize it. It's real and valid.</li>
<li><strong>Talk about it</strong> — Share your feelings with someone who understands</li>
<li><strong>Honor the relationship</strong> — Create memory books, record stories</li>
<li><strong>Find meaning</strong> — Many caregivers report personal growth through the experience</li>
<li><strong>Seek professional help</strong> — A grief counselor can provide specialized support</li>
<li><strong>Cherish the present</strong> — Focus on what IS still possible, not what's lost</li>
</ul>

<h2>After They Pass</h2>
<p>After a prolonged caregiving journey, you may feel relief, guilt about feeling relief, emptiness, and loss of purpose. All of these are normal. Give yourself time and grace. Consider bereavement support groups specifically for former dementia caregivers.</p>`,
    "5 min read", 7
  ),

  // ── Module 2: Being a Caregiver (iSupport) ──

  article("cope", "self-care",
    "Being a Caregiver: Understanding Your New Role",
    "Becoming a dementia caregiver changes your identity, relationships, and daily life. This guide helps you navigate the transition with clarity and self-compassion.",
    `<h2>The Shift in Identity</h2>
<p>One day you're a spouse, child, or friend. The next, you're a caregiver — managing medications, handling finances, making medical decisions, and providing intimate personal care. This role reversal is disorienting and emotionally complex.</p>

<h2>What Being a Caregiver Means</h2>
<ul>
<li><strong>You are not alone</strong> — Over 55 million families worldwide are on this same journey</li>
<li><strong>You didn't choose this</strong> — And it's okay to feel conflicted about it</li>
<li><strong>You are enough</strong> — You don't need medical training to provide loving care</li>
<li><strong>Your needs still matter</strong> — Putting yourself last is not noble; it's unsustainable</li>
</ul>

<h2>Common Challenges for New Caregivers</h2>
<ul>
<li>Feeling unprepared and overwhelmed</li>
<li>Navigating changed family dynamics</li>
<li>Balancing caregiving with work and personal life</li>
<li>Making decisions on behalf of someone else</li>
<li>Dealing with denial — your own or the family's</li>
</ul>

<h2>Your Rights as a Caregiver</h2>
<ul>
<li>The right to take care of yourself</li>
<li>The right to seek help from others</li>
<li>The right to feel and express difficult emotions</li>
<li>The right to reject manipulation</li>
<li>The right to receive consideration, affection, and acceptance</li>
<li>The right to take pride in your accomplishments</li>
<li>The right to be treated with respect</li>
</ul>

<h2>First Steps</h2>
<p>Learn about the specific type of dementia your loved one has. Connect with a support group early. Establish a care team and delegate tasks. Set up legal and financial documents while the person can still participate. And most importantly — be patient with yourself.</p>`,
    "6 min read", 8
  ),

  article("cope", "emotional",
    "Challenging Negative Thoughts: CBT Techniques for Caregivers",
    "Your thoughts shape your experience. Learn cognitive-behavioral techniques to break cycles of guilt, helplessness, and catastrophic thinking.",
    `<h2>How Thoughts Affect Caregiving</h2>
<p>Cognitive Behavioral Therapy (CBT) research, referenced in the WHO iSupport programme, shows that how we THINK about a situation directly affects how we FEEL and BEHAVE. Negative thought patterns are common in caregivers and worsen stress, depression, and burnout.</p>

<h2>Common Unhelpful Thought Patterns</h2>
<ul>
<li><strong>All-or-nothing thinking</strong> — "If I can't do this perfectly, I'm failing."</li>
<li><strong>Catastrophizing</strong> — "Everything is getting worse. There's no hope."</li>
<li><strong>Mind-reading</strong> — "Everyone thinks I'm a terrible caregiver."</li>
<li><strong>Should statements</strong> — "I should be able to handle this without help."</li>
<li><strong>Personalization</strong> — "She hit me because she hates me." (It's the disease.)</li>
<li><strong>Emotional reasoning</strong> — "I feel guilty, so I must be doing something wrong."</li>
</ul>

<h2>The ABCDE Technique</h2>
<ol>
<li><strong>A — Activating Event:</strong> What happened? ("Mom asked the same question 20 times.")</li>
<li><strong>B — Belief:</strong> What did you think? ("I can't take this anymore. I'm going to lose it.")</li>
<li><strong>C — Consequence:</strong> How did you feel/act? (Frustrated, snapped at her.)</li>
<li><strong>D — Dispute:</strong> Challenge the thought. ("She can't help it. I need a break, not an escape.")</li>
<li><strong>E — New Effect:</strong> How do you feel now? (Calmer. "I'll ask my sister to come over tonight.")</li>
</ol>

<h2>Replacing Unhelpful Thoughts</h2>
<ul>
<li>"I should be able to do this alone" → "Asking for help is strength, not weakness"</li>
<li>"Everything is falling apart" → "Today was hard. Tomorrow I'll try something different"</li>
<li>"I'm a terrible caregiver" → "I'm doing the best I can in an impossible situation"</li>
<li>"Nothing I do makes a difference" → "My presence and love matter, even when it doesn't feel like it"</li>
</ul>

<h2>Practice Daily</h2>
<p>Keep a thought diary for one week. Write down the situation, your automatic thought, the emotion it caused, and a more balanced alternative. This simple practice, recommended by WHO iSupport, has been shown to significantly reduce caregiver depression and anxiety.</p>`,
    "7 min read", 9
  ),

  article("cope", "support",
    "Staying Connected: Maintaining Relationships While Caregiving",
    "Caregiving can be profoundly isolating. Here's how to maintain friendships, family bonds, and your social identity beyond the caregiver role.",
    `<h2>Why Isolation Happens</h2>
<p>Dementia caregivers are among the most socially isolated people in society. Reasons include:</p>
<ul>
<li>The person with dementia may behave unpredictably in social settings</li>
<li>Friends and family may withdraw because they don't know what to say or do</li>
<li>Caregiving demands leave little time or energy for socializing</li>
<li>Grief and depression reduce motivation to connect</li>
<li>Stigma around dementia still exists</li>
</ul>

<h2>Strategies to Stay Connected</h2>
<ul>
<li><strong>Be honest with friends</strong> — Tell them what you need. "I can't always call, but a text means the world."</li>
<li><strong>Accept imperfect social contact</strong> — A 10-minute phone call counts. A text conversation counts.</li>
<li><strong>Invite people in</strong> — If you can't go out, have friends come to you. Many are willing but unsure if they should ask.</li>
<li><strong>Use technology</strong> — Video calls, social media, and online communities help bridge the gap</li>
<li><strong>Join a support group</strong> — People who truly understand what you're going through</li>
<li><strong>Maintain one activity</strong> — Even if you scale back, keep one hobby, class, or regular outing</li>
</ul>

<h2>Managing Family Relationships</h2>
<ul>
<li>Hold family meetings to share updates and divide responsibilities</li>
<li>Use a shared app or platform (like ChallengeD's UniteD) to coordinate</li>
<li>Address conflicts directly and early — resentment festers</li>
<li>Recognize that everyone grieves differently</li>
<li>Accept that not all family members will contribute equally</li>
</ul>

<h2>Your Identity Beyond Caregiving</h2>
<p>You are more than a caregiver. You are still a friend, a professional, a person with interests and dreams. Maintaining even small connections to your pre-caregiving identity is essential for long-term resilience.</p>`,
    "6 min read", 10
  ),
];

// ═══════════════════════════════════════════════
// SafeD — Safety Guides
// ═══════════════════════════════════════════════

const safeArticles: ChallengedContentItem[] = [
  article("safe", "home-safety",
    "Complete Home Safety Checklist for Dementia",
    "A room-by-room guide to making your home safe for someone with dementia — from the kitchen to the bedroom.",
    `<h2>General Home Safety</h2>
<ul>
<li>Remove throw rugs and secure loose carpeting</li>
<li>Install handrails on both sides of staircases</li>
<li>Ensure adequate lighting throughout — no dark corners</li>
<li>Remove or secure sharp objects, toxic chemicals, and medications</li>
<li>Cover electrical outlets not in use</li>
<li>Install smoke detectors and carbon monoxide detectors on every level</li>
<li>Remove locks from interior doors (to prevent being locked in)</li>
</ul>

<h2>Kitchen</h2>
<ul>
<li>Install automatic shut-off devices on stove</li>
<li>Remove or lock up knives and sharp utensils</li>
<li>Lock up cleaning products and chemicals</li>
<li>Use unbreakable dishes</li>
<li>Disconnect garbage disposal switch</li>
<li>Set water heater to 120°F (49°C) to prevent scalding</li>
</ul>

<h2>Bathroom</h2>
<ul>
<li>Install grab bars near toilet and in shower/tub</li>
<li>Use a shower chair and handheld showerhead</li>
<li>Place non-slip mats inside and outside the tub</li>
<li>Remove lock from bathroom door</li>
<li>Use a raised toilet seat if needed</li>
</ul>

<h2>Bedroom</h2>
<ul>
<li>Place nightlights along the path to the bathroom</li>
<li>Use bed rails if there's a risk of falling out of bed</li>
<li>Remove clutter from the floor</li>
<li>Consider a bed alarm for nighttime wandering</li>
</ul>

<h2>Outside</h2>
<ul>
<li>Ensure walkways are smooth and well-lit</li>
<li>Install motion-sensor lights</li>
<li>Fence the yard if possible</li>
<li>Lock gates and remove access to pools</li>
<li>Remove poisonous plants</li>
</ul>`,
    "7 min read", 1
  ),

  article("safe", "wandering",
    "Wandering Prevention & Response Plan",
    "60% of people with dementia will wander at some point. Being prepared can save a life.",
    `<h2>Understanding Wandering</h2>
<p>Wandering can happen at any stage and for many reasons: searching for something familiar, following a past routine, restlessness, or simply getting lost. It is one of the most dangerous behaviors because it can lead to injury, exposure, or death.</p>

<h2>Prevention Strategies</h2>
<ul>
<li><strong>GPS tracking</strong> — Use a GPS device (shoe insert, watch, or pendant)</li>
<li><strong>Door alarms</strong> — Install chimes or alarms on all exit doors</li>
<li><strong>Camouflage exits</strong> — Paint doors the same color as walls, cover doorknobs with cloth covers</li>
<li><strong>Place STOP signs</strong> on doors at eye level</li>
<li><strong>Fulfill underlying needs</strong> — Ensure adequate exercise, toileting, and engagement</li>
<li><strong>Avoid new environments</strong> that may trigger confusion</li>
</ul>

<h2>Identification</h2>
<ul>
<li>Medical ID bracelet with name, condition, and emergency contact</li>
<li>ID card in their pocket at all times</li>
<li>Sew ID labels into clothing</li>
<li>Keep a recent photo on your phone for emergencies</li>
<li>Register with MedicAlert + Alzheimer's Association Safe Return</li>
</ul>

<h2>If They Go Missing</h2>
<ol>
<li>Begin searching immediately — don't wait</li>
<li>Call 911 — identify the person as having dementia</li>
<li>Search nearby areas first (they usually don't go far)</li>
<li>Check previous addresses and familiar locations</li>
<li>Alert neighbors and ask them to check their property</li>
<li>Activate your GPS tracking device</li>
</ol>

<h2>Statistics</h2>
<p>If a person with dementia is not found within 24 hours, up to half will suffer serious injury or death. This is why prevention and rapid response are critical.</p>`,
    "6 min read", 2
  ),

  article("safe", "falls",
    "Fall Prevention: Keeping Your Loved One Upright",
    "Falls are the leading cause of injury in people with dementia. Most falls are preventable with the right measures.",
    `<h2>Why People with Dementia Fall</h2>
<ul>
<li>Impaired judgment and spatial awareness</li>
<li>Medication side effects (dizziness, drowsiness)</li>
<li>Muscle weakness from inactivity</li>
<li>Vision changes</li>
<li>Environmental hazards</li>
<li>Rushing to the bathroom</li>
</ul>

<h2>Prevention Strategies</h2>

<h3>Environmental</h3>
<ul>
<li>Remove throw rugs, electrical cords, and clutter from walkways</li>
<li>Ensure adequate lighting, especially at night</li>
<li>Install grab bars in bathroom and along hallways</li>
<li>Use non-slip mats in bathroom and kitchen</li>
<li>Secure furniture so it won't tip if leaned on</li>
</ul>

<h3>Physical</h3>
<ul>
<li>Encourage regular exercise (walking, balance exercises, chair yoga)</li>
<li>Ensure proper-fitting, non-slip footwear</li>
<li>Schedule regular vision and hearing checks</li>
<li>Review medications with the doctor for fall-risk side effects</li>
<li>Ensure adequate vitamin D and calcium intake</li>
</ul>

<h3>Assistive Devices</h3>
<ul>
<li>Walkers or canes as recommended by a physical therapist</li>
<li>Hip protectors to reduce fracture risk</li>
<li>Bed rails if they roll out of bed</li>
<li>Motion-sensor nightlights</li>
</ul>

<h2>After a Fall</h2>
<p>Don't panic. Check for injuries before moving them. If they can't get up or you suspect a fracture, call for medical help. Document falls (time, place, what they were doing) to identify patterns.</p>`,
    "5 min read", 3
  ),

  article("safe", "driving",
    "When to Stop Driving: A Difficult but Critical Decision",
    "Driving requires complex cognitive skills that dementia progressively impairs. Here's how to navigate this sensitive topic.",
    `<h2>Why Driving Becomes Unsafe</h2>
<p>Driving requires attention, memory, judgment, visual-spatial processing, and quick reaction times — all of which dementia impairs. People with dementia are 2–8 times more likely to have crashes.</p>

<h2>Warning Signs</h2>
<ul>
<li>Getting lost on familiar routes</li>
<li>Forgetting how to get to familiar places</li>
<li>Making slow or poor decisions in traffic</li>
<li>Driving at inappropriate speeds</li>
<li>Confusing the brake and gas pedals</li>
<li>New dents or scratches on the car</li>
<li>Other drivers honking or expressing frustration</li>
<li>Getting traffic tickets</li>
</ul>

<h2>How to Approach the Conversation</h2>
<ul>
<li>Have the doctor bring it up — the person may accept medical advice more readily</li>
<li>Frame it as safety, not taking away independence</li>
<li>Offer concrete alternatives for transportation</li>
<li>Consider a professional driving assessment</li>
<li>Be prepared — they may react with anger or denial</li>
</ul>

<h2>Alternative Transportation</h2>
<ul>
<li>Family and friends driving schedule</li>
<li>Ride-sharing services (Uber, Lyft)</li>
<li>Senior transportation services</li>
<li>Volunteer driver programs</li>
<li>Public transportation with a companion</li>
</ul>

<h2>If They Won't Stop</h2>
<p>As a last resort: disable the car, hide the keys, sell the vehicle, or ask the DMV to require a driving test. Safety must come first.</p>`,
    "5 min read", 4
  ),

  article("safe", "emergency",
    "Emergency Preparedness for Dementia Households",
    "Natural disasters, medical emergencies, and power outages require special planning when someone has dementia.",
    `<h2>Emergency Kit Essentials</h2>
<ul>
<li>7-day supply of medications in a waterproof container</li>
<li>Medical information card (diagnoses, medications, allergies, doctor contact)</li>
<li>Copy of legal documents (power of attorney, advance directive)</li>
<li>Recent photo of the person with dementia</li>
<li>Comfort items (favorite snack, blanket, family photos)</li>
<li>Extra clothing and incontinence supplies</li>
<li>GPS tracking device (fully charged)</li>
<li>Flashlight with extra batteries</li>
<li>Emergency contact list</li>
</ul>

<h2>Planning Ahead</h2>
<ul>
<li>Identify two evacuation routes from your home</li>
<li>Practice the evacuation plan when the person is calm</li>
<li>Inform neighbors and local emergency services about the person's condition</li>
<li>Register with your local emergency alert system</li>
<li>Identify a backup caregiver in case you are incapacitated</li>
<li>Have a plan for if you are separated (ID bracelet, GPS, phone check-in)</li>
</ul>

<h2>During an Emergency</h2>
<ul>
<li>Stay calm — your anxiety will increase theirs</li>
<li>Speak in simple, reassuring terms</li>
<li>Don't try to explain the emergency in detail</li>
<li>Bring comfort items if evacuating</li>
<li>Keep routines as normal as possible</li>
</ul>`,
    "5 min read", 5
  ),

  article("safe", "medication",
    "Medication Safety: Preventing Dangerous Mistakes",
    "Medication errors are common and dangerous in dementia. Here's how to prevent overdoses, missed doses, and harmful interactions.",
    `<h2>Common Medication Risks</h2>
<ul>
<li>Taking medications multiple times (forgetting they already took them)</li>
<li>Missing doses entirely</li>
<li>Taking the wrong medication</li>
<li>Taking incorrect dosages</li>
<li>Dangerous drug interactions</li>
<li>Hiding or hoarding medications</li>
</ul>

<h2>Safety Measures</h2>
<ul>
<li><strong>Lock up all medications</strong> — Only the caregiver should have access</li>
<li><strong>Use a pill organizer</strong> — Pre-fill weekly and check daily</li>
<li><strong>Keep a medication log</strong> — Record every dose given</li>
<li><strong>Use one pharmacy</strong> — They can check for interactions</li>
<li><strong>Regular medication reviews</strong> — Ask the doctor at every visit</li>
<li><strong>Dispose of expired medications</strong> — Don't leave them accessible</li>
</ul>

<h2>Medications to Avoid</h2>
<p>The Beers Criteria lists medications that are potentially inappropriate for older adults. Common ones that can worsen dementia symptoms:</p>
<ul>
<li>Diphenhydramine (Benadryl) — worsens confusion</li>
<li>Benzodiazepines (Valium, Xanax) — increase fall risk</li>
<li>Opioids — confusion, falls, respiratory depression</li>
<li>Anticholinergics — directly worsen cognitive function</li>
</ul>`,
    "5 min read", 6
  ),

  // ── Fire Safety & NRT + Bathing Safety ──

  article("safe", "fire",
    "Fire Safety for Dementia Households: Prevention, NRT, and Smoking Risks",
    "People with dementia who smoke are at extreme fire risk. This comprehensive guide covers fire prevention, nicotine replacement therapy (NRT), and emergency planning.",
    `<h2>Why Dementia + Smoking = Extreme Fire Risk</h2>
<p>Smoking is one of the leading causes of fatal house fires. When combined with dementia — which impairs judgment, memory, and reaction time — the risk multiplies dramatically. A person with dementia may:</p>
<ul>
<li>Forget a lit cigarette and fall asleep</li>
<li>Drop a cigarette onto clothing, furniture, or bedding</li>
<li>Leave a lighter or match unattended near flammable materials</li>
<li>Be unable to respond appropriately to a fire alarm</li>
<li>Forget how to use a fire extinguisher or call for help</li>
</ul>

<h2>Nicotine Replacement Therapy (NRT)</h2>
<p>NRT is one of the most important safety interventions for dementia patients who smoke. It removes the fire risk entirely while addressing nicotine dependence:</p>

<h3>Types of NRT</h3>
<ul>
<li><strong>Nicotine patches</strong> — 24-hour slow release. Easiest for dementia patients as caregivers can apply/remove them. Available in 21mg, 14mg, and 7mg strengths for gradual step-down.</li>
<li><strong>Nicotine gum</strong> — 2mg and 4mg. May be suitable for early-stage patients who can follow chewing instructions.</li>
<li><strong>Nicotine lozenges</strong> — Dissolve in the mouth. Simpler than gum for those with chewing difficulties.</li>
<li><strong>Nicotine inhaler</strong> — Mimics the hand-to-mouth action of smoking, which some patients find comforting.</li>
<li><strong>Nicotine spray</strong> — Fast-acting for acute cravings.</li>
</ul>

<h3>NRT for Dementia Patients — Special Considerations</h3>
<ul>
<li><strong>Patches are the top recommendation</strong> — The caregiver manages application; no patient compliance required</li>
<li>Remove patch at bedtime if vivid dreams occur (switch to 16-hour patch)</li>
<li>Monitor skin for irritation — rotate application sites daily</li>
<li>Consult the doctor before starting NRT, especially if the patient has cardiovascular conditions</li>
<li>Combine with hiding cigarettes and lighters to prevent dual use</li>
</ul>

<h2>Fire Prevention Checklist</h2>
<ul>
<li>Install smoke alarms on every floor and in the kitchen and bedroom</li>
<li>Test smoke alarms monthly — the person may not hear or respond to them</li>
<li>Consider interconnected alarms that all sound when one is triggered</li>
<li>Remove or lock up lighters, matches, and candles</li>
<li>Install automatic stove shut-off devices</li>
<li>Use flameless candles for ambiance</li>
<li>Keep a fire extinguisher accessible to caregivers</li>
<li>Never leave the person alone with an open flame</li>
<li>Install fireproof bedding if they have a history of smoking in bed</li>
</ul>

<h2>Emergency Fire Plan</h2>
<ul>
<li>Practice fire escape routes — even if the person won't remember, muscle memory can help</li>
<li>Install exit path lighting that activates with smoke alarms</li>
<li>Alert your local fire department that a person with dementia lives at this address</li>
<li>Keep doors unlocked from the inside for quick exit (balance with wandering prevention)</li>
<li>Have an emergency bag ready with medications, IDs, and important documents</li>
</ul>

<h2>Recommended Products</h2>
<ul>
<li>10-year sealed lithium battery smoke alarms (no battery changes needed)</li>
<li>Stove guard automatic shut-off devices</li>
<li>Fireproof bedding and chair throws</li>
<li>NRT starter kits (patches + lozenges combination packs)</li>
<li>Flameless LED candles</li>
<li>Lockboxes for lighters and matches</li>
</ul>`,
    "10 min read", 7
  ),

  article("safe", "bathing",
    "Bathing Safety: Preventing Injuries During Personal Care",
    "The bathroom is the most dangerous room for someone with dementia. These safety measures prevent falls, burns, and distress during bathing.",
    `<h2>Why Bathing Is High-Risk</h2>
<p>The bathroom combines wet surfaces, hard edges, hot water, and a vulnerable person who may be confused, frightened, or resistant. Falls in the bathroom are a leading cause of hospitalization in dementia patients.</p>

<h2>Equipment Essentials</h2>
<ul>
<li><strong>Grab bars</strong> — Install near the toilet, inside and outside the tub/shower. Use bars rated for at least 250 lbs (screwed into studs, not suction cups)</li>
<li><strong>Shower chair or bath bench</strong> — Allows seated bathing, reducing fall risk dramatically</li>
<li><strong>Handheld showerhead</strong> — Gentler, less frightening than overhead water, and allows seated bathing</li>
<li><strong>Non-slip mats</strong> — Inside the tub AND on the bathroom floor</li>
<li><strong>Raised toilet seat</strong> — Easier to sit down and stand up</li>
<li><strong>Thermostatic mixing valve</strong> — Prevents scalding by limiting water temperature</li>
</ul>

<h2>Temperature Safety</h2>
<ul>
<li>Set water heater to 120°F / 49°C maximum</li>
<li>Always test water temperature yourself before the person enters</li>
<li>Consider installing an anti-scald device on faucets</li>
<li>People with dementia may lose the ability to sense temperature extremes</li>
</ul>

<h2>Reducing Bathing Resistance</h2>
<ul>
<li>Follow their lifelong bathing preferences (bath vs. shower, morning vs. evening)</li>
<li>Warm the bathroom first — cold air causes resistance and distress</li>
<li>Use a calm, reassuring voice throughout</li>
<li>Cover body parts not being washed for warmth and dignity</li>
<li>Let them do as much as possible independently</li>
<li>On bad days, a sponge bath is perfectly acceptable</li>
<li>Consider no-rinse body wash and shampoo products</li>
</ul>

<h2>When Professional Help Is Needed</h2>
<p>If bathing becomes a consistent source of aggression or extreme distress, consider hiring a home health aide for bathing assistance. Sometimes a non-family caregiver encounters less resistance.</p>`,
    "6 min read", 8
  ),
];

// ═══════════════════════════════════════════════

const accompanyArticles: ChallengedContentItem[] = [
  article("accompany", "companion-guides",
    "The Art of Being Present: A Companion's Guide",
    "Being a good companion to someone with dementia isn't about fixing things — it's about being fully present with them.",
    `<h2>What Makes a Good Companion?</h2>
<p>A good companion meets the person where they are, not where you wish they were. This means accepting reality without constantly correcting, entering their world with empathy, and finding joy in small moments.</p>

<h2>Being Present</h2>
<ul>
<li><strong>Put away your phone</strong> — Give them your undivided attention</li>
<li><strong>Follow their lead</strong> — If they want to talk about their childhood, join them</li>
<li><strong>Use touch</strong> — Hold hands, give gentle shoulder rubs</li>
<li><strong>Match their pace</strong> — Don't rush them</li>
<li><strong>Embrace silence</strong> — Companionship doesn't require constant talking</li>
</ul>

<h2>Validation Therapy</h2>
<p>Instead of correcting or arguing, validate their feelings:</p>
<ul>
<li>If they say "I want to go home" (while at home), respond to the feeling: "You're feeling homesick. Tell me about your home."</li>
<li>If they're looking for their deceased parent: "You miss your mom. What was she like?"</li>
<li>If they don't recognize you: "I'm here with you. I care about you."</li>
</ul>

<h2>Activities to Share</h2>
<ul>
<li>Listen to their favorite music together</li>
<li>Look through family photo albums</li>
<li>Take a gentle walk outside</li>
<li>Do a simple craft or puzzle</li>
<li>Watch old movies or nature shows</li>
<li>Read aloud from a favorite book</li>
<li>Sit in the garden together</li>
</ul>`,
    "5 min read", 1
  ),

  article("accompany", "activities",
    "25 Activities to Enjoy Together with Someone Who Has Dementia",
    "Meaningful activities create connection and joy. Here are 25 ideas organized by energy level and ability.",
    `<h2>Low Energy / Late Stage</h2>
<ol>
<li>Hand massage with scented lotion</li>
<li>Listen to their era's music</li>
<li>Watch birds at a feeder outside the window</li>
<li>Gentle chair exercises</li>
<li>Read poetry or scripture aloud</li>
<li>Look at large-print photo books</li>
<li>Aromatherapy with familiar scents (lavender, vanilla, baking bread)</li>
</ol>

<h2>Moderate Energy / Middle Stage</h2>
<ol start="8">
<li>Sort items (buttons, coins, cards by color)</li>
<li>Fold towels or match socks</li>
<li>Water plants or do light gardening</li>
<li>Paint or color together</li>
<li>Bake simple cookies (let them stir)</li>
<li>Dance to familiar music</li>
<li>Play simple card games (Go Fish, matching)</li>
<li>Put together a simple puzzle (25-50 pieces)</li>
<li>Brush a pet or visit therapy animals</li>
</ol>

<h2>Higher Energy / Early Stage</h2>
<ol start="17">
<li>Take walks in nature</li>
<li>Visit a museum or botanical garden</li>
<li>Attend a music concert or sing-along</li>
<li>Cook a familiar recipe together</li>
<li>Work on a scrapbook</li>
<li>Play a simplified board game</li>
<li>Attend a dementia-friendly community event</li>
<li>Volunteer together (simple tasks)</li>
<li>Take a scenic drive to familiar places</li>
</ol>

<h2>Tips for Success</h2>
<ul>
<li>Focus on enjoyment, not achievement</li>
<li>Be flexible — switch activities if frustration builds</li>
<li>Praise effort, not results</li>
<li>Watch for signs of fatigue and stop before they're exhausted</li>
</ul>`,
    "5 min read", 2
  ),

  article("accompany", "remote-care",
    "Caring from a Distance: Remote Caregiving Guide",
    "Not every caregiver lives nearby. Here's how to provide meaningful support and monitor wellbeing from afar.",
    `<h2>Technology for Remote Monitoring</h2>
<ul>
<li><strong>Video calling</strong> — Schedule regular video calls (Zoom, FaceTime). Familiar faces and voices bring comfort.</li>
<li><strong>Smart home devices</strong> — Motion sensors, smart doorbells, medication reminders</li>
<li><strong>GPS tracking</strong> — Wearable devices for wandering detection</li>
<li><strong>Security cameras</strong> — In common areas (with consent) for safety monitoring</li>
<li><strong>Medical alert systems</strong> — Fall detection pendants that automatically call for help</li>
</ul>

<h2>Coordinating Care</h2>
<ul>
<li>Hire a geriatric care manager in their area</li>
<li>Use a shared calendar app for appointments and tasks</li>
<li>Set up a family group chat for daily updates</li>
<li>Create a care plan document accessible to all caregivers</li>
<li>Schedule regular check-ins with local caregivers</li>
</ul>

<h2>What You Can Do From Afar</h2>
<ul>
<li>Handle finances and paperwork</li>
<li>Research resources and services</li>
<li>Coordinate appointments</li>
<li>Order groceries and supplies for delivery</li>
<li>Provide emotional support to the primary caregiver</li>
<li>Plan visits that give the primary caregiver a break</li>
</ul>

<h2>Dealing with Distance Guilt</h2>
<p>If you can't be there in person, remember that your contributions matter. Financial support, emotional support, coordination, and planned visits all make a real difference. One person cannot and should not do everything alone.</p>`,
    "5 min read", 3
  ),

  article("accompany", "ai-companion",
    "AI Companionship for Dementia: How Technology Can Help",
    "AI companions can provide stimulation, reminders, and comfort — supplementing (never replacing) human connection.",
    `<h2>What AI Companions Can Do</h2>
<ul>
<li><strong>Conversation</strong> — Engage in patient, repetitive conversations without frustration</li>
<li><strong>Music therapy</strong> — Play personalized playlists from their era</li>
<li><strong>Reminiscence</strong> — Prompt memory-sharing with questions about their past</li>
<li><strong>Reminders</strong> — Medication, meal, and appointment reminders</li>
<li><strong>Cognitive exercises</strong> — Simple word games, trivia, and puzzles</li>
<li><strong>Emergency detection</strong> — Monitor for unusual patterns and alert caregivers</li>
</ul>

<h2>Benefits</h2>
<ul>
<li>Available 24/7, including during "sundowning" hours</li>
<li>Infinite patience — never gets frustrated or tired</li>
<li>Reduces caregiver burden during short breaks</li>
<li>Provides stimulation when human companions aren't available</li>
<li>Can be personalized with family stories and preferences</li>
</ul>

<h2>Limitations</h2>
<ul>
<li>Cannot replace human touch and emotional connection</li>
<li>May confuse some people with dementia</li>
<li>Privacy concerns with always-on devices</li>
<li>Technology failures can cause distress</li>
</ul>

<h2>Best Practices</h2>
<ul>
<li>Introduce AI gradually and observe the person's reaction</li>
<li>Use AI as a supplement, not a replacement for human interaction</li>
<li>Choose devices with simple, intuitive interfaces</li>
<li>Ensure privacy settings are properly configured</li>
<li>Involve the care team in deciding what's appropriate</li>
</ul>`,
    "5 min read", 4
  ),

  article("accompany", "find-companions",
    "How to Find the Right Companion for Your Loved One",
    "Professional companions, volunteers, and peer programs — explore all the options for keeping your loved one engaged and supported.",
    `<h2>Types of Companions</h2>

<h3>Professional Companions</h3>
<ul>
<li>Home care aides trained in dementia care</li>
<li>Certified dementia practitioners</li>
<li>Licensed social workers with geriatric experience</li>
<li>Music or art therapists</li>
</ul>

<h3>Volunteer Programs</h3>
<ul>
<li>Friendly visitor programs through local aging agencies</li>
<li>Faith-based volunteer services</li>
<li>College student volunteer programs</li>
<li>Retired Senior Volunteer Program (RSVP)</li>
</ul>

<h3>Peer Programs</h3>
<ul>
<li>Dementia-friendly community programs</li>
<li>Memory cafés — social gatherings for people with dementia and caregivers</li>
<li>Intergenerational programs with schools or youth groups</li>
</ul>

<h2>What to Look For</h2>
<ul>
<li><strong>Patience and empathy</strong> — The most important qualities</li>
<li><strong>Dementia training</strong> — Understanding of the condition and behaviors</li>
<li><strong>Reliability</strong> — Consistency is important for people with dementia</li>
<li><strong>Shared interests</strong> — Match based on hobbies, music taste, or background</li>
<li><strong>Background check</strong> — Always verify for safety</li>
</ul>

<h2>Making It Work</h2>
<ul>
<li>Start with short visits and gradually increase</li>
<li>Provide the companion with a "cheat sheet" about the person (likes, dislikes, triggers, calming strategies)</li>
<li>Stay nearby during initial visits</li>
<li>Get regular feedback from both parties</li>
</ul>`,
    "5 min read", 5
  ),
];

// ═══════════════════════════════════════════════
// Export all content grouped by category
// ═══════════════════════════════════════════════

export const STATIC_CONTENT: Record<string, ChallengedContentItem[]> = {
  aware: awareArticles,
  care: careArticles,
  cope: copeArticles,
  safe: safeArticles,
  accompany: accompanyArticles,
};

export function getStaticContent(
  category?: string,
  subcategory?: string
): ChallengedContentItem[] {
  let items: ChallengedContentItem[] = [];
  if (category) {
    items = STATIC_CONTENT[category] || [];
  } else {
    items = Object.values(STATIC_CONTENT).flat();
  }
  if (subcategory) {
    items = items.filter((i) => i.subcategory === subcategory);
  }
  return items.sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));
}

export function getStaticContentById(id: string): ChallengedContentItem | null {
  const all = Object.values(STATIC_CONTENT).flat();
  return all.find((a) => a.id === id) || null;
}
