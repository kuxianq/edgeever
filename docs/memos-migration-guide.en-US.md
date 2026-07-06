# Memos Migration Guide

[简体中文](memos-migration-guide.md) | [English](memos-migration-guide.en-US.md)

Since EdgeEver natively supports AI Agent (Model Context Protocol, MCP) integration, you don't even need to use programming scripts or migration tools. You can directly let your AI assistant sync all your old Memos notes to EdgeEver.

---

### Migration Steps

#### Step 1: Export Data from Memos
In your Memos system, export your data:
- This can be the entire exported **Markdown folder**;
- Or the exported **JSON format backup data**.

#### Step 2: Install and Configure EdgeEver MCP
1. Log in to your EdgeEver instance, and click **Profile** -> **MCP settings** in the bottom left corner.
2. Generate an API Token and click **Copy full MCP configuration**.
3. Send this configuration to your AI programming assistant (such as Antigravity, Claude Code, Cursor, etc.) to set up and activate the EdgeEver MCP server.

#### Step 3: Let the AI Assistant Do the Moving
Send your Memos export files (Markdown folder or JSON backup file) directly to the configured AI assistant, and send the following prompt:

```text
You are my AI assistant. These are my exported notes from my old Memos. Please read the content of these notes (including text, creation time, tags, etc.) and automatically import them in batches using the note creation tools provided by the EdgeEver MCP.
```

The AI assistant will automatically parse your old data and call the MCP tools to import each Memo into EdgeEver.

#### Step 4: Verify in Web Browser
Go back to your EdgeEver web client and refresh the page to confirm that all Memos notes have been successfully recorded, and that their timestamps and tags are synchronized.
