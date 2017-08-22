
exports.register = function(server, options, next){

    server.expose('channel_departments', require('./channel_departments.js')(server));
    server.expose('channel_details', require('./channel_details.js')(server));
    server.expose('budgets', require('./budgets.js')(server));
    server.expose('booth_points', require('./booth_points.js')(server));
    server.expose('signs_history', require('./signs_history.js')(server));
    server.expose('call_centers', require('./call_centers.js')(server));
    server.expose('threads', require('./threads.js')(server));
    server.expose('threads_demands', require('./threads_demands.js')(server));
    server.expose('allocations', require('./allocations.js')(server));
    server.expose('allocation_histories', require('./allocation_histories.js')(server));
    server.expose('intentions_customers', require('./intentions_customers.js')(server));
    server.expose('appointment_records', require('./appointment_records.js')(server));
    //server.expose('connection_records', require('./connection_records.js')(server));
    server.expose('threads_students_infos', require('./threads_students_infos.js')(server));
    server.expose('threads_teachers_demands', require('./threads_teachers_demands.js')(server));
    server.expose('threads_follow_achievements', require('./threads_follow_achievements.js')(server));
    server.expose('campuses', require('./campuses.js')(server));
    server.expose('visit_records', require('./visit_records.js')(server));
    server.expose('contracts', require('./contracts.js')(server));
    server.expose('contracts_details', require('./contracts_details.js')(server));


  next();
}

exports.register.attributes = {
    name: 'models'
};
