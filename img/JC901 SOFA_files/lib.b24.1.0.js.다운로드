var B24;
function BatonCafe24() {
	this.API_URL = "https://api2.kaareklint.co.kr";
	var self = this;
	this.get = function(endpoint,data,callback){
		try {
			$.get(self.API_URL+endpoint,data,function(res){
				var err = false;
				if(!res) err = true;
				var data = JSON.parse(res);
				callback(err,data);
			})
		} catch (error) {
			console.log(error);
			callback(true);
		}
	}
	this.getUrlParam = function (target_key) {
		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			vars[key] = value;
		});
		if(!target_key) return vars;
		return vars[target_key];
	}

	this.genPaginationHTML = function(current_page,total,per_page,prefix){
		var $pages = "";
		console.log(current_page,total,per_page,prefix);
		var loop = Math.ceil(total/per_page);
		for (var index = 1; index <= loop; index++) {
			$pages += '<li class="'+(current_page == index ? 'active' : '')+'"><a href="'+prefix+'?pg='+index+'" >'+index+'</a></li>';
		}
		var $html = '<ul class="ec-base-paginate pagination page-navi">'+
					'<li class="prev"><a href="'+prefix+'?pg='+(current_page == 1 ? 1 : current_page-1)+'"></a></li>'+
					$pages+
					'<li class="next"><a href="'+prefix+'?pg='+(current_page == loop ? loop : Number(current_page)+1)+'"></a> </li>'+
				'</ul>';
		return $html;
	}
}
B24 =  new BatonCafe24();