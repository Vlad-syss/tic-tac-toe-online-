import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export const useGameApi = (gameId: Id<'games'> | null) => {
	const createGameWithAI = useMutation(api.ai.ai_controller.createGameWithAI)
	const startGame = useMutation(api.games.games_controller.startNewGame)
	const getGame = useQuery(
		api.games.games_controller.getGame,
		gameId ? { gameId } : 'skip'
	)
	const makeMoves = useMutation(api.games.games_controller.makeMove)
	const aiMakeMove = useMutation(api.ai.ai_controller.aiMakeMove)

	const [mutationLoading, setMutationLoading] = useState(false)

	const startGameWithAI = async (userId: Id<'users'>, fieldSize: number) => {
		setMutationLoading(true)
		const game = await createGameWithAI({ userId, fieldSize })
		setMutationLoading(false)
		return game
	}

	const makeMove = async (move: { gameId: Id<'games'>; row: number; col: number }) => {
		setMutationLoading(true)
		await makeMoves(move)
		setMutationLoading(false)
	}

	const aiMove = async (move: { gameId: Id<'games'>; playerId: Id<'users'> }) => {
		setMutationLoading(true)
		await aiMakeMove(move)
		setMutationLoading(false)
	}

	const startNewGame = async (game: any) => {
		setMutationLoading(true)
		const result = await startGame(game)
		setMutationLoading(false)
		return result
	}

	const joinByInvite = useMutation(
		api.games.games_controller.joinGameByInvite
	)

	const joinGameByInvite = async (
		inviteCode: string,
		userId: Id<'users'>
	) => {
		setMutationLoading(true)
		const gameId = await joinByInvite({ inviteCode, userId })
		setMutationLoading(false)
		return gameId
	}

	return {
		createGameWithAI,
		getGame,
		aiMove,
		startGameWithAI,
		makeMove,
		startNewGame,
		joinGameByInvite,
		isLoading: getGame === undefined || mutationLoading,
		makeMoves,
	}
}
