# Adapters 层（初始化层）说明

> ⚠️ **MANDATORY FOR AI/AGENT** ⚠️
> 
> **BEFORE READING THIS SECTION**, you MUST:
> 1. First invoke: `Bash("openskills read adapters-authoring")`
> 2. Only read this section if the skill explicitly says to, or for specific examples after loading the skill
> 3. **DO NOT read this entire section** when a skill is available - this wastes tokens
> 
> 当需要编写或修改 adapters 层初始化代码时，请优先加载 `adapters-authoring` skill，本部分提供完整参考与示例库使用。

adapters 层（注意：这是 `src/adapters`，不是 `infrastructure/*/adapters`）负责**初始化和配置** infrastructure 层的各个模块。

## 核心职责

- 🔧 **初始化**：创建 infrastructure 各模块的实例
- ⚙️ **配置**：设置模块参数（如 API 地址、超时时间、拦截器等）
- 📤 **导出**：统一导出已配置好的实例供业务层使用
- 🎛️ **环境适配**：根据环境（开发/生产/测试）选择不同配置
- ⚠️ **禁止转发式封装**：不做简单的 API 转发，直接导出 infrastructure 实例

## 设计原则

1. **只负责初始化，不做二次封装**
   - ✅ 初始化 + 配置 + 导出实例
   - ❌ 不要做转发式的方法包装（如 `get() { return client.get() }`）

2. **拦截器配置原则**
   - 优先使用 infrastructure 内置拦截器（如果满足需求）
   - 业务相关的拦截器放在 `adapters/interceptors/` 中
   - 在各模块的 setup 函数中配置拦截器
   - 不是所有模块都需要自定义拦截器

3. **导出命名规范**
   - 基础导出：直接使用模块名（如 `http`、`storage`、`logger`）
   - 业务扩展导出（尽量避免）：使用 `xxxCustom` 命名空间（如 `httpCustom.xxx()`）

4. **保持简洁**
   - 每个文件只负责一个模块的初始化
   - 复杂配置逻辑放在 `setup.ts` 中统一管理
   - 拦截器按模块组织在 `interceptors/` 子目录中

## 目录结构

```typescript
src/adapters/
├── http.ts           # 初始化 HTTP 客户端（导出 http 实例）
├── storage.ts        # 初始化存储服务（导出 storage 实例）
├── router.ts         # 初始化路由服务（导出 router 实例）
├── event.ts          # 初始化事件总线（导出 eventBus 实例）
├── logger.ts         # 初始化日志服务（导出 logger 实例）
├── i18n.ts           # 初始化国际化服务（导出 i18n 实例）
├── interceptors/     # 自定义拦截器（按需添加）
│   ├── http/         # HTTP 拦截器
│   │   ├── auth-interceptor.ts      # 认证拦截器
│   │   ├── retry-interceptor.ts     # 重试拦截器
│   │   └── cache-interceptor.ts     # 缓存拦截器
│   ├── storage/      # Storage 拦截器
│   │   └── encryption-interceptor.ts # 加密拦截器
│   └── logger/       # Logger 拦截器
│       └── filter-interceptor.ts     # 过滤拦截器
└── setup.ts          # 初始化入口（在 app 启动时调用）
```

> **说明**：
> - **不使用 index.ts**：每个服务从具体文件导入（如 `import { http } from '@/adapters/http'`）
> - **interceptors/ 目录按需创建**：只为需要自定义拦截器的模块创建子目录
> - **可以使用 infrastructure 内置拦截器**：如果内置拦截器满足需求，无需创建
> - **业务相关的拦截器放这里**：如认证、加密、缓存等业务逻辑相关的拦截器

## 标准示例：HTTP 客户端初始化

以下是 HTTP 客户端的标准初始化模式，展示如何配置拦截器：

