# Technical Terms of Reference (TOR)

## Project: Tic Tac Toe / Tic Tac Toe

Project Goal: Break the coding barrier and create a simple game for training programming skills.

## Description:

This is a classic Tic Tac Toe game with additional features:

- Implementation of the game with artificial intelligence.
- Ability to play with other users via URL (online game).
- Adding player ratings and leaderboards.
- Support for different field sizes (3x3, 5x5, 10x10).
- New shapes are added in 2v2 mode, for example, not only tic-tac-toe, but also squares and triangles.
- The rating is different for playing with a bot or with people.
  Main features:

1. Playing with a computer (AI):
   - The user can choose the level of difficulty of the game with AI. (not yet)
   - Minimax algorithm to determine the best moves of AI.
2. Playing with other users:
   - Ability to create a game via a URL that can be sent to other users to join.
   - Using Convex Sinhronization for real-time and game synchronization.
3. Ranking and statistics:
   - After each game, the player's ranking is saved.
   - Leaderboard with player rankings for playing with the computer and other users.
4. Different field sizes:
   - The player can choose the field size (3x3, 5x5, 10x10).
   - In the game on large fields, you need to collect a line of 4 or more elements.
5. 2-on-2 game:
   - Ability to play with a partner on the same side, where new figures are used, except for the cross and zero (for example, the square and the circle).
6. User interface:
   - Simple and clear interface, allowing you to quickly start the game.
   - Creating a game via the "Start new game" button and the ability to connect to the game via URL.
   - Display current rating and game history.
     Technologies:
   - Frontend: React (TypeScript), Redux for state management, React Router for routing, Tailwind CSS for styling.
   - Backend: Convex for server logic (for storing games, users, ratings).
   - Realtime: Convex Realtime for real-time game synchronization between two players.
   - Artificial Intelligence: Minimax algorithm for implementing artificial intelligence.
     Goal:
     Develop a simple Tic Tac Toe game application with interactive features such as playing with a computer, online games and ratings to improve programming skills and train algorithms.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
	languageOptions: {
		// other options...
		parserOptions: {
			project: ['./tsconfig.node.json', './tsconfig.app.json'],
			tsconfigRootDir: import.meta.dirname,
		},
	},
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
	// Set the react version
	settings: { react: { version: '18.3' } },
	plugins: {
		// Add the react plugin
		react,
	},
	rules: {
		// other rules...
		// Enable its recommended rules
		...react.configs.recommended.rules,
		...react.configs['jsx-runtime'].rules,
	},
})
```
