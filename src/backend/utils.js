const proxy = require("http-proxy-middleware");

module.exports = self = {
  wrap(fn) {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (err) {
        next(err);
      }
    };
  },
  
  pause(ms) {
    return new Promise((resolve) =>  {
      setTimeout(resolve, ms);
    });
  },
  
  proxyHMR (app) {
    const hmrProxy = proxy({
      target: 'ws://localhost:12345/',
      ws: true,
      ignorePath: true,
      onOpen: (socket) => {
        // keepalive
        const handler = setInterval(() => {
          socket.write('\x89\x00', 'binary');
        }, 30000);
        socket.on('close', () => {
          clearInterval(handler);
        });
      },
    });
    app.use('/__hmr:12345/', hmrProxy);
    return hmrProxy;
  },
}
