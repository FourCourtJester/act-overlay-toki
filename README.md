# 🌀 Tōki - FFXIV ACT Overlay

![Tōki Banner](/public/toki-256x256.png)

An [ACT Overlay plugin](https://github.com/FFXIV-ACT/setup-guide) for Final Fantasy XIV that creates a right-to-left timeline of your Abilities and Spells

---

## ✨ Features

* Real-time cooldown tracking
* XIVAPI integration and caching
* Trait and Charges awareness
* Smooth timeline animations
* Responsive sizing

## 🧰 ACT Requirements

Before using Tōki, ensure you have:

* **Advanced Combat Tracker (ACT)**
  Version: ≥ `3.8.4`
* **FFXIV Plugin for ACT**
  Set up and parsing combat logs correctly
* **OverlayPlugin**
  Vresion: ≥ `v0.19.60`
* ACT WebSocket Relay enabled (via OverlayPlugin)

---

## 📦 Usage Instructions (for Players)

## 📦 Installation Instructions (for Devs)

1. **Clone or download this repository**

   ```bash
   git clone https://github.com/your-org/toki-overlay.git
   ```

2. **Run the overlay server**

   ```bash
   npm install
   npm run dev
   ```

3. **Register the overlay in ACT:**

   * Open ACT → Plugins → OverlayPlugin
   * Click “New” and add a **Custom Browser Overlay**
   * Set the URL to:

     ```
     http://localhost:5173
     ```

4. **Done!**
   Tōki will now receive combat data from ACT and display cooldowns in real-time.

---

## 🤝 Contributing

Due to the nature of the game version tracking and the arbitrary updates to Job Traits, contributions are welcome to keep the data up to date! To get started:

1. Fork the repo
2. Create a new branch:

   ```bash
   git checkout -b feature/my-awesome-thing
   ```
3. Make your changes
4. Submit a pull request 🛠


### Contributions
The main two changing data points that will require contributions are:

### `/.env`

There is no sensitive data within the `.env` file that is damaging to anyone, it simply contains some global values used within the app. In order for these values to be used in the app, they must be prefixed with `VITE_`:

```
VITE_ABILITY_RECAST_THRESHOLD=10
VITE_ICON_SECONDS_TTL=3
VITE_GAME_VERSION=7.25
```

And the obvious choice of "which value requires semi regular updating" is `VITE_GAME_VERSION`. Since some patches can and will update game information, the cache is set to purge whenever this value changes in order to allow updated values to come in from XIVAPI

### `/src/traits.json`

This JSON file contains all the manual overrides when it comes to abilities. Currently there are two relevant overrides:

```
[AbilityName]: {
  "level": 94,
  "modification": {
    "maxCharges": 1
    "recast": -20
  }
}
```

At least at the time of conception for this plugin, Traits could modify two fields that are returned from XIVAPI: `maxCharges` and `recast`. Some abilities as the player levels up gain additional charges at certain levels, and some abilities will reduce (or increase?) in their recast timer.

Keeping the Traits up to date will be required as the game evolves and additional changes occur in order to keep the cooldowns lined up with player expectations

---

For all other contributions, I have included comments to help future contributors understand what is going on. Any pull requests with convincing arguments will be considered for merging
