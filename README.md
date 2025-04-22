# 🚀 My Cool Project

🔗 **Live Demo:** [Click here to view](https://geo-location-app-tau.vercel.app/)

# GeoExplorer

GeoExplorer is a modern, interactive web application built with React and TypeScript that allows users to explore geographic locations on a map. Leveraging the power of Leaflet and OpenStreetMap, GeoExplorer provides an intuitive interface for searching locations, viewing user position, and interacting with map markers.

## Features

- **User Location Detection:** Automatically detects and displays the user's current location on the map.
- **Location Search:** Search for places worldwide using the OpenStreetMap Nominatim API with autocomplete and minimum character validation.
- **Local and Global Search:** Performs local bounded searches around the user's location for relevant results, with a global fallback if no local results are found.
- **Distance Sorting:** Search results are sorted by distance from the user's current location for convenience.
- **Interactive Map Markers:** Add markers for selected locations with informative popups displaying place name, type, and distance.
- **Responsive UI:** Clean and responsive design using Tailwind CSS and lucide-react icons for a modern look and feel.
- **Smooth Map Navigation:** Map automatically pans and zooms to selected locations with smooth animations.

## Technology Stack

- **React 18** - Frontend UI library
- **TypeScript** - Typed JavaScript for improved developer experience
- **Vite** - Fast build tool and development server
- **Leaflet** - Open-source JavaScript library for mobile-friendly interactive maps
- **React-Leaflet** - React components for Leaflet maps
- **Tailwind CSS** - Utility-first CSS framework for styling
- **lucide-react** - Icon library for React
- **OpenStreetMap Nominatim API** - Geocoding and location search service

## Getting Started

### Prerequisites

- Node.js (version 10 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd geolocation_project/project
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Running the Application

Start the development server with hot reloading:

```bash
npm run dev
```

Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

### Building for Production

To create an optimized production build:

```bash
npm run build
```

### Preview Production Build

To locally preview the production build:

```bash
npm run preview
```

### Linting

To check code quality and style issues:

```bash
npm run lint
```

## Project Structure

- `src/` - Source code directory
  - `components/Map.tsx` - Main map component with location search and markers
  - `App.tsx` - Root application component
- `index.html` - HTML entry point
- `package.json` - Project metadata and scripts
- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
