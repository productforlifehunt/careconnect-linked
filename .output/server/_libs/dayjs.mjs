import { t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/dayjs/plugin/isoWeek.js
var require_isoWeek = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(e, t) {
		"object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).dayjs_plugin_isoWeek = t();
	})(exports, (function() {
		"use strict";
		var e = "day";
		return function(t, i, s) {
			var a = function(t) {
				return t.add(4 - t.isoWeekday(), e);
			};
			var d = i.prototype;
			d.isoWeekYear = function() {
				return a(this).year();
			}, d.isoWeek = function(t) {
				if (!this.$utils().u(t)) return this.add(7 * (t - this.isoWeek()), e);
				var i;
				var d;
				var n;
				var o;
				var r = a(this);
				var u = (i = this.isoWeekYear(), d = this.$u, n = (d ? s.utc : s)().year(i).startOf("year"), o = 4 - n.isoWeekday(), n.isoWeekday() > 4 && (o += 7), n.add(o, e));
				return r.diff(u, "week") + 1;
			}, d.isoWeekday = function(e) {
				return this.$utils().u(e) ? this.day() || 7 : this.day(this.day() % 7 ? e : e - 7);
			};
			var n = d.startOf;
			d.startOf = function(e, t) {
				var i = this.$utils();
				var s = !!i.u(t) || t;
				return "isoweek" === i.p(e) ? s ? this.date(this.date() - (this.isoWeekday() - 1)).startOf("day") : this.date(this.date() - 1 - (this.isoWeekday() - 1) + 7).endOf("day") : n.bind(this)(e, t);
			};
		};
	}));
}));
//#endregion
//#region node_modules/dayjs/plugin/customParseFormat.js
var require_customParseFormat = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(e, t) {
		"object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).dayjs_plugin_customParseFormat = t();
	})(exports, (function() {
		"use strict";
		var e = {
			LTS: "h:mm:ss A",
			LT: "h:mm A",
			L: "MM/DD/YYYY",
			LL: "MMMM D, YYYY",
			LLL: "MMMM D, YYYY h:mm A",
			LLLL: "dddd, MMMM D, YYYY h:mm A"
		};
		var t = /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g;
		var n = /\d/;
		var r = /\d\d/;
		var i = /\d\d?/;
		var o = /\d*[^-_:/,()\s\d]+/;
		var s = {};
		var a = function(e) {
			return (e = +e) + (e > 68 ? 1900 : 2e3);
		};
		var f = function(e) {
			return function(t) {
				this[e] = +t;
			};
		};
		var h = [/[+-]\d\d:?(\d\d)?|Z/, function(e) {
			(this.zone || (this.zone = {})).offset = function(e) {
				if (!e) return 0;
				if ("Z" === e) return 0;
				var t = e.match(/([+-]|\d\d)/g);
				var n = 60 * t[1] + (+t[2] || 0);
				return 0 === n ? 0 : "+" === t[0] ? -n : n;
			}(e);
		}];
		var u = function(e) {
			var t = s[e];
			return t && (t.indexOf ? t : t.s.concat(t.f));
		};
		var d = function(e, t) {
			var n;
			var r = s.meridiem;
			if (r) {
				for (var i = 1; i <= 24; i += 1) if (e.indexOf(r(i, 0, t)) > -1) {
					n = i > 12;
					break;
				}
			} else n = e === (t ? "pm" : "PM");
			return n;
		};
		var c = {
			A: [o, function(e) {
				this.afternoon = d(e, !1);
			}],
			a: [o, function(e) {
				this.afternoon = d(e, !0);
			}],
			Q: [n, function(e) {
				this.month = 3 * (e - 1) + 1;
			}],
			S: [n, function(e) {
				this.milliseconds = 100 * +e;
			}],
			SS: [r, function(e) {
				this.milliseconds = 10 * +e;
			}],
			SSS: [/\d{3}/, function(e) {
				this.milliseconds = +e;
			}],
			s: [i, f("seconds")],
			ss: [i, f("seconds")],
			m: [i, f("minutes")],
			mm: [i, f("minutes")],
			H: [i, f("hours")],
			h: [i, f("hours")],
			HH: [i, f("hours")],
			hh: [i, f("hours")],
			D: [i, f("day")],
			DD: [r, f("day")],
			Do: [o, function(e) {
				var t = s.ordinal;
				var n = e.match(/\d+/);
				if (this.day = n[0], t) for (var r = 1; r <= 31; r += 1) t(r).replace(/\[|\]/g, "") === e && (this.day = r);
			}],
			w: [i, f("week")],
			ww: [r, f("week")],
			M: [i, f("month")],
			MM: [r, f("month")],
			MMM: [o, function(e) {
				var t = u("months");
				var n = (u("monthsShort") || t.map((function(e) {
					return e.slice(0, 3);
				}))).indexOf(e) + 1;
				if (n < 1) throw new Error();
				this.month = n % 12 || n;
			}],
			MMMM: [o, function(e) {
				var t = u("months").indexOf(e) + 1;
				if (t < 1) throw new Error();
				this.month = t % 12 || t;
			}],
			Y: [/[+-]?\d+/, f("year")],
			YY: [r, function(e) {
				this.year = a(e);
			}],
			YYYY: [/\d{4}/, f("year")],
			Z: h,
			ZZ: h
		};
		function l(n) {
			var r = n;
			var i = s && s.formats;
			for (var o = (n = r.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g, (function(t, n, r) {
				var o = r && r.toUpperCase();
				return n || i[r] || e[r] || i[o].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, (function(e, t, n) {
					return t || n.slice(1);
				}));
			}))).match(t), a = o.length, f = 0; f < a; f += 1) {
				var h = o[f];
				var u = c[h];
				var d = u && u[0];
				var l = u && u[1];
				o[f] = l ? {
					regex: d,
					parser: l
				} : h.replace(/^\[|\]$/g, "");
			}
			return function(e) {
				for (var t = {}, n = 0, r = 0; n < a; n += 1) {
					var i = o[n];
					if ("string" == typeof i) r += i.length;
					else {
						var s = i.regex;
						var f = i.parser;
						var h = e.slice(r);
						var u = s.exec(h)[0];
						f.call(t, u), e = e.replace(u, "");
					}
				}
				return function(e) {
					var t = e.afternoon;
					if (void 0 !== t) {
						var n = e.hours;
						t ? n < 12 && (e.hours += 12) : 12 === n && (e.hours = 0), delete e.afternoon;
					}
				}(t), t;
			};
		}
		return function(e, t, n) {
			n.p.customParseFormat = !0, e && e.parseTwoDigitYear && (a = e.parseTwoDigitYear);
			var r = t.prototype;
			var i = r.parse;
			r.parse = function(e) {
				var t = e.date;
				var r = e.utc;
				var o = e.args;
				this.$u = r;
				var a = o[1];
				if ("string" == typeof a) {
					var f = !0 === o[2];
					var h = !0 === o[3];
					var u = f || h;
					var d = o[2];
					h && (d = o[2]), s = this.$locale(), !f && d && (s = n.Ls[d]), this.$d = function(e, t, n, r) {
						try {
							if (["x", "X"].indexOf(t) > -1) return /* @__PURE__ */ new Date(("X" === t ? 1e3 : 1) * e);
							var i = l(t)(e);
							var o = i.year;
							var s = i.month;
							var a = i.day;
							var f = i.hours;
							var h = i.minutes;
							var u = i.seconds;
							var d = i.milliseconds;
							var c = i.zone;
							var m = i.week;
							var M = /* @__PURE__ */ new Date();
							var Y = a || (o || s ? 1 : M.getDate());
							var p = o || M.getFullYear();
							var v = 0;
							o && !s || (v = s > 0 ? s - 1 : M.getMonth());
							var D;
							var w = f || 0;
							var g = h || 0;
							var y = u || 0;
							var L = d || 0;
							return c ? new Date(Date.UTC(p, v, Y, w, g, y, L + 60 * c.offset * 1e3)) : n ? new Date(Date.UTC(p, v, Y, w, g, y, L)) : (D = new Date(p, v, Y, w, g, y, L), m && (D = r(D).week(m).toDate()), D);
						} catch (e) {
							return /* @__PURE__ */ new Date("");
						}
					}(t, a, r, n), this.init(), d && !0 !== d && (this.$L = this.locale(d).$L), u && t != this.format(a) && (this.$d = /* @__PURE__ */ new Date("")), s = {};
				} else if (a instanceof Array) for (var c = a.length, m = 1; m <= c; m += 1) {
					o[1] = a[m - 1];
					var M = n.apply(this, o);
					if (M.isValid()) {
						this.$d = M.$d, this.$L = M.$L, this.init();
						break;
					}
					m === c && (this.$d = /* @__PURE__ */ new Date(""));
				}
				else i.call(this, e);
			};
		};
	}));
}));
//#endregion
//#region node_modules/dayjs/plugin/advancedFormat.js
var require_advancedFormat = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(e, t) {
		"object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).dayjs_plugin_advancedFormat = t();
	})(exports, (function() {
		"use strict";
		return function(e, t) {
			var r = t.prototype;
			var n = r.format;
			r.format = function(e) {
				var t = this;
				var r = this.$locale();
				if (!this.isValid()) return n.bind(this)(e);
				var s = this.$utils();
				var a = (e || "YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g, (function(e) {
					switch (e) {
						case "Q": return Math.ceil((t.$M + 1) / 3);
						case "Do": return r.ordinal(t.$D);
						case "gggg": return t.weekYear();
						case "GGGG": return t.isoWeekYear();
						case "wo": return r.ordinal(t.week(), "W");
						case "w":
						case "ww": return s.s(t.week(), "w" === e ? 1 : 2, "0");
						case "W":
						case "WW": return s.s(t.isoWeek(), "W" === e ? 1 : 2, "0");
						case "k":
						case "kk": return s.s(String(0 === t.$H ? 24 : t.$H), "k" === e ? 1 : 2, "0");
						case "X": return Math.floor(t.$d.getTime() / 1e3);
						case "x": return t.$d.getTime();
						case "z": return "[" + t.offsetName() + "]";
						case "zzz": return "[" + t.offsetName("long") + "]";
						default: return e;
					}
				}));
				return n.bind(this)(a);
			};
		};
	}));
}));
//#endregion
//#region node_modules/dayjs/plugin/duration.js
var require_duration = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(t, s) {
		"object" == typeof exports && "undefined" != typeof module ? module.exports = s() : "function" == typeof define && define.amd ? define(s) : (t = "undefined" != typeof globalThis ? globalThis : t || self).dayjs_plugin_duration = s();
	})(exports, (function() {
		"use strict";
		var t;
		var s;
		var n = 1e3;
		var i = 6e4;
		var e = 36e5;
		var r = 864e5;
		var o = 31536e6;
		var u = 2628e6;
		var d = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
		var a = /\[([^\]]+)]|YYYY|YY|Y|M{1,2}|D{1,2}|H{1,2}|m{1,2}|s{1,2}|SSS/g;
		var h = {
			years: o,
			months: u,
			days: r,
			hours: e,
			minutes: i,
			seconds: n,
			milliseconds: 1,
			weeks: 6048e5
		};
		var c = function(t) {
			return t instanceof g;
		};
		var f = function(t, s, n) {
			return new g(t, n, s.$l);
		};
		var m = function(t) {
			return s.p(t) + "s";
		};
		var l = function(t) {
			return t < 0;
		};
		var $ = function(t) {
			return l(t) ? Math.ceil(t) : Math.floor(t);
		};
		var y = function(t) {
			return Math.abs(t);
		};
		var v = function(t, s) {
			return t ? l(t) ? {
				negative: !0,
				format: "" + y(t) + s
			} : {
				negative: !1,
				format: "" + t + s
			} : {
				negative: !1,
				format: ""
			};
		};
		var g = function() {
			function l(t, s, n) {
				var i = this;
				if (this.$d = {}, this.$l = n, void 0 === t && (this.$ms = 0, this.parseFromMilliseconds()), s) return f(t * h[m(s)], this);
				if ("number" == typeof t) return this.$ms = t, this.parseFromMilliseconds(), this;
				if ("object" == typeof t) return Object.keys(t).forEach((function(s) {
					i.$d[m(s)] = t[s];
				})), this.calMilliseconds(), this;
				if ("string" == typeof t) {
					var e = t.match(d);
					if (e) {
						var r = e.slice(2).map((function(t) {
							return null != t ? Number(t) : 0;
						}));
						return this.$d.years = r[0], this.$d.months = r[1], this.$d.weeks = r[2], this.$d.days = r[3], this.$d.hours = r[4], this.$d.minutes = r[5], this.$d.seconds = r[6], this.calMilliseconds(), this;
					}
				}
				return this;
			}
			var y = l.prototype;
			return y.calMilliseconds = function() {
				var t = this;
				this.$ms = Object.keys(this.$d).reduce((function(s, n) {
					return s + (t.$d[n] || 0) * h[n];
				}), 0);
			}, y.parseFromMilliseconds = function() {
				var t = this.$ms;
				this.$d.years = $(t / o), t %= o, this.$d.months = $(t / u), t %= u, this.$d.days = $(t / r), t %= r, this.$d.hours = $(t / e), t %= e, this.$d.minutes = $(t / i), t %= i, this.$d.seconds = $(t / n), t %= n, this.$d.milliseconds = t;
			}, y.toISOString = function() {
				var t = v(this.$d.years, "Y");
				var s = v(this.$d.months, "M");
				var n = +this.$d.days || 0;
				this.$d.weeks && (n += 7 * this.$d.weeks);
				var i = v(n, "D");
				var e = v(this.$d.hours, "H");
				var r = v(this.$d.minutes, "M");
				var o = this.$d.seconds || 0;
				this.$d.milliseconds && (o += this.$d.milliseconds / 1e3, o = Math.round(1e3 * o) / 1e3);
				var u = v(o, "S");
				var d = t.negative || s.negative || i.negative || e.negative || r.negative || u.negative;
				var a = e.format || r.format || u.format ? "T" : "";
				var h = (d ? "-" : "") + "P" + t.format + s.format + i.format + a + e.format + r.format + u.format;
				return "P" === h || "-P" === h ? "P0D" : h;
			}, y.toJSON = function() {
				return this.toISOString();
			}, y.format = function(t) {
				var n = t || "YYYY-MM-DDTHH:mm:ss";
				var i = {
					Y: this.$d.years,
					YY: s.s(this.$d.years, 2, "0"),
					YYYY: s.s(this.$d.years, 4, "0"),
					M: this.$d.months,
					MM: s.s(this.$d.months, 2, "0"),
					D: this.$d.days,
					DD: s.s(this.$d.days, 2, "0"),
					H: this.$d.hours,
					HH: s.s(this.$d.hours, 2, "0"),
					m: this.$d.minutes,
					mm: s.s(this.$d.minutes, 2, "0"),
					s: this.$d.seconds,
					ss: s.s(this.$d.seconds, 2, "0"),
					SSS: s.s(this.$d.milliseconds, 3, "0")
				};
				return n.replace(a, (function(t, s) {
					return s || String(i[t]);
				}));
			}, y.as = function(t) {
				return this.$ms / h[m(t)];
			}, y.get = function(t) {
				var s = this.$ms;
				var n = m(t);
				return "milliseconds" === n ? s %= 1e3 : s = "weeks" === n ? $(s / h[n]) : this.$d[n], s || 0;
			}, y.add = function(t, s, n) {
				var i;
				return i = s ? t * h[m(s)] : c(t) ? t.$ms : f(t, this).$ms, f(this.$ms + i * (n ? -1 : 1), this);
			}, y.subtract = function(t, s) {
				return this.add(t, s, !0);
			}, y.locale = function(t) {
				var s = this.clone();
				return s.$l = t, s;
			}, y.clone = function() {
				return f(this.$ms, this);
			}, y.humanize = function(s) {
				return t().add(this.$ms, "ms").locale(this.$l).fromNow(!s);
			}, y.valueOf = function() {
				return this.asMilliseconds();
			}, y.milliseconds = function() {
				return this.get("milliseconds");
			}, y.asMilliseconds = function() {
				return this.as("milliseconds");
			}, y.seconds = function() {
				return this.get("seconds");
			}, y.asSeconds = function() {
				return this.as("seconds");
			}, y.minutes = function() {
				return this.get("minutes");
			}, y.asMinutes = function() {
				return this.as("minutes");
			}, y.hours = function() {
				return this.get("hours");
			}, y.asHours = function() {
				return this.as("hours");
			}, y.days = function() {
				return this.get("days");
			}, y.asDays = function() {
				return this.as("days");
			}, y.weeks = function() {
				return this.get("weeks");
			}, y.asWeeks = function() {
				return this.as("weeks");
			}, y.months = function() {
				return this.get("months");
			}, y.asMonths = function() {
				return this.as("months");
			}, y.years = function() {
				return this.get("years");
			}, y.asYears = function() {
				return this.as("years");
			}, l;
		}();
		var p = function(t, s, n) {
			return t.add(s.years() * n, "y").add(s.months() * n, "M").add(s.days() * n, "d").add(s.hours() * n, "h").add(s.minutes() * n, "m").add(s.seconds() * n, "s").add(s.milliseconds() * n, "ms");
		};
		return function(n, i, e) {
			t = e, s = e().$utils(), e.duration = function(t, s) {
				return f(t, { $l: e.locale() }, s);
			}, e.isDuration = c;
			var r = i.prototype.add;
			var o = i.prototype.subtract;
			i.prototype.add = function(t, s) {
				return c(t) ? p(this, t, 1) : r.bind(this)(t, s);
			}, i.prototype.subtract = function(t, s) {
				return c(t) ? p(this, t, -1) : o.bind(this)(t, s);
			};
		};
	}));
}));
//#endregion
export { require_isoWeek as i, require_advancedFormat as n, require_customParseFormat as r, require_duration as t };
