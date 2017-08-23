var _ = require('lodash');
var EventProxy = require('eventproxy');

var visit_records = function(server) {
	return {
		//获得所有预算
		get_visit_records : function(info, cb){
            var query = `select id, customer_id, name, phone, sex, relationship,
            visit_date, reception_person, school, created_at, updated_at
            from visit_records where flag = 0
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
		account_visit_records : function(info, cb){
			var query = `select count(1) num
			from visit_records where flag = 0
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
		save_visit : function(visit, cb){
			var query = `insert into visit_records(customer_id, name, phone, sex, relationship,
            visit_date, reception_person, school, created_at, updated_at, flag)
			values
			(?, ?, ?, ?,
            ?, ?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [visit.customer_id, visit.name, visit.phone, visit.sex, visit.relationship,
            visit.visit_date, visit.reception_person, visit.school];
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
		update_visit:function(visit, cb){
			var query = `update visit_records set customer_id = ?, name = ?, phone = ?, sex = ?, relationship = ?,
            visit_date = ?, reception_person = ?, school = ?, updated_at = now() where id = ? and flag = 0
			`;
			var coloums = [visit.customer_id, visit.name, visit.phone, visit.sex, visit.relationship,
            visit.visit_date, visit.reception_person, visit.school, visit.id];
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
		search_visit_by_id : function(id, cb){
			var query = `select id, customer_id, name, phone, sex, relationship,
            visit_date, reception_person, school, created_at, updated_at, flag
			from visit_records where flag = 0 and id = ?
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
		delete_visit:function(id, cb){
			var query = `update visit_records set flag = 1, updated_at = now()
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

module.exports = visit_records;
