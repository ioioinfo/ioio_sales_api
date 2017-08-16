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
            path: '/get_channels',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num", "departments",
					function(rows, num, departments){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (departments[row.department_id]) {
                                row.department_name = departments[row.department_id].name;
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有渠道部门
                server.plugins['models'].channel_details.get_channels(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].channel_details.account_channels(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});
                server.plugins['models'].channel_departments.get_departments(info,function(err,rows){
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
            path: '/save_channel',
            handler: function(request, reply){
                var name = request.payload.name;
                var code = request.payload.code;
                var department_id = request.payload.department_id;
                if (!name || !code || !department_id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].channel_details.save_channel(name, code, department_id, function(err,result){
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
            path: '/delete_channel',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].channel_details.delete_channel(id, function(err,result){
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
            path: '/search_channel_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                var info2 = {};
                var ep =  eventproxy.create("rows","departments",
                    function(rows,departments){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (departments[row.department_id]) {
                                row.department_name = departments[row.department_id].name;
                            }
                        }
                    return reply({"success":true,"rows":rows,"service_info":service_info});
                });
                //查询渠道部门
                server.plugins['models'].channel_details.search_channel_byId(id,function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
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
            path: '/update_channel',
            handler: function(request, reply){
                var id = request.payload.id;
                var name = request.payload.name;
                var code = request.payload.code;
                var department_id = request.payload.department_id;

                if (!id || !name || !code || !department_id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].channel_details.update_channel(id, name, code, department_id, function(err,result){
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
    name: "channel_details_controller"
};
