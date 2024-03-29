export function formatUserInfo(userInfo) {
  const genderMap = {
    M: '男',
    F: '女',
    U: '未知'
  }
  const _userInfo = {
    ...userInfo,
    gender: genderMap[userInfo.gender],
    createdAt: formatDate(userInfo.createdAt),
    birthdate: userInfo.birthdate ? formatDate(userInfo.birthdate) : '-'
  }
  return _userInfo
}

export function formatDate(value) {
  const _date = new Date(value)
  const year = _date.getFullYear()
  const month = _date.getMonth() + 1
  const date = _date.getDate()
  return fillZero(year) + '/' + fillZero(month) + '/' + fillZero(date)
}

export function fillZero(value) {
  return value >= 10 ? value : '0' + value
}

export async function delay(time = 800) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export function extractAgreements(str) {
  const reg = /<a[^>]*href=[ '"]([^"]*)[' "][^>]*>(.*?)<\/a>/gi
  const res = []
  while (reg.exec(str) !== null) {
    res.push({
      title: RegExp.$2,
      link: RegExp.$1
    })
  }
  return res
}

export function parseSearch(str = '') {
  if (!str) {
    return {}
  }
  return str.split('&').reduce((map, item) => {
    const [key, value] = item.split('=')
    map[key] = value
    return map
  }, {})
}
