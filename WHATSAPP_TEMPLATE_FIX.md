# WhatsApp Template Fix Guide - Complete Edition

## Problem
Meta automatically changed templates from UTILITY to MARKETING because the wording seemed promotional. MARKETING templates have severe delivery restrictions (error 63049).

---

# ⚠️ CRITICAL: Template Name Format

**MOST COMMON ERROR:**
```
❌ WRONG: "Donation Receipt - Utility"
✅ CORRECT: "temple_donation_receipt_utility_v3"
```

**Template names MUST:**
- Only contain lowercase letters (a-z)
- Only contain numbers (0-9)
- Only contain underscores (_)
- **NO spaces, NO hyphens, NO capital letters**

If you use spaces or hyphens in the template name, Twilio will reject it with:
```
"WhatsApp template name can only contain lowercase alphanumeric
characters and underscores ( _ ). No other characters or white
space are allowed"
```

---

# 🚨 CRITICAL RULES - READ BEFORE CREATING ANY TEMPLATE

## ✅ MANDATORY REQUIREMENTS CHECKLIST

Before creating each template, verify:

- [ ] **Category MUST be "UTILITY"** (NOT Marketing, NOT Authentication)
- [ ] **Template name MUST include "utility"** (e.g., `temple_donation_receipt_utility_v3`)
- [ ] **Language MUST be "English"**
- [ ] **Sample content MUST be filled for ALL variables**
- [ ] **NO promotional words** (thank you, generous, blessed, divine, etc.)
- [ ] **Keep it factual and transactional only**
- [ ] **Header MUST be text-only** (if used)
- [ ] **Footer MUST be short contact info only** (if used)
- [ ] **Variable count MUST match your code exactly**
- [ ] **Variable order MUST match your code exactly**
- [ ] **⚠️ CRITICAL: Variables CANNOT be at start or end of template body**
- [ ] **⚠️ CRITICAL: Template must have good text-to-variable ratio (more text than variables)**

---

## 📋 STEP-BY-STEP TEMPLATE CREATION PROCESS

### Step 1: Access Twilio Console
1. Go to: https://console.twilio.com/us1/develop/sms/content-editor
2. Log in with your Twilio credentials
3. Click **"Create new template"** button (blue button, top right)

### Step 2: Fill Basic Information

#### Field: **Friendly Name**
- **What to enter:** Descriptive name for your reference
- **Example:** `Donation Receipt - Utility Category`
- **Rules:** Human-readable, internal use only

#### Field: **Template Name** ⚠️ CRITICAL
- **What to enter:** Unique identifier used in code
- **Example:** `temple_donation_receipt_utility_v3`
- **Rules:**
  - **ONLY lowercase letters, numbers, and underscores** (a-z, 0-9, _)
  - **NO spaces, NO hyphens, NO capital letters**
  - MUST include "utility" in the name
  - Must be unique across all your templates
  - **This is what you'll reference in your .env file**
  - **Example CORRECT:** `temple_donation_receipt_utility_v3`
  - **Example WRONG:** `Temple Donation Receipt - Utility` ❌
  - **Example WRONG:** `temple-donation-receipt` ❌

#### Field: **Category** ⚠️ MOST CRITICAL
- **What to select:** **UTILITY** (from dropdown)
- **Why:** UTILITY = transactional messages (receipts, confirmations)
- **NOT Marketing:** Marketing requires opt-ins and has strict limits
- **NOT Authentication:** Only for OTP/verification codes

#### Field: **Language**
- **What to select:** English (or English - United States)
- **Why:** Must match your message content language

### Step 3: Add Content Components

#### **Header** (Optional - recommended for user-facing templates)
1. Click **"Add Header"**
2. Select **"Text"**
3. **Sample headers for each template:**
   - Donation Receipt: `Receipt Confirmation`
   - Pooja Booking: `Booking Confirmation`
   - Parihara Booking: `Booking Confirmation`
   - Astrology: `Consultation Confirmation`
   - Admin templates: `New Transaction Alert`

