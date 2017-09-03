var _ = require('lodash');
var EventProxy = require('eventproxy');

var intentions_customers = function(server) {
	return {
		//获得所有预算
		get_customers : function(info, cb){
            var query = `select id, thread_id, phone, email, name, sex, state, relationship, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from intentions_customers where flag = 0
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
		account_customers : function(info, cb){
			var query = `select count(1) num
			from intentions_customers where flag = 0
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
		save_customer : function(customer, cb){
			var query = `insert into intentions_customers(thread_id, phone, email, name, sex, relationship, state, created_at, updated_at, flag)
			values
			(?, ?, ?, ?, ?,
            ?,  "新建", now(), now(), 0
			)
			`;
			var coloums = [customer.thread_id, customer.phone, customer.email, customer.name, customer.sex, customer.relationship];
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
		update_customer:function(customer, cb){
			var query = `update intentions_customers set thread_id = ?, phone = ?, email = ?,
            name = ?, sex = ?, relationship = ?, state = ?, updated_at = now() where id = ? and flag = 0
			`;
			var coloums = [customer.thread_id, customer.phone, customer.email,
			customer.name, customer.sex, customer.relationship, customer.state, customer.id];
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
		search_customer_by_id : function(id, cb){
			var query = `select id, thread_id, phone, email, name, sex, relationship, state, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from intentions_customers where flag = 0 and id = ?
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
		delete_customer:function(id, cb){
			var query = `update intentions_customers set flag = 1, updated_at = now()
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

module.exports = intentions_customers;
