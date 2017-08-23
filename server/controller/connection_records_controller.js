// Base routes for item..
const uu_request = require('../utils/uu_request');
const uuidV1 = require('uuid/v1');
var eventproxy = require('eventproxy');
var service_info = "sales service";
var async = require('async');

var do_get_method = function(url,cb){
	uu_request.get(url, function(err, response, body){
		if (!err && response.statusCode === 200) {
			var content = JSON.parse(body);
			do_result(false, content, cb);
		} else {
			cb(true, null);
		}
	});
};
//所有post调用接口方法
var do_post_method = function(url,data,cb){
	uu_request.request(url, data, function(err, response, body) {
		if (!err && response.statusCode === 200) {
			do_result(false, body, cb);
		} else {
			cb(true,null);
		}
	});
};
//处理结果
var do_result = function(err,result,cb){
	if (!err) {
		if (result.success) {
			cb(false,result);
		}else {
			cb(true,result);
		}
	}else {
		cb(true,null);
	}
};
exports.register = function(server, options, next) {

    server.route([
        //查询所有渠道
        {
            method: "GET",
            path: '/get_threads_customers',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num", "threads","ways",
					function(rows, num, threads,ways){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (threads[row.thread_id]) {
                                row.thread_name = threads[row.thread_id].name;
                            }
                            if (ways[row.way]) {
                                row.way_name = ways[row.way].name;
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有渠道部门
                server.plugins['models'].connection_records.get_threads_customers(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].connection_records.account_threads_customers(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});
                server.plugins['models'].threads.get_threads(info2,function(err,rows){
                    if (!err) {
                        var thread_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            thread_map[rows[i].id] = rows[i];
                        }
						ep.emit("threads", thread_map);
					}else {
						ep.emit("threads", {});
					}
				});
                server.plugins['models'].connection_ways.get_connection_ways(info2,function(err,rows){
                    if (!err) {
                        var way_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            way_map[rows[i].id] = rows[i];
                        }
						ep.emit("ways", way_map);
					}else {
						ep.emit("ways", {});
					}
                });
            }
        },
        {
            method: "GET",
            path: '/get_intentions_customers',
            handler: function(request, reply) {
                var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
                var info2 = {};
                var ep =  eventproxy.create("rows", "num", "customers", "ways",
                    function(rows, num, customers,ways){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (customers[row.customer_id]) {
                                row.customer_name = customers[row.customer_id].name;
                            }
                            if (ways[row.way]) {
                                row.way_name = ways[row.way].name;
                            }
                        }
                    return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
                });
                //查询所有渠道部门
                server.plugins['models'].connection_records.get_intentions_customers(info,function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
                    }
                });
                server.plugins['models'].connection_records.account_intentions_customers(info,function(err,rows){
                    if (!err) {
                        ep.emit("num", rows[0].num);
                    }else {
                        ep.emit("num", 0);
                    }
                });
                server.plugins['models'].intentions_customers.get_customers(info2,function(err,rows){
                    if (!err) {
                        var customer_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            customer_map[rows[i].id] = rows[i];
                        }
						ep.emit("customers", customer_map);
					}else {
						ep.emit("customers", {});
					}
				});
                server.plugins['models'].connection_ways.get_connection_ways(info2,function(err,rows){
                    if (!err) {
                        var way_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            way_map[rows[i].id] = rows[i];
                        }
                        ep.emit("ways", way_map);
                    }else {
                        ep.emit("ways", {});
                    }
                });
            }
        },

        //新增
        {
            method: 'POST',
            path: '/save_threads_by_phone',
            handler: function(request, reply){
                var connection = request.payload.connection;
                connection = JSON.parse(connection);
                if (!connection.thread_id || !connection.phone || !connection.state || !connection.way
                 || !connection.call_in_time || !connection.call_time) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var connection ={
                //     "thread_id":1,
                //     "phone":"1822103772",
                //     "state":"初次联系",
                //     "way":1,
                //     "call_in_time":"2017-08-23 15:27:00",
                //     "call_time":"05:00:00"
                // }

                server.plugins['models'].connection_records.save_threads_by_phone(connection, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });

            }
        },
        {
            method: 'POST',
            path: '/save_intention_by_phone',
            handler: function(request, reply){
                var connection = request.payload.connection;
                connection = JSON.parse(connection);
                if (!connection.customer_id || !connection.phone || !connection.state || !connection.way
                 || !connection.call_in_time || !connection.call_time) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var connection ={
                //     "customer_id":1,
                //     "phone":"1822103772",
                //     "state":"初次联系",
                //     "way":1,
                //     "call_in_time":"2017-08-23 15:27:00",
                //     "call_time":"05:00:00"
                // }

                server.plugins['models'].connection_records.save_intention_by_phone(connection, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });

            }
        },
        {
            method: 'POST',
            path: '/save_threads_by_email',
            handler: function(request, reply){
                var connection = request.payload.connection;
                connection = JSON.parse(connection);
                if (!connection.thread_id || !connection.email || !connection.state || !connection.way
                 || !connection.message) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var connection ={
                //     "thread_id":1,
                //     "email":"1822103772",
                //     "state":"二次联系",
                //     "way":2,
                //     "message":"希望能见一次面"
                // }

                server.plugins['models'].connection_records.save_threads_by_email(connection, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });

            }
        },
        {
            method: 'POST',
            path: '/save_intention_by_email',
            handler: function(request, reply){
                var connection = request.payload.connection;
                connection = JSON.parse(connection);
                if (!connection.customer_id || !connection.email || !connection.state || !connection.way
                 || !connection.message) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var connection ={
                //     "customer_id":1,
                //     "email":"1822103772",
                //     "state":"二次联系",
                //     "way":2,
                //     "message":"希望能见一次面"
                // }

                server.plugins['models'].connection_records.save_intention_by_email(connection, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });

            }
        },
        {
            method: 'POST',
            path: '/save_threads_by_message',
            handler: function(request, reply){
                var connection = request.payload.connection;
                connection = JSON.parse(connection);
                if (!connection.thread_id || !connection.phone || !connection.state || !connection.way
                 || !connection.message) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var connection ={
                //     "thread_id":1,
                //     "email":"1822103772",
                //     "state":"二次联系",
                //     "way":2,
                //     "message":"希望能见一次面"
                // }

                server.plugins['models'].connection_records.save_threads_by_message(connection, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });

            }
        },
        {
            method: 'POST',
            path: '/save_intention_by_message',
            handler: function(request, reply){
                var connection = request.payload.connection;
                connection = JSON.parse(connection);
                if (!connection.customer_id || !connection.phone || !connection.state || !connection.way
                 || !connection.message) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var connection ={
                //     "customer_id":1,
                //     "phone":"1822103772",
                //     "state":"二次联系",
                //     "way":3,
                //     "message":"希望能见一次面"
                // }

                server.plugins['models'].connection_records.save_intention_by_message(connection, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });

            }
        },


        //删除
        {
            method: 'POST',
            path: '/delete_connection_record',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].connection_records.delete_connection_record(id, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },
        //查询渠道
        {
            method: "GET",
            path: '/search_threads_record',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                var info2 = {};
                var ep =  eventproxy.create("rows","threads","ways",
                    function(rows,threads,ways){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (threads[row.thread_id]) {
                                row.thread_name = threads[row.thread_id].name;
                            }
                            if (ways[row.way]) {
                                row.way_name = ways[row.way].name;
                            }
                        }
                    return reply({"success":true,"rows":rows,"service_info":service_info});
                });
                //查询渠道部门
                server.plugins['models'].connection_records.search_threads_record(id,function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
                    }
                });
                server.plugins['models'].threads.get_threads(info2,function(err,rows){
                    if (!err) {
                        var thread_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            thread_map[rows[i].id] = rows[i];
                        }
						ep.emit("threads", thread_map);
					}else {
						ep.emit("threads", {});
					}
				});
                server.plugins['models'].connection_ways.get_connection_ways(info2,function(err,rows){
                    if (!err) {
                        var way_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            way_map[rows[i].id] = rows[i];
                        }
                        ep.emit("ways", way_map);
                    }else {
                        ep.emit("ways", {});
                    }
                });
            }
        },
        //查询渠道
        {
            method: "GET",
            path: '/search_intentions_record',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                var info2 = {};
                var ep =  eventproxy.create("rows","customers","ways",
                    function(rows,customers,ways){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            for (var i = 0; i < rows.length; i++) {
                                var row = rows[i];
                                if (customers[row.customer_id]) {
                                    row.customer_name = customers[row.customer_id].name;
                                }
                                if (ways[row.way]) {
                                    row.way_name = ways[row.way].name;
                                }
                            }
                        }
                    return reply({"success":true,"rows":rows,"service_info":service_info});
                });
                //查询渠道部门
                server.plugins['models'].connection_records.search_intentions_record(id,function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
                    }
                });
                server.plugins['models'].intentions_customers.get_customers(info2,function(err,rows){
                    if (!err) {
                        var customer_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            customer_map[rows[i].id] = rows[i];
                        }
						ep.emit("customers", customer_map);
					}else {
						ep.emit("customers", {});
					}
				});
                server.plugins['models'].connection_ways.get_connection_ways(info2,function(err,rows){
                    if (!err) {
                        var way_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            way_map[rows[i].id] = rows[i];
                        }
                        ep.emit("ways", way_map);
                    }else {
                        ep.emit("ways", {});
                    }
                });

            }
        },


    ]);

    next();
}

exports.register.attributes = {
    name: "connection_records_controller"
};