**Header Rules:**
- ✅ Keep it short (1-3 words)
- ✅ Use neutral, transactional language
- ❌ NO emojis
- ❌ NO promotional words
- ❌ NO variables in header

#### **Body** ⚠️ CRITICAL - Most Important Part

**Rules for Body:**
1. Use **{{1}}**, **{{2}}**, etc. for variables (NOT {{name}} or {{amount}})
2. Number variables starting from 1
3. Keep language factual and boring (this is GOOD!)
4. NO "thank you", "blessed", "generous", "divine", etc.
5. Use "Confirmed", "Processed", "Scheduled" instead
6. Always end with contact information line

**Important:** After entering body text with variables, you MUST click **"Add Sample Content"** for each variable!

#### **Footer** (Optional - recommended)
- **What to enter:** Temple contact information
- **Example:** `Shri Raghavendra Swamy Temple`
- **Rules:**
  - Max 60 characters
  - NO marketing language
  - Just temple name or basic contact

#### **Buttons** (Optional - NOT recommended for this use case)
- **Do NOT add buttons** unless specifically needed
- Buttons can trigger marketing classification

### Step 4: Add Variables with Sample Content ⚠️ CRITICAL

**This is where most people fail!**

For EACH variable ({{1}}, {{2}}, etc.):

1. The variable will appear in the right panel
2. Click on **"Add Sample"** or **"Sample Value"** field
3. **Enter realistic sample data** (NOT "sample" or "test")

**Example Sample Content for Donation Receipt:**
- Variable {{1}} (Donor Name): `Ramesh Kumar`
- Variable {{2}} (Amount): `501`
- Variable {{3}} (Receipt Number): `DN-2025-001234`
- Variable {{4}} (Date): `23/11/2025`

**Why this matters:**
- Meta reviews templates using sample content
- Poor samples = rejection
- Use real-looking data (Indian names for your case)
- Use realistic amounts, dates, booking IDs

### Step 5: Preview and Verify

1. Click **"Preview"** button
2. Check that sample content appears correctly
3. Verify variable placement
4. Check for typos
5. Verify category still shows **UTILITY**

### Step 6: Submit for Approval

1. Click **"Submit for Approval"**
2. Wait for confirmation message
3. Template status will show **"Pending"**
4. Check back in 1-2 hours

---

# 📝 TEMPLATE SPECIFICATIONS

## Template 1: DONATION RECEIPT (User)

### Basic Information
- **Friendly Name:** `Donation Receipt - Utility`
- **Template Name:** `temple_donation_receipt_utility_v3`
- **Category:** UTILITY ⚠️
- **Language:** English

### Header
```
Receipt Confirmation
```

### Body
```
Donation Receipt Confirmation

This message confirms your donation transaction has been recorded in our system.

Donor Name: {{1}}
Donation Amount: ₹{{2}}
Receipt Number: {{3}}
Transaction Date: {{4}}

Your donation has been processed successfully. Receipt is available for download.

For any questions or clarifications regarding this transaction, please contact {{5}} for assistance.
```
**⚠️ CRITICAL NOTES:**
- Template has ~40+ words with 5 variables (good text-to-variable ratio)
- Template ends with "for assistance." NOT with variable {{5}}
- Uses descriptive field labels: "Donor Name:" not just "Name:"

### Footer
```
Shri Raghavendra Swamy Temple
```

### Variables (MUST ADD SAMPLE CONTENT!)
1. **Variable {{1}}** - Donor Name
   - Sample: `Ramesh Kumar`

2. **Variable {{2}}** - Amount (number only, no ₹)
   - Sample: `501`

3. **Variable {{3}}** - Receipt Number
   - Sample: `DN-2025-001234`

4. **Variable {{4}}** - Date (DD/MM/YYYY format)
   - Sample: `23/11/2025`

5. **Variable {{5}}** - Contact Number
   - Sample: `+917019337306`

### Media Attachment
- **Type:** Document
- **Purpose:** PDF certificate attachment
- **How to enable:**
  1. In template editor, click **"Add Media"**
  2. Select **"Document"**
  3. Upload a sample PDF (any PDF, just for approval)

