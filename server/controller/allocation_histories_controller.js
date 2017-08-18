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
            path: '/get_allocation_histories',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num", "threads", "departments",
					function(rows, num, threads, departments){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (threads[row.thread_id]) {
                                row.thread_name = threads[row.thread_id].name;
                            }
                            if (departments[row.department_id1]) {
                                row.department_name1 = departments[row.department_id1].name;
                            }
                            if (departments[row.department_id2]) {
                                row.department_name2 = departments[row.department_id2].name;
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有渠道部门
                server.plugins['models'].allocation_histories.get_allocation_histories(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].allocation_histories.account_allocation_histories(info,function(err,rows){
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
                server.plugins['models'].channel_departments.get_departments(info2,function(err,rows){
                    if (!err) {
                        var department_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            department_map[rows[i].id] = rows[i];
                        }
						ep.emit("departments", department_map);
					}else {
						ep.emit("departments", {});
					}
				});

            }
        },
        //新增
        {
            method: 'POST',
            path: '/save_allocation_history',
            handler: function(request, reply){
                var allocation_history = request.payload.allocation_history;
                allocation_history = JSON.parse(allocation_history);
                if (!allocation_history.thread_id || !allocation_history.person_id1 || !allocation_history.person_id2 || !allocation_history.department_id1 || !allocation_history.department_id2) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var allocation ={
                //     "thread_id":1,
                //     "person_id1":1,
                //     "person_id2":2,
                //     "department_id1":1,
                //     "department_id2":1
                // }

                server.plugins['models'].allocation_histories.save_allocation_history(allocation_history, function(err,result){
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
            path: '/delete_allocation_history',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].allocation_histories.delete_allocation_history(id, function(err,result){
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
            path: '/search_allocation_history_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                var info2 = {};
                var ep =  eventproxy.create("rows","threads","departments",
                    function(rows,threads,departments){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (threads[row.thread_id]) {
                                row.thread_name = threads[row.thread_id].name;
                            }
                            if (departments[row.department_id1]) {
                                row.department_name1 = departments[row.department_id1].name;
                            }
                            if (departments[row.department_id2]) {
                                row.department_name2 = departments[row.department_id2].name;
                            }
                        }
                    return reply({"success":true,"rows":rows,"service_info":service_info});
                });
                //查询渠道部门
                server.plugins['models'].allocation_histories.search_allocation_history_byId(id,function(err,rows){
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
                server.plugins['models'].channel_departments.get_departments(info2,function(err,rows){
                    if (!err) {
                        var department_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            department_map[rows[i].id] = rows[i];
                        }
						ep.emit("departments", department_map);
					}else {
						ep.emit("departments", {});
					}
				});
            }
        },
        //更新渠道
        {
            method: 'POST',
            path: '/update_allocation_history',
            handler: function(request, reply){
                var allocation_history = request.payload.allocation_history;
                allocation_history = JSON.parse(allocation_history);
                if (!allocation_history.thread_id || !allocation_history.person_id1 || !allocation_history.person_id2 || !allocation_history.department_id1 || !allocation_history.department_id2 || !allocation_history.id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].allocation_histories.update_allocation_history(allocation_history, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },


    ]);

    next();
}

exports.register.attributes = {
    name: "allocation_histories_controller"
};
