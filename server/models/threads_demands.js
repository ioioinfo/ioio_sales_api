var _ = require('lodash');
var EventProxy = require('eventproxy');

var threads_demands = function(server) {
	return {
		//获得所有预算
		get_demands : function(info, cb){
            var query = `select id, thread_id, training_goal, disadvantage, learning_time, intention_city, intention_school, intention_level, visit_time, intention_product, source_type, phone,
            DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from threads_demands where flag = 0
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
		account_demands : function(info, cb){
			var query = `select count(1) num
			from threads_demands where flag = 0
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
		save_demand : function(demand, cb){
			var query = `insert into threads_demands (thread_id, training_goal, disadvantage, learning_time, intention_city, intention_school,
            intention_level, visit_time, intention_product, source_type,
            phone, created_at, updated_at, flag )
			values
			(?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, now(), now(), 0
			)
			`;
			var coloums = [demand.thread_id, demand.training_goal,
            demand.disadvantage, demand.learning_time, demand.intention_city, demand.intention_school,
            demand.intention_level, demand.visit_time, demand.intention_product, demand.source_type, demand.phone];
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
		update_demand:function(demand, cb){
			var query = `update threads_demands set thread_id = ?, training_goal = ?,
            disadvantage = ?, learning_time = ?, intention_city = ?,
            intention_school = ?, intention_level = ?, visit_time = ?,
            intention_product = ?, source_type = ?, phone = ?, updated_at = now()
			where id = ? and flag = 0
			`;
			var coloums = [demand.thread_id, demand.training_goal,
            demand.disadvantage, demand.learning_time, demand.intention_city, demand.intention_school, demand.intention_level, demand.visit_time, demand.intention_product, demand.source_type, demand.phone, demand.id];
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
		search_demand_byId : function(id, cb){
			var query = `select id, thread_id, training_goal, disadvantage, learning_time, intention_city, intention_school, intention_level, visit_time, intention_product, source_type, phone, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from threads_demands where flag = 0 and id = ?
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
		delete_demand:function(id, cb){
			var query = `update threads_demands set flag = 1, updated_at = now()
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

module.exports = threads_demands;
