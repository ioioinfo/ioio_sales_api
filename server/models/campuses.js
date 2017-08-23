var _ = require('lodash');
var EventProxy = require('eventproxy');

var campuses = function(server) {
	return {
		//获得所有渠道部门
		get_campuses : function(info, cb){
            var query = `select id, name, code, location, province, city, district, photo, responsible_person,
			created_at, updated_at
            from campuses where flag = 0
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
		account_campuses : function(info, cb){
			var query = `select count(1) num
			from campuses where flag = 0
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
		// 保存渠道
		save_campuse : function(campuse, cb){
			var query = `insert into campuses (name, code, location, province, city,
                district, photo, responsible_person, created_at, updated_at, flag )
    			values
    			(?, ?, ?, ?, ?,
                ?, ?, ?,
                now(), now(), 0
    			)
			`;
			var coloums = [campuse.name, campuse.code, campuse.location, campuse.province,
                campuse.city, campuse.district, campuse.photo, campuse.responsible_person];
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
		update_campuse:function(campuse, cb){
			var query = `update campuses set name = ?, code = ?, location = ?, province = ?, city = ?,
            district = ?, photo = ?, responsible_person = ?, updated_at = now()
				where id = ? and flag = 0
				`;
			var coloums = [campuse.name, campuse.code, campuse.location, campuse.province,
                campuse.city, campuse.district, campuse.photo, campuse.responsible_person, campuse.id];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//查询渠道
		search_campuse_byId : function(id, cb){
			var query = `select id, name, code, location, province, city, district, photo,
            responsible_person, created_at, updated_at, flag
			from campuses where flag = 0 and id = ?
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
		delete_campuse:function(id, cb){
			var query = `update campuses set flag = 1, updated_at = now()
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

module.exports = campuses;
