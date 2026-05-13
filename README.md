# Frontend Mentor - IP address tracker solution

This is a solution to the [IP address tracker challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/ip-address-tracker-I8-0yYAH0). The app shows your current IP details on load and lets you search any valid IP address or domain to view location data and map position.

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [Project structure](#project-structure)
  - [Environment variables](#environment-variables)
  - [How to run locally](#how-to-run-locally)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
  - [AI Collaboration](#ai-collaboration)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

## Overview

### The challenge

Users should be able to:

- View the optimal layout for the app depending on their device screen size
- See hover states for interactive elements
- See their own IP address on initial page load
- Search for any IP address or domain and see location/ISP details
- See the searched location reflected on the Leaflet map

### Screenshot

Add your screenshot here:

`./screenshot.png`

### Links

- Solution URL: [Add your Frontend Mentor solution URL](https://www.frontendmentor.io/)
- Live Site URL: [Add your deployed site URL](https://example.com)

## My process

### Built with

- [React 19](https://react.dev/) + [Vite 6](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/) for map rendering
- Geo.IPify API for IP/domain geolocation
- Mobile-first responsive workflow

### Project structure

```text
ip-tracker/
├─ src/
│  ├─ App.jsx
│  ├─ IPTracker.jsx
│  ├─ main.jsx
│  ├─ index.css
│  └─ images/
├─ .env
├─ package.json
└─ README.md
```

### Environment variables

Create a `.env` file in the project root:

```env
VITE_IPIFY_API_KEY=your_api_key_here
VITE_IPIFY_API_URL=https://geo.ipify.org/api/v2/country,city?apiKey=
```

Notes:

- Variables must start with `VITE_` to be available in client code.
- Restart the dev server after changing `.env`.

### How to run locally

1. Clone the repository
2. Install dependencies
3. Add `.env` with valid Geo.IPify credentials
4. Start development server

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

### What I learned

- How to normalize user input (IP/domain/URL-like text) before API lookup
- How to manage Leaflet lifecycle safely in React (including cleanup and marker updates)
- How to handle API-driven UI states with clear error messaging
- How to keep UI structure stable while refactoring business logic

### Continued development

- Add loading skeleton/spinner while resolving IP lookups
- Improve domain validation edge cases and private IP messaging
- Add unit tests for input normalization and API response mapping
- Add e2e tests for search flow and map marker updates

### Useful resources

- [Frontend Mentor challenge page](https://www.frontendmentor.io/challenges/ip-address-tracker-I8-0yYAH0)
- [Geo.IPify API docs](https://geo.ipify.org/)
- [Leaflet documentation](https://leafletjs.com/reference.html)
- [Vite env variables guide](https://vite.dev/guide/env-and-mode)

### AI Collaboration

AI tools were used during implementation and debugging to:

- Refactor application logic while preserving existing UI layout
- Diagnose runtime issues (`React is not defined`, map initialization edge cases)
- Improve input validation and API error handling paths
- Accelerate README and project documentation updates

## Author

- Name: Your Name
- Frontend Mentor: [@yourusername](https://www.frontendmentor.io/profile/yourusername)
- GitHub: [@yourusername](https://github.com/yourusername)

## Acknowledgments

Thanks to the Frontend Mentor community for challenge inspiration and solution patterns, and to the open-source maintainers of React, Vite, Tailwind CSS, and Leaflet.
