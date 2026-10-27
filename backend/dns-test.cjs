const dns = require('node:dns').promises;
const host = '_mongodb._tcp.cluster0.kbkozyf.mongodb.net';

(async () => {
  console.log('default servers:', dns.getServers());
  for (const servers of [null, ['192.168.1.1'], ['8.8.8.8']]) {
    if (servers) dns.setServers(servers);
    try {
      const r = await dns.resolveSrv(host);
      console.log(servers ?? 'default', '-> OK,', r.length, 'records');
    } catch (e) {
      console.log(servers ?? 'default', '-> FAIL', e.code);
    }
  }
})();