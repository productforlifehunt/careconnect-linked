import { s as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-DgaEzEqC.mjs";
import { n as CardContent, t as Card } from "./card-DGU2jav_.mjs";
import { t as Badge } from "./badge-B2YCAhUo.mjs";
import { t as Input } from "./input-4rcasKp7.mjs";
import { Dn as CircleCheckBig, Dt as MapPin, G as Search, L as Shield, T as Star, Xn as ArrowRight, jt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as useTranslation } from "../_libs/react-i18next.mjs";
import { r as useSite } from "./SiteContext-Br0kF93Q.mjs";
import { i as careServiceTypeLabel } from "./source.wordpress-CI9kg3_M.mjs";
import { wn as useProviders } from "./use-care-data-7GR_eJDG.mjs";
import { i as useNavigate$1, t as Link$1 } from "./router-compat-CRbRSfhz.mjs";
import { t as BrandMark } from "./BrandMark-s4GFHX6D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Index-TCYfk3yf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var hero_image_default = "/assets/hero-image-CL9FYy6H.jpg";
var hero_image_cn_default = "/assets/hero-image-cn-Bg5M4dxx.jpg";
var hero_image_carecnc_default = "/assets/hero-image-carecnc-B4WAksXr.jpg";
var CN_CITIES = [
	{
		name: "北京",
		pinyin: "beijing",
		zip: "100000",
		province: "北京"
	},
	{
		name: "上海",
		pinyin: "shanghai",
		zip: "200000",
		province: "上海"
	},
	{
		name: "广州",
		pinyin: "guangzhou",
		zip: "510000",
		province: "广东"
	},
	{
		name: "深圳",
		pinyin: "shenzhen",
		zip: "518000",
		province: "广东"
	},
	{
		name: "天津",
		pinyin: "tianjin",
		zip: "300000",
		province: "天津"
	},
	{
		name: "重庆",
		pinyin: "chongqing",
		zip: "400000",
		province: "重庆"
	},
	{
		name: "成都",
		pinyin: "chengdu",
		zip: "610000",
		province: "四川"
	},
	{
		name: "杭州",
		pinyin: "hangzhou",
		zip: "310000",
		province: "浙江"
	},
	{
		name: "武汉",
		pinyin: "wuhan",
		zip: "430000",
		province: "湖北"
	},
	{
		name: "西安",
		pinyin: "xian",
		zip: "710000",
		province: "陕西"
	},
	{
		name: "南京",
		pinyin: "nanjing",
		zip: "210000",
		province: "江苏"
	},
	{
		name: "苏州",
		pinyin: "suzhou",
		zip: "215000",
		province: "江苏"
	},
	{
		name: "无锡",
		pinyin: "wuxi",
		zip: "214000",
		province: "江苏"
	},
	{
		name: "常州",
		pinyin: "changzhou",
		zip: "213000",
		province: "江苏"
	},
	{
		name: "南通",
		pinyin: "nantong",
		zip: "226000",
		province: "江苏"
	},
	{
		name: "徐州",
		pinyin: "xuzhou",
		zip: "221000",
		province: "江苏"
	},
	{
		name: "扬州",
		pinyin: "yangzhou",
		zip: "225000",
		province: "江苏"
	},
	{
		name: "宁波",
		pinyin: "ningbo",
		zip: "315000",
		province: "浙江"
	},
	{
		name: "温州",
		pinyin: "wenzhou",
		zip: "325000",
		province: "浙江"
	},
	{
		name: "绍兴",
		pinyin: "shaoxing",
		zip: "312000",
		province: "浙江"
	},
	{
		name: "嘉兴",
		pinyin: "jiaxing",
		zip: "314000",
		province: "浙江"
	},
	{
		name: "金华",
		pinyin: "jinhua",
		zip: "321000",
		province: "浙江"
	},
	{
		name: "台州",
		pinyin: "taizhou",
		zip: "318000",
		province: "浙江"
	},
	{
		name: "青岛",
		pinyin: "qingdao",
		zip: "266000",
		province: "山东"
	},
	{
		name: "济南",
		pinyin: "jinan",
		zip: "250000",
		province: "山东"
	},
	{
		name: "烟台",
		pinyin: "yantai",
		zip: "264000",
		province: "山东"
	},
	{
		name: "潍坊",
		pinyin: "weifang",
		zip: "261000",
		province: "山东"
	},
	{
		name: "临沂",
		pinyin: "linyi",
		zip: "276000",
		province: "山东"
	},
	{
		name: "淄博",
		pinyin: "zibo",
		zip: "255000",
		province: "山东"
	},
	{
		name: "济宁",
		pinyin: "jining",
		zip: "272000",
		province: "山东"
	},
	{
		name: "泰安",
		pinyin: "taian",
		zip: "271000",
		province: "山东"
	},
	{
		name: "东莞",
		pinyin: "dongguan",
		zip: "523000",
		province: "广东"
	},
	{
		name: "佛山",
		pinyin: "foshan",
		zip: "528000",
		province: "广东"
	},
	{
		name: "中山",
		pinyin: "zhongshan",
		zip: "528400",
		province: "广东"
	},
	{
		name: "珠海",
		pinyin: "zhuhai",
		zip: "519000",
		province: "广东"
	},
	{
		name: "惠州",
		pinyin: "huizhou",
		zip: "516000",
		province: "广东"
	},
	{
		name: "汕头",
		pinyin: "shantou",
		zip: "515000",
		province: "广东"
	},
	{
		name: "湛江",
		pinyin: "zhanjiang",
		zip: "524000",
		province: "广东"
	},
	{
		name: "江门",
		pinyin: "jiangmen",
		zip: "529000",
		province: "广东"
	},
	{
		name: "肇庆",
		pinyin: "zhaoqing",
		zip: "526000",
		province: "广东"
	},
	{
		name: "茂名",
		pinyin: "maoming",
		zip: "525000",
		province: "广东"
	},
	{
		name: "厦门",
		pinyin: "xiamen",
		zip: "361000",
		province: "福建"
	},
	{
		name: "福州",
		pinyin: "fuzhou",
		zip: "350000",
		province: "福建"
	},
	{
		name: "泉州",
		pinyin: "quanzhou",
		zip: "362000",
		province: "福建"
	},
	{
		name: "漳州",
		pinyin: "zhangzhou",
		zip: "363000",
		province: "福建"
	},
	{
		name: "莆田",
		pinyin: "putian",
		zip: "351100",
		province: "福建"
	},
	{
		name: "长沙",
		pinyin: "changsha",
		zip: "410000",
		province: "湖南"
	},
	{
		name: "株洲",
		pinyin: "zhuzhou",
		zip: "412000",
		province: "湖南"
	},
	{
		name: "湘潭",
		pinyin: "xiangtan",
		zip: "411100",
		province: "湖南"
	},
	{
		name: "衡阳",
		pinyin: "hengyang",
		zip: "421000",
		province: "湖南"
	},
	{
		name: "岳阳",
		pinyin: "yueyang",
		zip: "414000",
		province: "湖南"
	},
	{
		name: "常德",
		pinyin: "changde",
		zip: "415000",
		province: "湖南"
	},
	{
		name: "郑州",
		pinyin: "zhengzhou",
		zip: "450000",
		province: "河南"
	},
	{
		name: "洛阳",
		pinyin: "luoyang",
		zip: "471000",
		province: "河南"
	},
	{
		name: "开封",
		pinyin: "kaifeng",
		zip: "475000",
		province: "河南"
	},
	{
		name: "新乡",
		pinyin: "xinxiang",
		zip: "453000",
		province: "河南"
	},
	{
		name: "南阳",
		pinyin: "nanyang",
		zip: "473000",
		province: "河南"
	},
	{
		name: "石家庄",
		pinyin: "shijiazhuang",
		zip: "050000",
		province: "河北"
	},
	{
		name: "唐山",
		pinyin: "tangshan",
		zip: "063000",
		province: "河北"
	},
	{
		name: "保定",
		pinyin: "baoding",
		zip: "071000",
		province: "河北"
	},
	{
		name: "邯郸",
		pinyin: "handan",
		zip: "056000",
		province: "河北"
	},
	{
		name: "秦皇岛",
		pinyin: "qinhuangdao",
		zip: "066000",
		province: "河北"
	},
	{
		name: "廊坊",
		pinyin: "langfang",
		zip: "065000",
		province: "河北"
	},
	{
		name: "沈阳",
		pinyin: "shenyang",
		zip: "110000",
		province: "辽宁"
	},
	{
		name: "大连",
		pinyin: "dalian",
		zip: "116000",
		province: "辽宁"
	},
	{
		name: "鞍山",
		pinyin: "anshan",
		zip: "114000",
		province: "辽宁"
	},
	{
		name: "抚顺",
		pinyin: "fushun",
		zip: "113000",
		province: "辽宁"
	},
	{
		name: "锦州",
		pinyin: "jinzhou",
		zip: "121000",
		province: "辽宁"
	},
	{
		name: "长春",
		pinyin: "changchun",
		zip: "130000",
		province: "吉林"
	},
	{
		name: "吉林",
		pinyin: "jilin",
		zip: "132000",
		province: "吉林"
	},
	{
		name: "哈尔滨",
		pinyin: "haerbin",
		zip: "150000",
		province: "黑龙江"
	},
	{
		name: "大庆",
		pinyin: "daqing",
		zip: "163000",
		province: "黑龙江"
	},
	{
		name: "齐齐哈尔",
		pinyin: "qiqihaer",
		zip: "161000",
		province: "黑龙江"
	},
	{
		name: "合肥",
		pinyin: "hefei",
		zip: "230000",
		province: "安徽"
	},
	{
		name: "芜湖",
		pinyin: "wuhu",
		zip: "241000",
		province: "安徽"
	},
	{
		name: "蚌埠",
		pinyin: "bengbu",
		zip: "233000",
		province: "安徽"
	},
	{
		name: "阜阳",
		pinyin: "fuyang",
		zip: "236000",
		province: "安徽"
	},
	{
		name: "南昌",
		pinyin: "nanchang",
		zip: "330000",
		province: "江西"
	},
	{
		name: "九江",
		pinyin: "jiujiang",
		zip: "332000",
		province: "江西"
	},
	{
		name: "赣州",
		pinyin: "ganzhou",
		zip: "341000",
		province: "江西"
	},
	{
		name: "上饶",
		pinyin: "shangrao",
		zip: "334000",
		province: "江西"
	},
	{
		name: "宜春",
		pinyin: "yichun",
		zip: "336000",
		province: "江西"
	},
	{
		name: "太原",
		pinyin: "taiyuan",
		zip: "030000",
		province: "山西"
	},
	{
		name: "大同",
		pinyin: "datong",
		zip: "037000",
		province: "山西"
	},
	{
		name: "运城",
		pinyin: "yuncheng",
		zip: "044000",
		province: "山西"
	},
	{
		name: "临汾",
		pinyin: "linfen",
		zip: "041000",
		province: "山西"
	},
	{
		name: "呼和浩特",
		pinyin: "huhehaote",
		zip: "010000",
		province: "内蒙古"
	},
	{
		name: "包头",
		pinyin: "baotou",
		zip: "014000",
		province: "内蒙古"
	},
	{
		name: "鄂尔多斯",
		pinyin: "eerduosi",
		zip: "017000",
		province: "内蒙古"
	},
	{
		name: "赤峰",
		pinyin: "chifeng",
		zip: "024000",
		province: "内蒙古"
	},
	{
		name: "南宁",
		pinyin: "nanning",
		zip: "530000",
		province: "广西"
	},
	{
		name: "柳州",
		pinyin: "liuzhou",
		zip: "545000",
		province: "广西"
	},
	{
		name: "桂林",
		pinyin: "guilin",
		zip: "541000",
		province: "广西"
	},
	{
		name: "梧州",
		pinyin: "wuzhou",
		zip: "543000",
		province: "广西"
	},
	{
		name: "玉林",
		pinyin: "yulin",
		zip: "537000",
		province: "广西"
	},
	{
		name: "海口",
		pinyin: "haikou",
		zip: "570000",
		province: "海南"
	},
	{
		name: "三亚",
		pinyin: "sanya",
		zip: "572000",
		province: "海南"
	},
	{
		name: "贵阳",
		pinyin: "guiyang",
		zip: "550000",
		province: "贵州"
	},
	{
		name: "遵义",
		pinyin: "zunyi",
		zip: "563000",
		province: "贵州"
	},
	{
		name: "昆明",
		pinyin: "kunming",
		zip: "650000",
		province: "云南"
	},
	{
		name: "大理",
		pinyin: "dali",
		zip: "671000",
		province: "云南"
	},
	{
		name: "丽江",
		pinyin: "lijiang",
		zip: "674100",
		province: "云南"
	},
	{
		name: "曲靖",
		pinyin: "qujing",
		zip: "655000",
		province: "云南"
	},
	{
		name: "拉萨",
		pinyin: "lasa",
		zip: "850000",
		province: "西藏"
	},
	{
		name: "兰州",
		pinyin: "lanzhou",
		zip: "730000",
		province: "甘肃"
	},
	{
		name: "天水",
		pinyin: "tianshui",
		zip: "741000",
		province: "甘肃"
	},
	{
		name: "西宁",
		pinyin: "xining",
		zip: "810000",
		province: "青海"
	},
	{
		name: "银川",
		pinyin: "yinchuan",
		zip: "750000",
		province: "宁夏"
	},
	{
		name: "乌鲁木齐",
		pinyin: "wulumuqi",
		zip: "830000",
		province: "新疆"
	},
	{
		name: "喀什",
		pinyin: "kashi",
		zip: "844000",
		province: "新疆"
	},
	{
		name: "伊宁",
		pinyin: "yining",
		zip: "835000",
		province: "新疆"
	},
	{
		name: "克拉玛依",
		pinyin: "kelamayi",
		zip: "834000",
		province: "新疆"
	},
	{
		name: "绵阳",
		pinyin: "mianyang",
		zip: "621000",
		province: "四川"
	},
	{
		name: "德阳",
		pinyin: "deyang",
		zip: "618000",
		province: "四川"
	},
	{
		name: "宜宾",
		pinyin: "yibin",
		zip: "644000",
		province: "四川"
	},
	{
		name: "南充",
		pinyin: "nanchong",
		zip: "637000",
		province: "四川"
	},
	{
		name: "泸州",
		pinyin: "luzhou",
		zip: "646000",
		province: "四川"
	},
	{
		name: "乐山",
		pinyin: "leshan",
		zip: "614000",
		province: "四川"
	},
	{
		name: "黄石",
		pinyin: "huangshi",
		zip: "435000",
		province: "湖北"
	},
	{
		name: "宜昌",
		pinyin: "yichang",
		zip: "443000",
		province: "湖北"
	},
	{
		name: "襄阳",
		pinyin: "xiangyang",
		zip: "441000",
		province: "湖北"
	},
	{
		name: "荆州",
		pinyin: "jingzhou",
		zip: "434000",
		province: "湖北"
	},
	{
		name: "十堰",
		pinyin: "shiyan",
		zip: "442000",
		province: "湖北"
	},
	{
		name: "香港",
		pinyin: "xianggang",
		zip: "999077",
		province: "香港"
	},
	{
		name: "澳门",
		pinyin: "aomen",
		zip: "999078",
		province: "澳门"
	},
	{
		name: "台北",
		pinyin: "taibei",
		zip: "100",
		province: "台湾"
	}
];
function searchCnCities(query, limit = 10) {
	const q = query.trim().toLowerCase();
	if (!q) return [];
	return CN_CITIES.filter((c) => c.name.includes(q) || c.pinyin.startsWith(q) || c.zip.startsWith(q) || c.province.includes(q)).slice(0, limit);
}
var Index = () => {
	const navigate = useNavigate$1();
	const site = useSite();
	const { t, i18n } = useTranslation();
	const isChinese = i18n.language?.startsWith("zh");
	const isSafety = site.family === "notchsafety";
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [locationQuery, setLocationQuery] = (0, import_react.useState)("");
	const paidCare = site.features.paidCaregivers;
	const { data: topProviders, isLoading } = useProviders({ sortBy: "rating" });
	const featuredProviders = (topProviders || []).slice(0, 3);
	const handleSearch = () => {
		const params = new URLSearchParams();
		if (searchQuery) params.set("q", searchQuery);
		if (locationQuery) params.set("location", locationQuery);
		navigate(`/search?${params.toString()}`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-inspector-id": "pages/Index/Index/div/0",
		"data-inspector-source": "pages/Index.tsx:47:5:846dd61817740bc6ba8b1ce14183a1f44c506623273f9638549d1b29df92915c:1",
		className: "min-h-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"data-inspector-id": "pages/Index/Index/section/0",
				"data-inspector-source": "pages/Index.tsx:49:7:9df5c4f87dc1be920487f0765d42f9ed3be943c073498dc735f2bacded4c4778:1",
				className: "relative overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Index/Index/div/1",
					"data-inspector-source": "pages/Index.tsx:50:9:f3c41ad4bf6831101c4b577bb8d8eb8cbaede91d45c038261eca5bbd25f41207:1",
					className: "absolute inset-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						"data-inspector-id": "pages/Index/Index/img/0",
						"data-inspector-source": "pages/Index.tsx:51:11:a724e2fba7dd465d57426e1f4bc1dae52bd4d6ae2845366647c3d078bf22ed63:1",
						src: isSafety ? isChinese ? hero_image_carecnc_default : hero_image_default : site.id === "carecnc" && isChinese ? hero_image_carecnc_default : isChinese && site.family === "challenged" ? hero_image_cn_default : hero_image_default,
						alt: isSafety ? isChinese ? "家人一起查看位置地图" : "A family viewing their location map together" : isChinese ? "用心的护理" : "Compassionate caregiving",
						width: 1536,
						height: 864,
						className: "w-full h-full object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/Index/Index/div/2",
						"data-inspector-source": "pages/Index.tsx:66:11:8777458440cfbef8877513571cfac714f6a9cb8baba9bf068b5ec4f7d8441c47:1",
						className: site.id === "carecnc" ? "absolute inset-0 bg-gradient-to-r from-card/85 via-card/40 to-transparent" : isSafety ? "absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent" : "absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/Index/Index/div/3",
					"data-inspector-source": "pages/Index.tsx:76:9:841d5567597ac977ba3e8b15e9fcef87075bee07c73e047520adc40297f71e80:1",
					className: "relative max-w-6xl mx-auto px-4 py-12 sm:py-16 md:py-24 lg:py-32",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Index/Index/div/4",
						"data-inspector-source": "pages/Index.tsx:77:11:26a6433a1ec3966fac938550d111ce65384165749c9b2a8e3cc23219914e95f8:1",
						className: "max-w-3xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								"data-inspector-id": "pages/Index/Index/h1/0",
								"data-inspector-source": "pages/Index.tsx:78:13:aa176e704499ded5ba5c2e7ee3735137bc5c81951097929e81d6389c72b90dd5:1",
								className: `text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-[1.1] tracking-tight animate-fade-in max-w-[14ch] ${site.id === "carecnc" ? "text-foreground" : "text-primary-foreground"}`,
								children: [
									t(`site.${site.id}.heroTitle`),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "pages/Index/Index/span/0",
										"data-inspector-source": "pages/Index.tsx:80:15:de69a986746df925d70c01b41a14a6ab261d97be780a4287580438d710d6c7bf:1",
										className: `${isSafety ? "text-primary-foreground" : "text-coral"} inline-block whitespace-nowrap`,
										children: t(`site.${site.id}.heroHighlight`)
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Index/Index/p/0",
								"data-inspector-source": "pages/Index.tsx:82:13:3e84a41b21366382edf399cb272465c9f2bcaca2f8916e921859d04828edceb4:1",
								className: `text-base sm:text-lg md:text-xl mb-6 sm:mb-8 animate-fade-in max-w-[38rem] ${site.id === "carecnc" ? "text-foreground/80" : "text-primary-foreground/90"}`,
								style: { animationDelay: "0.1s" },
								children: t(`site.${site.id}.heroSubtitle`)
							}),
							paidCare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/Index/Index/div/5",
								"data-inspector-source": "pages/Index.tsx:87:13:7a0566b5e9cb2b3c452e3aa6905428339330842ae478d6b3fd74f9d2f7e4deb0:1",
								className: "bg-card rounded-xl p-2 shadow-xl animate-fade-in max-w-4xl",
								style: { animationDelay: "0.2s" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Index/Index/div/6",
									"data-inspector-source": "pages/Index.tsx:88:15:7e7fdd482a0e85cbee5918d1d878dd507456f4af7a9c2b92f05208d9e9066945:1",
									className: "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/Index/Index/div/7",
											"data-inspector-source": "pages/Index.tsx:89:17:874197742b0cc11b6d145e4eaefdfbb803b703ccf53cbd4b5a045c4652e90ac0:1",
											className: "relative min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
												"data-inspector-id": "pages/Index/Index/Search/0",
												"data-inspector-source": "pages/Index.tsx:90:19:b5f3479d1bb1141b001d7a6520fe79a52fc2446c291f78177948fb5bf3f8910b:1",
												className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												"data-inspector-id": "pages/Index/Index/Input/0",
												"data-inspector-source": "pages/Index.tsx:91:19:2027ce8482541b8b59ec7b0cf4045905f9733b5513979d8912ab9990a38a94e9:1",
												placeholder: t(`site.${site.id}.searchPlaceholder`),
												value: searchQuery,
												onChange: (e) => setSearchQuery(e.target.value),
												className: "pl-9 border-0 bg-muted/50 h-12",
												onKeyDown: (e) => e.key === "Enter" && handleSearch()
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											"data-inspector-id": "pages/Index/Index/div/8",
											"data-inspector-source": "pages/Index.tsx:99:17:874197742b0cc11b6d145e4eaefdfbb803b703ccf53cbd4b5a045c4652e90ac0:1",
											className: "relative min-w-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
													"data-inspector-id": "pages/Index/Index/MapPin/0",
													"data-inspector-source": "pages/Index.tsx:100:19:01f4f2433435db2bdc5cc04c62ae94bcba51e1419c6c974a283345bd1cadeb02:1",
													className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													"data-inspector-id": "pages/Index/Index/Input/1",
													"data-inspector-source": "pages/Index.tsx:101:19:2027ce8482541b8b59ec7b0cf4045905f9733b5513979d8912ab9990a38a94e9:1",
													placeholder: t("home.cityOrZip"),
													value: locationQuery,
													onChange: (e) => setLocationQuery(e.target.value),
													className: "pl-9 border-0 bg-muted/50 h-12",
													onKeyDown: (e) => e.key === "Enter" && handleSearch(),
													list: isChinese ? "cn-cities-list" : void 0,
													autoComplete: "off"
												}),
												isChinese && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
													"data-inspector-id": "pages/Index/Index/datalist/0",
													"data-inspector-source": "pages/Index.tsx:111:21:602c17201d8f7297e695f8b0cc20b0423c9c312d17ecb56933ed2235e8844056:1",
													id: "cn-cities-list",
													children: searchCnCities(locationQuery || "", 20).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														"data-inspector-id": "pages/Index/Index/option/0",
														"data-inspector-source": "pages/Index.tsx:113:25:625974bdb0128d2f7e8cf36f250f41c2074ba2b3b61057beb30ac83555bfd6be:1",
														value: `${c.name} ${c.zip}`,
														children: c.province
													}, c.zip + c.name))
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											"data-inspector-id": "pages/Index/Index/Button/0",
											"data-inspector-source": "pages/Index.tsx:118:17:932fec75aa506458c78a2414f0fa89636cacc23df4011182a806dde2726acf0c:1",
											variant: "coral",
											size: "lg",
											className: "h-12 px-8 lg:px-6 lg:min-w-[120px]",
											onClick: handleSearch,
											children: t("common.search")
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/Index/Index/div/9",
								"data-inspector-source": "pages/Index.tsx:125:13:79854f506a4aad88124c45caf780e1fa86c333bd2a9ebd5ae39ca31fb45aed94:1",
								className: "flex flex-wrap gap-x-4 gap-y-2 mt-6 animate-fade-in",
								style: { animationDelay: "0.3s" },
								children: site.trustBadges.map((badgeKey) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-inspector-id": "pages/Index/Index/div/10",
									"data-inspector-source": "pages/Index.tsx:127:17:693a38219cf0795c6c41ff61facdddfcfc7ef5f1106a9e5c95466378a07cce69:1",
									className: "flex items-center gap-2 text-primary-foreground/85 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, {
										"data-inspector-id": "pages/Index/Index/CheckCircle/0",
										"data-inspector-source": "pages/Index.tsx:128:19:5aa5808792df635780b827e154a67340235b53d75a159efeb89fc2cf7a24bd19:1",
										className: "h-4 w-4 shrink-0"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-inspector-id": "pages/Index/Index/span/1",
										"data-inspector-source": "pages/Index.tsx:129:19:9396b49e11292e099dba3b140e792364d8933f9039730deded47a80a377c4848:1",
										children: t(`site.${site.id}.${badgeKey}`)
									})]
								}, badgeKey))
							})
						]
					})
				})]
			}),
			paidCare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				"data-inspector-id": "pages/Index/Index/section/1",
				"data-inspector-source": "pages/Index.tsx:143:7:ccc846c7ad474316b7a4a51f2e7087f4a8a306cf5ab77971786031b6fb22ab5a:1",
				className: "bg-muted/50 py-10 sm:py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Index/Index/div/11",
					"data-inspector-source": "pages/Index.tsx:144:9:fb9bfdbcf8ee5be4f99f7e086e7cc15ce3e29646beeca04002f3aac77087cee4:1",
					className: "max-w-6xl mx-auto px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Index/Index/div/12",
							"data-inspector-source": "pages/Index.tsx:145:11:9bc46527b1ac72ba7128abb8b57213e4ad9bf7d06542b3bcbb99cad4c02e1705:1",
							className: "flex items-center justify-between mb-6 sm:mb-8 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								"data-inspector-id": "pages/Index/Index/div/13",
								"data-inspector-source": "pages/Index.tsx:146:13:e39e7bb06f107c442762c343d9e7ea825ae31b99a2ecae5e17e7a2e8a756a250:1",
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									"data-inspector-id": "pages/Index/Index/h2/0",
									"data-inspector-source": "pages/Index.tsx:147:15:5ce38d8d3a4366cea2654d8205cfa409b2a7784e5d8f98b91137c8684568a545:1",
									className: "text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight",
									children: t("home.topRatedCaregivers")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									"data-inspector-id": "pages/Index/Index/p/1",
									"data-inspector-source": "pages/Index.tsx:148:15:9d9bcdefc803247ce686a4f5ff899cc81cb04c5583a963a7b0620f63c4af48fc:1",
									className: "text-sm sm:text-base text-muted-foreground mt-1",
									children: t("home.trustedProfessionals")
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "pages/Index/Index/Button/1",
								"data-inspector-source": "pages/Index.tsx:150:13:63996ded9430ea764bb452ba0fae7959c02438a63a3fd201c81d3ab709a59932:1",
								variant: "outline",
								onClick: () => navigate("/search"),
								className: "hidden sm:flex",
								children: [
									t("home.viewAllCaregivers"),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
										"data-inspector-id": "pages/Index/Index/ArrowRight/0",
										"data-inspector-source": "pages/Index.tsx:151:45:e3a02f6e5dadf92f526a7bd5138ffec1eb7969da8ce4523740a8e2ed5d0e3063:1",
										className: "ml-2 h-4 w-4"
									})
								]
							})]
						}),
						isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/Index/Index/div/14",
							"data-inspector-source": "pages/Index.tsx:156:13:d992791aeb99754822ca7f0832f6fdb2b44460b507f92c935fbad9d25ab3eeb6:1",
							className: "flex justify-center py-12",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								"data-inspector-id": "pages/Index/Index/Loader2/0",
								"data-inspector-source": "pages/Index.tsx:156:56:d992791aeb99754822ca7f0832f6fdb2b44460b507f92c935fbad9d25ab3eeb6:1",
								className: "h-8 w-8 animate-spin text-muted-foreground"
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/Index/Index/div/15",
							"data-inspector-source": "pages/Index.tsx:158:13:9754cc2a0d7f44b357ab0bc35865c6064c634c516f155a3f0ff1c68c3d496bbe:1",
							className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6",
							children: featuredProviders.map((cg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								"data-inspector-id": "pages/Index/Index/Card/0",
								"data-inspector-source": "pages/Index.tsx:160:17:541e3ee2790a80488d8e96a874b66f9a4cd0d6085d26222ab5d365992f9d339d:1",
								className: "card-elevated cursor-pointer border-transparent overflow-hidden",
								onClick: () => navigate(`/caregiver/${cg.id}`),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									"data-inspector-id": "pages/Index/Index/CardContent/0",
									"data-inspector-source": "pages/Index.tsx:161:19:e19112fd4a3acd1b080f73732664ab8603ef731bef081e57afaa799830249305:1",
									className: "p-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-inspector-id": "pages/Index/Index/div/16",
										"data-inspector-source": "pages/Index.tsx:162:21:fd36b4cce095023232d3ddda69d0e1f55ae3be8c66c4a0eec62fe345ad035ac7:1",
										className: "p-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												"data-inspector-id": "pages/Index/Index/div/17",
												"data-inspector-source": "pages/Index.tsx:163:23:c56efb16d200f6dda3822e205d640eb5b09b8487c83e0e9b3f29c5a41308999f:1",
												className: "flex items-start gap-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													"data-inspector-id": "pages/Index/Index/img/1",
													"data-inspector-source": "pages/Index.tsx:164:25:ec5fa95ba4005d23c7a8d6e1ef9a014b08efb84b2afb8fe68f977fe20c5e8095:1",
													src: cg.avatar_url || "/placeholder.svg",
													alt: cg.full_name || "",
													className: "w-16 h-16 rounded-xl object-cover"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													"data-inspector-id": "pages/Index/Index/div/18",
													"data-inspector-source": "pages/Index.tsx:165:25:c5ef961e7c671996083509685695e28adf3bf953f4f06f8bf48866d694a6d3b4:1",
													className: "flex-1 min-w-0",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															"data-inspector-id": "pages/Index/Index/div/19",
															"data-inspector-source": "pages/Index.tsx:166:27:afc64a44695b2988c1d249e107b195d5498b61a84e714563955a8903676ce90b:1",
															className: "flex items-center gap-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
																"data-inspector-id": "pages/Index/Index/h3/0",
																"data-inspector-source": "pages/Index.tsx:167:29:7c69fd263c552f7093daa44215208678d6d59c984aedf8951eb483e00cab53c6:1",
																className: "font-semibold text-foreground truncate",
																children: cg.full_name
															}), cg.care_provider_is_background_checked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
																"data-inspector-id": "pages/Index/Index/Shield/0",
																"data-inspector-source": "pages/Index.tsx:168:72:37d27821d1f817a4aa4ad6e2dfc8483e303fcd493cbc4fb22d0aa3ec88ea3be2:1",
																className: "h-4 w-4 text-primary shrink-0"
															})]
														}),
														cg.rating_average != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															"data-inspector-id": "pages/Index/Index/div/20",
															"data-inspector-source": "pages/Index.tsx:171:29:0553097b4bba62e9169b023ab5a1fd92c05677125a83213feab58e64895d04e1:1",
															className: "flex items-center gap-1 mt-1",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
																	"data-inspector-id": "pages/Index/Index/Star/0",
																	"data-inspector-source": "pages/Index.tsx:172:31:590a95298489d5e16b8f688119cda86c4275f119411f0acfe717479072c14804:1",
																	className: "h-4 w-4 text-warning fill-warning"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	"data-inspector-id": "pages/Index/Index/span/2",
																	"data-inspector-source": "pages/Index.tsx:173:31:c318f1e1c09710319b2eba57143c6b011c6fc375a326da4c5c583936f42ae003:1",
																	className: "text-sm font-medium",
																	children: cg.rating_average.toFixed(1)
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	"data-inspector-id": "pages/Index/Index/span/3",
																	"data-inspector-source": "pages/Index.tsx:174:31:5f24e60b52a4b491be031484a88aae37fcd5bd63b3296aaf32fc172f117b90ac:1",
																	className: "text-xs text-muted-foreground",
																	children: [
																		"(",
																		cg.rating_count || 0,
																		")"
																	]
																})
															]
														}),
														cg.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															"data-inspector-id": "pages/Index/Index/div/21",
															"data-inspector-source": "pages/Index.tsx:178:29:c6abaa65521115cafbd513cc4113f7f92f3432c5353a8416065607977613d437:1",
															className: "flex items-center gap-1 mt-1 text-sm text-muted-foreground",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
																"data-inspector-id": "pages/Index/Index/MapPin/1",
																"data-inspector-source": "pages/Index.tsx:179:31:b4fcb5300cf5d1a1d59a53a6f154e78ed7dd166980fa0da70cfe62a8bf0b4f1d:1",
																className: "h-3 w-3"
															}), cg.location]
														})
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-id": "pages/Index/Index/div/22",
												"data-inspector-source": "pages/Index.tsx:185:23:f5ca0e848dfece77c31e5d10009627e7dd4acc7f4bd7a9c6be06472ce6943d1b:1",
												className: "flex flex-wrap gap-1.5 mt-4",
												children: (cg.service_type_slugs || []).slice(0, 3).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													"data-inspector-id": "pages/Index/Index/Badge/0",
													"data-inspector-source": "pages/Index.tsx:187:27:3f735f9d0990a06c47cc0798479e0466f0767565f8d7c7929c65ec51f80d6879:1",
													variant: "secondary",
													className: "bg-accent text-accent-foreground text-xs",
													children: careServiceTypeLabel(s, !!isChinese)
												}, s))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												"data-inspector-id": "pages/Index/Index/div/23",
												"data-inspector-source": "pages/Index.tsx:190:23:bb455a9180dcd733f8db4afbc8f514dd3958fad0ca4f3175ab6354e7769b9f63:1",
												className: "flex items-center justify-end mt-4 pt-4 border-t",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													"data-inspector-id": "pages/Index/Index/div/24",
													"data-inspector-source": "pages/Index.tsx:191:25:6014df73d84ae42f2fec41a9e8d05b21257774f6e602670b2c45ca15fd9db4a7:1",
													className: "text-right",
													children: cg.care_provider_starts_hourly_rate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														"data-inspector-id": "pages/Index/Index/span/4",
														"data-inspector-source": "pages/Index.tsx:194:31:69e4bf15a5c6290cb8c24583c249310e5a7bd7467cdd1e47456a763e7af43df6:1",
														className: "text-lg font-bold text-foreground",
														children: [isChinese ? "¥" : "$", cg.care_provider_starts_hourly_rate]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														"data-inspector-id": "pages/Index/Index/span/5",
														"data-inspector-source": "pages/Index.tsx:195:31:3d158d0fa79ca4366b260c6202afe74b385598d821f52f8867dfbc001ae3a5e7:1",
														className: "text-sm text-muted-foreground",
														children: t("common.perHour")
													})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														"data-inspector-id": "pages/Index/Index/span/6",
														"data-inspector-source": "pages/Index.tsx:198:29:c5252585209a146a20193cf46e4e9ec829fcd61ad0333e94cffe4884a07e0530:1",
														className: "text-sm font-medium text-muted-foreground",
														children: isChinese ? "价格待询" : "Rate on request"
													})
												})
											})
										]
									})
								})
							}, cg.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-inspector-id": "pages/Index/Index/div/25",
							"data-inspector-source": "pages/Index.tsx:210:11:c2cec4c9cac484c51ba02f33d98c64b690b59f9eaaa38198d7dfa5396bf886a8:1",
							className: "mt-6 text-center sm:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								"data-inspector-id": "pages/Index/Index/Button/2",
								"data-inspector-source": "pages/Index.tsx:211:13:bfc1643dbe056a9d9134e832aff01c313d6284fae43bbfa08b9c563f244b4881:1",
								variant: "outline",
								onClick: () => navigate("/search"),
								children: [
									t("home.viewAllCaregivers"),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
										"data-inspector-id": "pages/Index/Index/ArrowRight/1",
										"data-inspector-source": "pages/Index.tsx:212:45:e3a02f6e5dadf92f526a7bd5138ffec1eb7969da8ce4523740a8e2ed5d0e3063:1",
										className: "ml-2 h-4 w-4"
									})
								]
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"data-inspector-id": "pages/Index/Index/section/2",
				"data-inspector-source": "pages/Index.tsx:220:7:a1331fbacfc09fba441218c2e64dc0a4b2faa98bb87e23fcf6f601b0e0285038:1",
				className: "max-w-6xl mx-auto px-4 py-10 sm:py-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-inspector-id": "pages/Index/Index/h2/1",
					"data-inspector-source": "pages/Index.tsx:221:9:c5db8b27b63a9b9cae5384e89e24b11d2f67e7c2af28ccdafee9a1b5cae28002:1",
					className: "text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center mb-8 sm:mb-12 tracking-tight",
					children: t(`site.${site.id}.howItWorksTitle`)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-inspector-id": "pages/Index/Index/div/26",
					"data-inspector-source": "pages/Index.tsx:222:9:d9be7916006e4d274746c087c48a7ad03502dfd4c306fb1b1546f3e07b530590:1",
					className: "grid md:grid-cols-3 gap-8",
					children: site.howItWorksSteps.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Index/Index/div/27",
						"data-inspector-source": "pages/Index.tsx:224:13:837783eb8ca864b999adc875bd1a42d030b118a98a64c5bb8db0de42746ec3b7:1",
						className: "text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/Index/Index/div/28",
								"data-inspector-source": "pages/Index.tsx:225:15:44aa3c0332f7c5ac7e46fe0e52ff1a4d68f888de78ac5618dac56732d50dedd7:1",
								className: "mx-auto w-14 h-14 rounded-2xl hero-gradient flex items-center justify-center mb-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-inspector-id": "pages/Index/Index/span/7",
									"data-inspector-source": "pages/Index.tsx:226:17:4278ce18bf4e4720d0ea79c6bf89dce0c2052b777076f78842fb47e3f7416a76:1",
									className: "text-primary-foreground font-bold text-xl",
									children: item.step
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								"data-inspector-id": "pages/Index/Index/h3/1",
								"data-inspector-source": "pages/Index.tsx:228:15:b53be4a534ed15e45b1a86a4c454616c1a87236b68391446db4641cfa636ab7b:1",
								className: "text-lg font-semibold text-foreground mb-2",
								children: t(`site.${site.id}.${item.titleKey}`)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Index/Index/p/2",
								"data-inspector-source": "pages/Index.tsx:229:15:4388d021e8544ddf4529dd2befe3404353be924beb2ea9fcae464bd1eb963192:1",
								className: "text-muted-foreground",
								children: t(`site.${site.id}.${item.descKey}`)
							})
						]
					}, item.step))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				"data-inspector-id": "pages/Index/Index/section/3",
				"data-inspector-source": "pages/Index.tsx:236:7:1f57460bb81078845ef154bc783f90e6233a67217d4d75b00d47e3af774d88a9:1",
				className: "hero-gradient py-10 sm:py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Index/Index/div/29",
					"data-inspector-source": "pages/Index.tsx:237:9:9019cf9d2e998e61c4ddf426596bb66f37cb3b5374bb64bc5f73eaacbbdc30bb:1",
					className: "max-w-4xl mx-auto px-4 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							"data-inspector-id": "pages/Index/Index/h2/2",
							"data-inspector-source": "pages/Index.tsx:238:11:f8fc88ec81fc9fd9d435d2b70363e6870ad90c4c09f220773722ace2879e6776:1",
							className: "text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground mb-3 sm:mb-4 tracking-tight",
							children: t(`site.${site.id}.ctaTitle`)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							"data-inspector-id": "pages/Index/Index/p/3",
							"data-inspector-source": "pages/Index.tsx:239:11:c709227b355e3497a9d4a57315024ca82f5575c6eaa0209b9c4403fffdbf232e:1",
							className: "text-primary-foreground/80 mb-8 max-w-xl mx-auto",
							children: t(`site.${site.id}.ctaSubtitle`)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Index/Index/div/30",
							"data-inspector-source": "pages/Index.tsx:240:11:2ce4fecc3dd57832294316d6bd8d60b769fbefecdcbe395357e9ab88bfc3bfba:1",
							className: "flex flex-col sm:flex-row gap-3 justify-center",
							children: [paidCare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/Index/Index/Button/3",
								"data-inspector-source": "pages/Index.tsx:242:15:b38f8feb365349b347f5d9b0cf67d828ce3a7fbe3afdf74032f6dbf0d6f47485:1",
								variant: "coral",
								size: "lg",
								onClick: () => navigate("/search"),
								children: t(`site.${site.id}.ctaButton`)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								"data-inspector-id": "pages/Index/Index/Button/4",
								"data-inspector-source": "pages/Index.tsx:246:13:fec8234640e91bd4de2a78fef83c71dc17624655b5aaaf9de9dbc08eabb4a631:1",
								variant: "secondary",
								size: "lg",
								onClick: () => navigate("/auth?mode=signup"),
								children: t("home.createFreeAccount")
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				"data-inspector-id": "pages/Index/Index/footer/0",
				"data-inspector-source": "pages/Index.tsx:254:7:984833ed5e5eef4c25d99f4e93f14371c1a7bf28706660ed58a12140a8805467:1",
				className: "border-t bg-card py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-inspector-id": "pages/Index/Index/div/31",
					"data-inspector-source": "pages/Index.tsx:255:9:fb9bfdbcf8ee5be4f99f7e086e7cc15ce3e29646beeca04002f3aac77087cee4:1",
					className: "max-w-6xl mx-auto px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-inspector-id": "pages/Index/Index/div/32",
						"data-inspector-source": "pages/Index.tsx:256:11:8bb754f62c630ef8647ca3be375d6fbef2c6cfa1ead35735e6a3b594eb0b87c1:1",
						className: "grid grid-cols-2 md:grid-cols-4 gap-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Index/Index/div/33",
							"data-inspector-source": "pages/Index.tsx:257:13:566e58fe17297b14fbbf5494027bde47d0792af393619ffdae80c5da43ed6698:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								"data-inspector-id": "pages/Index/Index/div/34",
								"data-inspector-source": "pages/Index.tsx:258:15:f643f5f2091234b33bc0ab826dadd72901fc4d91e08d67f083086e20a2e8d400:1",
								className: "mb-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {
									"data-inspector-id": "pages/Index/Index/BrandMark/0",
									"data-inspector-source": "pages/Index.tsx:259:17:0a0b48faf445d52fabbe41fa51e35c83cc7b6cbfef5d2d6bd39c77e28a797716:1",
									size: 48,
									showWordmark: true
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-inspector-id": "pages/Index/Index/p/4",
								"data-inspector-source": "pages/Index.tsx:261:15:9de701e895a342b3a68bd0dfa731145a96dafa8f728c506d88f7b189a8415393:1",
								className: "text-sm text-muted-foreground",
								children: t(`site.${site.id}.footerTagline`)
							})]
						}), (isSafety ? [
							{
								title: isChinese ? "家人安全" : "Family safety",
								links: [
									{
										label: isChinese ? "实时地图" : "Live map",
										href: "/auth"
									},
									{
										label: isChinese ? "地点提醒" : "Place alerts",
										href: "/auth"
									},
									{
										label: isChinese ? "家庭圈子" : "Family circle",
										href: "/auth"
									}
								]
							},
							{
								title: isChinese ? "开始使用" : "Get started",
								links: [
									{
										label: isChinese ? "创建账号" : "Create account",
										href: "/auth?mode=signup"
									},
									{
										label: isChinese ? "登录" : "Sign in",
										href: "/auth"
									},
									{
										label: isChinese ? "创建家庭圈子" : "Create a family circle",
										href: "/auth?mode=signup"
									}
								]
							},
							{
								title: isChinese ? "隐私与帮助" : "Privacy & help",
								links: [{
									label: isChinese ? "信任与安全" : "Trust & safety",
									href: "/trust-safety"
								}, {
									label: isChinese ? "紧急求助" : "Emergency SOS",
									href: "/auth"
								}]
							}
						] : [
							{
								title: t("home.forFamilies"),
								links: [
									...paidCare ? [{
										label: t("home.findCaregivers"),
										href: "/search"
									}] : [],
									{
										label: t("nav.howItWorks"),
										href: "/how-it-works"
									},
									{
										label: t("nav.trustSafety"),
										href: "/trust-safety"
									},
									{
										label: t(site.family === "challenged" ? "nav.careTeams" : "nav.careGroups"),
										href: "/care-circle"
									}
								]
							},
							{
								title: t("home.forCaregivers"),
								links: paidCare ? [
									{
										label: t("home.joinAsCaregiver"),
										href: "/become-caregiver"
									},
									{
										label: t("nav.tasksNeedingHelp"),
										href: "/tasks"
									},
									{
										label: t("nav.providerDashboard"),
										href: "/caregiver-setting"
									},
									{
										label: t("nav.trustSafety"),
										href: "/trust-safety"
									}
								] : [{
									label: t("nav.tasksNeedingHelp"),
									href: "/tasks"
								}, {
									label: t("nav.trustSafety"),
									href: "/trust-safety"
								}]
							},
							{
								title: t("home.company"),
								links: [
									{
										label: t("nav.howItWorks"),
										href: "/how-it-works"
									},
									{
										label: t("nav.trustSafety"),
										href: "/trust-safety"
									},
									{
										label: t("common.signUp"),
										href: "/auth?mode=signup"
									},
									{
										label: t("common.signIn"),
										href: "/auth"
									}
								]
							}
						]).map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-inspector-id": "pages/Index/Index/div/35",
							"data-inspector-source": "pages/Index.tsx:301:15:1350b1050c2e90333eb1e0d87c749b21957d4edb55d52c0b0b23a829f002e4d4:1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								"data-inspector-id": "pages/Index/Index/h4/0",
								"data-inspector-source": "pages/Index.tsx:302:17:61b52f68ee236a535c6b91572102f2b8fea2c4af48bde148181d4fc5a0dbd799:1",
								className: "font-semibold text-foreground mb-3 text-sm",
								children: col.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								"data-inspector-id": "pages/Index/Index/ul/0",
								"data-inspector-source": "pages/Index.tsx:303:17:7efeff9efba4f5c18684fde791c8564ba2936633b5d366715e895c8a557aaee1:1",
								className: "space-y-2",
								children: col.links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									"data-inspector-id": "pages/Index/Index/li/0",
									"data-inspector-source": "pages/Index.tsx:305:21:e785550761bdfcc19cab183f1090e36e4cf3e23bdf45eb92639561885ce41f9e:1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
										"data-inspector-id": "pages/Index/Index/Link/0",
										"data-inspector-source": "pages/Index.tsx:306:23:9d75dd826ee904e5bc3060dc0f18159c0f050c340ebcb9dfda151f7555ab0d63:1",
										to: link.href,
										className: "text-sm text-muted-foreground hover:text-primary transition-colors",
										children: link.label
									})
								}, link.label))
							})]
						}, col.title))]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-inspector-id": "pages/Index/Index/div/36",
						"data-inspector-source": "pages/Index.tsx:313:11:03fef904acde3f1ac8f7648892b133a74e71e9e6f0ef465d1db9955c25ae7d06:1",
						className: "border-t mt-8 pt-8 text-center text-sm text-muted-foreground",
						children: t("common.copyright", { brand: site.name })
					})]
				})
			})
		]
	});
};
//#endregion
export { Index as t };
