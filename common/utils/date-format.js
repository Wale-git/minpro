module.exports = {
	parseTimeToNumber(time) {
		if (typeof time === 'string') {
			var times = time.split(':')
			if (times.length > 1) {
				time = parseInt(times[0], 10) * 60 + parseInt(times[1], 10)
			}
		}
		return time
	},
	dateFormater(date, mask, utc) {
		// You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
		if (arguments.length === 1 && Object.prototype.toString.call(date) === '[object String]' && !/\d/.test(date)) {
			mask = date
			date = undefined
		}
		// Passing date through Date applies Date.parse, if
		// necessary
		date = date ? new Date(date) : new Date()
		if (isNaN(date)) {
			throw SyntaxError('invalid date')
		}
		mask = String(masks[mask] || mask || masks['default'])
		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) === 'UTC:') {
			mask = mask.slice(4)
			utc = true
		}
		let _ = utc ? 'getUTC' : 'get'
		let d = date[_ + 'Date']()
		let D = date[_ + 'Day']()
		let m = date[_ + 'Month']()
		let y = date[_ + 'FullYear']()
		let H = date[_ + 'Hours']()
		let M = date[_ + 'Minutes']()
		let s = date[_ + 'Seconds']()
		let L = date[_ + 'Milliseconds']()
		let o = utc ? 0 : date.getTimezoneOffset()
		let flags = {
			d: d,
			dd: pad(d),
			ddd: i18n.dayNames[D],
			dddd: i18n.dayNames[D + 7],
			m: m + 1,
			mm: pad(m + 1),
			mmm: i18n.monthNames[m],
			mmmm: i18n.monthNames[m + 12],
			yy: String(y).slice(2),
			yyyy: y,
			h: H % 12 || 12,
			hh: pad(H % 12 || 12),
			H: H,
			HH: pad(H),
			M: M,
			MM: pad(M),
			s: s,
			ss: pad(s),
			l: pad(L, 3),
			L: pad(L > 99 ? Math.round(L / 10) : L),
			t: H < 12 ? 'a' : 'p',
			tt: H < 12 ? 'am' : 'pm',
			T: H < 12 ? 'A' : 'P',
			TT: H < 12 ? 'AM' : 'PM',
			Z: utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
			o: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
			S: ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
		}
		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1)
		})
	}
}

var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|'[^']*'|'[^']*'/g
const timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g
const timezoneClip = /[^-+\dA-Z]/g
let pad = function (val, len) {
	val = String(val)
	len = len || 2
	while (val.length < len) {
		val = '0' + val
	}
	return val
}
const i18n = {
	dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'January', 'February', 'March', 'April', 'May',
		'June', 'July', 'August', 'September', 'October', 'November', 'December']
}
const masks = {
	'default': 'ddd mmm dd yyyy HH:MM:ss',
	shortDate: 'm/d/yy',
	mediumDate: 'mmm d, yyyy',
	longDate: 'mmmm d, yyyy',
	fullDate: 'dddd, mmmm d, yyyy',
	shortTime: 'HH:MM',
	mediumTime: 'h:MM:ss TT',
	longTime: 'h:MM:ss TT Z',
	isoDate: 'yyyy-mm-dd',
	isoTime: 'HH:MM:ss',
	isoDateTime: 'yyyy-mm-dd\'T\'HH:MM:ss',
	isoUtcDateTime: 'yyyy-mm-dd\'T\'HH:MM:ss.lo',
	chineseDate: 'yyyy年mm月dd日',
	DateTime: 'yyyy-mm-dd HH:MM',
	chineseDatetime: 'yyyy年mm月dd日 HH点MM分',
	chineseshortDate: 'HH点MM分',
	DateTimeYMD: 'yyyy/mm/dd',
	pointYMD: 'yyyy.mm.dd',
	chineseDatetime2: 'yyyy年mm月dd日 HH:MM',
	chineseDate3: 'yyyy年mm月dd号 '
}