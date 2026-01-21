import type { Peer } from 'crossws'
import { Chess } from 'chess.js'

interface GameRoom {
  id: string
  players: Map<string, { peer: Peer; color: 'white' | 'black' }>
  fen: string
  pgn: string
  whiteTime: number
  blackTime: number
  gameActive: boolean
  createdAt: number
  lastMoveTime: number
}

const rooms = new Map<string, GameRoom>()

setInterval(() => {
  const now = Date.now()
  const maxAge = 30 * 60 * 1000
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

function getGameState(room: GameRoom) {
  return {
    fen: room.fen,
    pgn: room.pgn,
    whiteTime: room.whiteTime,
    blackTime: room.blackTime,
    gameActive: room.gameActive
  }
}

function checkGameState(fen: string) {
  const chess = new Chess(fen)

  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'Black' : 'White'
    return { gameOver: true, result: `Checkmate! ${winner} wins!` }
  }

  if (chess.isStalemate()) {
    return { gameOver: true, result: 'Stalemate! Draw by stalemate.' }
  }

  if (chess.isDraw()) {
    return { gameOver: true, result: 'Draw! Game drawn.' }
  }

  return { gameOver: false, result: null }
}

export default defineWebSocketHandler({
  open(peer) {
    console.log('[WS Chess] Connection opened:', peer.id)
  },

  message(peer, message) {
    try {
      const data = JSON.parse(message.text())

      switch (data.type) {
        case 'create_room': {
          let roomId = generateRoomId()
          while (rooms.has(roomId)) {
            roomId = generateRoomId()
          }

          const chess = new Chess()

          const room: GameRoom = {
            id: roomId,
            players: new Map([[peer.id, { peer, color: data.color || 'white' }]]),
            fen: chess.fen(),
            pgn: chess.pgn(),
            whiteTime: 600,
            blackTime: 600,
            gameActive: false,
            createdAt: Date.now(),
            lastMoveTime: Date.now()
          }

          rooms.set(roomId, room)

          peer.send(JSON.stringify({
            type: 'room_created',
            roomId,
            color: data.color || 'white',
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

          if (room.players.has(peer.id)) {
            peer.send(JSON.stringify({
              type: 'error',
              message: 'You are already in this room.'
            }))
            return
          }

          const existingPlayer = Array.from(room.players.values())[0]
          const existingColor = existingPlayer?.color || 'white'

          const newColor = existingColor === 'white' ? 'black' : 'white'

          room.players.set(peer.id, { peer, color: newColor as 'white' | 'black' })
          room.gameActive = true

          const gameState = getGameState(room)

          peer.send(JSON.stringify({
            type: 'room_joined',
            roomId,
            color: newColor,
            ...gameState
          }))

          broadcastToRoom(room, {
            type: 'opponent_joined',
            ...gameState
          }, peer.id)

          console.log(`[WS Chess] Player ${peer.id} joined room ${roomId} as ${newColor}`)
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

          const chess = new Chess(room.fen)

          if (chess.turn() === 'w' && player.color !== 'white') {
            peer.send(JSON.stringify({
              type: 'error',
              message: "It's not your turn."
            }))
            return
          }

          if (chess.turn() === 'b' && player.color !== 'black') {
            peer.send(JSON.stringify({
              type: 'error',
              message: "It's not your turn."
            }))
            return
          }

          const tempChess = new Chess(room.fen)
          const move = tempChess.move(data.move)

          if (!move) {
            peer.send(JSON.stringify({
              type: 'error',
              message: 'Invalid move.'
            }))
            return
          }

          room.fen = tempChess.fen()
          room.pgn = tempChess.pgn()
          room.whiteTime = data.whiteTime
          room.blackTime = data.blackTime
          room.lastMoveTime = Date.now()

          const gameState = checkGameState(room.fen)

          if (gameState.gameOver) {
            room.gameActive = false

            for (const [, p] of room.players) {
              p.peer.send(JSON.stringify({
                type: 'game_over',
                result: gameState.result,
                ...getGameState(room)
              }))
            }
          } else {
            const gameState = getGameState(room)

            for (const [, p] of room.players) {
              p.peer.send(JSON.stringify({
                type: 'move_made',
                ...gameState
              }))
            }
          }

          console.log(`[WS Chess] Move made in room ${roomId}`)
          break
        }

        case 'resign': {
          const roomId = data.roomId?.toUpperCase()
          const room = rooms.get(roomId)

          if (!room) return

          const player = room.players.get(peer.id)
          if (!player) return

          room.gameActive = false

          const winner = player.color === 'white' ? 'Black' : 'White'
          const result = `${winner} wins by resignation`

          for (const [, p] of room.players) {
            p.peer.send(JSON.stringify({
              type: 'player_resigned',
              result,
              color: player.color
            }))
          }

          console.log(`[WS Chess] Player ${player.color} resigned in room ${roomId}`)
          break
        }

        case 'offer_draw': {
          const roomId = data.roomId?.toUpperCase()
          const room = rooms.get(roomId)

          if (!room) return

          const player = room.players.get(peer.id)
          if (!player) return

          broadcastToRoom(room, {
            type: 'draw_offered',
            color: player.color
          }, peer.id)

          console.log(`[WS Chess] Draw offered by ${player.color} in room ${roomId}`)
          break
        }

        case 'decline_draw': {
          const roomId = data.roomId?.toUpperCase()
          const room = rooms.get(roomId)

          if (!room) return

          broadcastToRoom(room, {
            type: 'draw_declined'
          }, peer.id)

          console.log(`[WS Chess] Draw declined in room ${roomId}`)
          break
        }

        case 'accept_draw': {
          const roomId = data.roomId?.toUpperCase()
          const room = rooms.get(roomId)

          if (!room) return

          room.gameActive = false

          for (const [, p] of room.players) {
            p.peer.send(JSON.stringify({
              type: 'draw_accepted'
            }))
          }

          console.log(`[WS Chess] Draw accepted in room ${roomId}`)
          break
        }

        case 'leave_room': {
          const roomId = data.roomId?.toUpperCase()
          handlePlayerLeave(peer, roomId)
          break
        }
      }
    } catch (error) {
      console.error('[WS Chess] Error processing message:', error)
      peer.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format.'
      }))
    }
  },

  close(peer) {
    console.log('[WS Chess] Connection closed:', peer.id)
    for (const [roomId, room] of rooms) {
      if (room.players.has(peer.id)) {
        handlePlayerLeave(peer, roomId)
        break
      }
    }
  },

  error(peer, error) {
    console.error('[WS Chess] Error:', peer.id, error)
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

  broadcastToRoom(room, {
    type: 'opponent_left',
    message: 'Your opponent has left the game.'
  })

  if (room.players.size === 0) {
    rooms.delete(roomId)
    console.log(`[WS Chess] Room ${roomId} deleted (empty)`)
  }

  console.log(`[WS Chess] Player ${peer.id} (${player.color}) left room ${roomId}`)
}
