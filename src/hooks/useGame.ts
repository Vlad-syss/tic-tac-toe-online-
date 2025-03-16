import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export const useGame = (gameId: Id<'games'> | null) => {
	const createGameWithAI = useMutation(api.ai.ai_controller.createGameWithAI)
	const getGame = useQuery(
		api.games.games_controller.getGame,
		gameId ? { gameId } : 'skip'
	)
	const getMoves = useQuery(
		api.moves.moves_controller.getMoves,
		gameId ? { gameId } : 'skip'
	)
	const makeMoves = useMutation(api.moves.moves_controller.makeMove)
	const aiMakeMove = useMutation(api.ai.ai_controller.aiMakeMove)
	const deleteAi = useMutation(api.ai.ai_controller.deleteAIUser)

	const startGameWithAI = async (userId: Id<'users'>, fieldSize: number) => {
		const game = await createGameWithAI({ userId, fieldSize })
		return game
	}

	return {
		createGameWithAI,
		getGame,
		getMoves,
		aiMakeMove,
		deleteAi,
		startGameWithAI,
		makeMoves,
		isLoading: getGame === undefined || getMoves === undefined,
	}
}
