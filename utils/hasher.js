
const bcrypt = require('bcryptjs')
const hmac = require('crypto')

exports.dohash = (value, saltValue) => {
    const result = bcrypt.hash(value, saltValue)
    return result
}

exports.dohashcompare = (value, hashedValue) => {
    const result = bcrypt.compare(value, hashedValue)
    return result
}

exports.hmacProcess = (value, key)=>{
    const result = hmac.createHmac('sha256', key).update(value).digest('hex')
    return result
}