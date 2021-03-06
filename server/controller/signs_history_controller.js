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
            path: '/get_histories',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num", "points",
					function(rows, num, points){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (points[row.point_id]) {
                                row.point_name = points[row.point_id].name;
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有渠道部门
                server.plugins['models'].signs_history.get_histories(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].signs_history.account_histories(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});
                server.plugins['models'].booth_points.get_points(info2,function(err,rows){
                    if (!err) {
						var point_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            point_map[rows[i].id] = rows[i];
                        }
                        ep.emit("points", point_map);
					}else {
						ep.emit("points", {});
					}
				});

            }
        },
        //新增
        {
            method: 'POST',
            path: '/save_history',
            handler: function(request, reply){
                var person_id = request.payload.person_id;
                var point_id = request.payload.point_id;
                var sign_date = request.payload.sign_date;

                if (!person_id || !point_id || !sign_date) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].signs_history.save_history(person_id,  point_id,  sign_date, function(err,result){
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
            path: '/delete_history',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].signs_history.delete_history(id, function(err,result){
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
            path: '/search_history_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                var info2 = {};
                var ep =  eventproxy.create("rows","points",
                    function(rows,points){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (points[row.point_id]) {
                                row.point_name = points[row.point_id].name;
                            }
                        }
                    return reply({"success":true,"rows":rows,"service_info":service_info});
                });
                //查询渠道部门
                server.plugins['models'].signs_history.search_history_byId(id,function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
                    }
                });
                server.plugins['models'].booth_points.get_points(info2,function(err,rows){
                    if (!err) {
						var point_map = {};
                        for (var i = 0; i < rows.length; i++) {
                            point_map[rows[i].id] = rows[i];
                        }
                        ep.emit("points", point_map);
					}else {
						ep.emit("points", {});
					}
				});

            }
        },
        //更新渠道
        {
            method: 'POST',
            path: '/update_history',
            handler: function(request, reply){
                var person_id = request.payload.person_id;
                var point_id = request.payload.point_id;
                var sign_date = request.payload.sign_date;
                var id = request.payload.id;

                if (!person_id || !point_id || !sign_date || !id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].signs_history.update_history(id, person_id, point_id, sign_date, function(err,result){
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
    name: "signs_history_controller"
};
