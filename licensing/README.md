# Universal Accounting Edition 2 licence administration

This development version supports offline verification of signed perpetual licences using a device identifier supplied by the native wrapper. Android derives it from Android ID and Windows from MachineGuid. Identifiers can change after an OS reset or reinstall and may be duplicated by machine cloning. A licence does not travel with a JSON accounting backup.

On the owner's private computer, run `node admin.cjs init` in a protected directory. Keep the resulting private PEM and licence registry private and backed up. Use the public JWK as the GitHub repository variable `UA_PUBLIC_JWK`. The commercial build option includes the public verification key and activation screen. Run `node admin.cjs issue DEVICE_ID android|windows CUSTOMER_REFERENCE` to issue a token for the displayed device ID. Keep key and registry access restricted to authorized administrators.

Payment verification is manual. Revocation, transfers and verification with production signing credentials are pending. An already activated offline device cannot receive revocations until it communicates with an authorized service.

## Administrator dashboard

After initializing the keys, stay in that same private working directory and run `node /path/to/licensing/dashboard.cjs` with Node.js 22 or later. Open the private loopback URL printed by the tool. Confirm cleared payment, enter the paid order reference and the customer's device ID, and issue the perpetual token. One registry accepts each paid-order reference once, including after restart. Keep one authoritative registry on the owner's local drive. Redeemed orders can be viewed and their tokens recovered from the dashboard. Back up the `ua-redeemed-orders` folder and signing key together. Close the dashboard when finished.

For development only, `admin.cjs issue` retains the legacy command-line issuance path, which is outside the paid-order registry. Commercial operations should use the dashboard.
