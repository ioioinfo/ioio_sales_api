var Hapi = require('hapi');
// Create a server with a host and port
var server = new Hapi.Server();

// Setup the server with a host and port
server.connection({
    port: parseInt(process.env.PORT, 10) || 18028,
    host: '0.0.0.0'
});

// Setup the views engine and folder
server.register(require('vision'), (err) => {
    if (err) {
        throw err;
    }

    var swig = require('swig');
    swig.setDefaults({ cache: false });

    server.views({
        engines: {
            html: swig
        },
        isCached: false,
        relativeTo: __dirname,
        encoding: 'utf8',
        path: './server/views'
    });
});

server.state('cookie', {
    ttl: null,
    isSecure: false,
    isHttpOnly: true,
    encoding: 'base64json',
    clearInvalid: false, // remove invalid cookies
    strictHeader: true // don't allow violations of RFC 6265
});

// Export the server to be required elsewhere.
module.exports = server;

/*
    Load all plugins and then start the server.
    First: community/npm plugins are loaded
    Second: project specific plugins are loaded
 */
server.register([
	{
        register: require("good"),
        options: {
            ops: false,
            reporters: {
                myConsoleReporter: [{
                    module: 'good-console'
                }, 'stdout']
            }
        }
    },
    {
      register: require('./server/db/db_mysql.js')
    },{
      register: require('./server/assets/index.js')
    }, {
        register: require('./server/models/models.js')
    }, {
        register: require('./server/controller/channel_departments_controller.js')
    },{
        register: require('./server/controller/channel_details_controller.js')
    },{
        register: require('./server/controller/budgets_controller.js')
    },{
        register: require('./server/controller/booth_points_controller.js')
    },{
        register: require('./server/controller/signs_history_controller.js')
    },{
        register: require('./server/controller/call_centers_controller.js')
    },{
        register: require('./server/controller/threads_controller.js')
    },{
        register: require('./server/controller/threads_demands_controller.js')
    },{
        register: require('./server/controller/allocations_controller.js')
    },{
        register: require('./server/controller/allocation_histories_controller.js')
    },{
        register: require('./server/controller/intentions_customers_controller.js')
    },{
        register: require('./server/controller/appointment_records_controller.js')
    },{
        register: require('./server/controller/students_controller.js')
    },{
        register: require('./server/controller/teachers_controller.js')
    },{
        register: require('./server/controller/achievements_controller.js')
    },{
        register: require('./server/controller/campuses_controller.js')
    },{
        register: require('./server/controller/visit_records_controller.js')
    },{
        register: require('./server/controller/contracts_controller.js')
    },{
        register: require('./server/controller/contracts_details_controller.js')
    },{
        register: require('./server/controller/prepayments_controller.js')
    },{
        register: require('./server/controller/connection_ways_controller.js')
    },{
        register: require('./server/controller/connection_records_controller.js')
    },




], function () {
    //Start the server
    server.start(function() {
        //Log to the console the host and port info
        console.log('Server started at: ' + server.info.uri);
    });
});
