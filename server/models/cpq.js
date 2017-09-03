var _ = require('lodash');
var EventProxy = require('eventproxy');

var cpq = function(server) {
	return {
		//获得所有预算
		get_cpqs : function(info, cb){
            var query = `select id, customer_id, amount, quantity, discount,
            actual_price, person_id, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from cpq where flag = 0
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
		account_cpqs : function(info, cb){
			var query = `select count(1) num
			from cpq where flag = 0
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
		save_cpq : function(cpq, cb){
			var query = `insert into cpq(customer_id, amount, quantity, discount,
            actual_price, person_id, created_at, updated_at, flag)
			values
			(?, ?, ?, ?,
            ?, ?, now(), now(), 0
			)
			`;
			var coloums = [cpq.customer_id, cpq.amount, cpq.quantity, cpq.discount,
            cpq.actual_price, cpq.person_id];
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
		update_cpq:function(cpq, cb){
			var query = `update cpq set customer_id = ?, amount = ?, quantity = ?, discount = ?,
            actual_price = ?, person_id = ?, updated_at = now() where id = ? and flag = 0
			`;
			var coloums = [cpq.customer_id, cpq.amount, cpq.quantity, cpq.discount,
            cpq.actual_price, cpq.person_id, cpq.id];
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
		search_cpq_by_id : function(id, cb){
			var query = `select id, customer_id, amount, quantity, discount,
            actual_price, person_id, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from cpq where flag = 0 and id = ?
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
		delete_cpq:function(id, cb){
			var query = `update cpq set flag = 1, updated_at = now()
				where id = ? and flag = 0
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

module.exports = cpq;
