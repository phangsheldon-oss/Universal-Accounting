# Universal Accounting Edition 2 licence administration

This development version supports offline verification of signed perpetual licences using a device identifier supplied by the native wrapper. Android derives it from Android ID and Windows from MachineGuid. Identifiers can change after an OS reset or reinstall and may be duplicated by machine cloning. A licence does not travel with a JSON accounting backup.

On the owner's private computer, run `node admin.cjs init` in a protected directory. Keep the resulting private PEM and licence registry private and backed up. Use the public JWK as the GitHub repository variable `UA_PUBLIC_JWK`. The commercial build option includes the public verification key and activation screen. Run `node admin.cjs issue DEVICE_ID android|windows CUSTOMER_REFERENCE` to issue a token for the displayed device ID. Keep key and registry access restricted to authorized administrators.

The administrator currently uses a command-line tool. Payment verification, one-time order redemption, a management dashboard, revocation, transfers and release signing are pending. An already activated offline device cannot receive revocations until it communicates with an authorized service.
