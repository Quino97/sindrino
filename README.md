# Sindrino — athlete & coaching

A static, responsive website for Sindrino, made for GitHub Pages. Forest green, light blue, locally hosted Bai Jamjuree, an original vector logo, a real alpine landscape, and supplied running photography. No runtime dependencies, no paid hosting requirement, and no server database.

## Run locally

Install Node.js 22 or newer, then open a terminal in this repository:

```powershell
npm run dev
```

Open http://localhost:4173. The GitHub Pages subpath can also be previewed at http://localhost:4173/sindrino/. Stop the server with Ctrl+C.

```powershell
npm run check
npm test
npm run build
```

The build creates `dist/`. You do not need `npm install`: there are no package dependencies. `tools/prepare-assets.py` and `tools/fetch-brand-assets.py` were one-time asset preparation helpers, not part of the build. They are not required for deployment.

## Make it live on GitHub Pages

This checkout already has the remote `https://github.com/Quino97/sindrino.git`. The expected site address after successful deployment is **https://quino97.github.io/sindrino/**.

1. Review the starter copy in the admin studio. Confirm Sindrino’s biography, coaching offer, prices, public contact details, athlete permissions, photo usage, and credits. Confirm the current sponsorships. There are no invented athlete results or roster entries; fill them when ready. Coaching descriptions and field notes are proposed editorial copy, not verified statements from Sindrino.
2. Commit and push the website to `main`. From the repository folder:

   ```powershell
   git add .
   git commit -m "Build Sindrino athlete and coaching website"
   git branch -M main
   git push -u origin main
   ```

3. In the GitHub repository, open **Settings → Pages**. Under **Build and deployment → Source**, select **GitHub Actions**. GitHub Free supports Pages from public repositories; private repository Pages support depends on your GitHub plan.
4. Open **Actions → Deploy Sindrino to GitHub Pages**. If the first run failed before Pages was enabled, choose **Run workflow** on `main`, or rerun it. The workflow checks content, runs tests, builds `dist/`, and deploys it.
5. After the deployment succeeds, open the site link shown by GitHub. It should be https://quino97.github.io/sindrino/. Initial availability can take several minutes.

If you use a branch other than `main`, edit `.github/workflows/pages.yml` and the branch in the admin connection. All public site assets use relative URLs; hash routes such as `#/athlete` work on repository Pages without redirect configuration. Always share the hash-based page addresses.

Official reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Edit from the admin portal

Open **Studio access** in the footer, or append `admin.html` to the site address, e.g. https://quino97.github.io/sindrino/admin.html.

The editor is available to open because this is a static site. Repository write access is required to publish. There is no pretend password screen or embedded admin password. It is a website content editor, not a private athlete training or health-record portal.

### Drafts and previews

- Choose a section in the left navigation. Edit the labelled fields. Drafts save automatically in this browser’s local storage; **Save draft** also checks the structure.
- **Preview draft** opens the website with `?preview=1`. Only that preview reads the draft. Normal visitors continue seeing published content. Reload an already-open preview after more edits.
- **Undo** reverses edits within the current editor session. **Reset to loaded content** restores the last content loaded from the site or GitHub. Export first if you want a separate backup.
- **Export content** downloads `content.json`. **Import content** checks and restores an exported file.
- Drafts are device-specific. Private browsing, clearing browser data, or switching devices can remove or hide them. Export copies for safekeeping.

### Add an athlete, then their achievements and goals

1. Open **Athlete profiles → Add Athlete profile** (the button may read “Add Athlete”).
2. Open the new entry. Set the name, discipline, headline, biography, and a stable page ID such as `jane-smith`.
3. Choose a supplied photo from the image picker, enter a repository path such as `assets/photos/jane.webp`, or use an HTTPS photo URL.
4. Within that same athlete, use **Add Achievement** and **Add Goal**. Those child records belong only to that parent athlete. Add official result links where possible.
5. Preview the roster and the athlete’s individual page, then publish.

