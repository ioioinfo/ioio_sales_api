var _ = require('lodash');
var EventProxy = require('eventproxy');

var budgets = function(server) {
	return {
		//获得所有预算
		get_budgets : function(info, cb){
            var query = `select id, name, channel_id, employees_cost, locations_cost, materials_cost, medias_cost, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at
            from budgets where flag = 0
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
		account_budgets : function(info, cb){
			var query = `select count(1) num
			from budgets where flag = 0
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
		save_budget : function(budget, cb){
			var query = `insert into budgets (name, channel_id, employees_cost, locations_cost, materials_cost, medias_cost, created_at, updated_at, flag )
			values
			(?, ?, ?,
            ?, ?, ?, now(), now(), 0
			)
			`;
			var coloums = [budget.name, budget.channel_id, budget.employees_cost, budget.locations_cost, budget.materials_cost, budget.medias_cost];
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
		update_budget:function(budget, cb){
			var query = `update budgets set name = ?, channel_id = ?, employees_cost =?, locations_cost = ?, materials_cost = ?, medias_cost =?, updated_at = now()
			where id = ? and flag = 0
			`;
			var coloums = [budget.name, budget.channel_id, budget.employees_cost, budget.locations_cost, budget.materials_cost, budget.medias_cost, budget.id];
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
		search_budget_byId : function(id, cb){
			var query = `select id, name, channel_id, employees_cost, locations_cost, materials_cost, medias_cost, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			from budgets where flag = 0 and id = ?
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
		delete_budget:function(id, cb){
			var query = `update budgets set flag = 1, updated_at = now()
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

module.exports = budgets;
