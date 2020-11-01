let winston = require('winston')
let datadogWinston = require('datadog-winston')

module.exports = {
  register: function(config){
    // Set defaults, throw if required params are missing
    if(!config.datadogApiKey) throw "datadog-log-and-trace: Datadog api key missing"
    if(!config.serviceName) throw "datadog-log-and-trace: Service name missing"
    if(!config.environment) throw "datadog-log-and-trace: Environment missing"
    if(!config.hostnameToReportAs) throw "datadog-log-and-trace: Hostname to report as is missing"
    if(!config.intakeRegion) config.intakeRegion = 'eu'
    if(!config.logToConsole) config.logToConsole = false
    if(!config.logLevel) config.logLevel = 'info'
    if(!config.tags) config.tags = []
    if(!config.traceHost) throw "datadog-log-and-trace: Trace host is missing"
    if(!config.tracePort) config.tracePort = 8126

    // Add tag for environment unless tag exists
    if(!config.tags.some(tag => tag['env'])) config.tags.push({'env': config.environment})

    // Create CSV string of tags for datadog-winston
    let tagsCsv = JSON.stringify(config.tags).replaceAll('{','').replaceAll('}','').replaceAll('[','').replaceAll(']','').replaceAll('"','')

    let datadogWinstonInstance = new datadogWinston({
      apiKey: config.datadogApiKey,
      hostname: config.hostnameToReportAs,
      service: config.serviceName,
      ddsource: 'nodejs',
      ddtags: tagsCsv,
      intakeRegion: config.intakeRegion
    })

    let transports = []
    if(config.logToConsole) transports.push(new winston.transports.Console())
    transports.push(datadogWinstonInstance)

    module.exports.logger = winston.createLogger({
      transports: transports,
      level: config.logLevel,
      exceptionHandlers: transports // Exception handlers make sure we log even when an unhandled exception occur
    })

    module.exports.tracer = require('dd-trace').init({
      env: config.environment,
      startupLogs: false,                 // dd-trace logs some junk info by default
      logInjection: false,
      service: config.serviceName,
      port: config.tracePort,             // Port of the trace agent to send traces to
      hostname: config.traceHost,         // Host of the trace agent to send traces to
      tags: config.tags,
      reportHostname: true
    })
  }
}