// Debug endpoint to test if requests to /game-assets/ are reaching the server route
export default defineEventHandler((event) => {
  return {
    message: 'This confirms the /game-assets route handler is being reached!',
    path: event.context.params?.path,
    url: event.path,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  }
})
