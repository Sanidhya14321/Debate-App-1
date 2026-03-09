import autocannon from 'autocannon';

const targetUrl = process.env.LOAD_TEST_URL || 'http://127.0.0.1:5000/health';
const connections = Number.parseInt(process.env.LOAD_TEST_CONNECTIONS || '200', 10);
const duration = Number.parseInt(process.env.LOAD_TEST_DURATION || '15', 10);
const amount = Number.parseInt(process.env.LOAD_TEST_AMOUNT || '0', 10);

const instance = autocannon({
  url: targetUrl,
  method: 'GET',
  duration,
  connections,
  amount: amount > 0 ? amount : undefined,
  timeout: 20,
  pipelining: 1,
});

autocannon.track(instance, { renderProgressBar: true });

instance.on('done', (result) => {
  const summary = {
    targetUrl,
    durationSeconds: duration,
    connections,
    reqPerSecAverage: Math.round(result.requests.average),
    reqPerSecP99: Math.round(result.requests.p99),
    latencyMsAverage: Number(result.latency.average.toFixed(2)),
    latencyMsP99: Number(result.latency.p99.toFixed(2)),
    non2xx: result.non2xx,
    errors: result.errors,
    timeouts: result.timeouts,
  };

  console.log('\nLoad Test Summary');
  console.log(JSON.stringify(summary, null, 2));

  if (summary.errors > 0 || summary.timeouts > 0 || summary.non2xx > 0) {
    process.exitCode = 1;
  }
});
