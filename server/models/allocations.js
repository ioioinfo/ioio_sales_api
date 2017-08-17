var _ = require('lodash');
var EventProxy = require('eventproxy');

var allocations = function(server) {
	return {
		//获得所有预算
		get_allocations : function(info, cb){
            var query = `select id, thread_id, person_id1, person_id2, department_id1,department_id2, created_at, updated_at
            from allocations where flag = 0
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
		account_allocations : function(info, cb){
			var query = `select count(1) num
			from allocations where flag = 0
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
		save_allocation : function(allocation, cb){
			var query = `insert into allocations (thread_id, person_id1, person_id2, department_id1, department_id2, created_at, updated_at, flag )
			values
			(?, ?, ?,
            ?, ?, now(), now(), 0
			)
			`;
			var coloums = [allocation.thread_id, allocation.person_id1, allocation.person_id2, allocation.department_id1, allocation.department_id2];
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
		update_allocation:function(allocation, cb){
			var query = `update allocations set thread_id = ?, person_id1 = ?,
            person_id2 = ?, department_id1 = ?, department_id2 = ?,
            updated_at = now() where id = ? and flag = 0
			`;
			var coloums = [allocation.thread_id, allocation.person_id1, allocation.person_id2, allocation.department_id1, allocation.department_id2, allocation.id];
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
		search_allocation_byId : function(id, cb){
			var query = `select id, thread_id, person_id1, person_id2, department_id1, department_id2, created_at, updated_at, flag
			from allocations where flag = 0 and id = ?
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
		delete_allocation:function(id, cb){
			var query = `update allocations set flag = 1, updated_at = now()
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

module.exports = allocations;
