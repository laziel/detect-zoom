/* Detect-zoom
 * -----------
 * Cross Browser Zoom and Pixel Ratio Detector
 * Version 1.0.4 | Apr 1 2013
 * dual-licensed under the WTFPL and MIT license
 * Maintained by https://github/tombigel
 * Original developer https://github.com/yonran
 * JindoJS extension by https://github.com/laziel
 */

 jindo.$Agent.prototype.xZoomLevel = function(){
	// IE8+
	if(!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)){
		return Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100) / 100;
	}
	// IE10+ / Touch
	else if(window.navigator.msMaxTouchPoints){
		return Math.round((document.documentElement.offsetHeight / window.innerHeight) * 100) / 100;
	}
	// Mobile Webkit
	else if('orientation' in window && typeof document.body.style.webkitMarquee === 'string'){
		return ((Math.abs(window.orientation) == 90) ? screen.height : screen.width) / window.innerWidth;
	}
	//WebKit
	else if(typeof document.body.style.webkitMarquee === 'string'){
        var important = function (str) {
            return str.replace(/;/g, " !important;");
        };

        var div = document.createElement('div');
        div.innerHTML = "1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0";
        div.setAttribute('style', important('font: 100px/1em sans-serif; -webkit-text-size-adjust: none; text-size-adjust: none; height: auto; width: 1em; padding: 0; overflow: visible;'));

        // The container exists so that the div will be laid out in its own flow
        // while not impacting the layout, viewport size, or display of the
        // webpage as a whole.
        // Add !important and relevant CSS rule resets
        // so that other rules cannot affect the results.
        var container = document.createElement('div');
        container.setAttribute('style', important('width:0; height:0; overflow:hidden; visibility:hidden; position: absolute;'));
        container.appendChild(div);

        document.body.appendChild(container);
        var zoom = (1000 / div.clientHeight);
        zoom = Math.round(zoom * 100) / 100;
        document.body.removeChild(container);
		return zoom;
	}
	//Opera
	else if (navigator.userAgent.indexOf('Opera') >= 0) {
        var zoom = window.top.outerWidth / window.top.innerWidth;
        zoom = Math.round(zoom * 100) / 100;
		return zoom;
	}
	//Last one is Firefox
	//FF 18.x
	//FF 4.0 - 17.x
	else if (window.devicePixelRatio) {
		/**
		 * Use a binary search through media queries to find zoom level in Firefox
		 * @param property
		 * @param unit
		 * @param a
		 * @param b
		 * @param maxIter
		 * @param epsilon
		 * @return {Number}
		 */
		var mediaQueryBinarySearch = function (property, unit, a, b, maxIter, epsilon) {
			var matchMedia;
			var head, style, div;
			if (window.matchMedia) {
				matchMedia = window.matchMedia;
			} else {
				head = document.getElementsByTagName('head')[0];
				style = document.createElement('style');
				head.appendChild(style);

				div = document.createElement('div');
				div.className = 'mediaQueryBinarySearch';
				div.style.display = 'none';
				document.body.appendChild(div);

				matchMedia = function (query) {
					style.sheet.insertRule('@media ' + query + '{.mediaQueryBinarySearch ' + '{text-decoration: underline} }', 0);
					var matched = getComputedStyle(div, null).textDecoration == 'underline';
					style.sheet.deleteRule(0);
					return {matches: matched};
				};
			}
			var ratio = binarySearch(a, b, maxIter);
			if (div) {
				head.removeChild(style);
				document.body.removeChild(div);
			}
			return ratio;

			function binarySearch(a, b, maxIter) {
				var mid = (a + b) / 2;
				if (maxIter <= 0 || b - a < epsilon) {
					return mid;
				}
				var query = "(" + property + ":" + mid + unit + ")";
				if (matchMedia(query).matches) {
					return binarySearch(mid, b, maxIter - 1);
				} else {
					return binarySearch(a, mid, maxIter - 1);
				}
			}
		};	
        var zoom = mediaQueryBinarySearch('min--moz-device-pixel-ratio', '', 0, 10, 20, 0.0001);
        zoom = Math.round(zoom * 100) / 100;
		return zoom;
	}
	
	return 1;
};

jindo.$Agent.prototype.xDevicePixelAspectRatio = function(){
	var nDevicePixelRatio = window.devicePixelRatio || 1;
	var nZoomLevel = this.xZoomLevel();
	
	// FireFox
	if(this.navigator().firefox){
		return (htNavigator.version >= 18) ? nDevicePixelRatio : nZoomLevel;
	}
	return nZoomLevel * nDevicePixelRatio;
};