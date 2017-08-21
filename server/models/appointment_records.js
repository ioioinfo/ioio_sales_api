var _ = require('lodash');
var EventProxy = require('eventproxy');

var appointment_records = function(server) {
	return {
		//获得所有预算
		get_appointments : function(info, cb){
            var query = `select id, customer_id, name, phone, sex, relationship, order_date, order_person, order_school, created_at, updated_at
            from appointment_records where flag = 0
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
		account_appointments : function(info, cb){
			var query = `select count(1) num
			from appointment_records where flag = 0
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
		save_appointment : function(appointment, cb){
			var query = `insert into appointment_records(customer_id, name, phone, sex, relationship, order_date, order_person, order_school, created_at, updated_at, flag)
			values
			(?, ?, ?, ?,
            ?, ?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [appointment.customer_id, appointment.name, appointment.phone, appointment.sex, appointment.relationship, appointment.order_date, appointment.order_person, appointment.order_school];
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
		update_appointment:function(appointment, cb){
			var query = `update appointment_records set customer_id = ?, name = ?,
            phone = ?, sex = ?, relationship = ?, order_date = ?, order_person = ?, order_school = ?, updated_at = now() where id = ? and flag = 0
			`;
			var coloums = [appointment.customer_id, appointment.name, appointment.phone, appointment.sex, appointment.relationship, appointment.order_date, appointment.order_person, appointment.order_school, appointment.id];
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
		search_appointment_by_id : function(id, cb){
			var query = `select id, customer_id, name, phone, sex, relationship, order_date, order_person, order_school, created_at, updated_at, flag
			from appointment_records where flag = 0 and id = ?
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
		delete_appointment:function(id, cb){
			var query = `update appointment_records set flag = 1, updated_at = now()
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

module.exports = appointment_records;
