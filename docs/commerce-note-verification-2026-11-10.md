# Care-commerce note update verification — 2026-11-10

- Updated and independently verified: 212/212 note bodies.
- Note types: 173 description notes (b55), 39 association notes (b56).
- Protected master #6856: exact full record unchanged.
- Titles, types, position bindings, version and verification settings unchanged; no REL325 operation.
- Plugin normalized empty a65/a66 from null to empty string on 203 records; both remain off.
- This changes notes only, not commerce implementation, orders, payment settings or schema.
- Covered findings: calendar booking occupancy; paid/service status distinction; headless payment conflict; unverified confirmation URL; manual vs real refund; server price/vendor checks; Dokan readiness; per-visit duration; rescheduling; multi-line/vendor mapping; cart/account isolation; currency; commission/withdrawal claims; quote state; cancellation/notifications/review provenance; incomplete recurrence/timezone; proxy credential destination risk.
- Correction to prior audit: current OrderConfirmation displays URL total directly; no fixed divide-by-100 found in this page.
- Other unrelated shop and non-care notes are outside this targeted update, not claimed fully audited.

## Saved notes
| ID | Type | Title | Body readback | Metadata |
|---|---|---|---|---|
| 10657 | b56 | 付费护理者展示评价与预约功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 10645 | b56 | 预约 · 待进行 | PASS | PASS (empty-switch normalization only where recorded) |
| 10644 | b56 | 预约 · 历史 | PASS | PASS (empty-switch normalization only where recorded) |
| 10634 | b56 | 照护者设置 · 可约时间（完整标签） | PASS | PASS (empty-switch normalization only where recorded) |
| 10633 | b56 | 照护者设置 · 排班（完整标签） | PASS | PASS (empty-switch normalization only where recorded) |
| 10632 | b56 | 照护者设置 · 预约请求（完整标签） | PASS | PASS (empty-switch normalization only where recorded) |
| 10625 | b56 | 照护者设置 · 收款记录（完整标签） | PASS | PASS (empty-switch normalization only where recorded) |
| 10624 | b56 | 照护者设置 · 收款账户（完整标签） | PASS | PASS (empty-switch normalization only where recorded) |
| 10622 | b56 | 照护者设置 · 退款与问题（完整标签） | PASS | PASS (empty-switch normalization only where recorded) |
| 10593 | b56 | 订单确认页参数摘要展示功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 10485 | b56 | 每周排班表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 10468 | b56 | 提现申请撤销表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 10467 | b56 | 提现申请表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 10466 | b56 | 收款账户设置表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 10454 | b56 | 发送报价表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 10453 | b56 | 预约留言与退款处理表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 10439 | b56 | 预约退款申请表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 10438 | b56 | 预约服务评价表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 10437 | b56 | 预约改期表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 10436 | b56 | 取消预约确认表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 10422 | b56 | 预约护理服务表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 10421 | b56 | 购物车结算表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 10420 | b56 | 购物车优惠码表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 8950 | b56 | 付费护理者搜索筛选功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 8946 | b56 | 接受聊天报价并准备结账功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 7729 | b56 | 提现金额校验与撤销功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 7728 | b56 | 商家收款账户保存功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 7727 | b56 | 启用有偿护理者与商家准备功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 7726 | b56 | 订单争议线程与客户留言功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 7725 | b56 | 预约状态与通知功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 7724 | b56 | 客户订单与护理者订单读取功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 7723 | b56 | 护理预约即时商品与价格功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 7722 | b56 | 支付方式选择与支付跳转功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 7721 | b56 | 结算前复核与账单地址功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 7719 | b56 | 购物车数量调整与移除功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 7718 | b56 | 将商品加入购物车功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 7717 | b56 | 购物车读取与本设备幽灵商品清理功能逻辑 | PASS | PASS (empty-switch normalization only where recorded) |
| 6475 | b55 | 护理设置页 · 整页读写元素 | PASS | PASS (empty-switch normalization only where recorded) |
| 6298 | b55 | 购物车页 · 整页读写元素 | PASS | PASS (empty-switch normalization only where recorded) |
| 5258 | b55 | 护理员端首页 · 预约状态分类与累计收入详情 | PASS | PASS (empty-switch normalization only where recorded) |
| 5257 | b55 | 护理员端首页 · 多维度预约与退款状态列表 | PASS | PASS (empty-switch normalization only where recorded) |
| 5255 | b55 | 护理员端首页 · 预约与退款分组计数统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 5253 | b55 | 护理员端首页 · 详细预约及退款进度统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 5251 | b55 | 护理员端首页 · 预约状态统计与总收入金额 | PASS | PASS (empty-switch normalization only where recorded) |
| 5250 | b55 | 护理员端首页 · 预约与退款统计数据 | PASS | PASS (empty-switch normalization only where recorded) |
| 5248 | b55 | 护理员端首页 · 收入汇总与各状态预约列表 | PASS | PASS (empty-switch normalization only where recorded) |
| 5247 | b55 | 护理员端首页 · 平台免佣金说明文案 | PASS | PASS (empty-switch normalization only where recorded) |
| 5245 | b55 | 护理员端首页 · 各状态预约数量统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 5243 | b55 | 护理员端首页 · 预约及退款状态统计概览 | PASS | PASS (empty-switch normalization only where recorded) |
| 5242 | b55 | 护理员端首页 · 已完成收入总额与待结算金额 | PASS | PASS (empty-switch normalization only where recorded) |
| 5240 | b55 | 服务商面板 · 特殊日期排班列表项 | PASS | PASS (empty-switch normalization only where recorded) |
| 5239 | b55 | 服务商面板 · 收入汇总与退款状态展示 | PASS | PASS (empty-switch normalization only where recorded) |
| 5232 | b55 | 服务商面板 · 预约与待退款数量统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 5231 | b55 | 服务商面板 · 待处理与已确认预约总数 | PASS | PASS (empty-switch normalization only where recorded) |
| 5230 | b55 | 服务者后台 · 特殊日期可约开关 | PASS | PASS (empty-switch normalization only where recorded) |
| 5229 | b55 | 服务商面板 · 预约收入统计与排班列表 | PASS | PASS (empty-switch normalization only where recorded) |
| 5228 | b55 | 服务商面板 · 待处理与已确认预约统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 5222 | b55 | 服务商面板 · 预约状态及退款详细统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 5220 | b55 | 服务商面板 · 待处理预约与收入统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 5218 | b55 | 服务商面板 · 订单数与待退款数统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 5217 | b55 | 服务商面板 · 收入与待结算金额求和统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 5216 | b55 | 服务商面板 · 已赚与待结算金额明细 | PASS | PASS (empty-switch normalization only where recorded) |
| 5211 | b55 | 服务商面板 · 顶部累计与待结算收入 | PASS | PASS (empty-switch normalization only where recorded) |
| 5204 | b55 | 服务商面板 · 预约状态统计数 | PASS | PASS (empty-switch normalization only where recorded) |
| 4804 | b55 | 购物车页 · 费用明细结算区域 | PASS | PASS (empty-switch normalization only where recorded) |
| 4795 | b55 | 购物车页 · 优惠券选择项 | PASS | PASS (empty-switch normalization only where recorded) |
| 4790 | b55 | 购物车页 · 邮政编码输入框 | PASS | PASS (empty-switch normalization only where recorded) |
| 4759 | b55 | 购物车页 · 已应用优惠券代码 | PASS | PASS (empty-switch normalization only where recorded) |
| 4744 | b55 | 购物车页 · 服务提供方名称 | PASS | PASS (empty-switch normalization only where recorded) |
| 4743 | b55 | 购物车页 · 商品名称 | PASS | PASS (empty-switch normalization only where recorded) |
| 4741 | b55 | 购物车页 · 商品描述文本 | PASS | PASS (empty-switch normalization only where recorded) |
| 4735 | b55 | 购物车页 · 购物车商品项数量 | PASS | PASS (empty-switch normalization only where recorded) |
| 4649 | b55 | 护理者预约 · 开始与结束时间 | PASS | PASS (empty-switch normalization only where recorded) |
| 4630 | b55 | 护理者档案页 · 可预约时间展示 | PASS | PASS (empty-switch normalization only where recorded) |
| 4628 | b55 | 护理详情页 · “可约时间”标题 | PASS | PASS (empty-switch normalization only where recorded) |
| 4616 | b55 | 护理者详情 · 预约与联系面板 | PASS | PASS (empty-switch normalization only where recorded) |
| 3232 | b55 | 服务商首页 · 预约与退款待处理数 | PASS | PASS (empty-switch normalization only where recorded) |
| 3231 | b55 | 服务商首页 · 已结与待结算金额统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 3230 | b55 | 服务商首页 · 周排班设置列表 | PASS | PASS (empty-switch normalization only where recorded) |
| 3222 | b55 | 服务商首页 · 待处理与已确认预约数 | PASS | PASS (empty-switch normalization only where recorded) |
| 3219 | b55 | 服务商首页 · 退款与已结收入统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 3214 | b55 | 服务商首页 · 预约及退款统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 3190 | b55 | 照护者设置页·拒绝预约按钮 | PASS | PASS (empty-switch normalization only where recorded) |
| 3189 | b55 | 护理员工作台 · 预约状态及总额统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 3184 | b55 | 护理员工作台 · 退款与状态分类统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 3182 | b55 | 照护者设置页·接受预约按钮 | PASS | PASS (empty-switch normalization only where recorded) |
| 3179 | b55 | 护理员工作台 · 预约申请分类统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 3178 | b55 | 护理员工作台 · 预约分类数量展示 | PASS | PASS (empty-switch normalization only where recorded) |
| 3177 | b55 | 护理员工作台 · 预约状态与总收入统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 3175 | b55 | 护理员工作台 · 预约状态分类统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 3173 | b55 | 护理员工作台 · 预约及收入统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 3138 | b55 | 服务商概览 · 预约分类统计与总收入 | PASS | PASS (empty-switch normalization only where recorded) |
| 3134 | b55 | 服务商概览 · 预约处理或沟通按钮 | PASS | PASS (empty-switch normalization only where recorded) |
| 3130 | b55 | 服务商概览 · 预约收入概览与排班详情 | PASS | PASS (empty-switch normalization only where recorded) |
| 3127 | b55 | 服务商概览 · 预约列表与收入明细 | PASS | PASS (empty-switch normalization only where recorded) |
| 3124 | b55 | 服务商概览 · 预约概览与已处理退款统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 3123 | b55 | 服务商概览 · 各状态预约数与待退款数 | PASS | PASS (empty-switch normalization only where recorded) |
| 3122 | b55 | 服务商概览 · 预约统计与退款申请数 | PASS | PASS (empty-switch normalization only where recorded) |
| 3120 | b55 | 护理员工作台 · 退款状态标签 | PASS | PASS (empty-switch normalization only where recorded) |
| 3088 | b55 | 护理员工作台 · 可约时间选项卡 | PASS | PASS (empty-switch normalization only where recorded) |
| 3084 | b55 | 护理员工作台 · 待处理与已确认预约数 | PASS | PASS (empty-switch normalization only where recorded) |
| 3080 | b55 | 护理员工作台 · 各状态预约数量统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 3079 | b55 | 护理员工作台 · 退款处理列表 | PASS | PASS (empty-switch normalization only where recorded) |
| 3078 | b55 | 护理员工作台 · 待退款订单笔数 | PASS | PASS (empty-switch normalization only where recorded) |
| 3076 | b55 | 护理员工作台 · 退款与问题标签页 | PASS | PASS (empty-switch normalization only where recorded) |
| 3075 | b55 | 护理员工作台 · 退款申请原因 | PASS | PASS (empty-switch normalization only where recorded) |
| 3071 | b55 | 护理员工作台 · 预约笔数与收入统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 3039 | b55 | 护理员首页 · 入账与待结算页签 | PASS | PASS (empty-switch normalization only where recorded) |
| 3033 | b55 | 护理员首页 · 退款状态统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 3032 | b55 | 护理员首页 · 预约状态计数器 | PASS | PASS (empty-switch normalization only where recorded) |
| 3029 | b55 | 护理员首页 · 预约状态及金额分类 | PASS | PASS (empty-switch normalization only where recorded) |
| 3028 | b55 | 护理员首页 · 预约与收入统计汇总 | PASS | PASS (empty-switch normalization only where recorded) |
| 3013 | b55 | 护理员首页 · 预约状态统计栏 | PASS | PASS (empty-switch normalization only where recorded) |
| 2910 | b55 | 预订页 · 退款申请头部描述 | PASS | PASS (empty-switch normalization only where recorded) |
| 2904 | b55 | 预订页 · 预约数量统计与服务商 | PASS | PASS (empty-switch normalization only where recorded) |
| 2896 | b55 | 预订页 · 取消与申请退款操作栏 | PASS | PASS (empty-switch normalization only where recorded) |
| 2861 | b55 | 预约页 · 退款申请及订单详情弹窗 | PASS | PASS (empty-switch normalization only where recorded) |
| 2852 | b55 | 预约页 · 申请退款详情弹窗 | PASS | PASS (empty-switch normalization only where recorded) |
| 2771 | b55 | 预约页·确认取消预约按钮 | PASS | PASS (empty-switch normalization only where recorded) |
| 2758 | b55 | 预约页 · 取消确认操作栏 | PASS | PASS (empty-switch normalization only where recorded) |
| 2702 | b55 | 预约页 · 问题与退款申请按钮 | PASS | PASS (empty-switch normalization only where recorded) |
| 2701 | b55 | 预约页 · 退款金额查看及申请入口 | PASS | PASS (empty-switch normalization only where recorded) |
| 2699 | b55 | 预约页 · 预约记录列表容器 | PASS | PASS (empty-switch normalization only where recorded) |
| 2696 | b55 | 预约页 · 退款进度状态标签 | PASS | PASS (empty-switch normalization only where recorded) |
| 2693 | b55 | 预约页 · 预约详情与状态说明 | PASS | PASS (empty-switch normalization only where recorded) |
| 2692 | b55 | 预约页 · 退款申请状态及金额 | PASS | PASS (empty-switch normalization only where recorded) |
| 2691 | b55 | 预约页 · 提供者头像与服务类型信息 | PASS | PASS (empty-switch normalization only where recorded) |
| 2672 | b55 | 预约页 · 申请退款菜单项 | PASS | PASS (empty-switch normalization only where recorded) |
| 2669 | b55 | 预约页 · 预约管理菜单选项 | PASS | PASS (empty-switch normalization only where recorded) |
| 2668 | b55 | 预约页 · 订单操作功能列表 | PASS | PASS (empty-switch normalization only where recorded) |
| 2638 | b55 | 预约页 · 服务者头像与全名 | PASS | PASS (empty-switch normalization only where recorded) |
| 2630 | b55 | 预约页 · 服务者信息与预约状态 | PASS | PASS (empty-switch normalization only where recorded) |
| 2208 | b55 | 订单确认页 · 预约详情参数 | PASS | PASS (empty-switch normalization only where recorded) |
| 2204 | b55 | 订单确认页 · 支付详情与指引 | PASS | PASS (empty-switch normalization only where recorded) |
| 1274 | b55 | 收款账户卡片 · 支付流程与提现规则说明 | PASS | PASS (empty-switch normalization only where recorded) |
| 1270 | b55 | 收款账户卡片 · 可提现余额标签 | PASS | PASS (empty-switch normalization only where recorded) |
| 1054 | b55 | 报价卡片 · 报价状态与金额摘要 | PASS | PASS (empty-switch normalization only where recorded) |
| 1042 | b55 | 消息报价卡片·接受报价按钮 | PASS | PASS (empty-switch normalization only where recorded) |
| 1037 | b55 | 报价卡片 · 报价金额与语言状态 | PASS | PASS (empty-switch normalization only where recorded) |
| 1035 | b55 | 报价卡片 · 报价状态处理按钮 | PASS | PASS (empty-switch normalization only where recorded) |
| 1024 | b55 | 消息报价卡片·拒绝报价按钮 | PASS | PASS (empty-switch normalization only where recorded) |
| 1003 | b55 | 报价卡片 · 报价单状态 | PASS | PASS (empty-switch normalization only where recorded) |
| 193 | b55 | 预约详情页 · 退款审批状态标签 | PASS | PASS (empty-switch normalization only where recorded) |
| 181 | b55 | 预约详情 · 沟通与退款处理弹窗 | PASS | PASS (empty-switch normalization only where recorded) |
| 5031 | b55 | 首页 · 预约与任务汇总列表 | PASS | PASS (empty-switch normalization only where recorded) |
| 4974 | b55 | 仪表板 · 预约与任务总数统计卡片 | PASS | PASS (empty-switch normalization only where recorded) |
| 4968 | b55 | 仪表板 · 待办预约与任务概览 | PASS | PASS (empty-switch normalization only where recorded) |
| 4810 | b55 | 购物车页 · 缺失信息填写提示 | PASS | PASS (empty-switch normalization only where recorded) |
| 4803 | b55 | 购物车页 · 商品名称选择项 | PASS | PASS (empty-switch normalization only where recorded) |
| 4801 | b55 | 购物车页 · 省份名称列表 | PASS | PASS (empty-switch normalization only where recorded) |
| 4796 | b55 | 购物车页 · 省州标签 | PASS | PASS (empty-switch normalization only where recorded) |
| 4767 | b55 | 购物车页 · 商品列表及操作区域 | PASS | PASS (empty-switch normalization only where recorded) |
| 4757 | b55 | 购物车页 · 优惠码输入框 | PASS | PASS (empty-switch normalization only where recorded) |
| 4745 | b55 | 购物车页 · 单项商品小计金额 | PASS | PASS (empty-switch normalization only where recorded) |
| 4734 | b55 | 购物车页 · 购物车结算汇总模块 | PASS | PASS (empty-switch normalization only where recorded) |
| 3136 | b55 | 服务商概览 · 预约客户头像 | PASS | PASS (empty-switch normalization only where recorded) |
| 3131 | b55 | 服务商概览 · 预约日期与具体时间 | PASS | PASS (empty-switch normalization only where recorded) |
| 3126 | b55 | 服务商概览 · 退款或订单总金额 | PASS | PASS (empty-switch normalization only where recorded) |
| 3085 | b55 | 护理员工作台 · 预约基本信息列表 | PASS | PASS (empty-switch normalization only where recorded) |
| 2909 | b55 | 预订页 · 退款原因输入框 | PASS | PASS (empty-switch normalization only where recorded) |
| 2906 | b55 | 预订页 · 预约状态分组统计卡片 | PASS | PASS (empty-switch normalization only where recorded) |
| 2898 | b55 | 预订页 · 退款确认描述文字 | PASS | PASS (empty-switch normalization only where recorded) |
| 2854 | b55 | 预约页 · 预约统计与服务者名称 | PASS | PASS (empty-switch normalization only where recorded) |
| 2816 | b55 | 预约页 · 改期操作页脚按钮 | PASS | PASS (empty-switch normalization only where recorded) |
| 2815 | b55 | 预约页 · 已完成预约评价弹窗 | PASS | PASS (empty-switch normalization only where recorded) |
| 2805 | b55 | 预约页 · 改期弹窗标题 | PASS | PASS (empty-switch normalization only where recorded) |
| 2801 | b55 | 预约页 · 评价弹窗服务者姓名 | PASS | PASS (empty-switch normalization only where recorded) |
| 2775 | b55 | 预约页 · 重调时间确认信息 | PASS | PASS (empty-switch normalization only where recorded) |
| 2772 | b55 | 预约页 · 申请改期对话框 | PASS | PASS (empty-switch normalization only where recorded) |
| 2768 | b55 | 预约页 · 过去预约记录总数 | PASS | PASS (empty-switch normalization only where recorded) |
| 2767 | b55 | 预约页 · 取消预约确认描述 | PASS | PASS (empty-switch normalization only where recorded) |
| 2766 | b55 | 预约页 · 寻找服务者按钮 | PASS | PASS (empty-switch normalization only where recorded) |
| 2761 | b55 | 预约页 · 已结束预约列表 | PASS | PASS (empty-switch normalization only where recorded) |
| 2734 | b55 | 预约页 · 待处理预约数量 | PASS | PASS (empty-switch normalization only where recorded) |
| 2731 | b55 | 预约页 · 预约计数器 | PASS | PASS (empty-switch normalization only where recorded) |
| 2729 | b55 | 预约页 · 已结束预约数量 | PASS | PASS (empty-switch normalization only where recorded) |
| 2728 | b55 | 预约页 · 预约数量统计 | PASS | PASS (empty-switch normalization only where recorded) |
| 2725 | b55 | 预约页 · 无待参加预约提示 | PASS | PASS (empty-switch normalization only where recorded) |
| 2703 | b55 | 预约页 · 评价订单按钮 | PASS | PASS (empty-switch normalization only where recorded) |
| 2700 | b55 | 预约页 · 评价操作入口 | PASS | PASS (empty-switch normalization only where recorded) |
| 2694 | b55 | 预约页 · 预约日期时间显示 | PASS | PASS (empty-switch normalization only where recorded) |
| 2689 | b55 | 预约页 · 订单总费用金额 | PASS | PASS (empty-switch normalization only where recorded) |
| 2671 | b55 | 预约页 · 评价服务菜单项 | PASS | PASS (empty-switch normalization only where recorded) |
| 2670 | b55 | 预约页 · 预约项目信息卡片 | PASS | PASS (empty-switch normalization only where recorded) |
| 2667 | b55 | 预约页 · 操作菜单触发器 | PASS | PASS (empty-switch normalization only where recorded) |
| 2655 | b55 | 预约页 · 重新预约菜单项 | PASS | PASS (empty-switch normalization only where recorded) |
| 2653 | b55 | 预约页 · 预约状态文字 | PASS | PASS (empty-switch normalization only where recorded) |
| 2639 | b55 | 预约页 · 服务者头像图片 | PASS | PASS (empty-switch normalization only where recorded) |
| 2637 | b55 | 预约页 · 服务者全名首字母占位 | PASS | PASS (empty-switch normalization only where recorded) |
| 2625 | b55 | 预约页 · 护理员头像与全名 | PASS | PASS (empty-switch normalization only where recorded) |
| 2624 | b55 | 预约页 · 预约详情卡片列表 | PASS | PASS (empty-switch normalization only where recorded) |
| 1380 | b55 | 提现账户 · 提现历史列表详情 | PASS | PASS (empty-switch normalization only where recorded) |
| 1377 | b55 | 提现账户 · 待处理提现详情 | PASS | PASS (empty-switch normalization only where recorded) |
| 1320 | b55 | 收款设置 · PayPal邮箱输入框 | PASS | PASS (empty-switch normalization only where recorded) |
| 1299 | b55 | 收款设置 · 银行账号输入框 | PASS | PASS (empty-switch normalization only where recorded) |
| 1277 | b55 | 收款账户卡片 · 格式化最小提现金额 | PASS | PASS (empty-switch normalization only where recorded) |
| 1276 | b55 | 收款账户卡片 · 格式化当前余额显示 | PASS | PASS (empty-switch normalization only where recorded) |
| 1275 | b55 | 收款账户卡片 · 提现申请状态与流水列表 | PASS | PASS (empty-switch normalization only where recorded) |
| 1269 | b55 | 收款账户卡片 · 收款账户与余额概览 | PASS | PASS (empty-switch normalization only where recorded) |
| 1136 | b55 | 报价弹窗 · 货币符号与计费总额 | PASS | PASS (empty-switch normalization only where recorded) |
| 1031 | b55 | 报价卡片 · 价格标题与状态操作 | PASS | PASS (empty-switch normalization only where recorded) |
| 4805 | b55 | 购物车页·前往安全支付按钮 | PASS | PASS (empty-switch normalization only where recorded) |
| 194 | b55 | 预约详情页 · 预约审批处理区域 | PASS | PASS (empty-switch normalization only where recorded) |
| 195 | b55 | 预约详情页 · 服务商退款审批按钮组 | PASS | PASS (empty-switch normalization only where recorded) |
| 197 | b55 | 预约详情页 · 同意并退款 | PASS | PASS (empty-switch normalization only where recorded) |
| 199 | b55 | 预约详情页 · 拒绝退款按钮 | PASS | PASS (empty-switch normalization only where recorded) |
| 178 | b55 | 预约详情页 · 退款金额与理由显示 | PASS | PASS (empty-switch normalization only where recorded) |
| 192 | b55 | 预约详情页 · 退款金额带币种符号 | PASS | PASS (empty-switch normalization only where recorded) |
| 10486 | b56 | 日期例外表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
| 5235 | b55 | 服务商面板 · 特殊日期结束时间 | PASS | PASS (empty-switch normalization only where recorded) |
| 4665 | b55 | 护理者详情页 · 无可用时段提示语 | PASS | PASS (empty-switch normalization only where recorded) |
| 10452 | b56 | 申请成为护理者表单笔记 | PASS | PASS (empty-switch normalization only where recorded) |
