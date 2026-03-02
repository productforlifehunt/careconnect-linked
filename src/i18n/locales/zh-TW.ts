// Traditional Chinese - mirrors zh-CN structure with Traditional characters
import zhCN from "./zh-CN";
const zhTW: typeof zhCN = JSON.parse(JSON.stringify(zhCN));
// Override key differences for Traditional Chinese
Object.assign(zhTW.common, {
  signIn: "登入", signUp: "註冊", signOut: "登出", getStarted: "立即開始",
  search: "搜尋", save: "儲存", cancel: "取消", delete: "刪除", loading: "載入中...",
  saving: "儲存中...", viewAll: "查看全部", clearAll: "清除全部", clearFilters: "清除篩選",
  noResults: "未找到結果", password: "密碼", fullName: "全名", address: "地址",
  bookNow: "立即預約", learnMore: "了解更多", refresh: "重新整理", directions: "導航",
  pending: "待處理", confirmed: "已確認", completed: "已完成", cancelled: "已取消",
  inProgress: "進行中", caregiver: "照護人員", description: "描述", location: "位置",
  notifications: "通知", privacy: "隱私", reviews: "評價", verified: "已驗證",
  active: "活躍", inactive: "不活躍", weak: "弱", fair: "一般", good: "好", strong: "強",
  copyright: "© 2026 {{brand}}. 保留所有權利。", errorOccurred: "發生錯誤", tryAgain: "請重試",
  unavailable: "不可用", minCharsToSearch: "請輸入至少2個字元進行搜尋",
});
Object.assign(zhTW.nav, {
  dashboard: "控制面板", messages: "訊息", favorites: "收藏", gpsTracking: "GPS追蹤",
  myBookings: "我的預約", careGroups: "照護小組", careTeams: "照護團隊", findCare: "尋找照護",
  findHelp: "尋求幫助", caredOnes: "被照顧者", myLovedOnes: "我的親人",
  howItWorks: "使用方法", trustSafety: "信任與安全", myProfile: "我的資料",
  notifications: "通知", becomeCaregiver: "成為照護人員", toggleTheme: "切換主題",
});
zhTW.site.challenged.heroTitle = "失智症照護，";
zhTW.site.challenged.heroHighlight = "攜手同行";
zhTW.site.challenged.heroSubtitle = "與家人協調失智症照護，找到專業照護人員，確保親人安全——一個團隊，一個平台。";
zhTW.site.challenged.caredOneSingular = "親人";
zhTW.site.challenged.careGroupSingular = "照護團隊";
zhTW.site.careconnected.heroTitle = "尋找可信賴的照護，";
zhTW.site.careconnected.heroHighlight = "保持聯繫";
zhTW.site.careconnected.caredOneSingular = "被照顧者";
zhTW.site.careconnected.careGroupSingular = "照護小組";
zhTW.notFound = { title: "404", subtitle: "糟糕！頁面未找到", returnHome: "返回首頁" };
export default zhTW;
