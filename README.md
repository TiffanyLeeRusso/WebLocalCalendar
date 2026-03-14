# Local Calendar

A high-performance, privacy-focused local calendar application built with Next.js 15 and Dexie.js (IndexedDB).

## Features
* **Zero Server Overhead:** All data is stored locally in your browser using IndexedDB.
* **Dynamic Day View:** Includes a "Live Now" indicator with a real-time tracking line.
* **Persistent Settings:** Dark/Light mode, Big Text accessibility, and 12/24h time formats (powered by Zustand).
* **Global Search:** Instant event lookup via the sidebar.
* **Responsive Layout:** Sliding navigation sidebar and right-side event management panel.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Database:** Dexie.js (IndexedDB wrapper)
- **State Management:** Zustand (with Persistence)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Getting Started

1. **Clone and Install:**
   ```bash
   git clone [your-repo-link]
   cd local-calendar
   npm install

2. **Run Development Server:**
   ```bash
   npm run dev

3. **Open http://localhost:3000/projects/LocalCalendar to see the app.**

4. **Build for Production:**
   ```bash
   npm run build

## Roadmap / TODOs
[ ] Month View: Implement 6-week grid with "compact" event indicators.

[ ] Year View

[ ] Event Recurrence: Add logic for weekly/monthly repeating events.

[ ] Import/Export: Allow users to backup their IndexedDB data as a JSON file.

## License
MIT
