# GyulRose Cake Upload Guide

The owner does not need to edit code.

After deployment approval and one-time GitHub/Pages CMS access setup:

1. Open `https://app.pagescms.org`.
2. Sign in with the approved GitHub account.
3. Open `GyulRose-Cakes`.
4. Select **Cake gallery**.
5. Select **Add entry**.
6. Complete:
   - URL name, for example `pink-30th-birthday-cake`
   - cake name
   - category
   - one cake photograph
   - photo description
   - flavour
   - short description
   - ingredients shown
   - starting price
   - whether it should appear on the homepage
   - visible on website
7. Save.
8. GitHub creates a versioned content commit and rebuilds the website.
9. Open the live gallery after the build finishes and check the new cake on phone.

## Safety rules

- Do not publish a cake without a price, category, useful description and photo description.
- Confirm ingredient and allergen wording whenever the recipe or decorations change.
- Do not mark too many cakes as featured. Keep the homepage to roughly six.
- Compress unusually large images before upload where possible.
- Never place customer phone numbers, addresses or private order information in a cake description.
- If anything is wrong, the previous version remains recoverable through Git.

## One-time deployment setup still required

- Authorize Pages CMS for the repository and the owner account.
- Approve the GitHub Actions deployment workflow.
- Decide whether owner edits publish directly to `main` or open a review branch first.
- Train the owner with one real cake upload and one rollback test.
