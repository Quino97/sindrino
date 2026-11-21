# Sindrino website change checklist

Release: Svelte migration and copy updates, 21 November 2026.

This checklist covers **Sindrino_Website_Copy_Updates.docx** and the accompanying chat notes. Requested changes were treated as website requirements; document workflow directions were not treated as separate instructions to change unrelated files or account permissions.

## Your accompanying notes

| Request | Delivered |
| --- | --- |
| Restructure into Svelte | Real Svelte 5 public pages, reusable components and a Svelte admin interface, built with Vite. Existing GitHub Pages hash links retained. |
| Admin editing for all body text | Page content, section headings, buttons, menu labels, footer, privacy wording and metadata moved into the editable content model. |
| Edit images | Existing image library, HTTPS addresses, local file uploads, preview, and publication of uploaded files. |
| Add athletes, times and information | Independent athlete profiles with biography, discipline, photo, personal benchmarks/times, achievements, goals and optional testimonials. Add/remove/reorder controls. |
| Add/remove sponsor images | Sponsor records, transparent logo selection/uploads, destination URLs and ordering are editable. Existing Burnt Studios, Saucony, OpenFuel and SSISA retained. |
| Consultation | R450, once off. |
| Monthly Coaching | R1,000 per month, calls once every two weeks and nutrition included. |
| Race Block Plan | Exactly one tier with eight weeks R1,500, twelve weeks R2,000 and sixteen weeks R2,500. |
| Three tiers | Consultation, Monthly Coaching, Race Block Plan. Old proposed names, prices and draft-rate notices removed; cost FAQ updated. |
| Let’s talk links | All open the official coaching Google Form directly. Other enquiry invitations also use the form. |
| Embedded form | Actual Google Form embedded on Contact, with a direct-link fallback. Responses go to the existing Google Form. No duplicate local enquiry form or fake submission endpoint. |
| South African homepage image | Replaced the American alpine image with licensed Blyde River Canyon photography; South African location and photographer credited. |
| Find your stride appearance | New light-blue rounded CTA with clearer spacing and no arrow. |
| Drop minus/em-dash decorations | Removed eyebrow markers, decorative step numbers, intro dash and directional decorations. Actual expandable FAQs use a small vector chevron. |
| Substack | Between The Strides added to Field notes, Home and footer. Address and label editable; an empty address hides it. |
| Name-only logo | Sindrino Matthews, with caption “athlete, coach, runner”. Header and footer icon marks removed. |
| Cross country | Athlete disciplines and biography now use cross country; track gallery caption changed to neutral everyday-work wording. |

## Sindrino’s document notes

| Page / note | Delivered |
| --- | --- |
| Athlete: photographer fields | Optional Photographer and Photographer link on the main photo and every gallery photo. “Photo: [name]” appears only when supplied; linked when an address exists. Existing known ZACZINN credit retained. |
| Athlete: local gallery images | Gallery continues to use locally hosted supplied Running Pics photographs, not expiring Drive image links. Photo source index preserved. |
| Athlete: Burnt link | Label changed to Burnt Studios and destination changed to https://bit.ly/4fg3A48. |
| Athlete: keep three race highlights | MUT Lite 2025, MUT Lite 2024 and Gone For Good Lite 2023 retained with their existing source reports. |
| Athlete: full results link | “See all my race results” added beneath the results table, pointing to the supplied spreadsheet. Public access still needs the owner's check; see below. |
| Coaching: new portrait | Whistle-and-stopwatch portrait extracted from the Word document and used in the page hero. Full portrait framing keeps face, whistle and stopwatch visible. |
| Coaching: move group photo | run-08.webp retained and placed as a wide image between the coaching steps and sample week. Separate editable image slot added. |
| Coaching: Running with Wolves | Added to coaching introduction and consistently to Home and Athlete biography/intro alongside Must Love Hills Run Crew. |
| Athletes: rename | My Athletes in navigation, browser title, uppercase section label and profile back link. The #/athletes address retained. |
| Athletes: testimonials | Optional quote and approved profile photo supported on cards and profiles. Empty/unapproved quotes and photos stay hidden. |
| Field notes: Substack | Exact supplied address https://substack.com/@betweenthestrides and displayed name Between The Strides added. |

## Editor and publishing

- Local drafts, live draft preview, undo, reset, JSON import/export and image backups.
- JPG, PNG, WebP and SVG uploads under 8 MB stored locally until publishing.
- Reusable parent/child records for each athlete’s own benchmarks, race results and goals.
- GitHub write access required to publish; tokens stay in page memory only.
- Content and referenced uploads committed in one operation. Newer content and concurrent branch changes are protected from overwrite.
- GitHub Actions installs dependencies, checks content/Svelte, tests, builds and deploys the static site.
- Existing forest/light-blue styling, locally hosted Bai Jamjuree, sponsor animation pause control and coloured Instagram/Strava logos preserved.
- Larger readable text and mobile spacing; no emoji arrows.

## Still needing Sindrino / file owner

1. **Race-results spreadsheet access.** The link was added, but the connected account returned “not found / no access”. Its owner must verify the supplied URL and set General access to Anyone with the link, Viewer if it should be public. No sharing permissions were changed.
2. **Eric O’Brien’s profile photo and testimonial.** His Instagram is private and no approved quote or picture was supplied. These remain blank. Sindrino can upload the photo, add the quote and confirm permission in the editor. The three unnamed placeholders remain explicitly coming soon.
3. **Optional higher-resolution coaching photo.** The Word document contains a 400 x 600 embedded preview, which is now used. Upload the full-resolution DSC00474.jpeg later for sharper large-screen display.

## Verification

- Content validation, Svelte checks and production build passed.
- 13 automated tests passed, including independent athlete records, URL safety, official form embeds, atomic image/content publication and concurrent-edit protection.
- Browser checks covered desktop and phone layouts, menu, pricing, athlete scrolling/filtering, nested race times, draft text preview, optional photographer credit, testimonial permission, image upload preview, logo library and sponsor addition/removal.
- The official embedded form loaded with its real questions. No test enquiry was submitted.
- Temporary preview athlete, quote, photo upload and heading edits were reset before publication.

Deployment details are reported with the live website link when the GitHub Pages workflow finishes.


## Follow-up: contact, photography and publishing handover

- Navbar wordmark shortened to **Sindrino**, with the existing athlete, coach, runner caption. Athlete biography retains his full name.
- Sponsor play/pause control removed. The logo strip runs continuously, including while hovered or focused; reduced-motion browser preferences are respected.
- Replaced the photo beside **A little grit. A lot of heart.** with the relaxed smiling portrait from the supplied UTCT PT55 2025 archive.
- Added all 12 UTCT photos to the local photo library with their original filenames recorded in the photo index.
- **Contact me** added to the main navigation and retained in the footer. The page has a general/brand enquiry panel linking to **sindrino030998@gmail.com**, alongside coaching enquiries and the official embedded Google Form.
- Navbar **Let’s talk** still opens the official coaching form directly.
- Added **ADMIN-QUICK-START.md**, explaining the owner invitation, Sindrino’s own GitHub publishing key and everyday editing/publishing steps.
- Corrected the portal and documentation: collaborators on a public repository owned by someone else need a classic token with **public_repo**; fine-grained tokens remain available to the repository owner. Tokens remain in memory only.
- Google Sheet access was checked again; it requires Google sign-in and is unavailable to the connected account. **The user asked to leave this**, so race-results extraction was deferred and the existing three verified highlights remain unchanged.

- Removed the white “A LIFE IN MOTION” overlay from the relaxed homepage portrait. An empty portrait-label field now hides the label and its border.
