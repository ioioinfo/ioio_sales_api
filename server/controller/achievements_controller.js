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
            path: '/get_achievements',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num", "threads",
					function(rows, num, threads){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (threads[row.thread_id]) {
                                row.thread_name = threads[row.thread_id].name;
                            }
                        }
					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有渠道部门
                server.plugins['models'].threads_follow_achievements.get_achievements(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].threads_follow_achievements.account_achievements(info,function(err,rows){
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

            }
        },
        //新增
        {
            method: 'POST',
            path: '/save_achievement',
            handler: function(request, reply){
                var achievement = request.payload.achievement;
                achievement = JSON.parse(achievement);
                if (!achievement.thread_id || !achievement.phone || !achievement.promoter_id ||
                    !achievement.choose_id || !achievement.school_id || !achievement.visit_type
                     || !achievement.other_recommend || !achievement.origin_source || !achievement.master
                     || !achievement.temp_promoter_id || !achievement.point_id || !achievement.marketing_master
                     || !achievement.marketing_activity || !achievement.recommend_student || !achievement.mark) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var achievement ={
                //     "thread_id":1,
                //     "phone":"1822103772",
                //     "promoter_id":"1",
                //     "choose_id":"1",
                //     "school_id":"1",
                //     "visit_type":"不确认",
                //     "other_recommend":"无",
                //     "origin_source":"手机短信",
                //     "master":"1",
                //     "temp_promoter_id":"1",
                //     "point_id":"1",
                //     "marketing_master":"1",
                //     "marketing_activity":"无",
                //     "recommend_student":"无",
                //     "mark":"无"
                // }

                server.plugins['models'].threads_follow_achievements.save_achievement(achievement, function(err,result){
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
            path: '/delete_achievement',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].threads_follow_achievements.delete_achievement(id, function(err,result){
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
            path: '/search_achievement_by_id',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                var info2 = {};
                var ep =  eventproxy.create("rows","threads",
                    function(rows,threads){
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            if (threads[row.thread_id]) {
                                row.thread_name = threads[row.thread_id].name;
                            }
                        }
                    return reply({"success":true,"rows":rows,"service_info":service_info});
                });
                //查询渠道部门
                server.plugins['models'].threads_follow_achievements.search_achievement_by_id(id,function(err,rows){
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

            }
        },
        //更新渠道
        {
            method: 'POST',
            path: '/update_achievement',
            handler: function(request, reply){
                var achievement = request.payload.achievement;
                achievement = JSON.parse(achievement);
                if (!achievement.thread_id || !achievement.phone || !achievement.promoter_id ||
                    !achievement.choose_id || !achievement.school_id || !achievement.visit_type
                     || !achievement.other_recommend || !achievement.origin_source || !achievement.master
                     || !achievement.temp_promoter_id || !achievement.point_id || !achievement.marketing_master
                     || !achievement.marketing_activity || !achievement.recommend_student || !achievement.mark
                     || !achievement.id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].threads_follow_achievements.update_achievement(achievement, function(err,result){
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
    name: "achievements_controller"
};
