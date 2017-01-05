/*!
 * @author Steen Klingberg
 * @version v0.1.4, 2013-2014
 * @license MIT License
 */
(function () {

	var nodepDatepicker = function () {

		var defaultConf = {
			months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			headings: ['W', 'M', 'T', 'W', 'T', 'F', 'S', 'S'],
			format: 'yyyy-mm-dd'
		}

		function css (elem, prop) {
			for (var c in prop) {
				elem.style[c] = prop[c];
			}
		}

		function hidePopups (evt) {
			var m = document.querySelectorAll('.click-me-away');

			for (var i=0; i<m.length; i++) {
				var pos = m[i].getBoundingClientRect()
				 ,	x = pos.left + document.body.scrollLeft
				 ,	y = pos.top + document.body.scrollTop;
				if (!((x < (evt.clientX + scrollX))
					&& ((evt.clientX + scrollX) < (x + m[i].offsetWidth))
					&& (y < (evt.clientY + scrollY))
					&& ((evt.clientY + scrollY) < (y + m[i].offsetHeight)))) {
					m[i].style.display = 'none';
					m[i].classList.remove('click-me-away');
				}
			}
		}

		function formatDate (date, mask) {
			var t = mask.split(/([ymd]+)/);
			var s = '';
			for (var i=0; i <t.length; i++) {
				switch (t[i]) {
					case 'y': s += (''+date.getFullYear()).substr(3); break;
					case 'yy': s += (''+date.getFullYear()).substr(2); break;
					case 'yyy': s += (''+date.getFullYear()).substr(1); break;
					case 'yyyy': s += date.getFullYear(); break;
					case 'm': s += (date.getMonth()+1); break;
					case 'mm': s += ('0'+(date.getMonth()+1)).substr(-2); break;
					case 'd': s += date.getDate(); break;
					case 'dd': s += ('0'+date.getDate()).substr(-2); break;
					case '-': s += '-'; break;
					case '/': s += '/'; break;
					case ' ': s += ' '; break;
				}
			}
			return s;
		};

		function getYearDay (date) {
			var d = new Date(date.getFullYear(), 0, 1, 0)
			 ,	e = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0);
			return Math.floor(e.getTime()/86400000) - Math.floor(d.getTime()/86400000) + 1;
		}

		function getISOWeek (date) {
			var fd = new Date(date);
			fd.setMonth(0);
			fd.setDate(1);
			var dd = ((((fd.getDay() + 6) % 7) + 3) % 7) - 3,
			yd = getYearDay(date) - 1 + dd,
			w = Math.floor(yd / 7) + 1;		
			if (w > 52) {
				fd.setDate(31);
				fd.setMonth(11);
				var wd = (fd.getDay() + 6) % 7;
				w = wd < 4 ? 1 : w;
			}
			if (w > 0) {
				return w;
			} else {
				fd.setYear(fd.getFullYear() - 1);
				fd.setMonth(11);
				fd.setDate(31);
				return getISOWeek(new Date(fd));
			}
		}

		function addDays (date, days) {
			var t = date.getTime();
			return new Date(t + 86400000 * days);
		}

		function lastDateOfMonth (date) {
			var d = new Date(date);
			d.setDate(28);
			d = addDays(d, 4);
			d.setDate(1);
			d = addDays(d, -1);
			return d.getDate();
		}

		window.addEventListener('click', hidePopups);

		return 	function (dom, conf) {

			function applyPolyfill (input) {
				var popup = document.createElement('div');
				css(popup, {
					width: '160px',
					minHeight: '120px',
					paddingLeft: '20px',
					paddingBottom: '4px',
					border: 'solid black 1px',
					position: 'absolute',
					backgroundColor: 'white',
					left: input.offsetLeft + 'px',
					zIndex: 111111,
					fontSize: '10pt',
					fontFamily: 'sans-serif',
					display: 'none',
				});

				/* month */
				var month = document.createElement('select');
				css(month, {
					border: 'none',
					'-webkitAppearance': 'none',
					'-moz-appearance': 'none',
					fontSize: '11pt',
					fontFamily: 'sans-serif',
					height: '20px',
					padding: '1px'
				});
				month.addEventListener('change', function () {
					layoutWeeks();
				});
				function populateMonth (list) {
					list.forEach(function (v, i) {
						var opt = document.createElement('option');
						opt.setAttribute('value', i);
						opt.appendChild(document.createTextNode(v));
						month.appendChild(opt);
					})
				}
				populateMonth((conf||{}).months || defaultConf.months);
				popup.appendChild(month);

				/* year */
				var year = document.createElement('input');
				year.setAttribute('type', 'number');
				css(year, {
					width: '50px',
					border: 'none',
					fontSize: '11pt',
					fontFamily: 'sans-serif'
				});
				year.addEventListener('change', function () {
					layoutWeeks();
				});
				popup.appendChild(year);
				var tab = document.createElement('div');

				/* object to keep track of selected date */
				var day = {
					_value: 1,
					set value (v) {
						this._value = v;
					},
					get value () {
						return this._value;
					},
					set highlighted (d) {
						if (d) {
							d.style.backgroundColor = 'pink';
						}
						if (this._d) {
							this._d.style.backgroundColor = '';
						}
						this._d = d;
					}
				}

				function toDate (date) {
					month.value = date.getMonth();
					year.value = date.getFullYear();
					day.value = date.getDate();
					layoutWeeks();
				}
				if (input.value.match(/\d\d\d\d-\d\d-\d\d/)) {
					toDate(new Date(input.value));
				} else {
					toDate(new Date());
				}

				popup.addEventListener('click', function () {
					input.value = formatDate(new Date(year.value, month.value, day.value), conf.format || defaultConf.format);
				});

				/* buttons */
				function stepDays (days) {
					var m = (new Date(year.value, month.value, 1)).getTime();
					var dt = new Date(m + 86400000 * days);
					month.value = dt.getMonth();
					year.value = dt.getFullYear();
					day.value = 1;
					day.highlighted = null;
					layoutWeeks();
				}
				/* right button */
				var rbut = document.createElement('div');
				css(rbut, {
					width: '0',
					height: '0',
					borderLeft: 'solid #444 8px',
					borderTop: 'solid transparent 4px',
					borderBottom: 'solid transparent 4px',
					float: 'right',
					margin: '4px',
					marginTop: '8px',
					marginRight: '20px',
					cursor: 'pointer',
					'-webkitTouchCallout': 'none',
					'-webkitUserSelect': 'none',
					'-khtmlUserSelect': 'none',
					'-mozUserSelect': 'moz-none',
					'-msUserSelect': 'none', 
					userSelect: 'none'
				});
				rbut.addEventListener('click', function () {stepDays(32)});
				popup.appendChild(rbut);
				/* middle button */
				var mbut = document.createElement('div');
				css(mbut, {
					width: '8px',
					height: '8px',
					borderRadius: '4px',
					backgroundColor: '#444',
					float: 'right',
					margin: '4px',
					marginTop: '8px',
					cursor: 'pointer',
					'-webkitTouchCallout': 'none',
					'-webkitUserSelect': 'none',
					'-khtmlUserSelect': 'none',
					'-mozUserSelect': 'moz-none',
					'-msUserSelect': 'none', 
					userSelect: 'none'
				});
				mbut.addEventListener('click', function () {
					var dt = new Date();
					toDate(dt);
				});
				popup.appendChild(mbut);
				/* left button */
				var lbut = document.createElement('div');
				css(lbut, {
					width: '0',
					height: '0',
					borderRight: 'solid #444 8px',
					borderTop: 'solid transparent 4px',
					borderBottom: 'solid transparent 4px',
					float: 'right',
					margin: '4px',
					marginTop: '8px',
					cursor: 'pointer',
					'-webkitTouchCallout': 'none',
					'-webkitUserSelect': 'none',
					'-khtmlUserSelect': 'none',
					'-mozUserSelect': 'moz-none',
					'-msUserSelect': 'none', 
					userSelect: 'none'
				});
				lbut.addEventListener('click', function () {stepDays(-2)});
				popup.appendChild(lbut);

				/* headings */
				var tp = document.createElement('div');
				popup.appendChild(tp);
				var h = (conf||{}).headings || defaultConf.headings;
				for (var dn in h) {
					var nn = document.createElement('div');
					nn.appendChild(document.createTextNode(h[dn]));
					tp.appendChild(nn);
					css(nn, {
						display: 'inline-block',
						textAlign: 'center',
						width: (dn == 0 ? '16pt' : '12pt'),
						color: 'gray',
						fontSize: '6pt',
						fontWeight: 'bold'
					});
				};


				/* lay out weeks */
				popup.appendChild(tab);
				function layoutWeeks () {
					day.highlighted = null;
					while (tab.hasChildNodes()) {
		                    tab.removeChild(tab.firstChild);
		            }
					var fdate = new Date(year.value, month.value, 1, 0);
					var lastDay = lastDateOfMonth(fdate);
					var w1 = getISOWeek(fdate);
					var w2 = getISOWeek(new Date(year.value, month.value, 8));
					var w3 = getISOWeek(new Date(year.value, month.value, lastDay - 7));
					var w4 = getISOWeek(new Date(year.value, month.value, lastDay));
					var wl = [w1];
					for (var i=w2; i<=w3; i++) {wl.push(i)};
						wl.push(w4);
					var ww = 0;
					for (var w in wl) {
						var wd = document.createElement('div'),
						wn = document.createElement('div');
						wn.style.color = 'gray';
						wn.appendChild(document.createTextNode(('0'+wl[w]).substr(-2)));
						wd.appendChild(wn);
						wn.style.width = '16pt';
						wn.style.display = 'inline-block';
						wn.style.textAlign = 'center';
						tab.appendChild(wd);
						for (var dd=1; dd<=7; dd++) {
							var dm = document.createElement('div'),
							dte = dd + (ww*7) - (fdate.getDay()+6)%7;
							if (dte === day.value) {day.highlighted = dm};
							if (dte > 0 && dte <= lastDay) {
								dm.appendChild(document.createTextNode(dte));
								dm.addEventListener('click', function () {
									day.value = Number(this.textContent);
									day.highlighted = this;
								})
							};
							wd.appendChild(dm);
							css(dm, {
								display: 'inline-block',
								width: '12pt',
								textAlign: 'center',
								cursor: 'pointer'
							})
						};
						ww++;
					}
				};

				/* modify input element */
				var parent = input.parentNode || document.body;
				if (input.nextSibling) {
					parent.insertBefore(popup, input.nextSibling);
				} else {
					parent.appendChild(popup);
				}
				var but = document.createElement('div');
				css(but, {
					width: 0,
					height: 0,
					borderLeft: '4px solid transparent',
					borderRight: '4px solid transparent',
					borderTop: '8px solid #444',
					cursor: 'pointer',
					left: - 12 + input.offsetLeft + input.clientWidth + 'px',
					top: 7 + input.offsetTop + 'px',
					position: 'absolute',
					zIndex: 1111
				});
				parent.insertBefore(but, input);
				if (input.value.match(/\d{4}-\d{2}-\d{2}/)) {
					toDate(new Date(input.value));
				}
				but.addEventListener('click', function (evt) {
					evt.stopPropagation();
					hidePopups({target:popup});
					popup.classList.add('click-me-away');
					popup.style.display = '';
				});
			}
			if (dom instanceof HTMLInputElement) {
				applyPolyfill(dom);
			} else if (dom instanceof NodeList) {
				for (var i=0; i<dom.length; i++) {
					applyPolyfill(dom[i]);
				}
			}
		}
	}
	
	if (typeof define === 'function') {
		define(nodepDatepicker);
	} else {
		window.nodepDatepicker = nodepDatepicker();
	}

})()
