var _ = require('lodash');
var EventProxy = require('eventproxy');

var channel_departments = function(server) {
	return {
		//获得所有渠道部门
		get_departments : function(info, cb){
            var query = `select id, name, code, source_level, created_at, updated_at
            from channel_departments where flag = 0
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
		account_departments : function(info, cb){
			var query = `select count(1) num
			from channel_departments where flag = 0
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
		// 保存渠道部门
		save_department : function(name, code, source_level, cb){
			var query = `insert into channel_departments (name, code, source_level, created_at, updated_at, flag )
			values
			(?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [name, code, source_level];
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
		update_department:function(id, name, code, source_level, cb){
			var query = `update channel_departments set name =?,
				code =?, source_level = ?, updated_at = now()
				where id = ? and flag = 0
				`;
			var coloums = [name, code, source_level, id];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//查询渠道部门
		search_department_byId : function(id, cb){
			var query = `select id, name, code, source_level,
			created_at, updated_at, flag
			from channel_departments where flag = 0 and id = ?
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
		//删除课程
		delete_department:function(id, cb){
			var query = `update channel_departments set flag = 1, updated_at = now()
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

module.exports = channel_departments;
