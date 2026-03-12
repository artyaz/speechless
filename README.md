# Speechless

Speechless is a mobile-first pronunciation practice app for non-native English speakers. It focuses on fast practice loops, precise Azure-powered pronunciation assessment, and clear coaching for the sounds that actually need work.

The goal is simple: open the app, get a short practice exercise, record yourself, and immediately see where your pronunciation can improve.

## What it does

- Generates quick pronunciation exercises for different practice modes
- Uses Azure Speech pronunciation assessment for detailed scoring
- Highlights weak words and phonemes with actionable tips
- Lets users compare the model pronunciation with their own audio clips
- Tracks practice history and weak-sound trends over time
- Keeps recordings client-side so audio is not stored on the app server

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- tRPC
- Prisma + PostgreSQL
- NextAuth
- Azure Speech SDK
- Gemini / Groq-backed text generation

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy your env file and fill in the required values:

```bash
cp .env.example .env
```

3. Make sure PostgreSQL is running and apply the Prisma schema:

```bash
npm run db:push
```

4. Start the app:

```bash
npm run dev
```

## Useful scripts

```bash
npm run dev
npm run check
npm run build
npm run db:push
```

## Product direction

Speechless is designed to feel focused rather than bloated:

- mobile-first
- dark, clean UI
- fast sentence and word practice
- picky for non-native pronunciation issues, not unrealistically strict
- detailed but readable feedback

## Privacy note

Raw recordings are intended to stay local to the browser session and be used only for immediate pronunciation analysis and playback. They are not meant to be stored on the app server.

## License and usage

This repository is released under the custom `Speechless Attribution & Shareback License`.

In plain English:

- you can use the code
- you can learn from it
- you can build on it
- you must clearly credit the original Speechless project
- if you publicly ship improvements based on this code, you should contribute those improvements back to this project

See [`LICENSE`](./LICENSE) for the actual terms.

## Contributing back

If you build something on top of Speechless, the ideal path is:

1. mention the original project clearly
2. open a PR with fixes or improvements
3. share meaningful changes back instead of keeping them private

That keeps the project useful for everyone.
