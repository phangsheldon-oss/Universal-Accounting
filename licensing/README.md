# Commercial licensing (development)
Generate keys privately with node admin.cjs init. Never commit ua-private.pem or customer registry. Issue with node admin.cjs issue INSTALLATION_ID android|windows CUSTOMER_REFERENCE.
Prepare a separate commercial HTML using node licensing/prepare-commercial.cjs windows /private/path/ua-public.json /output/index.html (or android). The normal development build is unchanged. The public key must be the owner's real public key.
The activation gate uses a random local installation ID, not a hardware-backed identity. Copying an entire application profile or modifying the application can bypass it. Reinstall after storage deletion requires reissue. No online activation, revocation or transfer enforcement exists yet. Do not market this as piracy-proof. Production builds need native secure identity, release signing, build integration and device tests.
Run node --test licensing/verify.test.cjs to verify signatures. Never bundle admin.cjs or private keys.
