var _ = require('lodash');
var EventProxy = require('eventproxy');

var threads_students_infos = function(server) {
	return {
		//获得所有预算
		get_students : function(info, cb){
            var query = `select id, thread_id, phone, student_name, sex, birthday,
            hobby, school_type, is_foreign_teacher, training_experience, training_type,
            training_way, learning_stage, age_stage, person_character, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from threads_students_infos where flag = 0
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
		account_students : function(info, cb){
			var query = `select count(1) num
			from threads_students_infos where flag = 0
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
		save_student : function(student, cb){
			var query = `insert into threads_students_infos(thread_id, phone, student_name, sex, birthday,
              hobby, school_type, is_foreign_teacher, training_experience, training_type,
              training_way, learning_stage, age_stage, person_character, created_at, updated_at, flag)
    			values
    			(?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?,
              ?, ?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [student.thread_id, student.phone, student.student_name, student.sex, student.birthday,
              student.hobby, student.school_type, student.is_foreign_teacher, student.training_experience,
              student.training_type,student.training_way, student.learning_stage, student.age_stage,
              student.person_character];
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
		update_student:function(student, cb){
			var query = `update threads_students_infos set thread_id = ?, phone = ?, student_name = ?, sex = ?, birthday = ?,
      hobby = ?, school_type = ?, is_foreign_teacher = ?, training_experience = ?, training_type = ?,
      training_way = ?, learning_stage = ?, age_stage = ?, person_character = ?, updated_at = now() where id = ? and flag = 0
			`;
			var coloums = [student.thread_id, student.phone, student.student_name, student.sex, student.birthday,
      student.hobby, student.school_type, student.is_foreign_teacher, student.training_experience,
      student.training_type,student.training_way, student.learning_stage, student.age_stage,
      student.person_character,student.id];
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
		search_student_by_id : function(id, cb){
			var query = `select id, thread_id, phone, student_name, sex, birthday,
      hobby, school_type, is_foreign_teacher, training_experience, training_type,
      training_way, learning_stage, age_stage, person_character, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from threads_students_infos where flag = 0 and id = ?
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
		delete_student:function(id, cb){
			var query = `update threads_students_infos set flag = 1, updated_at = now()
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

module.exports = threads_students_infos;
