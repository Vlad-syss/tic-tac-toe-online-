import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

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
		try {
			return await createGameWithAI({ userId, fieldSize })
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to start AI game')
			return null
		} finally {
			setMutationLoading(false)
		}
	}

	const makeMove = async (move: { gameId: Id<'games'>; row: number; col: number }) => {
		setMutationLoading(true)
		try {
			await makeMoves(move)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Move failed')
		} finally {
			setMutationLoading(false)
		}
	}

	const aiMove = async (move: { gameId: Id<'games'>; playerId: Id<'users'> }) => {
		setMutationLoading(true)
		try {
			await aiMakeMove(move)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'AI move failed')
		} finally {
			setMutationLoading(false)
		}
	}

	const startNewGame = async (game: {
		userIds: Id<'users'>[]
		gameMode: 'AI' | 'Online' | '1v1v1v1'
		fieldSize: number
		firstPlayerId?: Id<'users'>
		inviteCode?: string
	}) => {
		setMutationLoading(true)
		try {
			return await startGame(game)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to start game')
			return null
		} finally {
			setMutationLoading(false)
		}
	}

	const joinByInvite = useMutation(
		api.games.games_controller.joinGameByInvite
	)

	const joinGameByInvite = async (
		inviteCode: string,
		userId: Id<'users'>
	) => {
		setMutationLoading(true)
		try {
			return await joinByInvite({ inviteCode, userId })
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to join game')
			return null
		} finally {
			setMutationLoading(false)
		}
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
