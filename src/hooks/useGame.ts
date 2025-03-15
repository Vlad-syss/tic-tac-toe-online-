import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export const useGame = (gameId: Id<'games'> | null) => {
	const startNewGame = useMutation(api.games.startNewGame)
	const getGame = useQuery(api.games.getGame, gameId ? { gameId } : 'skip')
	const getMoves = useQuery(api.moves.getMoves, gameId ? { gameId } : 'skip')
	const makeMove = useMutation(api.moves.makeMove)
	const aiMakeMove = useMutation(api.ai.aiMakeMove)

	return {
		startNewGame,
		getGame,
		getMoves,
		makeMove,
		aiMakeMove,
		isLoading: getGame === undefined || getMoves === undefined,
	}
}
