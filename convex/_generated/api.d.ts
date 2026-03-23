/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai_ai_actions from "../ai/ai_actions.js";
import type * as ai_ai_controller from "../ai/ai_controller.js";
import type * as games_games_controller from "../games/games_controller.js";
import type * as games_games_schema from "../games/games_schema.js";
import type * as users_leaderboard_controller from "../users/leaderboard_controller.js";
import type * as users_users_controller from "../users/users_controller.js";
import type * as users_users_schema from "../users/users_schema.js";
import type * as utils_elo from "../utils/elo.js";
import type * as utils_gameLogic from "../utils/gameLogic.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "ai/ai_actions": typeof ai_ai_actions;
  "ai/ai_controller": typeof ai_ai_controller;
  "games/games_controller": typeof games_games_controller;
  "games/games_schema": typeof games_games_schema;
  "users/leaderboard_controller": typeof users_leaderboard_controller;
  "users/users_controller": typeof users_users_controller;
  "users/users_schema": typeof users_users_schema;
  "utils/elo": typeof utils_elo;
  "utils/gameLogic": typeof utils_gameLogic;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
