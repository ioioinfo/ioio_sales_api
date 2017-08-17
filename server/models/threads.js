var _ = require('lodash');
var EventProxy = require('eventproxy');

var threads = function(server) {
	return {
		//获得所有预算
		get_threads : function(info, cb){
            var query = `select id, name, sex, phone, address, channel_id,  state,
            created_at, updated_at
            from threads where flag = 0
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
		account_threads : function(info, cb){
			var query = `select count(1) num
			from threads where flag = 0
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
		save_thread : function(thread, cb){
			var query = `insert into threads (name, sex, phone, address, channel_id,
            state, created_at, updated_at, flag )
			values
			(?, ?, ?, ?, ?,
            "新建", now(), now(), 0
			)
			`;
			var coloums = [thread.name, thread.sex, thread.phone, thread.address, thread.channel_id];
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
		update_thread:function(thread, cb){
			var query = `update threads set name = ?, sex = ?, phone = ?, address = ?, channel_id = ?, state = ?, updated_at = now()
			where id = ? and flag = 0
			`;
			var coloums = [thread.name, thread.sex, thread.phone, thread.address, thread.channel_id, thread.state, thread.id];
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
		search_thread_byId : function(id, cb){
			var query = `select id, name, sex, phone, address, channel_id,
            state, created_at, updated_at, flag
			from threads where flag = 0 and id = ?
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
		delete_thread:function(id, cb){
			var query = `update threads set flag = 1, updated_at = now()
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
        //更新状态
        update_thread_state:function(id,state, cb){
            var query = `update threads set state = ?, updated_at = now()
            where id = ? and flag = 0
            `;
            var coloums = [state, id];
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

module.exports = threads;