### After Approval
Copy Content SID (HXxxxxx...) to:
```bash
TWILIO_TEMPLATE_DONATION_RECEIPT_V2="HXxxxxxxxxxxxxx"
```

---

## Template 2: ADMIN DONATION NOTIFICATION

### Basic Information
- **Friendly Name:** `Admin Donation Alert - Utility`
- **Template Name:** `admin_donation_alert_utility_v3`
- **Category:** UTILITY ⚠️
- **Language:** English

### Header
```
New Transaction Alert
```

### Body
```
New Donation Received

Donor: {{1}}
Phone: {{2}}
Amount: {{3}}
Receipt: {{4}}
Date: {{5}}

Check admin dashboard for details.
```

### Footer
```
Temple Admin System
```

### Variables (MUST ADD SAMPLE CONTENT!)
1. **Variable {{1}}** - Donor Name
   - Sample: `Ramesh Kumar`

2. **Variable {{2}}** - Donor Phone
   - Sample: `+917760118171`

3. **Variable {{3}}** - Amount (with ₹ symbol)
   - Sample: `₹501`

4. **Variable {{4}}** - Receipt Number
   - Sample: `DN-2025-001234`

5. **Variable {{5}}** - Date
   - Sample: `23/11/2025`

### After Approval
Copy Content SID to:
```bash
TWILIO_TEMPLATE_ADMIN_DONATION_V2="HXxxxxxxxxxxxxx"
```

---

## Template 3: POOJA BOOKING (User)

### Basic Information
- **Friendly Name:** `Pooja Booking Confirmation - Utility`
- **Template Name:** `temple_pooja_booking_utility_v3`
- **Category:** UTILITY ⚠️
- **Language:** English

### Header
```
Booking Confirmation
```

### Body
```
Pooja Booking Confirmed

Name: {{1}}
Pooja: {{2}}
Date: {{3}}
Booking ID: {{4}}

Your pooja has been scheduled. Booking reference {{4}}.

For changes, contact the temple office.
```

### Footer
```
Shri Raghavendra Swamy Temple
```

### Variables (MUST ADD SAMPLE CONTENT!)
1. **Variable {{1}}** - Devotee Name
   - Sample: `Sita Devi`

2. **Variable {{2}}** - Pooja Name
   - Sample: `Satyanarayan Pooja`

3. **Variable {{3}}** - Booking Date
   - Sample: `25/11/2025`

4. **Variable {{4}}** - Receipt Number
   - Sample: `PJ-2025-001234`

### After Approval
Copy Content SID to:
```bash
TWILIO_TEMPLATE_POOJA_BOOKING_V2="HXxxxxxxxxxxxxx"
```

---

## Template 4: ADMIN POOJA NOTIFICATION

### Basic Information
- **Friendly Name:** `Admin Pooja Alert - Utility`
- **Template Name:** `admin_pooja_alert_utility_v3`
- **Category:** UTILITY ⚠️
- **Language:** English

### Header
```
New Booking Alert
```

### Body
```
New Pooja Booking

Devotee: {{1}}
Phone: {{2}}
Pooja: {{3}}
Date: {{4}}
Booking ID: {{5}}

Check admin dashboard for details.
```

### Footer
```
Temple Admin System
```

### Variables (MUST ADD SAMPLE CONTENT!)
1. **Variable {{1}}** - Devotee Name
   - Sample: `Sita Devi`

2. **Variable {{2}}** - Devotee Phone
   - Sample: `+919876543210`

3. **Variable {{3}}** - Pooja Name
   - Sample: `Satyanarayan Pooja`

4. **Variable {{4}}** - Booking Date
   - Sample: `25/11/2025`

5. **Variable {{5}}** - Receipt Number
   - Sample: `PJ-2025-001234`

### After Approval
Copy Content SID to:
```bash
TWILIO_TEMPLATE_ADMIN_POOJA_V2="HXxxxxxxxxxxxxx"
```

---

