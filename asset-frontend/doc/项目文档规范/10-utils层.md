# utils 层说明

utils 层负责**提供通用的工具函数**，封装可复用的纯函数逻辑，不包含业务逻辑。

## 核心职责

- 🔧 **纯函数封装**：提供无副作用的纯函数工具
- 🔄 **可复用性**：跨项目、跨模块复用的工具函数
- 📦 **功能独立**：每个工具函数功能独立，不依赖其他模块
- 🎯 **类型安全**：完整的 TypeScript 类型定义
- ⚠️ **禁止业务逻辑**：不包含任何业务逻辑，只提供通用功能

## 设计原则

1. **纯函数优先**
   - ✅ 相同输入产生相同输出
   - ✅ 无副作用（不修改外部状态）
   - ✅ 不依赖外部状态
   - ❌ 不直接调用 api 层
   - ❌ 不直接访问 store
   - ❌ 不包含业务逻辑判断

2. **按平台分类**
   - **common/**：跨平台通用工具函数
   - **h5/**：H5 平台特有工具函数
   - **weapp/**：微信小程序特有工具函数
   - **其他平台/**：按需添加（如 alipay、tt 等）

3. **单一职责**
   - ✅ 每个文件只负责一类功能
   - ✅ 每个函数只做一件事
   - ✅ 函数命名清晰，见名知意
   - ✅ 避免创建过大的工具文件

4. **统一命名后缀**
   - ✅ 工具函数文件使用 `-util.ts` 后缀
   - ✅ 便于识别和管理
   - ✅ 与其他层的文件区分

## 目录结构

```typescript
src/utils/
├── common/                          # 跨平台通用工具函数
│   ├── date-util.ts                # 日期处理工具
│   ├── string-util.ts              # 字符串处理工具
│   ├── number-util.ts              # 数字处理工具
│   ├── array-util.ts               # 数组处理工具
│   ├── object-util.ts              # 对象处理工具
│   └── index.ts                    # 统一导出
│
├── h5/                              # H5 特有工具函数
│   ├── dom-util.ts                 # DOM 操作工具
│   ├── url-util.ts                 # URL 处理工具
│   ├── cookie-util.ts              # Cookie 工具
│   ├── decode-util.ts              # 解码工具
│   └── index.ts                    # 统一导出
│
├── weapp/                           # 小程序特有工具函数
│   ├── wx-util.ts                  # 微信 API 封装
│   ├── share-util.ts               # 分享工具
│   ├── auth-util.ts                # 授权工具
│   └── index.ts                    # 统一导出
│
└── index.ts                         # 顶层统一导出
```

## 命名规范

- **文件命名**：`[功能名]-util.ts`（如 `date-util.ts`、`string-util.ts`）

## 完整示例

```typescript
// ============================================
// utils/common/date-util.ts - 日期工具函数
// ============================================

/**
 * 格式化日期
 * 
 * @example
 * formatDate(new Date(), 'YYYY-MM-DD') // => '2024-01-01'
 */
export function formatDate(date: Date | number, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'number' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  // ... 其他格式处理
  return `${year}-${month}-${day}`
}

// 其他常用函数：getDaysDiff(), isToday(), addDays(), startOfDay() 等

// ============================================
// utils/common/string-util.ts - 字符串工具函数
// ============================================

/**
 * 驼峰转短横线
 * @example camelToKebab('userName') // => 'user-name'
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

// 其他常用函数：truncate(), capitalize(), kebabToCamel(), stripHtml() 等

// ============================================
// utils/common/validate-util.ts - 验证工具函数
// ============================================

/**
 * 验证邮箱格式
 */
export function isEmail(email: string): boolean {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return reg.test(email)
}

// 其他常用函数：isPhone(), isIdCard(), isUrl(), getPasswordStrength() 等

// ============================================
// utils/common/array-util.ts - 数组工具函数
// ============================================

/**
 * 数组去重
 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

/**
 * 数组分组
 * @example
 * groupBy([{ age: 20 }, { age: 30 }], 'age')
 * // => { '20': [{age: 20}], '30': [{age: 30}] }
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) result[groupKey] = []
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

// 其他常用函数：chunk(), shuffle(), flatten(), intersection() 等

// ============================================
// utils/common/object-util.ts - 对象工具函数
// ============================================

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  
  const clonedObj = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }
  return clonedObj
}

// 其他常用函数：deepMerge(), pick(), omit(), isEmpty() 等

// ============================================
// utils/h5/url-util.ts - URL 工具函数（H5 特有）
// ============================================

/**
 * 解析 URL 参数
 * @example parseQuery('?name=john') // => { name: 'john' }
 */
export function parseQuery(url: string): Record<string, string> {
  const query = url.startsWith('?') ? url.slice(1) : url
  return query.split('&').reduce((params, param) => {
    const [key, value] = param.split('=')
    params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    return params
  }, {} as Record<string, string>)
}

// 其他常用函数：buildQuery(), getUrlParam(), updateUrlParam() 等

// ============================================
// ❌ 错误示例 vs ✅ 正确示例
// ============================================

// ❌ 错误：调用 api、访问 store、包含业务逻辑
function badGetUserAge(userId: string) {
  const user = await getUserInfo(userId)  // ❌ 调用 api
  return user.age
}

function badCanUserEdit(user: User) {
  return user.role === 'admin'  // ❌ 业务逻辑判断
}

