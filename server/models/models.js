
exports.register = function(server, options, next){

    server.expose('channel_departments', require('./channel_departments.js')(server));
    server.expose('channel_details', require('./channel_details.js')(server));
    server.expose('budgets', require('./budgets.js')(server));
    server.expose('booth_points', require('./booth_points.js')(server));
    server.expose('signs_history', require('./signs_history.js')(server));

  next();
}

exports.register.attributes = {
    name: 'models'
};
