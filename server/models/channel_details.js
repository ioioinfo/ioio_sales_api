var _ = require('lodash');
var EventProxy = require('eventproxy');

var channel_details = function(server) {
	return {
		//获得所有渠道部门
		get_channels : function(info, cb){
            var query = `select id, name, code, department_id, successful_rate,
			DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from channel_details where flag = 0
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
		account_channels : function(info, cb){
			var query = `select count(1) num
			from channel_details where flag = 0
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
		// 保存渠道
		save_channel : function(name, code, department_id, cb){
			var query = `insert into channel_details (name, code, department_id, created_at, updated_at, flag )
			values
			(?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [name, code, department_id];
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
		update_channel:function(id, name, code, department_id, cb){
			var query = `update channel_details set name =?,
				code =?, department_id = ?, updated_at = now()
				where id = ? and flag = 0
				`;
			var coloums = [name, code, department_id, id];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//查询渠道
		search_channel_byId : function(id, cb){
			var query = `select id, name, code, department_id,successful_rate,
			DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from channel_details where flag = 0 and id = ?
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
		delete_channel:function(id, cb){
			var query = `update channel_details set flag = 1, updated_at = now()
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

module.exports = channel_details;