// ✅ 正确：纯函数，无副作用，通用功能
function calculateAge(birthday: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthday.getFullYear()
  const monthDiff = today.getMonth() - birthday.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--
  }
  return age
}

function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}
```

## 统一导出

为了方便使用，utils 层采用分层统一导出的方式，既支持按需引入，也支持分平台导出。

```typescript
// ============================================
// utils/common/index.ts - 通用工具统一导出
// ============================================

// 导出所有日期工具
export * from './date-util'

// 导出所有字符串工具
export * from './string-util'

// 导出所有数字工具
export * from './number-util'

// 导出所有数组工具
export * from './array-util'

// 导出所有对象工具
export * from './object-util'

// ============================================
// utils/h5/index.ts - H5 工具统一导出
// ============================================

export * from './dom-util'
export * from './url-util'
export * from './cookie-util'
export * from './decode-util'

// ============================================
// utils/weapp/index.ts - 小程序工具统一导出
// ============================================

export * from './wx-util'
export * from './share-util'
export * from './auth-util'

// ============================================
// utils/index.ts - 顶层统一导出（推荐使用）
// ============================================

/**
 * utils 层顶层统一导出
 */

// 按平台命名空间导出
// 使用方式：import { H5Utils, WeappUtils } from '@/utils'
export * as H5Utils from './h5'
export * as WeappUtils from './weapp'

```

## 使用示例

```typescript
// ============================================
// 按平台命名空间导入
// ============================================

import { H5Utils, WeappUtils } from '@/utils'

// H5 平台使用
const params = H5Utils.parseQuery('?name=john')
H5Utils.setCookie('token', 'xxx')

// 小程序平台使用
WeappUtils.share({ title: '分享标题' })
WeappUtils.wxRequest({ url: '/api/data' })
```

## 最佳实践总结

| 场景 | 做法 | 示例 |
|------|------|------|
| **函数定位** | ✅ 纯函数，无副作用 | 相同输入产生相同输出 |
| **功能范围** | ✅ 通用功能，不包含业务逻辑 | `formatDate()`, `isEmail()` |
| **类型安全** | ✅ 完整的 TypeScript 类型定义 | `function formatDate(date: Date): string` |
| **API 调用** | ❌ 不直接调用 api 层 | 工具函数不应该调用接口 |
| **Store 访问** | ❌ 不直接访问 store | 工具函数不应该依赖全局状态 |
| **业务逻辑** | ❌ 不包含业务逻辑判断 | 业务逻辑放在 services/functions |
| **依赖关系** | ✅ 只依赖其他工具函数 | 可以调用同层其他工具函数 |
| **文件命名** | ✅ 使用 `-util.ts` 后缀 | `date-util.ts`, `string-util.ts` |
| **函数命名** | ✅ 动词开头，见名知意 | `formatDate`, `validateEmail` |
| **文档注释** | ✅ 提供清晰的 JSDoc 注释 | 包含参数、返回值、示例 |
| **统一导出** | ✅ 各层级使用 index.ts 统一导出 | `utils/common/index.ts`, `utils/index.ts` |

**核心原则**：
1. ✅ **纯函数**：无副作用，相同输入产生相同输出
2. ✅ **通用性**：可跨项目、跨模块复用
3. ✅ **独立性**：不依赖业务层（api、store、services）
4. ✅ **类型安全**：完整的 TypeScript 类型定义
5. ✅ **单一职责**：每个函数只做一件事
6. ❌ **禁止业务逻辑**：不做业务判断、不调用 api、不访问 store

**禁止事项**：
```typescript
// ❌ 禁止在 utils 中调用 api
import { getUserInfo } from '@/api/user-api'  // ❌

// ❌ 禁止在 utils 中访问 store
import { useUserStore } from '@/store/user-store'  // ❌

// ❌ 禁止在 utils 中包含业务逻辑
function canUserEdit(user: User) {
  return user.role === 'admin' && user.permissions.includes('edit')  // ❌
}
```

**正确做法**：
```typescript
// ✅ 纯函数：格式化日期
export function formatDate(date: Date, format: string): string {
  // 纯粹的数据处理，无副作用
  return /* ... */
}

// ✅ 纯函数：验证邮箱
export function isEmail(email: string): boolean {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return reg.test(email)
}

// ✅ 纯函数：数组去重
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}
```

**工具函数职责边界**：
```
✅ utils 层应该做的：
- 日期、字符串、数组、对象等通用处理
- 格式化、验证、转换等纯函数
- 平台特定的底层 API 封装（如 URL、Cookie）
- 数学计算、加密解密等算法

❌ utils 层不应该做的：
- 业务逻辑判断
- API 调用
- Store 访问
- 依赖业务模型
```

**与其他层的关系**：
| 层级 | 职责 | 特点 |
|------|------|------|
| **utils 层** | 通用工具函数 | 纯函数，无副作用，可跨项目复用 |
| **services/functions 层** | 业务函数 | 包含业务逻辑，可调用 api、utils |
| **infrastructure 层** | 基础设施 | 平台能力封装，更底层 |

**使用场景**：
- ✅ 日期格式化、时间计算
- ✅ 字符串处理、格式转换
- ✅ 数组操作、对象处理
- ✅ 表单验证、数据校验
- ✅ 加密解密、编码解码
- ✅ URL 解析、参数处理
- ❌ 用户权限判断（应放在 services/functions）
- ❌ 业务数据处理（应放在 services/functions）

**调用关系**：
```
utils 层（被调用）
  ↑
services 层、pages 层、components 层（调用 utils）
```

-----

