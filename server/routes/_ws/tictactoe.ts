import type { Peer } from 'crossws'

interface GameRoom {
  id: string
  players: Map<string, { peer: Peer; symbol: 'X' | 'O' }>
  board: (string | null)[]
  currentPlayer: 'X' | 'O'
  gameActive: boolean
  createdAt: number
}

// In-memory store for game rooms
const rooms = new Map<string, GameRoom>()

// Clean up old rooms every 5 minutes
setInterval(() => {
  const now = Date.now()
  const maxAge = 30 * 60 * 1000 // 30 minutes
  for (const [roomId, room] of rooms) {
    if (now - room.createdAt > maxAge && room.players.size === 0) {
      rooms.delete(roomId)
    }
  }
}, 5 * 60 * 1000)

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function broadcastToRoom(room: GameRoom, message: object, excludePeerId?: string) {
  const messageStr = JSON.stringify(message)
  for (const [peerId, player] of room.players) {
    if (peerId !== excludePeerId) {
      player.peer.send(messageStr)
    }
  }
}

function checkWinner(board: (string | null)[]): string | null {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ]

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return null
}

function checkDraw(board: (string | null)[]): boolean {
  return board.every(cell => cell !== null)
}

export default defineWebSocketHandler({
  open(peer) {
    console.log('[WS] Connection opened:', peer.id)
  },

  message(peer, message) {
    try {
      const data = JSON.parse(message.text())

      switch (data.type) {
        case 'create_room': {
          // Create a new room
          let roomId = generateRoomId()
          while (rooms.has(roomId)) {
            roomId = generateRoomId()
          }

          const room: GameRoom = {
            id: roomId,
            players: new Map([[peer.id, { peer, symbol: 'X' }]]),
            board: Array(9).fill(null),
            currentPlayer: 'X',
            gameActive: false,
            createdAt: Date.now()
          }

          rooms.set(roomId, room)

          peer.send(JSON.stringify({
            type: 'room_created',
            roomId,
            symbol: 'X',
            message: 'Waiting for opponent to join...'
          }))
          break
        }

        case 'join_room': {
          const roomId = data.roomId?.toUpperCase()
          const room = rooms.get(roomId)

          if (!room) {
            peer.send(JSON.stringify({
              type: 'error',
              message: 'Room not found. Check the room code and try again.'
            }))
            return
          }

          if (room.players.size >= 2) {
            peer.send(JSON.stringify({
              type: 'error',
              message: 'Room is full. Please try a different room.'
            }))
            return
          }

          // Check if this peer is already in the room
          if (room.players.has(peer.id)) {
            peer.send(JSON.stringify({
              type: 'error',
              message: 'You are already in this room.'
            }))
            return
          }

          // Add player as O
          room.players.set(peer.id, { peer, symbol: 'O' })
          room.gameActive = true

          // Notify the joining player
          peer.send(JSON.stringify({
            type: 'room_joined',
            roomId,
            symbol: 'O',
            board: room.board,
            currentPlayer: room.currentPlayer
          }))

          // Notify the host that opponent joined
          broadcastToRoom(room, {
            type: 'opponent_joined',
            board: room.board,
            currentPlayer: room.currentPlayer
          }, peer.id)
          break
        }

        case 'make_move': {
          const roomId = data.roomId?.toUpperCase()
          const room = rooms.get(roomId)

          if (!room) {
            peer.send(JSON.stringify({
              type: 'error',
              message: 'Room not found.'
            }))
            return
          }

          const player = room.players.get(peer.id)
          if (!player) {
            peer.send(JSON.stringify({
              type: 'error',
              message: 'You are not in this room.'
            }))
            return
          }

          if (!room.gameActive) {
            peer.send(JSON.stringify({
              type: 'error',
              message: 'Game is not active.'
            }))
            return
          }

          if (room.currentPlayer !== player.symbol) {
            peer.send(JSON.stringify({
              type: 'error',
              message: "It's not your turn."
            }))
            return
          }

          const index = data.index
          if (typeof index !== 'number' || index < 0 || index > 8 || room.board[index] !== null) {
            peer.send(JSON.stringify({
              type: 'error',
              message: 'Invalid move.'
            }))
            return
          }

          // Make the move
          room.board[index] = player.symbol

          // Check for winner
          const winner = checkWinner(room.board)
          const isDraw = !winner && checkDraw(room.board)

          if (winner || isDraw) {
            room.gameActive = false

            // Broadcast game over
            for (const [, p] of room.players) {
              p.peer.send(JSON.stringify({
                type: 'game_over',
                board: room.board,
                winner: winner,
                isDraw: isDraw,
                winningPattern: winner ? getWinningPattern(room.board) : null
              }))
            }
          } else {
            // Switch player
            room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X'

            // Broadcast move to all players
            for (const [, p] of room.players) {
              p.peer.send(JSON.stringify({
                type: 'move_made',
                board: room.board,
                currentPlayer: room.currentPlayer,
                lastMove: { index, symbol: player.symbol }
              }))
            }
          }
          break
        }

        case 'restart_game': {
          const roomId = data.roomId?.toUpperCase()
          const room = rooms.get(roomId)

          if (!room) return

          const player = room.players.get(peer.id)
          if (!player) return

          // Reset the game
          room.board = Array(9).fill(null)
          room.currentPlayer = 'X'
          room.gameActive = room.players.size === 2

          // Broadcast reset
          for (const [, p] of room.players) {
            p.peer.send(JSON.stringify({
              type: 'game_restarted',
              board: room.board,
              currentPlayer: room.currentPlayer,
              gameActive: room.gameActive
            }))
          }
          break
        }

        case 'leave_room': {
          const roomId = data.roomId?.toUpperCase()
          handlePlayerLeave(peer, roomId)
          break
        }
      }
    } catch (error) {
      console.error('[WS] Error processing message:', error)
      peer.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format.'
      }))
    }
  },

  close(peer) {
    console.log('[WS] Connection closed:', peer.id)
    // Find and clean up any rooms this peer was in
    for (const [roomId, room] of rooms) {
      if (room.players.has(peer.id)) {
        handlePlayerLeave(peer, roomId)
        break
      }
    }
  },

  error(peer, error) {
    console.error('[WS] Error:', peer.id, error)
  }
})

function handlePlayerLeave(peer: Peer, roomId?: string) {
  if (!roomId) return

  const room = rooms.get(roomId)
  if (!room) return

  const player = room.players.get(peer.id)
  if (!player) return

  room.players.delete(peer.id)
  room.gameActive = false

  // Notify remaining player
  broadcastToRoom(room, {
    type: 'opponent_left',
    message: 'Your opponent has left the game.'
  })

  // Clean up empty rooms
  if (room.players.size === 0) {
    rooms.delete(roomId)
  }
}

function getWinningPattern(board: (string | null)[]): number[] | null {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ]

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return pattern
    }
  }
  return null
}
