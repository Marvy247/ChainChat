# Timelock Vault - Time-Locked Savings Vault

Enforce savings discipline by locking tokens for a specific period with optional auto-extension.

## Features

- **Create Vaults**: Lock STX for fixed or recurring periods
- **Savings Goals**: Set target amounts and deadlines
- **Extend Lock**: Voluntarily extend lock period
- **Add Funds**: Add more STX to existing vault
- **Emergency Withdraw**: Early withdrawal with 10% penalty
- **Auto-Extend**: Optional automatic lock extension

## Key Functions

### create-vault
Lock STX for a specific duration with lock type.

### withdraw
Withdraw funds after unlock period expires.

### extend-lock
Extend lock period to boost savings discipline.

### add-to-vault
Add more funds to existing vault.

### set-savings-goal
Set financial goals with target and deadline.

## Use Cases

- Personal savings plans
- Retirement funds
- Education savings
- Emergency fund building
- Financial goal tracking

## Deployment

```bash
clarinet check
clarinet deploy --testnet
```
