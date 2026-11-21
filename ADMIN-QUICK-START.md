# Sindrino: editing and publishing your website

## Before the first visit

You need your own GitHub account. Send its username to Quintin so he can invite you to **Quino97/sindrino**. Accept the invitation in GitHub before trying to publish. An editing token does not give access unless your account already has permission.

## Make your publishing key once

1. Sign into GitHub, then open [Personal access tokens](https://github.com/settings/tokens).
2. Choose **Generate new token > Generate new token (classic)**. Name it **Sindrino website** and choose an expiry, for example 90 days.
3. Under permissions, select **public_repo**. Generate the token and copy it to your password manager. It is a private publishing key: do not email it or send it to anyone.

Use a **classic** token because this public repository belongs to Quintin's GitHub account and you are a collaborator. GitHub does not currently support fine-grained tokens for this arrangement. If the repository is transferred to your own account later, a fine-grained token restricted to the repository with Contents: read and write can be used instead. [GitHub’s explanation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#fine-grained-personal-access-tokens-limitations).

## Update your website

1. Open [your content studio](https://quino97.github.io/sindrino/admin.html).
2. Pick a section and edit the text or photos. **Athlete profiles** lets you add runners, their times, results and goals. **Sponsor slider** manages partner logos. **All section text & labels** edits the smaller headings and buttons.
3. Choose **Preview draft** to check the result. Drafts and new photo uploads stay on your device until you publish; use the same browser for editing and previewing.
4. At the bottom, leave **Owner: Quino97**, **Repository: sindrino**, **Branch: main**. Paste your publishing key and choose **Connect to GitHub**.
5. Choose **Publish website**, review the confirmation and continue. Open **View deployment progress**; once the build and deployment are green, the public website is updated. This usually takes a few minutes.

The studio does not have a separate username/password login. Your GitHub account and publishing key give you publishing access. The key is forgotten when you refresh, close the studio or disconnect, so paste it again when needed.

If you see **website content has changed**, export a backup first, choose **Load latest content**, and reapply your edits. If the key expires, make a new one using the steps above. Keep **Export content** and **Export uploaded images** backups if moving to another device.

## Quintin: invite Sindrino once

Open [repository settings](https://github.com/Quino97/sindrino/settings/access), choose **Collaborators > Add people**, enter Sindrino's GitHub username and send the invitation. Sindrino must accept it before publishing. Do not share your own GitHub token with him.
