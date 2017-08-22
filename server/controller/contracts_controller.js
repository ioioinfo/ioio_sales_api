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
            path: '/get_contracts',
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
                server.plugins['models'].contracts.get_contracts(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].contracts.account_contracts(info,function(err,rows){
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
            path: '/save_contract',
            handler: function(request, reply){
                var contract = request.payload.contract;
                contract = JSON.parse(contract);
                if (!contract.customer_id || !contract.amount || !contract.quantity || !contract.discount
                 || !contract.actual_price || !contract.person_id || !contract.school_id || !contract.state) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var contract ={
                //     "customer_id":1,
                //     "amount":2000.10,
                //     "quantity":100,
                //     "discount":1,
                //     "actual_price":2000.10,
                //     "person_id":1,
                //     "school_id":1,
                //     "state":"未付款"
                // }

                server.plugins['models'].contracts.save_contract(contract, function(err,result){
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
            path: '/delete_contract',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].contracts.delete_contract(id, function(err,result){
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
            path: '/search_contract_by_id',
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
                server.plugins['models'].contracts.search_contract_by_id(id,function(err,rows){
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
            path: '/update_contract',
            handler: function(request, reply){
                var contract = request.payload.contract;
                contract = JSON.parse(contract);
                if (!contract.customer_id || !contract.amount || !contract.quantity || !contract.discount|| !contract.id
                 || !contract.actual_price || !contract.person_id || !contract.school_id || !contract.state) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].contracts.update_contract(contract, function(err,result){
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
    name: "contracts_controller"
};
