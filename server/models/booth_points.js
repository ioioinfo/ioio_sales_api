var _ = require('lodash');
var EventProxy = require('eventproxy');

var booth_points = function(server) {
	return {
		//获得所有预算
		get_points : function(info, cb){
            var query = `select id, name,  code,  address,  province,  city,
            district, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from booth_points where flag = 0
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
		account_points : function(info, cb){
			var query = `select count(1) num
			from booth_points where flag = 0
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
		save_point : function(point, cb){
			var query = `insert into booth_points (name,  code,  address,
            province, city, district, created_at, updated_at, flag )
			values
			(?, ?, ?,
            ?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [point.name,  point.code,  point.address,
            point.province, point.city, point.district];
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
		update_point:function(point, cb){
			var query = `update booth_points set name = ?,  code = ?,  address = ?,
            province = ?, city = ?, district = ?, updated_at = now()
			where id = ? and flag = 0
			`;
			var coloums = [point.name,  point.code,  point.address,
            point.province, point.city, point.district, point.id];
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
		search_point_byId : function(id, cb){
			var query = `select id, name,  code,  address,
            province, city, district, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from booth_points where flag = 0 and id = ?
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
		delete_point:function(id, cb){
			var query = `update booth_points set flag = 1, updated_at = now()
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

module.exports = booth_points;
