# Rick & Morty Idle Collector

A purely hobbyist, non-commercial open-source idle game set in the Rick & Morty multiverse. Collect procedural cards, manage your portal slots, and earn Mega Seeds.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/DeepVoidGames/Unknown.git
   cd Unknown
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production
To create an optimized production build:
```bash
npm run build
```
The build process automatically updates the **Build Hash** displayed in the settings page.

## 🚢 Deployment (GitHub Pages)

This project is configured to automatically deploy to GitHub Pages via GitHub Actions.

1. Push your changes to the `main` branch.
2. Go to your repository settings on GitHub.
3. Navigate to **Settings > Pages**.
4. Under **Build and deployment > Source**, select **GitHub Actions**.
5. Your site will be automatically built and deployed at `https://<username>.github.io/<repo-name>/`.

---

## 🛠 Contributing: Adding New Characters

This project uses a procedural generation system. You can easily expand the multiverse by adding new characters to the database.

### 1. Adding Character Data
Open `src/data/characters.json` and add a new object to the array:

```json
{
  "name": "Character Name",
  "iq": 100,
  "status": "Alive",
  "species": "Human",
  "avatarId": 1
}
```

- **name**: Display name of the character.
- **iq**: Intelligence Quotient (1-400), used in Mega Seeds production formula: `floor(iq^1.5 * rarity_multiplier * 0.1)`.
- **status**: Character status (`"Alive"`, `"Dead"`, or `"Unknown"`).
- **species**: The species of the character.
- **avatarId**: The ID used for the character's image.

### 2. Managing Images
The project supports three ways to define character avatars:

#### Option A: Official API (Easiest)
Use the `avatarId` field to pull images from the [Rick and Morty API](https://rickandmortyapi.com/api/character).
```json
{ "name": "Rick", "avatarId": 1, ... }
```

#### Option B: External URL
Use the `customImage` field with a full `http` or `https` link.
```json
{ "name": "Rick", "customImage": "https://example.com/my-rick.png", ... }
```

#### Option C: Local Images
Place your images in `public/img/` and use the `customImage` field with the relative path starting from `/img/`.
```json
{ "name": "Rick", "customImage": "/img/my-rick.png", ... }
```

**Note:** If both `customImage` and `avatarId` are provided, `customImage` takes precedence.

### 3. Adding Card Types/Rarities
If you want to modify drop rates or multipliers for card variants (Silver, Gold, etc.), edit `src/data/cardTypes.json`.

### 4. Modifying Packs
To change costs, card counts, or drop chances for portals, edit `src/data/packs.json`.

---

## ⚖️ Legal Disclaimer
This is a **purely hobbyist, fan-made project**. All character names, images, and related assets from "Rick and Morty" are the sole property of **Adult Swim, Warner Bros. Discovery**, and their respective creators. This application is not affiliated with, endorsed, or sponsored by any of these entities.

---

## 📄 License
This project is open-source. Feel free to use it for educational or hobbyist purposes.
