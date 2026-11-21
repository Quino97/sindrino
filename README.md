# Sindrino Matthews website

Svelte 5 and Vite, published as a static website on GitHub Pages. The site uses forest green, light blue, locally hosted Bai Jamjuree, a name-only wordmark, and supplied running photographs.

- Website: https://quino97.github.io/sindrino/
- Editor: https://quino97.github.io/sindrino/admin.html
- Repository: https://github.com/Quino97/sindrino
- Change checklist: [CHANGELOG-2026-11-21.md](CHANGELOG-2026-11-21.md)

## Editing the website

1. Open the editor. Choose a section on the left. Main copy lives in its page section; smaller headings, buttons, navigation and footer copy live in **All section text & labels**.
2. Edit the text. Drafts save on this device. Open **Preview draft** to review changes. An open preview also updates when you save the draft.
3. Use **Choose from library**, **Upload image**, or an HTTPS image address to replace a photo or logo. Uploads accept JPG, PNG, WebP or SVG under 8 MB. Uploads stay in this browser until publishing. Keep photographer credits with their images.
4. Under **Athlete profiles**, add an athlete, set a unique page ID, and open their profile to enter their bio, personal benchmarks, race results and goals. Each athlete owns their child records. Keep IDs stable once published. Use the coming-soon switch for unnamed placeholders. Add a supplied testimonial and photo only after confirming permission using the corresponding switches.
5. Under **Sponsor slider**, add, remove or reorder sponsors and choose/upload their logos. Removing a sponsor removes its slider entry; existing asset files and Git history remain available.
6. The **Substack** address and its displayed label are in **Home, brand & contact**. Empty the address to hide the link. The Google Form address and social links are there too. Only official full Google Forms viewform addresses can be embedded; other HTTPS links still open directly.
7. Use **Export content** to back up the JSON, and **Export uploaded images** for any new image files. Keep both backups if you edit on another device. Unsaved uploads are in this browser's IndexedDB; clearing browser data removes them. Importing JSON does not import image files.
8. At the bottom, connect to GitHub with a fine-grained personal access token for **Quino97/sindrino**, with **Contents: read and write**. The signed-in GitHub account must already have write access to this repository. Keep the default branch **main**. The token is kept only in page memory, never in drafts or browser storage. Refreshing or disconnecting clears access.
9. If the editor says website content has changed, export your draft, choose **Load latest content**, and reconcile your edits. It will refuse to overwrite newer content.
10. Choose **Publish website** and review the confirmation. Text and referenced new images are committed together. **View deployment progress** opens GitHub Actions. The live website changes after the deployment succeeds. Keep your image cache until the deployment finishes, then clear it if desired.

This is a static GitHub-authenticated editor, not a server with separate website accounts. Opening the editor does not grant publishing permission. GitHub controls who can publish. Content in the public repository, including unpublished articles, is public; do not store confidential athlete information in it. Drafts are device-specific, so use the same browser for editing and previewing.

## Running locally

Install Node.js 22.12+ (or Node 24) and run:

```powershell
npm ci
npm run dev
```

Open http://localhost:4173. Stop with Ctrl+C.

```powershell
npm run check
npm test
npm run build
npm run preview
```

The build writes **dist/**. The Vite base is relative (`./`), so assets work under the GitHub Pages `/sindrino/` path. Hash routes preserve the existing page addresses without requiring a server router. Source images and JSON remain at **assets/** and **data/content.json**. The build copies both into dist; new uploads are included automatically.

## GitHub Pages

Pages is already configured to deploy from GitHub Actions. Push changes to **main**. The workflow installs pinned dependencies with npm ci, validates content, checks Svelte, runs tests, builds the site and deploys dist. In repository **Settings > Pages**, the source should remain **GitHub Actions**. Watch the **Deploy Sindrino to GitHub Pages** workflow. No paid host or backend is required.

## Source layout

- **src/App.svelte**: public pages and hash navigation.
- **src/Admin.svelte**: draft editing and publishing interface.
- **src/components/**: reusable Svelte photos, sponsor strip, results table, athlete visuals, recursive fields and accessible dialogs.
- **data/content.json**: page copy, labels, image references, athletes, sponsors and plans.
- **lib/content.js** and **lib/ui-fields.js**: validation and collection templates.
- **lib/github.js**: atomic content/image publication with stale-content and branch protection checks.
- **lib/media.js**: local upload storage and draft image previews.
- **lib/forms.js**: official Google Forms embed URL validation.

## Images and outstanding content

Homepage: Blyde River Canyon, South Africa, by [Asher Pardey on Unsplash](https://unsplash.com/photos/a-view-of-a-mountain-range-with-a-river-running-through-it-bWE2CLXU0bM), under the [Unsplash License](https://unsplash.com/license). The coaching portrait was extracted from the supplied Word document; its embedded original is 400 x 600. A full-resolution DSC00474.jpeg can be uploaded later. Existing running gallery photos are locally hosted copies from the supplied Running Pics archive, matching the referenced Drive folder; original filenames remain in assets/photo-credits.json.

The full race-results spreadsheet link is included, but the connected account could not access it. Its owner should check **General access > Anyone with the link > Viewer** and test it signed out. Eric O’Brien still needs to supply/approve a profile picture and a testimonial; both remain unpublished. The three blank athlete slots are explicitly coming soon.

The contact page embeds Sindrino's actual Google Form, with a direct-link fallback. Google handles submissions and access requirements. No test response was sent during verification.
