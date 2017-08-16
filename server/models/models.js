
exports.register = function(server, options, next){

    server.expose('channel_departments', require('./channel_departments.js')(server));
    server.expose('channel_details', require('./channel_details.js')(server));

  next();
}

exports.register.attributes = {
    name: 'models'
};
