# WooCommerce + Dokan 集成实现总结

## 已完成功能

### 1. WooCommerce REST API 服务层 (`src/services/woocommerce-api.ts`)

**核心功能：**
- **产品类型**: `easier_care_service` - 通过产品元数据标识服务类商品
- **分类**: `acompany` - 陪护服务分类
- **标签**: `challenged` - 平台标识标签
- **提供者产品管理**: 自动创建/更新提供者服务产品
- **订单管理**: 创建服务订单，关联预约信息
- **Dokan 集成**: 同步提供者到 Dokan vendor

**API Key:**
```
Consumer Key: ck_bae62884f3c64d4d860faae170e747e7bd5da8fa
Consumer Secret: cs_5c8c8e329fc158394613e32970d91601d4c08357
Base URL: http://170.106.171.59:8080/wp-json/wc/v3
```

### 2. React Hooks

#### Provider WooCommerce 同步 (`src/hooks/use-woocommerce.ts`)
- `useSyncProviderToWooCommerce()` - 同步提供者资料到 WooCommerce/Dokan
- `useProviderWooCommerceProduct()` - 获取提供者的 WooCommerce 产品
- `useUpdateProviderProductStatus()` - 更新产品上下架状态

#### Booking WooCommerce 集成 (`src/hooks/use-booking-woocommerce.ts`)
- `useCreateBookingWithWooCommerce()` - 创建预约并生成 WooCommerce 订单
- `useConfirmBookingWithWooCommerce()` - 确认预约并更新订单状态
- `useCompleteBookingWithWooCommerce()` - 完成预约并更新订单状态
- `useCancelBookingWithWooCommerce()` - 取消预约并更新订单状态

### 3. 前端集成

#### ProviderSettingsTab 修改 (`src/components/provider/ProviderSettingsTab.tsx`)
- 新增"Marketplace Integration"卡片，显示 WooCommerce 产品状态
- 保存时自动同步到 WooCommerce 和 Dokan
- 显示产品 ID、价格、状态等信息

#### CaregiverProfile 修改 (`src/pages/CaregiverProfile.tsx`)
- 使用 `useCreateBookingWithWooCommerce` 替代原有的 `useCreateBooking`
- 创建预约时自动生成 WooCommerce 订单

## 数据流架构

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React App     │────▶│   Supabase       │────▶│   WooCommerce   │
│                 │     │   care_connector │     │   + Dokan       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
       │                        │                       │
       ▼                        ▼                       ▼
  Provider Profile        profile table           Product (wc)
  Booking                 booking table           Order (wc)
  Availability            provider_availability   Vendor (dokan)
```

## 产品数据结构

### WooCommerce Product (服务商品)
```typescript
{
  name: "Provider Name - Care Service",
  type: "simple",
  regular_price: hourlyRate,
  sku: `provider-${providerId}`,
  categories: [{ slug: "acompany" }],
  tags: [{ slug: "challenged" }],
  virtual: true,  // 虚拟产品（服务）
  meta_data: [
    { key: "_provider_id", value: providerId },
    { key: "_service_type", value: "easier_care_service" },
    { key: "_hourly_rate", value: hourlyRate },
    { key: "_specialties", value: JSON.stringify(specialties) },
    { key: "_certifications", value: JSON.stringify(certifications) },
    { key: "_years_of_experience", value: yearsOfExperience },
    { key: "_location", value: location },
  ]
}
```

### Booking + Order 关联
```typescript
// Supabase booking
{
  id: "...",
  provider_id: "...",
  user_id: "...",
  appointment_date: "2024-01-15",
  appointment_time: "14:00",
  duration_hour: 4,
  total_cost: 140,
  wc_order_id: "12345",        // 关联 WooCommerce 订单
  wc_order_status: "pending",   // 同步订单状态
}
```

## 关键文件清单

| 文件 | 说明 |
|------|------|
| `src/services/woocommerce-api.ts` | WooCommerce REST API 封装 |
| `src/hooks/use-woocommerce.ts` | Provider 同步 hooks |
| `src/hooks/use-booking-woocommerce.ts` | Booking 集成 hooks |
| `src/components/provider/ProviderSettingsTab.tsx` | 提供者设置页面（已修改） |
| `src/pages/CaregiverProfile.tsx` | 预约页面（已修改） |

## 配置步骤

### 1. WordPress 后端配置（已完成）

访问 http://170.106.171.59:8080/wp-admin/

- WooCommerce 已安装并配置
- Dokan 已安装并配置
- REST API Key 已创建
- 产品分类 `acompany` 和标签 `challenged` 会在首次同步时自动创建

### 2. 前端环境变量

如需将 API key 移至环境变量，在 `.env` 中添加：
```
VITE_WC_CONSUMER_KEY=ck_bae62884f3c64d4d860faae170e747e7bd5da8fa
VITE_WC_CONSUMER_SECRET=cs_5c8c8e329fc158394613e32970d91601d4c08357
VITE_WC_BASE_URL=http://170.106.171.59:8080
```

### 3. 提供者使用流程

1. **注册成为提供者**: 填写资料（时薪、专长、认证等）
2. **保存设置**: 自动同步到 WooCommerce 创建产品
3. **上架服务**: 开启 `provider_is_active`，产品自动发布
4. **接收预约**: 用户预约时创建 WooCommerce 订单
5. **管理订单**: 在 ProviderDashboard 确认/完成预约，同步更新订单状态

## 安全注意事项

- API Key 当前硬编码在 `woocommerce-api.ts` 中，生产环境应移至后端或环境变量
- 建议使用后端代理处理 WooCommerce API 调用，避免暴露 credentials
- Dokan vendor 同步失败不影响核心功能（已添加 try-catch）

## 后续优化建议

1. **支付集成**: 接入 WooCommerce 支付网关（Stripe/PayPal）
2. **订单同步 webhook**: 设置 WordPress webhook 实时同步订单状态回 Supabase
3. **库存管理**: 添加 provider_availability 与 WooCommerce 库存联动
4. **优惠券**: 集成 WooCommerce 优惠券系统
5. **报表**: 使用 Dokan 报表功能统计提供者收入
