var _ = require('lodash');
var EventProxy = require('eventproxy');


var cpq_details = function(server) {
	return {
		//获得所有预算
		get_cpq_details : function(info, cb){
            var query = `select id, cpq_id, product_id, quantity, total_price, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from cpq_details where flag = 0
            `;
            console.log("query:"+query);
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
		account_cpq_details : function(info, cb){
			var query = `select count(1) num
			from cpq_details where flag = 0
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
		save_cpq_detail : function(detail, cb){
			var query = `insert into cpq_details(cpq_id, product_id, quantity, total_price, created_at, updated_at, flag)
			values
			(?, ?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [detail.cpq_id, detail.product_id, detail.quantity, detail.total_price];
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
		update_cpq_detail:function(detail, cb){
			var query = `update cpq_details set cpq_id = ?, product_id = ?, quantity = ?, total_price = ?, updated_at = now() where id = ? and flag = 0
			`;
			var coloums = [detail.cpq_id, detail.product_id, detail.quantity, detail.total_price, detail.id];
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
		search_cpq_detail_by_id : function(id, cb){
			var query = `select id, cpq_id, product_id, quantity, total_price, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from cpq_details where flag = 0 and id = ?
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
		delete_cpq_detail:function(id, cb){
			var query = `update cpq_details set flag = 1, updated_at = now()
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

module.exports = cpq_details;
