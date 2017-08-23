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
        //查询所有渠道部门
        {
            method: "GET",
            path: '/get_campuses',
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
                server.plugins['models'].campuses.get_campuses(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].campuses.account_campuses(info,function(err,rows){
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
            path: '/save_campuse',
            handler: function(request, reply){
                var campuse = request.payload.campuse;
                campuse = JSON.parse(campuse);
                if (!campuse.name || !campuse.code || !campuse.location || !campuse.province
                     || !campuse.city || !campuse.district || !campuse.photo || !campuse.responsible_person) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var campuse ={
                //     "name":"宝山校区",
                //     "code":"baoshan",
                //     "location":"呼兰路1100弄",
                //     "province":"上海",
                //     "city":"上海",
                //     "district":"宝山区",
                //     "photo":"无",
                //     "responsible_person":1
                // }

                server.plugins['models'].campuses.save_campuse(campuse, function(err,result){
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
            path: '/delete_campuse',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].campuses.delete_campuse(id, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },
        //查询渠道部门
        {
            method: "GET",
            path: '/search_campuse_byId',
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
                server.plugins['models'].campuses.search_campuse_byId(id,function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
                    }
                });

            }
        },
        //更新部门
        {
            method: 'POST',
            path: '/update_campuse',
            handler: function(request, reply){
                var campuse = request.payload.campuse;
                campuse = JSON.parse(campuse);
                if (!campuse.name || !campuse.code || !campuse.location || !campuse.province|| !campuse.id
                     || !campuse.city || !campuse.district || !campuse.photo || !campuse.responsible_person) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].campuses.update_campuse(campuse, function(err,result){
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
    name: "campuses_controller"
};
