var _ = require('lodash');
var EventProxy = require('eventproxy');

var contracts = function(server) {
	return {
		//获得所有预算
		get_contracts : function(info, cb){
            var query = `select id, customer_id, amount, quantity, discount,
            actual_price, person_id, school_id, state, created_at, updated_at
            from contracts where flag = 0
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
		account_contracts : function(info, cb){
			var query = `select count(1) num
			from contracts where flag = 0
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
		save_contract : function(contract, cb){
			var query = `insert into contracts(customer_id, amount, quantity, discount,
            actual_price, person_id, school_id, state, created_at, updated_at, flag)
			values
			(?, ?, ?, ?,
            ?, ?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [contract.customer_id, contract.amount, contract.quantity, contract.discount,
            contract.actual_price, contract.person_id, contract.school_id, contract.state];
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
		update_contract:function(contract, cb){
			var query = `update contracts set customer_id = ?, amount = ?, quantity = ?, discount = ?,
            actual_price = ?, person_id = ?, school_id = ?, state = ?, updated_at = now() where id = ? and flag = 0
			`;
			var coloums = [contract.customer_id, contract.amount, contract.quantity, contract.discount,
            contract.actual_price, contract.person_id, contract.school_id, contract.state, contract.id];
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
		search_contract_by_id : function(id, cb){
			var query = `select id, customer_id, amount, quantity, discount,
            actual_price, person_id, school_id, state, created_at, updated_at, flag
			from contracts where flag = 0 and id = ?
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
		delete_contract:function(id, cb){
			var query = `update contracts set flag = 1, updated_at = now()
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

module.exports = contracts;
