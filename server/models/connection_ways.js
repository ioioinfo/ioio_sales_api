var _ = require('lodash');
var EventProxy = require('eventproxy');

var connection_ways = function(server) {
	return {
		//获得所有预算
		get_connection_ways : function(info, cb){
            var query = `select id, name, created_at, updated_at
            from connection_ways where flag = 0
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
		account_connection_ways : function(info, cb){
			var query = `select count(1) num
			from connection_ways where flag = 0
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
		save_connection_way : function(name, cb){
			var query = `insert into connection_ways(name, created_at, updated_at, flag)
			values
			(?, now(), now(), 0
			)
			`;
			var coloums = [name];
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
		search_by_id : function(id, cb){
			var query = `select id, name, created_at, updated_at, flag
			from connection_ways where flag = 0 and id = ?
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
		delete_connection_way:function(id, cb){
			var query = `update connection_ways set flag = 1, updated_at = now()
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

module.exports = connection_ways;
