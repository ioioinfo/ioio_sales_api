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
var get_product = function(product_id,cb){
	var url = "http://211.149.248.241:18002/get_product?product_id=";
	url = url + product_id;
	do_get_method(url,cb);
};
exports.register = function(server, options, next) {

    server.route([
        //查询所有渠道
        {
            method: "GET",
            path: '/get_details',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num",
					function(rows, num){

					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有渠道部门
                server.plugins['models'].contracts_details.get_details(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].contracts_details.account_details(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});

            }
        },
        //新增
        {
            method: 'POST',
            path: '/save_detail',
            handler: function(request, reply){
                var detail = request.payload.detail;
                detail = JSON.parse(detail);
                if (!detail.contract_id || !detail.product_id || !detail.quantity) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var detail ={
                //     "contract_id":1,
                //     "product_id":1,
                //     "quantity":10
                // }
                get_product(detail.product_id,function(err,rows){
					if (!err) {
						if (rows.rows.length>0) {
                            var product = rows.rows[0];
                            detail.total_price = product.product_sale_price*detail.quantity;

                            server.plugins['models'].contracts_details.save_detail(detail, function(err,result){
                                if (result.affectedRows>0) {
                                    return reply({"success":true,"service_info":service_info});
                                }else {
                                    return reply({"success":false,"message":result.message,"service_info":service_info});
                                }
                            });

						}else {
                            return reply({"success":false,"message":"can't find product by product_id","service_info":service_info});
						}
					}else {
	                   return reply({"success":false,"message":rows.rows.message,"service_info":service_info});
					}
				});
            }
        },
        //删除
        {
            method: 'POST',
            path: '/delete_detail',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].contracts_details.delete_detail(id, function(err,result){
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
            path: '/search_detail_by_id',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                var info2 = {};
                var ep =  eventproxy.create("rows",
                    function(rows){

                    return reply({"success":true,"rows":rows,"service_info":service_info});
                });
                //查询渠道部门
                server.plugins['models'].contracts_details.search_detail_by_id(id,function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
                    }
                });


            }
        },
        //更新渠道
        {
            method: 'POST',
            path: '/update_detail',
            handler: function(request, reply){
                var detail = request.payload.detail;
                detail = JSON.parse(detail);
                if (!detail.contract_id || !detail.product_id || !detail.quantity || !detail.id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                get_product(detail.product_id,function(err,rows){
					if (!err) {
						if (rows.rows.length>0) {
                            var product = rows.rows[0];
                            detail.total_price = product.product_sale_price*detail.quantity;

                            server.plugins['models'].contracts_details.update_detail(detail, function(err,result){
                                if (result.affectedRows>0) {
                                    return reply({"success":true,"service_info":service_info});
                                }else {
                                    return reply({"success":false,"message":result.message,"service_info":service_info});
                                }
                            });

						}else {
                            return reply({"success":false,"message":"can't find product by product_id","service_info":service_info});
						}
					}else {
	                   return reply({"success":false,"message":rows.rows.message,"service_info":service_info});
					}
				});

            }
        },


    ]);

    next();
}

exports.register.attributes = {
    name: "contracts_details_controller"
};
