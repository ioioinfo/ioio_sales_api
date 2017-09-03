var _ = require('lodash');
var EventProxy = require('eventproxy');

var prepayments = function(server) {
	return {
		//获得所有预算
		get_prepayments : function(info, cb){
            var query = `select id, customer_id, person_id, amount, state, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from prepayments where flag = 0
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
		account_prepayments : function(info, cb){
			var query = `select count(1) num
			from prepayments where flag = 0
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
		save_prepayment : function(prepayment, cb){
			var query = `insert into prepayments(customer_id, person_id, amount, state, created_at, updated_at, flag)
			values
			(?, ?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [prepayment.customer_id, prepayment.person_id, prepayment.amount, prepayment.state];
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
		update_prepayment:function(prepayment, cb){
			var query = `update prepayments set customer_id = ?, person_id = ?, amount = ?, state = ?, updated_at = now() where id = ? and flag = 0
			`;
			var coloums = [prepayment.customer_id, prepayment.person_id, prepayment.amount, prepayment.state, prepayment.id];
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
		search_prepayment_by_id : function(id, cb){
			var query = `select id, customer_id, person_id, amount, state, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from prepayments where flag = 0 and id = ?
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
		delete_prepayment:function(id, cb){
			var query = `update prepayments set flag = 1, updated_at = now()
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

module.exports = prepayments;
