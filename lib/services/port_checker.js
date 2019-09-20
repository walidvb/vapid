const net = require('net');
const Utils = require('../utils');

// Based on https://github.com/node-modules/detect-port
class PortChecker {
  constructor(port) {
    this.port = port;
  }

  async perform() {
    const results = await Promise.all([
      this.listen(null),
      this.listen('0.0.0.0'),
      this.listen('localhost'),
    ]);

    return Utils.some(results, r => r === true);
  }

  async listen(hostname) {
    const server = new net.Server();
    return new Promise((resolve) => {
      server.on('error', () => {
        server.close();
        resolve(true);
      });

      server.listen(this.port, hostname, () => {
        server.close();
        resolve(false);
      });
    });
  }
}

module.exports = PortChecker;
