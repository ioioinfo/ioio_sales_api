var _ = require('lodash');
var EventProxy = require('eventproxy');

var threads_follow_achievements = function(server) {
	return {
		//获得所有预算
		get_achievements : function(info, cb){
            var query = `select id, thread_id, phone, promoter_id, choose_id, school_id,
			visit_type, other_recommend, origin_source, master, temp_promoter_id, point_id,
			marketing_master, marketing_activity, recommend_student, mark, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from threads_follow_achievements where flag = 0
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
		account_achievements : function(info, cb){
			var query = `select count(1) num
			from threads_follow_achievements where flag = 0
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
		save_achievement : function(achievement, cb){
			var query = `insert into threads_follow_achievements(thread_id, phone, promoter_id, choose_id, school_id,
			visit_type, other_recommend, origin_source, master, temp_promoter_id, point_id,
			marketing_master, marketing_activity, recommend_student, mark, created_at, updated_at, flag)
			values
			(?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [achievement.thread_id, achievement.phone, achievement.promoter_id,
				achievement.choose_id, achievement.school_id,
				achievement.visit_type, achievement.other_recommend, achievement.origin_source,
				achievement.master, achievement.temp_promoter_id, achievement.point_id,
				achievement.marketing_master, achievement.marketing_activity, achievement.recommend_student,
				achievement.mark];
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
		update_achievement:function(achievement, cb){
			var query = `update threads_follow_achievements set thread_id = ?, phone = ?, promoter_id = ?,
			choose_id = ?, school_id = ?, visit_type = ?, other_recommend = ?, origin_source = ?, master = ?,
			temp_promoter_id = ?, point_id = ?, marketing_master = ?, marketing_activity = ?,
			recommend_student = ?, mark = ?, updated_at = now() where id = ? and flag = 0
			`;
			var coloums = [achievement.thread_id, achievement.phone, achievement.promoter_id,
				achievement.choose_id, achievement.school_id,
				achievement.visit_type, achievement.other_recommend, achievement.origin_source,
				achievement.master, achievement.temp_promoter_id, achievement.point_id,
				achievement.marketing_master, achievement.marketing_activity, achievement.recommend_student,
				achievement.mark,achievement.id];
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
		search_achievement_by_id : function(id, cb){
			var query = `select id, thread_id, phone, promoter_id, choose_id, school_id,
			visit_type, other_recommend, origin_source, master, temp_promoter_id, point_id,
			marketing_master, marketing_activity, recommend_student, mark, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from threads_follow_achievements where flag = 0 and id = ?
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
		delete_achievement:function(id, cb){
			var query = `update threads_follow_achievements set flag = 1, updated_at = now()
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

module.exports = threads_follow_achievements;
