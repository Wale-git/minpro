module.exports = {
  //用于生成UUID的字符集合
  _CHARS: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
  /**
   * 手机号校验
   * 手机号，13 14 15 17 18 19开头的11位数字
   */
  _cellphonePatten: /^1\d{10}$/,
  /**
   * 校验姓名
   */
  _namePatten: /^[0-9a-zA-Z]{1,24}|[\u4E00-\u9FA5]{1,12}$/,
  /**
   * 校验密码
   */
  _passwordPatten: /^[\da-zA-Z]{6,16}$/i,
  /**
   * 校验验证码
   */
  _codePatten: /^[a-zA-Z0-9]{6,10}$/i,
  /**
   * 去除空格特殊符号
   */
  _reDescText: /[\s，。！？、；：‘’“”（）《》【】]/g,

  /**
   * 去除首尾空格
   */
  _trim: function(value) {
    return value.replace(/(^\s*)|(\s*$)/g, '')
  },
  /**
   * 生成UUID
   */
  _getUUID: function(len, radix) {
    var deviceId = wx.getStorageSync('deviceId')
    if (!deviceId) {
      var chars = this._CHARS,
        uuid = [],
        i
      radix = radix || chars.length
      if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
      } else {
        // rfc4122, version 4 form
        var r
        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
        uuid[14] = '4'
        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
          if (!uuid[i]) {
            r = 0 | Math.random() * 16
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r]
          }
        }
      }
      deviceId = uuid.join('')
    }
    wx.setStorageSync('deviceId', deviceId)
    return deviceId
  },
  _valid: function(patten, value) {
    if (typeof patten === 'string') {
      patten = reg[patten] || new RegExp(patten)
    }
    if (patten && typeof patten.test === 'function') {
      return patten.test(value)
    } else {
      return false
    }
  },
  _validCellPhone: function(phone) {
    return this._valid(this._cellphonePatten, phone)
  },
  _validName: function(name) {
    return this._valid(this._namePatten, name)
  },
  _validPassword: function(password) {
    return this._valid(this._passwordPatten, password)
  },
  _validCode: function(code) {
    if (/^\d{6}$/i.test(code)) {
      return this._valid(this._codePatten, code)
    }
    return false
  },

  /**
   * 获取字符串长度
   */
  _checkStrLength: function(str) {
    var w = 0
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i)
      //单字节加1  
      if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
        w++
      } else {
        w += 2
      }
    }
    return w
  },
  /**
   * 验证是否有非法字符
   * @export
   * @param {any} value
   * @returns
   */
  validIllegalStr: function(value) {
    const arr = ['|', '%', '<', '>', '+', 'script', 'src', 'select', 'update', 'delete', 'insert']
    const lowerValue = value.substring(0).toLowerCase()
    for (let i = 0; i < arr.length; i++) {
      if (lowerValue.indexOf(arr[i]) >= 0) {
        return false
      }
    }
    return true
  },

  /**
   * 特殊符号校验
   */
  _validDescText: function(code) {
    return this._valid(this._reDescText, code)
  },

  /**
   * 是否包含非法字符
   */
  _hasSpecialChar: function(value) {
    var arr = new Array("|", "%", "<", ">", "+", "script", "src", "select", "update", "delete", "insert")
    var lowerValue = value.substring(0).toLowerCase()
    for (var i = 0; i < arr.length; i++) {
      if (lowerValue.indexOf(arr[i]) >= 0) {
        return arr[i]
      }
    }
    return false
  }
}