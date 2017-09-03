var _ = require('lodash');
var EventProxy = require('eventproxy');

var allocation_histories = function(server) {
	return {
		//获得所有预算
		get_allocation_histories : function(info, cb){
            var query = `select id, thread_id, person_id1, person_id2, department_id1,department_id2, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from allocation_histories where flag = 0
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
		account_allocation_histories : function(info, cb){
			var query = `select count(1) num
			from allocation_histories where flag = 0
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
		save_allocation_history : function(allocation_history, cb){
			var query = `insert into allocation_histories (thread_id, person_id1, person_id2, department_id1, department_id2, created_at, updated_at, flag )
			values
			(?, ?, ?,
            ?, ?, now(), now(), 0
			)
			`;
			var coloums = [allocation_history.thread_id, allocation_history.person_id1, allocation_history.person_id2, allocation_history.department_id1, allocation_history.department_id2];
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
		update_allocation_history:function(allocation_history, cb){
			var query = `update allocation_histories set thread_id = ?, person_id1 = ?,
            person_id2 = ?, department_id1 = ?, department_id2 = ?,
            updated_at = now() where id = ? and flag = 0
			`;
			var coloums = [allocation_history.thread_id, allocation_history.person_id1, allocation_history.person_id2, allocation_history.department_id1, allocation_history.department_id2, allocation_history.id];
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
		search_allocation_history_byId : function(id, cb){
			var query = `select id, thread_id, person_id1, person_id2, department_id1, department_id2, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from allocation_histories where flag = 0 and id = ?
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
		delete_allocation_history:function(id, cb){
			var query = `update allocation_histories set flag = 1, updated_at = now()
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

module.exports = allocation_histories;
