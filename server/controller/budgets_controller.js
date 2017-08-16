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
            path: '/get_budgets',
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
                server.plugins['models'].budgets.get_budgets(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].budgets.account_budgets(info,function(err,rows){
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
            path: '/save_budget',
            handler: function(request, reply){
                var budget = request.payload.budget;
                budget = JSON.parse(budget);
                if (!budget.name || !budget.channel_id || !budget.employees_cost || !budget.locations_cost || !budget.materials_cost || !budget.medias_cost) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var budget ={
                //     "name":"手机预算",
                //     "channel_id":1,
                //     "employees_cost":100,
                //     "locations_cost":200,
                //     "materials_cost":300,
                //     "medias_cost":400
                // }

                server.plugins['models'].budgets.save_budget(budget, function(err,result){
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
            path: '/delete_budget',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].budgets.delete_budget(id, function(err,result){
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
            path: '/search_budget_byId',
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
                server.plugins['models'].budgets.search_budget_byId(id,function(err,rows){
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
            path: '/update_budget',
            handler: function(request, reply){
                var budget = request.payload.budget;
                budget = JSON.parse(budget);
                if (!budget.name || !budget.channel_id || !budget.employees_cost || !budget.locations_cost || !budget.materials_cost || !budget.medias_cost
                || !budget.id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].budgets.update_budget(budget, function(err,result){
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
    name: "budgets_controller"
};
