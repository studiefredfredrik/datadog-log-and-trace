let datadogLogAndTrace = require('datadog-log-and-trace')
let express = require('express');

let app = express();
let config = {
  port: process.env.PORT || 3220,
}

if(!process.env.DD_API_KEY) throw 'Api key for Datadog (DD_API_KEY) not found in environment variables'

datadogLogAndTrace.register({
  datadogApiKey: process.env.DD_API_KEY,
  serviceName: 'my-machine',
  environment: 'development',
  hostnameToReportAs: 'localhost',
  logLevel: 'info',
  traceHost: 'localhost',
  logToConsole: false
})

let log = datadogLogAndTrace.log
let tracer = datadogLogAndTrace.tracer


function startServer(){
  
  app.get('/', (req, res) => {
    let span = tracer.startSpan('test-span')
    span.setTag('HTTP request')
    log.info('Request to /')
    res.send('Good morning 😍')
    span.finish()
  })
  
  // Tracing span
  let span = tracer.startSpan('test-span')

  app.listen(config.port, '0.0.0.0')

  console.log('Serving on port ' + config.port)
  log.debug('Testing debug (not shown due to log level set to info above)')
  log.info('Testing info')
  log.error('Testing err')
  log.warn('Testing warn')

  // Wrapping tracer span
  for(i = 0; i < 10; i++){
    let innerSpan = tracer.startSpan('inner-test')
    innerSpan.setTag('iteration', i)
    innerSpan.finish()
  }

  setTimeout(async () => {
    // In case you want to kill the process you should await logger.waitForFinish() to make sure all logs are sent
    await log.waitForFinish()
    process.exit(0)
  }, 10000)

  // Commented out, but unhandled exceptions are also caught and logged
  // throw 'oh no, an unhandled error! Yikes! (this is still logged to datadog and console)'

  span.finish()
}

startServer()