No duplicated HTML or new page component is needed. `data/content.json` is the single source of content; `app.js` renders each athlete from its parent record. Array entries can be reordered and removed in the editor. The Our Athletes page uses a swipeable horizontal profile list with previous/next controls. It does not move profiles automatically.

Three entries are explicitly marked as coming-soon placeholders. To convert one into a real profile, open it in **Athlete profiles**, turn off **Show as an unnamed coming-soon profile**, and fill in its details. Placeholders have no public detail page, results, or goals. Eric O’Brien’s public name and Instagram URL are included; his private Instagram photos and posts were not accessed. Until a photo is supplied, his card uses initials.

### Publish directly to GitHub

1. In GitHub, create a **fine-grained personal access token** with an expiry. Choose only the `sindrino` repository and give **Contents: Read and write** permission. Do not give the token account-wide access. A repository owner’s token is the simplest setup; organisation policies and protected branches may require a different approval flow.
2. In the editor, open **Connect to GitHub**. Confirm `Quino97`, `sindrino`, and `main`. Paste the token and choose **Connect & check access**. Never send the token in chat or commit it to the repository.
3. If repository content is newer than the editor’s starting point, export your draft, then **Load repository content** and reconcile changes. This prevents silently overwriting another editor’s work.
4. Choose **Publish content** and confirm the repository and branch in the dialog. This commits only `data/content.json`. The workflow redeploys the site.
5. Use **View deployment on GitHub** to verify success. **Disconnect**, close, or refresh the editor when done. The token is held only in page memory, never local storage, exports, or source files; it is transmitted only to GitHub’s HTTPS API.

If a token is rejected, check its expiry, repository selection, Contents write permission, organisation approval, and branch protection. The draft stays on your device. Fine-grained token limitations can apply to outside collaborators; publishing by the repository owner or using the manual path below avoids depending on that access pattern.

Official references: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens and https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents

### Publish without a token

Export `content.json`, then replace **`data/content.json`** in the GitHub repository and commit to `main`. You can use GitHub’s file editor/upload interface or your local checkout. Keep the filename and folder exactly the same. The deployment workflow validates and publishes the update. Upload new photos into `assets/photos/` and use their exact paths in the content editor.

## Contact form

Sindrino’s published coaching Google Form is linked from the contact page, using the address on his public Linktree. Edit it in **Home & contact → Official coaching enquiry form**. It is an outbound link; this website does not submit the form on the visitor’s behalf.

You can also add a public email in **Home & contact → Email**. The built-in enquiry form prepares a message in the visitor’s email app; the visitor reviews and sends it. There is no server inbox or automatic email delivery for that built-in form. Until an address is added, it downloads the enquiry as a text file. Instagram and Strava are configured from Sindrino’s public links. WhatsApp appears only when supplied. If you later integrate a form-delivery service, update the privacy copy accordingly.

## Profile details and proposed prices

The site owner supplied Sindrino’s full name, his Must Love Hills coaching role, Instagram handle, and approximate benchmarks of **1:15:00 for the half marathon** and **16:30 for 5 km**. These remain labelled as approximate benchmarks, separate from verified trail highlights. Eric’s coaching relationship was also supplied by the owner.

Race highlights checked on 13 November 2026, after the owner chose public sources because Instagram requires sign-in to read race-post captions:

- **2025 MUT Lite:** 1st men, **49:40**, 12 km. Source: https://diverge.info/2025/05/26/mut-by-utmb-records-tumble-and-women-excel-in-2025-edition/
- **2024 MUT Lite:** 1st men, **47:20**, 11 km. Source: https://diverge.info/2024/05/28/mut-by-utmb-douglas-pickard-wins-2024-title/
- **2023 Gone For Good Lite:** **45:07**, 10 km virtual trail challenge. Source: https://protectthewestcoast.org/post/gone-for-good-2023-recap/ . This is presented as a challenge time, without an unverified placing.

These source links are attached to the public results. No newer Dryland results or other unconfirmed placings have been inferred from photos.

