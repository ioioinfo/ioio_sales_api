var _ = require('lodash');
var EventProxy = require('eventproxy');

var call_centers = function(server) {
	return {
		//获得所有预算
		get_call_centers : function(info, cb){
            var query = `select id, school_id, telephone, responsible_person,
            DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from call_centers where flag = 0
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
		account_call_centers : function(info, cb){
			var query = `select count(1) num
			from call_centers where flag = 0
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
		save_center : function(school_id, telephone, responsible_person, cb){
			var query = `insert into call_centers (school_id, telephone, responsible_person, created_at, updated_at, flag )
			values
			(?, ?, ?,
            now(), now(), 0
			)
			`;
			var coloums = [school_id, telephone, responsible_person];
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
		update_center:function(id, school_id, telephone, responsible_person, cb){
			var query = `update call_centers set school_id = ?, telephone = ?, responsible_person = ?, updated_at = now()
			where id = ? and flag = 0
			`;
			var coloums = [school_id, telephone, responsible_person, id];
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
		search_center_byId : function(id, cb){
			var query = `select id, school_id, telephone, responsible_person,
            DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from call_centers where flag = 0 and id = ?
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
		delete_center:function(id, cb){
			var query = `update call_centers set flag = 1, updated_at = now()
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

module.exports = call_centers;
