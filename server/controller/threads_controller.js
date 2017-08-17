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
            path: '/get_threads',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num", "channels",
					function(rows, num, channels){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (channels[row.channel_id]) {
                                row.channel_name = channels[row.channel_id].name;
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有渠道部门
                server.plugins['models'].threads.get_threads(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].threads.account_threads(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});
                server.plugins['models'].channel_details.get_channels(info2,function(err,rows){
                    if (!err) {
                        var channel_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            channel_map[rows[i].id] = rows[i];
                        }
						ep.emit("channels", channel_map);
					}else {
						ep.emit("channels", {});
					}
				});

            }
        },
        //新增
        {
            method: 'POST',
            path: '/save_thread',
            handler: function(request, reply){
                var thread = request.payload.thread;
                thread = JSON.parse(thread);
                if (!thread.name || !thread.sex || !thread.phone || !thread.address || !thread.channel_id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var thread ={
                //     "name":"手机预算",
                //     "channel_id":1,
                //     "sex":"男",
                //     "phone":"18221036882",
                //     "address":"1001棟101"
                // }

                server.plugins['models'].threads.save_thread(thread, function(err,result){
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
            path: '/delete_thread',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].threads.delete_thread(id, function(err,result){
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
            path: '/search_thread_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                var info2 = {};
                var ep =  eventproxy.create("rows","channels",
                    function(rows,channels){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (channels[row.channel_id]) {
                                row.channel_name = channels[row.channel_id].name;
                            }
                        }
                    return reply({"success":true,"rows":rows,"service_info":service_info});
                });
                //查询渠道部门
                server.plugins['models'].threads.search_thread_byId(id,function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
                    }
                });
                server.plugins['models'].channel_details.get_channels(info2,function(err,rows){
                    if (!err) {
                        var channel_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            channel_map[rows[i].id] = rows[i];
                        }
						ep.emit("channels", channel_map);
					}else {
						ep.emit("channels", {});
					}
				});

            }
        },
        //更新渠道
        {
            method: 'POST',
            path: '/update_thread',
            handler: function(request, reply){
                var thread = request.payload.thread;
                thread = JSON.parse(thread);
                if (!thread.name || !thread.sex || !thread.phone || !thread.address || !thread.channel_id || !thread.id || !thread.state) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].threads.update_thread(thread, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },
        //更新状态
        {
            method: 'POST',
            path: '/update_thread_state',
            handler: function(request, reply){
                var id = request.payload.id;
                var state = request.payload.state;

                if (!id || !state) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].threads.update_thread_state(id,state, function(err,result){
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
    name: "threads_controller"
};