## Template 5: PARIHARA BOOKING (User)

### Basic Information
- **Friendly Name:** `Parihara Booking Confirmation - Utility`
- **Template Name:** `temple_parihara_booking_utility_v3`
- **Category:** UTILITY ⚠️
- **Language:** English

### Header
```
Booking Confirmation
```

### Body
```
Parihara Pooja Confirmed

Name: {{1}}
Pooja: {{2}}
Date: {{3}}
Booking ID: {{4}}

Your parihara pooja has been scheduled. Reference {{4}}.

For changes, contact the temple office.
```

### Footer
```
Shri Raghavendra Swamy Temple
```

### Variables (MUST ADD SAMPLE CONTENT!)
1. **Variable {{1}}** - Devotee Name
   - Sample: `Lakshmi Narayan`

2. **Variable {{2}}** - Pooja Name
   - Sample: `Navagraha Parihara`

3. **Variable {{3}}** - Booking Date
   - Sample: `26/11/2025`

4. **Variable {{4}}** - Receipt Number
   - Sample: `PR-2025-001234`

### After Approval
Copy Content SID to:
```bash
TWILIO_TEMPLATE_PARIHARA_BOOKING_V2="HXxxxxxxxxxxxxx"
```

---

## Template 6: ADMIN PARIHARA NOTIFICATION

### Basic Information
- **Friendly Name:** `Admin Parihara Alert - Utility`
- **Template Name:** `admin_parihara_alert_utility_v3`
- **Category:** UTILITY ⚠️
- **Language:** English

### Header
```
New Booking Alert
```

### Body
```
New Parihara Booking

Devotee: {{1}}
Phone: {{2}}
Pooja: {{3}}
Date: {{4}}
Booking ID: {{5}}

Check admin dashboard for details.
```

### Footer
```
Temple Admin System
```

### Variables (MUST ADD SAMPLE CONTENT!)
1. **Variable {{1}}** - Devotee Name
   - Sample: `Lakshmi Narayan`

2. **Variable {{2}}** - Devotee Phone
   - Sample: `+919123456789`

3. **Variable {{3}}** - Pooja Name
   - Sample: `Navagraha Parihara`

4. **Variable {{4}}** - Booking Date
   - Sample: `26/11/2025`

5. **Variable {{5}}** - Receipt Number
   - Sample: `PR-2025-001234`

### After Approval
Copy Content SID to:
```bash
TWILIO_TEMPLATE_ADMIN_PARIHARA_V2="HXxxxxxxxxxxxxx"
```

---

## Template 7: ASTROLOGY CONSULTATION (User)

### Basic Information
- **Friendly Name:** `Astrology Consultation Confirmation - Utility`
- **Template Name:** `temple_astrology_booking_utility_v3`
- **Category:** UTILITY ⚠️
- **Language:** English

### Header
```
Consultation Confirmation
```

### Body
```
Astrology Consultation Confirmed

Name: {{1}}
Type: {{2}}
Date: {{3}}
Reference: {{4}}

Your consultation has been scheduled. Reference number {{4}}.

For changes, contact the temple office.
```

### Footer
```
Shri Raghavendra Swamy Temple
```

### Variables (MUST ADD SAMPLE CONTENT!)
1. **Variable {{1}}** - Client Name
   - Sample: `Venkata Raman`

2. **Variable {{2}}** - Consultation Type
   - Sample: `Horoscope Reading`

3. **Variable {{3}}** - Booking Date
   - Sample: `27/11/2025`

4. **Variable {{4}}** - Reference Number
   - Sample: `AS-2025-001234`

### After Approval
Copy Content SID to:
```bash
TWILIO_TEMPLATE_ASTROLOGY_BOOKING_V2="HXxxxxxxxxxxxxx"
```

---

## Template 8: ADMIN ASTROLOGY NOTIFICATION

### Basic Information
- **Friendly Name:** `Admin Astrology Alert - Utility`
- **Template Name:** `admin_astrology_alert_utility_v3`
- **Category:** UTILITY ⚠️
- **Language:** English