```typescript
// adapters/http.ts
import { 
  HttpClientFactory, 
  getHttpClient,
  type IHttpClient 
} from '@/infrastructure/network';

// 使用 infrastructure 内置拦截器
import { 
  TokenInterceptor, 
  ResponseInterceptor 
} from '@/infrastructure/network/interceptors';

// 使用自定义拦截器
import { AuthInterceptor } from './interceptors/http/auth-interceptor';
import { RetryInterceptor } from './interceptors/http/retry-interceptor';
import { CacheInterceptor } from './interceptors/http/cache-interceptor';

/**
 * 初始化 HTTP 客户端
 * 应用启动时调用一次
 */
export function setupHttpClient(config: {
  baseURL: string;
  timeout?: number;
  enableLogging?: boolean;
}) {
  const { baseURL, timeout = 30000, enableLogging = true } = config;

  // 1. 初始化 HTTP 客户端
  HttpClientFactory.initialize({ baseURL, timeout });

  // 2. 获取客户端实例
  const client = getHttpClient();

  // 3. 配置内置拦截器
  client.requestInterceptors.use(new TokenInterceptor());
  client.responseInterceptors.use(new ResponseInterceptor());

  // 4. 配置自定义拦截器（业务相关）
  client.requestInterceptors.use(new AuthInterceptor());
  client.requestInterceptors.use(new RetryInterceptor({ maxRetries: 3 }));
  client.responseInterceptors.use(new CacheInterceptor());

  // 5. 根据环境添加日志拦截器
  if (enableLogging && process.env.NODE_ENV === 'development') {
    client.requestInterceptors.use(new LoggingInterceptor());
  }
}

/**
 * ✅ 推荐：直接导出 infrastructure 实例
 * 业务代码使用：http.get('/api/users')
 */
export const http = getHttpClient();

/**
 * ⚠️ 业务扩展（尽量避免）
 * 只在有业务特定需求时使用，命名空间为 Custom
 */
export const httpCustom = {
  /**
   * 示例：组合 GET 请求和下载的业务场景
   */
  async getAndDownload(url: string) {
    const data = await http.get(url);
    const filePath = await http.download(data.downloadUrl);
    return { data, filePath };
  },

  /**
   * 示例：带业务逻辑的请求
   */
  async requestWithRetry<T>(url: string, maxRetry = 3): Promise<T> {
    let lastError;
    for (let i = 0; i < maxRetry; i++) {
      try {
        return await http.get<T>(url);
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw lastError;
  }
};

// 导出类型
export type { IHttpClient, RequestConfig } from '@/infrastructure/network';
```

## 其他模块示例

```typescript
// adapters/logger.ts - 简单模块初始化（带自定义拦截器）
import { LoggerFactory, type ILogger } from '@/infrastructure/logger';
import { FilterInterceptor } from './interceptors/logger/filter-interceptor';

export function setupLogger(config?: { level?: string }) {
  LoggerFactory.initialize(config);
  
  // 添加自定义拦截器
  const logger = LoggerFactory.getInstance();
  logger.use(new FilterInterceptor({ 
    excludePatterns: ['debug', 'trace'] 
  }));
}

// ✅ 直接导出实例
export const logger = LoggerFactory.getInstance();

// adapters/storage.ts - 带平台选择和拦截器的初始化
import { StorageFactory, type IStorage } from '@/infrastructure/storage';
import { EncryptionInterceptor } from './interceptors/storage/encryption-interceptor';

export function setupStorage(platform: 'uni' | 'web') {
  StorageFactory.initialize(platform);
  
  // 添加加密拦截器（业务需求）
  const storage = StorageFactory.getInstance();
  storage.use(new EncryptionInterceptor({ 
    secretKey: process.env.ENCRYPTION_KEY 
  }));
}

// ✅ 直接导出实例
export const storage = StorageFactory.getInstance();
```

## 统一初始化

```typescript
// adapters/setup.ts - 应用启动时的统一初始化
import { setupHttpClient } from './http'
import { setupLogger } from './logger'
import { setupStorage } from './storage'
import { logger } from './logger'

/**
 * 初始化所有基础设施模块
 * 在应用启动时调用（如 App.vue 的 onLaunch 或 main.ts）
 */
export function setupInfrastructure() {
  // 1. 初始化日志（最先初始化，方便记录其他模块的初始化过程）
  setupLogger({ level: 'info' })
  logger.info('Starting infrastructure setup...')

  // 2. 初始化存储
  setupStorage('web')
  logger.info('Storage initialized')

  // 3. 初始化 HTTP 客户端
  setupHttpClient({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    enableLogging: import.meta.env.DEV
  })
  logger.info('HTTP client initialized')

  logger.info('Infrastructure setup completed')
}
```

