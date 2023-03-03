import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.locale('zh-cn')
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export default dayjs