### Header
```
New Booking Alert
```

### Body
```
New Astrology Booking

Client: {{1}}
Phone: {{2}}
Type: {{3}}
Date: {{4}}
Reference: {{5}}

Check admin dashboard for details.
```

### Footer
```
Temple Admin System
```

### Variables (MUST ADD SAMPLE CONTENT!)
1. **Variable {{1}}** - Client Name
   - Sample: `Venkata Raman`

2. **Variable {{2}}** - Client Phone
   - Sample: `+918765432109`

3. **Variable {{3}}** - Consultation Type
   - Sample: `Horoscope Reading`

4. **Variable {{4}}** - Booking Date
   - Sample: `27/11/2025`

5. **Variable {{5}}** - Reference Number
   - Sample: `AS-2025-001234`

### After Approval
Copy Content SID to:
```bash
TWILIO_TEMPLATE_ADMIN_ASTROLOGY_V2="HXxxxxxxxxxxxxx"
```

---

# ⚠️ CRITICAL VARIABLE FORMATTING RULES (Nov 2025 - NEWLY DISCOVERED)

## Issue 1: Variables Cannot Be at Start or End of Template

**Error Message:**
```
INVALID_FORMAT. Facebook is not able to create template due to the following error:
Invalid parameter. Leading or Trailing Params Not Allowed.
Variables can't be at the start or end of the template.
```

**Problem Example (❌ WRONG):**
```
Donation Receipt

Name: {{1}}
Amount: ₹{{2}}
Receipt: {{3}}
Date: {{4}}

Transaction processed.

Questions: {{5}}
```
☝️ Template ends with variable `{{5}}` - **REJECTED**

**Solution Example (✅ CORRECT):**
```
Donation Receipt Confirmation

This message confirms your donation transaction has been recorded in our system.

Donor Name: {{1}}
Donation Amount: ₹{{2}}
Receipt Number: {{3}}
Transaction Date: {{4}}

Your donation has been processed successfully. Receipt is available for download.

For any questions or clarifications regarding this transaction, please contact {{5}} for assistance.
```
☝️ Template ends with text "for assistance." after the variable - **APPROVED**

**Rule:** Always ensure templates:
- Start with text (not a variable)
- End with text (not a variable)
- Add phrases like "for assistance.", "for further details.", "as reference." after final variable

---

## Issue 2: Text-to-Variable Ratio Must Be Good

**Error Message:**
```
INVALID_FORMAT. Facebook is not able to create template due to the following error:
Invalid parameter. Params Words Ratio Exceeds Limit.
This template has too many variables for its length.
Reduce the number of variables or increase the message length.
```

**Problem Example (❌ WRONG - Too Concise):**
```
Donation Receipt

Name: {{1}}
Amount: ₹{{2}}
Receipt: {{3}}
Date: {{4}}

Transaction processed.

Questions: {{5}}
```
☝️ Only ~10 words of text with 5 variables - **REJECTED**

**Solution Example (✅ CORRECT - More Text):**
```
Donation Receipt Confirmation

This message confirms your donation transaction has been recorded in our system.

Donor Name: {{1}}
Donation Amount: ₹{{2}}
Receipt Number: {{3}}
Transaction Date: {{4}}

Your donation has been processed successfully. Receipt is available for download.

For any questions or clarifications regarding this transaction, please contact {{5}} for assistance.
```
☝️ ~40+ words of text with 5 variables - **APPROVED**

**Rule:** For every variable, include at least 8-10 words of surrounding text. More is better.

**How to Add More Text Without Being Promotional:**
- ✅ "This message confirms your [service] has been recorded in our system."
- ✅ "Your [service] has been processed successfully."
- ✅ "For any questions or clarifications regarding this [transaction/booking/appointment], please contact..."
- ✅ Use descriptive labels: "Donor Name:" instead of "Name:", "Transaction Date:" instead of "Date:"
- ❌ DON'T add emotional words like "thank you", "blessed", "wonderful"
- ✅ DO add factual descriptive sentences

