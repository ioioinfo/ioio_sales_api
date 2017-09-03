var _ = require('lodash');
var EventProxy = require('eventproxy');


var contracts_details = function(server) {
	return {
		//获得所有预算
		get_details : function(info, cb){
            var query = `select id, contract_id, product_id, quantity, total_price, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from contracts_details where flag = 0
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
		account_details : function(info, cb){
			var query = `select count(1) num
			from contracts_details where flag = 0
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
		save_detail : function(detail, cb){
			var query = `insert into contracts_details(contract_id, product_id, quantity, total_price, created_at, updated_at, flag)
			values
			(?, ?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [detail.contract_id, detail.product_id, detail.quantity, detail.total_price];
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
		update_detail:function(detail, cb){
			var query = `update contracts_details set contract_id = ?, product_id = ?, quantity = ?, total_price = ?, updated_at = now() where id = ? and flag = 0
			`;
			var coloums = [detail.contract_id, detail.product_id, detail.quantity, detail.total_price, detail.id];
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
		search_detail_by_id : function(id, cb){
			var query = `select id, contract_id, product_id, quantity, total_price, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from contracts_details where flag = 0 and id = ?
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
		delete_detail:function(id, cb){
			var query = `update contracts_details set flag = 1, updated_at = now()
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

module.exports = contracts_details;
