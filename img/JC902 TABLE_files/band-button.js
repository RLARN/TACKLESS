(function(global){

    //namespace
    var ns = function(name){
        var namespaces = name.split('.');
        var obj = global;
        while (namespaces.length > 0) {
            var segment = namespaces.pop();
            if(typeof obj[segment] === 'undefined'){
                obj[segment] = {};
            }
            if(typeof obj[segment] !== 'object') {
                // do nothing
                return null;
            }
            obj = obj[segment];
        };
        return obj;
    };
    
    if (!ns('ShareBand')){
        return;
    }

    // util
    var $ = {
        bind: function(obj, type, fn){
            obj.addEventListener ?
                obj.addEventListener(type, fn, false) :
                obj.attachEvent('on'+type, fn);
        },
        getThisScriptElement: function() {
            // returns caller script element node if it is called in loading
            var scripts = document.getElementsByTagName('script');
            return scripts[scripts.length -1];
        },
        each: function(array, fn) {
            for ( var i = 0, l = array.length; i < l; i++ ) {
                var r = fn(i, array[i], array);
                if (r === false) {return;}
            }
        },
        attr: function(el, obj){
            for (var key in obj) {
                el.setAttribute(key, obj[key]);
            }
        },
        map: function(array, fn){
            var res = [];
            $.each(array, function(i, v, a){
                res.push(fn(i, v, a));
            });
            return res;
        },
        filter: function(array, fn){
            var res = [];
            $.each(array, function(i, v, a){
                if(fn(i, v, a)){res.push(v)};
            });
            return res;
        },
        ready: function(fn){
            $.bind(window, 'load', fn);
        },
        isSmartphone: function(){
            return navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/i);
        },
		json2str : function(object) {
			var results = [];
			for ( var property in object) {
				var value = object[property];
				if (value)
					var quotedValue = ((typeof value) == 'number' || (typeof value) == 'boolean') ? value : '"' + value + '"';
					results.push('"' + property.toString() + '": ' + quotedValue);
			}

			return '{' + results.join(', ') + '}';
		},        
        agentType: function() {
        	if(navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        		return "ios";
        	}
        	
        	if(navigator.userAgent.match(/Android/i)) {
        		return "android";
        	}
        	return "web";
        },
        
    };

    // @see https://github.com/sobstel/jsonp.js/blob/master/jsonp.js
	var $jsonp = (function() {
		var that = {};
	
		that.send = function(src, options) {
			var callback_name = options.callbackName || 'callback';
			var on_success = options.onSuccess || function() {};
			var on_timeout = options.onTimeout || function() {};
			var timeout = options.timeout || 10; // sec
	
			var timeout_trigger = window.setTimeout(function() {
				window[callback_name] = function() {
				};
				on_timeout();
			}, timeout * 1000);
	
			window[callback_name] = function(data) {
				window.clearTimeout(timeout_trigger);
				on_success(data);
			}
	
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.async = true;
			script.src = src;
	
			document.getElementsByTagName('head')[0].appendChild(script);
		}
	
		return that;
	})();    
    
    var bandButton = {
        constant: {
            IMG_BASE_URL: 'developers.band.us/img/share/button/',
            ALT: {ko: '\ubc34\ub4dc\uacf5\uc720',	// 밴드공유
                  en: 'Share on BAND'
                 },
            // width, height
            IMG_SIZE: {ko: {a:[72,22], b:[20,20], c:[30,30], d:[40,40], e:[50,61], f:[81,24]},
                       en: {a:[68,22], b:[20,20], c:[30,30], d:[40,40], e:[42,60], f:[79,24]}
            },
            STAT_URL : 'statcatcher.band.us/log/write_log',
            PHASE : '',
            STAT_PHASE: ''
        },
        
        phase : function(phase, statPhase) {
        	var self = this;
        	self.constant.PHASE = (phase == undefined) ? '' : phase;
        	self.constant.STAT_PHASE = (statPhase == undefined) ? self.constant.PHASE : statPhase;
        	return self;
        },
        
        properties : function() {
        	return {
        		"img_base_url" : '//' + this.constant.PHASE + ((this.constant.PHASE === '') ? '' : '-') + this.constant.IMG_BASE_URL,
        		"stat_url" : '//' + this.constant.STAT_PHASE + ((this.constant.STAT_PHASE === '') ? '' : '-') + this.constant.STAT_URL
        	};
        },

        insertButton: function(argOption, scriptParent, script){
            var self = this;
            var option = self.validate(argOption);            
            var s = (script.parentNode === scriptParent) ? script : undefined;
            var elAdded = self.createTag(option);
            scriptParent.insertBefore(elAdded, s);
            return elAdded;
        },

        validate: function(argOption){
            var self = this;
            var pattern = {lang: /^(ko|en)$/,
                           type: /^(a|b|c|d|e|f)$/,
                           text: /^[\s\S]+$/};
            //default
            var option = {lang: 'ko', type: 'a', text: null};
            if (!argOption) {
                return option;
            }
            for (var key in option) {
                if (argOption[key]
                    && typeof argOption[key] === 'string'
                    && argOption[key].match(pattern[key])){
                    option[key] = argOption[key];
                }
            }

            option.withUrl = !!argOption.withUrl;
            
            return option;
        },
        
        createTag: function(option){
            var self = this;
            var size = self.constant.IMG_SIZE[option.lang][option.type];
            
            /*
              <a href="{url}">
              <img src="{img}" alt="{alt}" height="{height}" width="{width}"/>
              </a>
            */
            var a = document.createElement('a');
            $.attr(a, {href: 'javascript:;'}); // top 스크롤 방지
            var img = document.createElement('img');
            $.attr(img,
                   {src: self.createImageUrl(option),
                    width: size[0],
                    height: size[1],
                    alt: self.constant.ALT[option.lang]});
            
            a.appendChild(img);
            
            return a;
        },

        text: function(option){
            var text;
            if (option.text) {
                text = [option.text];
                if(option.withUrl){
                    text.push(document.location.href);
                }
            } else {
                text = [document.title, document.location.href];
            }
            return text.join('\n');
        },

        createImageUrl: function(option){
            var self = this;
            var C = self.constant;
            var size = C.IMG_SIZE[option.lang][option.type];
            return [this.properties().img_base_url,
                    option.lang, '/',
                    size[0], 'x', size[1], '.png'].join('');
        },
        
        sendLog : function(params) {
        	var logParams = {
            		"log_type" : "CLICK",
            		"code" : 1,
            		"route": params.route,
            		"agent" : $.agentType()
            	};

        	try {
        		$jsonp.send(this.properties().stat_url + '?callback=callback&jsonLog=' + encodeURIComponent($.json2str(logParams)), {
        			callbackName : 'callback',
        			onSuccess : function(result) {
        				if(result.resultCode != 1) {
//        					console.log('jsonp success:' + result.resultData);
        				}
        			},
        			onTimeout : function() {
//        				console.log('sendLog request timeout');
        			},
        			timeout : 2
        		});        	
        	}catch (e) {
        		// ignore
			}
        },
        
        handleEvent: function(option) {
        	var self = this;
        	
        	var text = self.text(option);        	
        	var params = {
        		"text" : encodeURIComponent(text).replace(/\+/g, '%20'),
        		"route" : document.location.hostname
        	};
        	
        	this.sendLog(params);
        	
        	if($.isSmartphone()) {
        		new BandAppLauncher(params).configure().launchApp();
        	}else {
        		window.open("https://band.us/plugin/share?body=" + params.text + "&route=" + params.route, "share_band", "width=600, height=700, resizable=no");
        	}
        	
        	return false;
        }
        
    };
    
    // class: launch BAND app
    function BandAppLauncher(params) {
    	this.params = params;
		    	
    	this.service = {
			"schemeUrl" : "bandapp://create/post",
			"installUrlForIos" : "itms-apps://itunes.apple.com/app/id542613198",
			"installUrlForAndroid" : "market://details?id=com.nhn.android.band",
			"packageNameForAndroid" : "com.nhn.android.band",
			"webUrlForNotSupported" : "http://band.us"
		};

    	this.platform = {
			"ios" : false,
			"android" : false,
			"androidChromeIntent" : false,
			"notSupported" : false
		};
		
		this.configure = function() {
			if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
				this.platform.ios = true;
			} else if (navigator.userAgent.match(/Android/i)) {
				this.platform.android = true;

				var chromeString = navigator.userAgent.match(/Chrome\/[0-9]*/g);
				// 크롬 중에 intent로만 호출되는 버전 확인. 
				var supportsIntent = chromeString && chromeString[0].split('/')[1] >= 25;
				if (supportsIntent) {
					this.platform.androidChromeIntent = true;
				}
			} else {
				this.platform.notSupported = true;
			}
			
			this.service.schemeUrl = this.service.schemeUrl + '?text=' + this.params.text + '&route=' + this.params.route;
			return this;
		};
		
		this.launchApp = function () {
			if (this.platform.ios) {

				function clearTimer(timer) {
					return function() {
						clearTimeout(timer);
						window.removeEventListener('pagehide', arguments.callee);
					};
				}

				var visited = (new Date()).getTime();
                var storeUrl = this.service.installUrlForIos;
				var timer = setTimeout(function() {
					var now = (new Date()).getTime();
					if (now - visited < 3000) {
						window.location.href = storeUrl;
					}
				}, 2000);
				
				window.addEventListener('pagehide', clearTimer(timer));
				window.location.href = this.service.schemeUrl;
				
			} else if (this.platform.android) {
				var visited = (new Date()).getTime();
				var alreadyMoved = false;
				if (this.platform.androidChromeIntent && this.service.packageNameForAndroid != '') {
					// 안드로이드 크롬에서는 intent 만 동작하는 경우 처리. 
					var intentUrl = "intent:" + this.service.schemeUrl + "#Intent;package=" + this.service.packageNameForAndroid + ";end;";
					window.location.href = intentUrl;
				} else {
					var iframe = document.createElement('iframe');
					iframe.style.display = 'none';
					iframe.src = this.service.schemeUrl;

                    var storeUrl = this.service.installUrlForAndroid
					setTimeout(function() {
						if ((new Date()).getTime() - visited < 2000) {
							if (!alreadyMoved) {
								alreadyMoved = true;
								window.location = storeUrl;
							}
						}
					}, 500);
					iframe.onload = function() {
						if (!alreadyMoved) {
							alreadyMoved = true;
							window.location = storeUrl;
						}
					};
					document.body.appendChild(iframe);
					// 뒤로가기 호출시 캐싱될 수도 있으므로 iframe을 삭제 한다. 
					document.body.removeChild(iframe);

				}
			} else if (this.service.webUrlForNotSupported != '') {
				window.location.href = this.service.webUrlForNotSupported;
			}			
		};

    }

    global.ShareBand.makeButton = function(option, phase, statPhase){
        var script = $.getThisScriptElement();
        var scriptParent = script.parentNode;        
        
        if(scriptParent.tagName.toLowerCase() !== 'head'){
            $.ready(function(){
                var elAdded = bandButton.phase(phase, statPhase).insertButton(option, scriptParent, script);
                
                $.bind(elAdded, 'click', function(){
                	bandButton.handleEvent(option);
                	return false; 
                });
            });
        }
    };
    
    global.ShareBand.Button = function (option, phase) {
    	this.imageUrl = function () {
    		var ops = bandButton.phase(phase).validate(option);        
    		var url = bandButton.createImageUrl(ops);
    		return url;    		
    	};
    	
    	this.bind = function (el, onEvent) {
    		$.bind(el, onEvent, function() {
            	bandButton.phase(phase).handleEvent(option);
            	return false;     			
    		});
    	};
    };   
    
})(this);
