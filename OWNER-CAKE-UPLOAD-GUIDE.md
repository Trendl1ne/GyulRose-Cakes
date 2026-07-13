# Private Owner Cake Upload

The client does not need a GitHub account and must never receive repository credentials.

## Owner experience

1. Open the private owner-upload URL supplied by Gyunay.
2. Enter the private access code.
3. Add one cake photograph, cake name, category, flavour, description, ingredients and starting price.
4. Choose whether the cake should be featured.
5. Press **Send cake for publishing**.
6. The form sends the entry to Gyunay's n8n webhook. n8n validates it, stores the image and JSON record through Gyunay's GitHub credential, then the normal website build publishes it.

## Security design

- GitHub credentials exist only inside n8n's encrypted credential store.
- No GitHub token, webhook secret or access code is embedded in the website.
- The owner types the access code when uploading; n8n validates it server-side.
- The page is `noindex` and is not linked from the public website.
- n8n must reject wrong codes, unsupported image types, oversized images, invalid prices, duplicate slugs and incomplete records.
- Prefer a restricted fine-grained GitHub token with access only to this repository's contents.
- Keep an approval step in n8n initially: send Gyunay a Telegram preview and commit only after approval. Direct publishing can be enabled later after the workflow proves reliable.

## n8n connection still required before production

Set `PUBLIC_CAKE_UPLOAD_WEBHOOK_URL` to the production n8n webhook URL during the website build. Configure n8n to:

1. Receive `multipart/form-data` and the binary field `cakeImage`.
2. Validate the access code against an n8n environment value or encrypted credential.
3. Sanitize the slug and validate all text/number fields.
4. Create the image at `public/images/cakes/<slug>.<extension>`.
5. Create the cake record at `src/content/cakes/<slug>.json` using the same schema as existing records.
6. Use GitHub's repository-contents API with Gyunay's restricted credential.
7. Respond with success only after both repository writes succeed.
8. Notify Gyunay and the owner of success or a safe error.

The repository remains versioned and reversible, while the client sees only a simple upload form.
