# Redesign Feed as Chat Dapp Interface

- [x] Redesign layout to resemble a chat app (messages as bubbles)
- [x] Align messages: own posts right-aligned, others left-aligned
- [x] Add user avatars to each message
- [x] Improve timestamps to chat-style (e.g., relative time)
- [x] Make fully responsive (mobile-first, stack on small screens)
- [x] Add chat header with title and status
- [x] Remove card structure, use full-width chat container
- [x] Apply modern chat aesthetics (clean, minimal, rounded bubbles)
- [x] Add subtle animations and hover effects
- [x] Ensure touch-friendly on mobile devices

# Real-time Post Updates

- [x] Add refreshKey prop to Feed component
- [x] Update refreshKey after successful post creation
- [x] Trigger refetchPosts when refreshKey changes

# Font Loading Fix

- [x] Remove Geist font imports from layout.tsx
- [x] Remove tw-animate-css import from globals.css
- [x] Replace Geist font variables with system font stacks

# Post Creation UI

- [x] Replace dialog-based post creation with inline textarea and button
- [x] Remove showCreatePost state and related dialog logic
- [x] Keep profile update as dialog (user requested only post creation change)
