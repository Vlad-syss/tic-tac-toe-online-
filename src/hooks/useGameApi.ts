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
	const deleteAi = useMutation(api.ai.ai_controller.deleteAIUser)

	const [mutationLoading, setMutationLoading] = useState(false)

	const startGameWithAI = async (userId: Id<'users'>, fieldSize: number) => {
		setMutationLoading(true)
		const game = await createGameWithAI({ userId, fieldSize })
		setMutationLoading(false)
		return game
	}

	const makeMove = async (move: any) => {
		setMutationLoading(true)
		await makeMoves(move)
		setMutationLoading(false)
	}
	const deleteAI = async (ai: any) => {
		setMutationLoading(true)
		await deleteAi(ai)
		setMutationLoading(false)
	}

	const startNewGame = async (game: any) => {
		setMutationLoading(true)
		await startGame(game)
		setMutationLoading(false)
	}

	return {
		createGameWithAI,
		getGame,
		deleteAI,
		startGameWithAI,
		makeMove,
		startNewGame,
		isLoading: getGame === undefined || mutationLoading,
		makeMoves,
	}
}
