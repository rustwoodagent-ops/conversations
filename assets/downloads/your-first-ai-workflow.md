# Your First AI Workflow
## Build an Email Summarizer in One Afternoon

---

## What You're Building

An automation that:
1. Checks your unread emails every morning
2. Uses AI to summarize key points
3. Sends you a formatted digest
4. Runs automatically

---

## What You'll Need

- Free n8n account (cloud or self-hosted)
- OpenAI API key (free tier available)
- Gmail account
- 2-3 hours

---

## Step 1: Set Up n8n

1. Go to n8n.io and create account
2. Create new workflow
3. Name it "Morning Email Digest"

---

## Step 2: Add Email Trigger

1. Add "Gmail" node
2. Set trigger: "New emails"
3. Connect your Gmail account
4. Set filter: Unread only

---

## Step 3: Add AI Summarization

1. Add "OpenAI" node
2. Select "Create completion"
3. Prompt: "Summarize these emails in 2-3 bullet points each: {{$json.content}}"
4. Connect your OpenAI API key

---

## Step 4: Format Output

1. Add "Set" node
2. Create fields:
   - Subject: "Morning Digest"
   - Body: "{{$json.choices[0].message.content}}"

---

## Step 5: Send Digest

1. Add "Gmail" node
2. Select "Send message"
3. To: Your email
4. Subject: From Step 4
5. Body: From Step 4

---

## Step 6: Schedule

1. Add "Schedule" trigger
2. Set: Every day at 8 AM
3. Activate workflow

---

## Testing

1. Send yourself test emails
2. Run workflow manually first
3. Check that digest arrives
4. Refine prompt if needed

---

## Troubleshooting

**No emails showing:**
- Check Gmail filter
- Verify connection

**Summaries too long:**
- Add: "Keep under 50 words per email"

**Not running automatically:**
- Check schedule is active
- Verify n8n instance running

---

## Next Steps

- Add more data sources (Slack, calendar)
- Customize summary format
- Add action items extraction

---

*You now have a working AI automation.*
