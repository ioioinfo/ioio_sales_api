var _ = require('lodash');
var EventProxy = require('eventproxy');

var channel_details = function(server) {
	return {
		//获得所有渠道部门
		get_channels : function(info, cb){
            var query = `select id, name, code, source_level, created_at, updated_at
            from channel_details where flag = 0
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
		account_channels : function(info, cb){
			var query = `select count(1) num
			from channel_details where flag = 0
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

	};
};

module.exports = channel_details;