**Good Patterns That Work:**
```
[Service Name] Confirmation

This message confirms your [service] has been [action] in our system.

[Field Label]: {{1}}
[Field Label]: {{2}}
[Field Label]: {{3}}
[Field Label]: {{4}}

Your [service] has been [action] successfully. [Additional factual statement].

For any questions or clarifications regarding this [type], please contact {{5}} for assistance.
```

---

# 🚫 WORDS AND PHRASES TO ABSOLUTELY AVOID

These will trigger MARKETING classification:

## ❌ Prohibited Words
- Thank you / Thanks
- Generous / Generosity
- Bless / Blessed / Blessing
- Divine
- Grace / Gracious
- Peace and prosperity
- Auspicious
- Sacred
- Holy
- Honored
- Grateful / Gratitude
- Appreciate / Appreciation
- Wonderful
- Amazing
- Great
- Excellent
- Special
- Exclusive
- Limited time
- Offer
- Deal
- Discount
- Free
- Win
- Prize

## ✅ Safe Words to Use Instead
- Confirmed
- Processed
- Completed
- Scheduled
- Registered
- Received
- Recorded
- Updated
- Verified
- Acknowledged

---

# 📱 ADDITIONAL REQUIREMENTS FOR YOUR TEMPLE USE CASE

## Requirement 1: WhatsApp Business Profile Setup

Your Twilio WhatsApp sender (+19402513402) MUST have:

1. **Business Profile Completed:**
   - Go to: https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
   - Click on your sender number
   - Complete all fields:
     - Business Name: `Shri Raghavendra Swamy Brundavana Sannidhi`
     - Business Category: `Religious Organization`
     - Business Description: `Temple services including donations, pooja bookings, and spiritual consultations`
     - Business Address: `No. 9/2, Damodhara Mudaliar Street, Halasuru, Bangalore - 560 008`
     - Business Email: `harishkumar@gurusevamandali.com`
     - Business Website: `https://gurusevamandali.com`

2. **Display Name Verified:**
   - Make sure your display name is approved
   - Should show temple name when users receive messages

## Requirement 2: User Opt-In (CRITICAL!)

**WhatsApp requires users to opt-in before receiving messages.**

### How to collect opt-ins:

#### Option A: On-site Opt-In (Recommended)
1. Add checkbox to donation/booking forms:
   ```
   ☑ I agree to receive booking confirmations and receipts via WhatsApp
   ```
2. Store opt-in status in database
3. Only send WhatsApp messages if user opted in

#### Option B: Keyword Opt-In
1. Users send "START" or "HELLO" to +19402513402
2. This automatically opts them in
3. First message triggers 24-hour window

#### Option C: Initial Contact
1. When user makes first donation/booking
2. Send them ONE opt-in request via WhatsApp:
   ```
   Reply YES to receive temple booking confirmations and receipts via WhatsApp
   ```
3. Wait for "YES" reply before sending templates

### Testing Opt-In
**Before testing with ANY phone number:**
1. Open WhatsApp on that phone
2. Send message to: +1 940 251 3402
3. Type: "Hello"
4. Wait for confirmation
5. Now that number is opted-in for 24 hours

## Requirement 3: Message Timing Rules

**24-Hour Window:**
- Template messages can ONLY be sent:
  - Within 24 hours of user's last message to you
  - OR if user is opted-in and template is UTILITY category

**For your temple use case:**
- Donation receipts: Send IMMEDIATELY after payment (UTILITY = allowed)
- Booking confirmations: Send IMMEDIATELY after booking (UTILITY = allowed)
- Admin notifications: Always allowed (internal)

## Requirement 4: Testing Checklist

Before going live:

- [ ] All 8 templates approved and showing "APPROVED" status
- [ ] All templates show category "UTILITY"
- [ ] Content SIDs updated in `.env.local` and `.env.production.local`
- [ ] WhatsApp Business Profile completed
- [ ] Test with YOUR phone number first (opt-in by sending "Hi")
- [ ] Verify messages deliver successfully
- [ ] Check Twilio logs show status "delivered" not "undelivered"
- [ ] Add opt-in checkbox to donation/booking forms
- [ ] Update privacy policy to mention WhatsApp notifications
- [ ] Test all 4 services: donations, poojas, parihara, astrology

