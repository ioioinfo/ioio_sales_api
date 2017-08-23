var _ = require('lodash');
var EventProxy = require('eventproxy');

var connection_records = function(server) {
	return {
		//获得所有预算
		get_threads_customers : function(info, cb){
            var query = `select id, thread_id, phone, state, way, call_in_time,
            call_time, email, message, created_at, updated_at
            from connection_records where flag = 0 and thread_id is not null
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
		account_threads_customers : function(info, cb){
			var query = `select count(1) num
			from connection_records where flag = 0 and thread_id is not null
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

        get_intentions_customers : function(info, cb){
            var query = `select id, customer_id, phone, state, way, call_in_time,
            call_time, email, message, created_at, updated_at
            from connection_records where flag = 0 and customer_id is not null
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
        account_intentions_customers : function(info, cb){
            var query = `select count(1) num
            from connection_records where flag = 0 and customer_id is not null
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

		//查询预算
		search_threads_record: function(id, cb){
			var query = `select id, thread_id, phone, state, way, call_in_time,
            call_time, email, message, created_at, updated_at, flag
			from connection_records where flag = 0 and id = ? and thread_id is not null
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
        search_intentions_record: function(id, cb){
			var query = `select id, customer_id, phone, state, way, call_in_time,
            call_time, email, message, created_at, updated_at, flag
			from connection_records where flag = 0 and id = ? and customer_id is not null
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
		delete_connection_record:function(id, cb){
			var query = `update connection_records set flag = 1, updated_at = now()
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

        // 保存预算
		save_threads_by_phone : function(connection, cb){
			var query = `insert into connection_records(thread_id, phone, state, way,
            call_in_time, call_time, created_at, updated_at, flag)
			values
			(?, ?, ?, ?,
            ?, ?, now(), now(), 0
			)
			`;
			var coloums = [connection.thread_id, connection.phone, connection.state, connection.way,
            connection.call_in_time, connection.call_time];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
        // 保存预算
        save_intention_by_phone : function(connection, cb){
            var query = `insert into connection_records(customer_id, phone, state, way,
            call_in_time, call_time, created_at, updated_at, flag)
            values
            (?, ?, ?, ?,
            ?, ?, now(), now(), 0
            )
            `;
            var coloums = [connection.customer_id, connection.phone, connection.state, connection.way,
            connection.call_in_time, connection.call_time];
            server.plugins['mysql'].query(query, coloums, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },

        save_threads_by_email : function(connection, cb){
            var query = `insert into connection_records(thread_id, email, state, way,
            message, created_at, updated_at, flag)
            values
            (?, ?, ?, ?,
            ?, now(), now(), 0
            )
            `;
            var coloums = [connection.thread_id, connection.email, connection.state, connection.way,
            connection.message];
            server.plugins['mysql'].query(query, coloums, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },

        save_intention_by_email : function(connection, cb){
            var query = `insert into connection_records(customer_id, email, state, way,
            message, created_at, updated_at, flag)
            values
            (?, ?, ?, ?,
            ?, now(), now(), 0
            )
            `;
            var coloums = [connection.customer_id, connection.email, connection.state, connection.way,
            connection.message];
            server.plugins['mysql'].query(query, coloums, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },

        save_threads_by_message : function(connection, cb){
            var query = `insert into connection_records(thread_id, phone, state, way,
            message, created_at, updated_at, flag)
            values
            (?, ?, ?, ?,
            ?, now(), now(), 0
            )
            `;
            var coloums = [connection.thread_id, connection.phone, connection.state, connection.way,
            connection.message];
            server.plugins['mysql'].query(query, coloums, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },

        save_intention_by_message : function(connection, cb){
            var query = `insert into connection_records(customer_id, phone, state, way,
            message, created_at, updated_at, flag)
            values
            (?, ?, ?, ?,
            ?, now(), now(), 0
            )
            `;
            var coloums = [connection.customer_id, connection.phone, connection.state, connection.way,
            connection.message];
            server.plugins['mysql'].query(query, coloums, function(err, results) {
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

module.exports = connection_records;
