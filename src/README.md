# datadog-log-and-trace

## Description  
Nodejs library for easy logging to Datadog http intake and tracing to a datadog agent  
Uses `dd-trace` and `datadog-winston` under the hood  

## Usage example  
```javascript
// Load the npm package
let datadogLogAndTrace = require('datadog-log-and-trace')

// Initialize the module with your configuration parameters
datadogLogAndTrace.register({
  datadogApiKey: process.env.DD_API_KEY,
  serviceName: 'my-machine',
  environment: 'development',
  hostnameToReportAs: 'localhost',
  logLevel: 'info',
  traceHost: 'localhost',
  logToConsole: false
})

// The logger and tracer are now available for use
let log = datadogLogAndTrace.logger
let tracer = datadogLogAndTrace.tracer

// Use the logger as you would with datadog-winston
log.info('An info message')

// Use the tracer as you would with dd-trace
let span = tracer.startSpan('my-span')
    * some code goes here *
span.finish()
```
See also example app in `/example`  