---

# 🔧 AFTER APPROVAL: UPDATE ENVIRONMENT FILES

## Update .env.local

```bash
# WhatsApp Content Template SIDs V3 (UTILITY Category - Nov 2025)
TWILIO_TEMPLATE_DONATION_RECEIPT_V2="HXxxxxx"  # Copy from Twilio after approval
TWILIO_TEMPLATE_POOJA_BOOKING_V2="HXxxxxx"
TWILIO_TEMPLATE_PARIHARA_BOOKING_V2="HXxxxxx"
TWILIO_TEMPLATE_ASTROLOGY_BOOKING_V2="HXxxxxx"
TWILIO_TEMPLATE_ADMIN_DONATION_V2="HXxxxxx"
TWILIO_TEMPLATE_ADMIN_POOJA_V2="HXxxxxx"
TWILIO_TEMPLATE_ADMIN_PARIHARA_V2="HXxxxxx"
TWILIO_TEMPLATE_ADMIN_ASTROLOGY_V2="HXxxxxx"

# Set to false to enable live WhatsApp messages
WHATSAPP_TEST_MODE="false"
```

## Update .env.production.local (for Vercel)

Same Content SIDs as above, make sure:
```bash
WHATSAPP_TEST_MODE="false"
```

## Update Vercel Environment Variables

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Update ALL 8 template SID variables
3. Redeploy the site

---

# ⏰ APPROVAL TIMELINE

- **Immediately:** Template appears as "Pending" in Twilio
- **15-30 minutes:** Auto-approved if simple and clearly UTILITY
- **1-2 hours:** Most templates approved
- **4-6 hours:** Complex templates or first-time submissions
- **24 hours:** Maximum wait time
- **48+ hours:** Likely rejected, check for errors

## How to Check Status

1. Go to: https://console.twilio.com/us1/develop/sms/content-editor
2. Look at "Status" column
3. Statuses:
   - **Pending:** Under review
   - **Approved:** ✅ Ready to use! Copy Content SID
   - **Rejected:** ❌ Check rejection reason, fix and resubmit

---

# ❌ COMMON MISTAKES THAT CAUSE REJECTION

1. **Category set to MARKETING** → Change to UTILITY
2. **No sample content for variables** → Add realistic samples
3. **Poor quality samples** ("test", "sample") → Use realistic data
4. **Promotional language** → Remove "thank you", "blessed", etc.
5. **Wrong variable numbering** → Use {{1}}, {{2}}, not {{name}}
6. **Too many emojis** → Remove all emojis
7. **Marketing-style header** → Use simple factual header
8. **Call-to-action language** → Remove "Don't miss", "Act now", etc.
9. **Missing footer** → Add temple name as footer
10. **Inconsistent language** → Make sure all text is English
11. **⚠️ NEW: Variable at end of template** → Always end with text after last variable (e.g., "for assistance.")
12. **⚠️ NEW: Too many variables for text length** → Add more descriptive text between variables (8-10 words per variable)

---

# ✅ FINAL VERIFICATION CHECKLIST

Before submitting each template:

- [ ] Template name includes "utility"
- [ ] Category is "UTILITY" (verify in dropdown)
- [ ] Language is "English"
- [ ] Header is simple and factual (if used)
- [ ] Body uses {{1}}, {{2}} for variables
- [ ] ALL variables have realistic sample content
- [ ] No promotional/marketing words in body
- [ ] Footer added with temple name
- [ ] Previewed template and it looks correct
- [ ] Variable count matches your code
- [ ] Variable order matches your code

---

# 🧪 TESTING AFTER APPROVAL

## Step 1: Update Environment Files
Copy all 8 Content SIDs to `.env.local` and `.env.production.local`

## Step 2: Enable Live Mode
```bash
WHATSAPP_TEST_MODE="false"
```

