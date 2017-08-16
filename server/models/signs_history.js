var _ = require('lodash');
var EventProxy = require('eventproxy');

var signs_history = function(server) {
	return {
		//获得所有预算
		get_histories : function(info, cb){
            var query = `select id, person_id,  point_id,  sign_date, created_at, updated_at
            from signs_history where flag = 0
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
		account_histories : function(info, cb){
			var query = `select count(1) num
			from signs_history where flag = 0
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
		save_history : function(person_id, point_id, sign_date, cb){
			var query = `insert into signs_history (person_id, point_id, sign_date, created_at, updated_at, flag )
			values
			(?, ?, ?,
            now(), now(), 0
			)
			`;
			var coloums = [person_id, point_id, sign_date];
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
		update_history:function(id, person_id, point_id, sign_date, cb){
			var query = `update signs_history set person_id = ?, point_id = ?,
            sign_date = ?, updated_at = now()
			where id = ? and flag = 0
			`;
			var coloums = [person_id, point_id, sign_date, id];
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
		search_history_byId : function(id, cb){
			var query = `select id, person_id,  point_id,  sign_date,
            created_at, updated_at, flag
			from signs_history where flag = 0 and id = ?
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
		delete_history:function(id, cb){
			var query = `update signs_history set flag = 1, updated_at = now()
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

module.exports = signs_history;