## 业务代码中的使用

```typescript
// ✅ 推荐：从具体文件导入（更明确）
import { http } from '@/adapters/http'
import { logger } from '@/adapters/logger'
import { storage } from '@/adapters/storage'

export class UserService {
  async getUser(id: string) {
    logger.info('Fetching user', { id })
    
    // 直接调用 infrastructure 层的方法
    const user = await http.get(`/api/users/${id}`)
    await storage.set('currentUser', user)
    
    return user;
  }
}

// ⚠️ 仅在有特殊业务需求时使用 Custom 扩展
import { httpCustom } from '@/adapters/http'

export class FileService {
  async downloadUserFile(userId: string) {
    // 使用业务扩展方法
    const { data, filePath } = await httpCustom.getAndDownload(
      `/api/users/${userId}/files`
    )
    return filePath
  }
}
```

## 自定义拦截器示例

展示如何在 adapters 层创建业务相关的拦截器：

```typescript
// adapters/interceptors/http/auth-interceptor.ts
import { IHttpInterceptor } from '@/infrastructure/network';

/**
 * 认证拦截器 - 处理用户认证逻辑
 */
export class AuthInterceptor implements IHttpInterceptor {
  async onRequest(config: RequestConfig) {
    // 从 storage 获取用户 token
    const token = await storage.get('userToken');
    
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    return config;
  }
  
  async onResponse(response: HttpResponse) {
    // 处理 401 未授权
    if (response.statusCode === 401) {
      // 清除 token，跳转登录
      await storage.remove('userToken');
      router.navigateTo('/pages/login');
    }
    
    return response;
  }
}

// adapters/interceptors/storage/encryption-interceptor.ts
import { IStorageInterceptor } from '@/infrastructure/storage';
import { encrypt, decrypt } from '@/utils/crypto';

/**
 * 加密拦截器 - 敏感数据加密存储
 */
export class EncryptionInterceptor implements IStorageInterceptor {
  private secretKey: string;
  private sensitiveKeys = ['userToken', 'password', 'creditCard'];
  
  constructor(config: { secretKey: string }) {
    this.secretKey = config.secretKey;
  }
  
  beforeSet(key: string, value: any) {
    // 敏感数据加密
    if (this.sensitiveKeys.includes(key)) {
      return {
        key,
        value: encrypt(value, this.secretKey)
      };
    }
    return { key, value };
  }
  
  afterGet(key: string, value: any) {
    // 解密数据
    if (this.sensitiveKeys.includes(key) && value) {
      return decrypt(value, this.secretKey);
    }
    return value;
  }
}
```

## 最佳实践总结

| 场景 | 做法 | 示例 |
|------|------|------|
| **基础功能** | ✅ 直接导出 infrastructure 实例 | `export const http = getHttpClient()` |
| **初始化配置** | ✅ 提供 setup 函数 | `setupHttpClient(config)` |
| **自定义拦截器** | ✅ 业务相关的放在 adapters/interceptors/ | `import { AuthInterceptor } from './interceptors/http/auth-interceptor'` |
| **拦截器配置** | ✅ 在 setup 函数中添加 | `client.use(new AuthInterceptor())` |
| **简单转发** | ❌ 禁止 | `get() { return http.get() }` ❌ |
| **业务扩展** | ⚠️ 尽量避免，必要时使用 Custom 命名空间 | `export const httpCustom = { ... }` |
| **类型导出** | ✅ 重新导出 infrastructure 类型 | `export type { IHttpClient }` |

**拦截器使用原则**：
1. **优先使用内置**：infrastructure 提供的拦截器优先使用
2. **业务逻辑分离**：业务相关的拦截器放在 adapters/interceptors/
3. **按模块组织**：在 interceptors/ 下按模块创建子目录
4. **按需创建**：不是所有模块都需要自定义拦截器

**核心思想**：adapters 层是"配置层"，不是"封装层"。让业务代码直接使用 infrastructure 的能力，通过拦截器扩展业务逻辑，保持架构清晰。