The owner requested draft pricing: **R450 once-off**, **R950 per month**, and **R1,800 for an eight-week race block**, with proposed inclusions. The public pricing page and FAQ identify these as proposals. In **Pricing page**, keep **Show proposed pricing notice** enabled until Sindrino agrees the rates and inclusions. Once confirmed, update that switch, each plan’s period text, the pricing note, and the FAQ together.

Public references checked on 11 November 2026:

- https://linktr.ee/_sindrino — identifies him as a running coach and Burnt athlete, and links his Instagram, Strava profile, and coaching form.
- https://www.mustlovehillsruncrew.com/post/sindrino-matthews — the crew’s feature on Sindrino. The site owner supplied his coaching role.
- https://burnt.co.za/pages/burnt-partners-athletes — the general Burnt partners page. An individual Sindrino profile could not be located, so the website does not label this as his personal Burnt profile.

## Content and files

| File | Purpose |
| --- | --- |
| `data/content.json` | Page content, profile, athletes and child records, articles, plans, FAQs, partners |
| `app.js`, `styles.css`, `refinements.css` | Shared rendering, public UI, responsive layouts |
| `admin.html`, `admin.js`, `admin.css` | Content studio, drafts, import/export, GitHub publishing |
| `lib/content.js` | Content schema validation, safe URL handling, record templates |
| `lib/icons.js`, `lib/athletes.js` | SVG UI controls and athlete filtering helpers |
| `assets/brand/` | Original Sindrino SVG logos and favicon |
| `assets/photos/` | 56 optimised WebP images from the supplied archive |
| `assets/photo-credits.json` | Mapping to original archive filenames |
| `assets/brands/` | Locally hosted official sponsor assets |
| `assets/fonts/` | Bai Jamjuree font files and SIL Open Font License |
| `.github/workflows/pages.yml` | Checks, build, and GitHub Pages deployment |

All fields and profile content are public, including unpublished article data in the JSON. Do not enter private athlete health information, personal contact details, or internal training records. Obtain each athlete’s permission before publishing their profile, photos, goals, or results.

## Design and image credits

- Sindrino mark: original geometric S inspired by a summit and a flowing trail/river. Forest `#153e35`, deep green `#102e28`, sky `#bce3ed`, paper `#f6f6ef`. The SVG wordmarks use Bai Jamjuree with system fallbacks; for print production, open in a vector editor and outline the lettering using the bundled font.
- Homepage: **Cole Allen**, Glacier National Park, Grinnell Glacier Hike. Photo: https://unsplash.com/photos/2cB599inAew ; license: https://unsplash.com/license . This is a scenic visual reference, not a stated Sindrino race/training location.
- Other photography: user-supplied Running Pics archive. Original filenames retain any available photographer credits. Pass2Pass: ZACZINN; Batrun: @sachaspex and @eringoodman_. Confirm supplied image rights and any required credits before public launch; don’t remove photographer marks.
- Sponsor logos downloaded from the brands’ official public websites on 11 November 2026: Burnt Studios (burnt.co.za), Saucony (saucony.com), OpenFuel (za.openfuel.com). Original logo colours are preserved in the files; the website uses a CSS monochrome treatment. Trademarks remain their owners’ property. Reconfirm partner asset approval before launch.
- SSISA was added at the owner’s request on 13 November 2026, using the official header logo from https://www.ssisa.com/hubfs/Header-Logo.png . Instagram and Strava vectors are from Simple Icons (CC0, included alongside the files) and displayed in the site palette. Brand trademarks remain their respective owners’ property.
- Design research: https://www.run2pb.co/ (clear coaching journey), https://vert.run/ (coach/athlete connection and structured options), https://burnt.co.za/ (moving brand strip). No layouts or copy were copied.

## Verification

`npm run check` validates content and local references. `npm test` exercises nested athlete data, duplicate IDs, imported content structure, URL safety, and output escaping. The production build contains only public site files and the editing guide; source-control metadata, tools, drafts, and local QA artifacts are not shipped.
