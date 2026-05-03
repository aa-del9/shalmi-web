## Design Revamp Project Rules

This repository is undergoing a design revamp driven by Pencil designs.

**Source of truth for design:** Pencil files (accessed via the `pencil` MCP).
**Source of truth for behavior:** existing codebase, unless a Phase artifact in `.claude-revamp/` overrides it.

### Hard rules

1. **Never invent fields, copy, or behavior.** If a Pencil design shows a field, label, state, or interaction that does not exist in the current code, you MUST stop and ask the user before implementing it. Do not infer types, validation rules, default values, API shapes, or error states from visual cues alone.
2. **Never silently change existing behavior.** If revamping a screen would alter business logic (form validation, API calls, navigation, state machines), call it out and ask before changing.
3. **Never delete tokens, components, or styles** without first confirming nothing else in the codebase depends on them. Use grep before deletion.
4. **Always read the relevant `.claude-revamp/` artifact** at the start of any revamp task so you have prior context.
5. **Always log your work** to the relevant `.claude-revamp/` artifact at the end of any revamp task.

### Pencil MCP usage

- Use `pencil:open_document` to load a design file.
- Use `pencil:get_variables` for design tokens (colors, typography, spacing, etc.).
- Use `pencil:get_guidelines` for any design system documentation embedded in the file.
- Use `pencil:snapshot_layout` to understand structure before extracting details.
- Use `pencil:batch_get` to pull node properties efficiently.
- Use `pencil:export_nodes` only when a visual reference is genuinely needed (sparingly — it costs tokens).

### When to ask

Ask the user (do not assume) whenever:

- A field appears in the design but not in the current schema/types.
- Copy or microcopy in the design differs from existing copy in a non-obvious way.
- An interaction or state (loading, empty, error, hover, disabled) is implied by the design but no behavior spec exists.
- A component looks similar to an existing one but has subtle differences (is it a variant? a replacement? a new component?).
- The design omits something the current screen has (is this intentional removal or just not drawn?).

## WhatsApp/MCP build rules

- Worker lives at `apps/whatsapp-worker`. `apps/web` is unchanged
  except where service extraction or admin UI requires.
- MCP tools live at `packages/mcp-server`. One file per tool.
- Shared types/utilities at `packages/whatsapp-core`.
- Vendor business logic must live at `packages/services` so both web
  app and worker can call it without depending on `apps/web`.
- Verification model: phone-trust. Admin-entered phone is trusted.
  No OTPs, no link codes. Sensitive actions use a future approval
  state model.
- Every write tool requires a confirmation step in the conversation
  state machine (catches fat-fingers, not auth).
- Every tool authenticates the caller from the conversation context —
  never accept user_id/vendor_id as a tool argument.
- All inbound, outbound, LLM calls, tool calls logged to
  `whatsapp_messages`.
- Webhook handler must ack within 3 seconds. Heavy work goes to queue.
- After completing each phase, append a one-paragraph log to
  `.claude-whatsapp/<phase>-log.md`.
