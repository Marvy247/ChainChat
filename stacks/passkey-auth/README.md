# Passkey Authentication - WebAuthn for Stacks

**Built for Stacks Builder Challenge by Marcus David**

## Deployed Contract

**Testnet Address:** `ST3P3DPDB69YP0Z259SS6MSA16GBQEBF8KG8P96D2.passkey-auth`

**Explorer:** [View on Stacks Explorer](https://explorer.hiro.so/txid/ST3P3DPDB69YP0Z259SS6MSA16GBQEBF8KG8P96D2.passkey-auth?chain=testnet)

**Deployer:** `ST3P3DPDB69YP0Z259SS6MSA16GBQEBF8KG8P96D2`

##  Overview
A cutting-edge authentication system using WebAuthn passkeys for Stacks wallets. Enables biometric and hardware key authentication for smart contracts. Showcases **Clarity 4's secp256r1** signature verification for native passkey support.

##  Key Features
- **Passkey authentication**: WebAuthn/FIDO2 support
- **Biometric login**: Face ID, Touch ID, Windows Hello
- **Hardware keys**: YubiKey, Titan Key support
- **Nonce protection**: Prevent replay attacks
- **Activity tracking**: Monitor authentication history
- **secp256r1**: Native passkey curve support (Clarity 4)

##  Use Cases
- Passwordless wallet access
- Biometric transaction signing
- Hardware key authentication
- Multi-device wallet management
- Enhanced UX for non-crypto users

##  Contract Functions

### Public Functions
- `register-passkey(public-key)` - Register new passkey wallet
- `authenticate(message-hash, signature, nonce)` - Authenticate with passkey
- `update-passkey(new-public-key, signature, nonce)` - Rotate passkey
- `deactivate-wallet()` - Disable wallet
- `reactivate-wallet(signature, nonce)` - Re-enable wallet
- `emergency-deactivate(user)` - Admin emergency shutdown

### Read-Only Functions
- `get-wallet(user)` - Get wallet details
- `is-nonce-used(nonce)` - Check if nonce already used
- `get-auth-log(auth-id)` - Get authentication record
- `get-stats()` - Get system statistics

##  How It Works

### Registration Flow
1. User generates passkey (biometric/hardware)
2. Public key (secp256r1) extracted
3. Wallet registered with public key
4. User can now authenticate

### Authentication Flow
1. User initiates transaction
2. Browser/device prompts for biometric
3. Signature generated with passkey
4. Contract verifies using secp256r1
5. Transaction authorized

### Security Features
- **Nonce system**: Prevents replay attacks
- **Signature verification**: Uses secp256r1 (WebAuthn standard)
- **Activity logging**: Tracks all authentications
- **Deactivation**: Can disable compromised wallets

##  Passkey Benefits
- **No passwords**: Just biometrics
- **Phishing resistant**: Keys never leave device
- **Multi-device**: Sync across devices
- **Familiar UX**: Like logging into websites
- **Hardware support**: YubiKey, etc.

##  WebAuthn Standards
- **Algorithm**: secp256r1 (P-256) curve
- **Format**: FIDO2/WebAuthn compliant
- **Credentials**: Device-bound or synced
- **Attestation**: Supports device verification

##  Deployment

```bash
# Check contract
clarinet check

# Test locally
clarinet test

# Deploy to testnet
clarinet deploy --testnet
```

##  Clarity 4 Features

This contract demonstrates:
- **secp256r1 signature verification** (Clarity 4's passkey support)
- **WebAuthn integration** patterns
- **Modern authentication** for blockchain
- **Replay attack prevention**

##  Integration Example

```javascript
// Frontend: Register passkey
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: new Uint8Array(32),
    rp: { name: "Stacks Wallet" },
    user: {
      id: new Uint8Array(16),
      name: "user@example.com",
      displayName: "User"
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256 (secp256r1)
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required"
    }
  }
});

// Extract public key and register
const publicKey = extractPublicKey(credential);
await contractCall('register-passkey', [publicKey]);
```

##  Security Considerations
- Public keys stored on-chain
- Signatures verified using secp256r1
- Nonces prevent replay attacks
- Emergency deactivation available
- Activity logged for audit trail

##  Future Enhancements
- Multi-sig with passkeys
- Social recovery options
- Passkey marketplace
- Cross-device syncing
- Advanced biometric options

##  Browser Support
-  Chrome/Edge (Windows Hello)
-  Safari (Touch ID/Face ID)
-  Firefox (Platform authenticators)
-  Mobile browsers (iOS/Android)

##  Built For
-  Stacks Builder Challenge (Dec 10-14, 2024)
-  Bringing Web2 UX to Bitcoin L2

##  License
MIT License

##  Author
Marcus David

##  Resources
- [WebAuthn Guide](https://webauthn.guide/)
- [Passkeys Overview](https://passkeys.dev/)
- [Clarity 4 secp256r1 Docs](https://docs.stacks.co/)
