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
            path: '/get_visit_records',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num", "customers",
					function(rows, num, customers){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (customers[row.customer_id]) {
                                row.customer_name = customers[row.customer_id].name;
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有渠道部门
                server.plugins['models'].visit_records.get_visit_records(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].visit_records.account_visit_records(info,function(err,rows){
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

            }
        },
        //新增
        {
            method: 'POST',
            path: '/save_visit',
            handler: function(request, reply){
                var visit = request.payload.visit;
                visit = JSON.parse(visit);
                if (!visit.customer_id || !visit.name || !visit.phone || !visit.sex || !visit.relationship
                 || !visit.visit_date || !visit.reception_person || !visit.school) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var visit ={
                //     "customer_id":1,
                //     "name":"李泉",
                //     "phone":"18221036882",
                //     "sex":"女",
                //     "relationship":"姐姐",
                //     "visit_date":"2017-08-21",
                //     "reception_person":1,
                //     "school":1
                // }

                server.plugins['models'].visit_records.save_visit(visit, function(err,result){
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
            path: '/delete_visit',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].visit_records.delete_visit(id, function(err,result){
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
            path: '/search_visit_by_id',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                var info2 = {};
                var ep =  eventproxy.create("rows","customers",
                    function(rows,customers){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (customers[row.customer_id]) {
                                row.customer_name = customers[row.customer_id].name;
                            }
                        }
                    return reply({"success":true,"rows":rows,"service_info":service_info});
                });
                //查询渠道部门
                server.plugins['models'].visit_records.search_visit_by_id(id,function(err,rows){
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

            }
        },
        //更新渠道
        {
            method: 'POST',
            path: '/update_visit',
            handler: function(request, reply){
                var visit = request.payload.visit;
                visit = JSON.parse(visit);
                if (!visit.customer_id || !visit.name || !visit.phone || !visit.sex || !visit.relationship
                 || !visit.visit_date || !visit.reception_person || !visit.school || !visit.id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].visit_records.update_visit(visit, function(err,result){
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
    name: "visit_records_controller"
};