## Step 3: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Step 4: Opt-In Your Test Number
1. Open WhatsApp on your phone
2. Send "Hi" to +1 940 251 3402
3. Wait 10 seconds

## Step 5: Test Each Template

### Test Donation Receipt:
```bash
curl -X POST http://localhost:3000/api/test-whatsapp-donation \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "YOUR_PHONE", "fullName": "Test User", "amount": 501}'
```

### Test Each Service:
1. Go to http://localhost:3000
2. Make test donation
3. Make test pooja booking
4. Make test parihara booking
5. Make test astrology booking

## Step 6: Verify Delivery

1. Check your WhatsApp
2. Should receive messages within 30 seconds
3. Check Twilio logs:
   ```bash
   # Use this Node script to check message status
   node -e "
   const accountSid = 'YOUR_ACCOUNT_SID';
   const authToken = 'YOUR_AUTH_TOKEN';
   const messageId = 'MM_MESSAGE_ID_FROM_LOGS';

   const url = \`https://api.twilio.com/2010-04-01/Accounts/\${accountSid}/Messages/\${messageId}.json\`;
   const auth = Buffer.from(\`\${accountSid}:\${authToken}\`).toString('base64');

   fetch(url, {
     headers: { 'Authorization': \`Basic \${auth}\` }
   })
   .then(res => res.json())
   .then(data => console.log('Status:', data.status, 'Error:', data.error_code))
   "
   ```

4. Status should be:
   - ✅ "delivered" or "sent" = SUCCESS
   - ❌ "undelivered" with error 63049 = Still MARKETING category
   - ❌ "undelivered" with error 63016 = User not opted in

---

# 🆘 TROUBLESHOOTING

## Problem: Still getting error 63049 after recreation

**Solution:**
1. Double-check template category in Twilio console
2. Meta may have changed it to MARKETING during approval
3. If category shows MARKETING:
   - Delete the template
   - Create NEW template with even more robotic language
   - Remove ANY friendly language
   - Make it as boring as possible
4. Consider reaching out to Twilio support

## Problem: Template rejected during approval

**Solution:**
1. Check rejection reason in Twilio console
2. Common reasons:
   - Policy violation: Remove promotional language
   - Quality issue: Add better sample content
   - Variable issue: Check variable numbering
3. Fix the issue and resubmit

## Problem: Messages not delivering (no error)

**Solution:**
1. Check user opted in (send "Hi" first)
2. Verify WhatsApp Business Profile completed
3. Check Twilio account balance
4. Verify template is APPROVED status
5. Check Content SID is correct in .env

## Problem: Admin messages not working

**Solution:**
1. Admin numbers must also opt-in
2. Send "Hi" from +917019337306 to +19402513402
3. Admin templates also need UTILITY category

---

# 📞 SUPPORT RESOURCES

- **Twilio Support:** https://support.twilio.com
- **WhatsApp Template Guidelines:** https://developers.facebook.com/docs/whatsapp/message-templates/guidelines
- **Template Error Codes:** https://www.twilio.com/docs/whatsapp/api/error-code-mapping
- **Your Twilio Console:** https://console.twilio.com/us1/develop/sms/content-editor

---

# 📝 NOTES FOR PRODUCTION

1. **Opt-in Collection:**
   - Add checkbox to all forms
   - Store opt-in status in database
   - Only send WhatsApp if opted-in

2. **Privacy Policy:**
   - Update to mention WhatsApp notifications
   - Mention they can opt-out anytime

3. **Monitoring:**
   - Set up Twilio webhooks for delivery status
   - Monitor error codes in production
   - Log all WhatsApp send attempts

4. **Fallback:**
   - If WhatsApp fails, send email instead
   - Your code already has email fallback

5. **Cost:**
   - UTILITY templates: Lower cost
   - MARKETING templates: Higher cost + restrictions
   - Monitor Twilio billing

---

**GOOD LUCK!** 🎉

If you follow all rules above, your templates should be approved as UTILITY and messages will deliver successfully.
