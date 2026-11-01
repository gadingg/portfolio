# AI Study Case

Admin routes: `/admintgadink/dashboard/ai` and `/admintgadink/dashboard/settings`.

## Setup

1. Sign in using the existing admin account.
2. Open **Pengaturan AI**, enter your Gemini API key and a text model ID available to that key, then test and save.
3. Open **AI Study Case**, choose a new case or an existing Website / Apps case, paste notes, choose a thumbnail and generate.
4. Review every field and any missing-information questions. Applying saves a draft only. Publish through the existing portfolio editor.

The default model ID is `gemini-3.8-flash`, matching Google's current structured-output example. It is editable; availability and quota depend on the key. No provider key is bundled and no local mock response is used by the production app. A connection test makes one short generation request.

## Secrets

The key is encrypted with AES-256-GCM before storage. Settings live in `settings/gemini.json` in a separate private Supabase Storage bucket, `portfolio-ai-settings`, created on first save. The bucket is never made public; saving refuses an existing public bucket. No SQL migration is needed. Storage access is server-side using existing service-role credentials. Browser responses contain configuration status, model ID and update time only.

Optionally set a stable server-only `CMS_AI_ENCRYPTION_KEY` before saving the provider key. Otherwise encryption derives a purpose-specific key from the existing Supabase service-role/secret credential. If the chosen encryption secret changes, re-enter the provider key through settings. Never use a `NEXT_PUBLIC_` environment variable for either secret.

The service role must be able to create/read/write the private bucket. No key is exposed through the media library or public media gateway, and upstream error payloads are never returned or logged.

## Generation and review

Notes are sent as text to Google's fixed Gemini endpoint when the admin clicks generate. Thumbnail bytes and application URLs are not fetched or analyzed. The request uses structured JSON output; the server validates the returned schema, bounded strings and arrays, slug, and screenshot suggestion indexes. No browsing or model tools are enabled.

The prompt instructs Gemini to use source facts only, use English headings and Indonesian body copy, avoid fabricated measurements or roles, and list missing details separately. An LLM cannot guarantee factual correctness. Manual review remains required; missing summaries can remain empty in a draft, and existing publication validation requires complete summaries before publish.

Regenerations are proposals until explicitly accepted. Field-level acceptance preserves the other edited fields. A brief and confirmation/screenshot notes are stored in private `aiDraft` metadata, removed by public projections and excluded from public media-reference checks.

## Draft integrity

Apply checks the current CMS revision and uses the existing compare-and-swap draft save. It does not publish, reorder other projects, change an existing slug, or replace screenshot assets. New cases begin hidden. Visual layouts with a recognized story region retain their CSS and images while their narrative text is updated. Unrecognized custom layouts receive an actionable error instead of being discarded.

Errors and timeouts preserve workspace inputs and the previous result. A lost apply response may mean a draft was saved; refresh the list before retrying. Client locking and a process-local generation lock reduce duplicates; the latter is not a distributed rate limit. Google quotas continue to apply.

Official API reference: https://ai.google.dev/gemini-api/docs/generate-content/structured-output
