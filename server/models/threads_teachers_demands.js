var _ = require('lodash');
var EventProxy = require('eventproxy');

var threads_teachers_demands = function(server) {
	return {
		//获得所有预算
		get_teachers : function(info, cb){
            var query = `select id, thread_id, nationality, pronunciation, sex,
            phone, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from threads_teachers_demands where flag = 0
            `;

			if (info.thisPage) {
                var offset = info.thisPage-1;
                if (info.everyNum) {
                    query = query + " limit " + offset*info.everyNum + "," + info.everyNum;
                }else {
                    query = query + " limit " + offset*20 + ",20";
                }
            }
            server.plugins['mysql'].query(query, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },
		account_teachers : function(info, cb){
			var query = `select count(1) num
			from threads_teachers_demands where flag = 0
			`;

			server.plugins['mysql'].query(query, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		// 保存预算
		save_teacher : function(teacher, cb){
			var query = `insert into threads_teachers_demands (thread_id, nationality, pronunciation, sex,
            phone, created_at, updated_at, flag )
			values
			(?, ?, ?, ?,
            ?, now(), now(), 0
			)
			`;
			var coloums = [teacher.thread_id, teacher.nationality, teacher.pronunciation, teacher.sex,
            teacher.phone];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//更新
		update_teacher:function(teacher, cb){
			var query = `update threads_teachers_demands set thread_id = ?, nationality = ?, pronunciation = ?, sex = ?,
            phone = ?, updated_at = now()
			where id = ? and flag = 0
			`;
			var coloums = [teacher.thread_id, teacher.nationality, teacher.pronunciation, teacher.sex,
            teacher.phone, teacher.id];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//查询预算
		search_teacher_by_id : function(id, cb){
			var query = `select id, thread_id, nationality, pronunciation, sex,
            phone, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from threads_teachers_demands where flag = 0 and id = ?
			`;
			server.plugins['mysql'].query(query,[id],function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//删除
		delete_teacher:function(id, cb){
			var query = `update threads_teachers_demands set flag = 1, updated_at = now()
				where id = ? and flag =0
				`;
			server.plugins['mysql'].query(query, [id], function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},




	};
};

module.exports = threads_teachers_demands;
