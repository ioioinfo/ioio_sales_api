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
            path: '/get_students',
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
                server.plugins['models'].threads_students_infos.get_students(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].threads_students_infos.account_students(info,function(err,rows){
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
            path: '/save_student',
            handler: function(request, reply){
                var student = request.payload.student;
                student = JSON.parse(student);
                if (!student.thread_id || !student.phone || !student.student_name || !student.sex || !student.birthday
                     || !student.hobby || !student.school_type || !student.is_foreign_teacher ||
                     !student.training_experience || !student.training_type || !student.training_way ||
                     !student.learning_stage || !student.age_stage || !student.person_character) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var student ={
                //     "thread_id":1,
                //     "phone":"1822103772",
                //     "student_name":"李泉",
                //     "sex":"女",
                //     "birthday":"2017-08-21",
                //     "hobby":"football",
                //     "school_type":"private",
                //     "is_foreign_teacher":"是",
                //     "training_experience":"新东方",
                //     "training_type":"外教1对1",
                //     "training_way":"听英文歌",
                //     "learning_stage":"大班",
                //     "age_stage":"6-9岁",
                //     "person_character":"open"
                // }

                server.plugins['models'].threads_students_infos.save_student(student, function(err,result){
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
            path: '/delete_student',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].threads_students_infos.delete_student(id, function(err,result){
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
            path: '/search_student_by_id',
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
                server.plugins['models'].threads_students_infos.search_student_by_id(id,function(err,rows){
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
            path: '/update_student',
            handler: function(request, reply){
                var student = request.payload.student;
                student = JSON.parse(student);
                if (!student.thread_id || !student.phone || !student.student_name || !student.sex || !student.birthday
                     || !student.hobby || !student.school_type || !student.is_foreign_teacher ||
                     !student.training_experience || !student.training_type || !student.training_way ||
                     !student.learning_stage || !student.age_stage || !student.person_character|| !student.id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].threads_students_infos.update_student(student, function(err,result){
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
    name: "students_controller"
};
