# Infrastructure 层说明

> ⚠️ **MANDATORY FOR AI/AGENT** ⚠️
> 
> **BEFORE READING THIS SECTION**, you MUST:
> 1. First invoke: `Bash("openskills read infrastructure-authoring")`
> 2. Only read this section if the skill explicitly says to, or for specific examples after loading the skill
> 3. **DO NOT read this entire section** when a skill is available - this wastes tokens
> 
> 当需要编写或修改 infrastructure 层模块时，请优先加载 `infrastructure-authoring` skill，本部分提供完整参考与示例库使用。

## 设计理念

infrastructure（基础设施层）是项目的核心底层架构，提供与平台无关的基础能力封装。

**核心原则**：
- 🔒 **独立性**：每个模块相互独立，不参与业务逻辑
- 🔄 **可替换性**：通过工厂模式和适配器模式，支持不同平台的实现切换
- 📦 **可复用性**：可独立发版，跨项目复用
- 🎯 **单一职责**：每个模块只负责一个基础能力

## 目录结构示例

```
src/infrastructure/
│
├── network/              # 网络请求模块（需要平台适配）
│   ├── factory/
│   │   └── http-client-factory.ts        # HTTP客户端工厂
│   ├── interfaces/
│   │   ├── i-http-client.ts              # HTTP客户端接口
│   │   ├── i-interceptor.ts              # 拦截器接口
│   │   └── types.ts                      # 类型定义
│   ├── impl/
│   │   └── http-client.ts                # HTTP客户端实现
│   ├── adapters/                         # 平台适配器
│   │   ├── uni-http-adapter.ts          # uni-app平台适配
│   │   └── xhr-http-adapter.ts           # 浏览器XHR适配
│   ├── interceptors/                     # 拦截器（可选实现）
│   │   ├── token-interceptor.ts          # Token拦截器
│   │   └── logging-interceptor.ts        # 日志拦截器
│   └── index.ts                          # 统一导出
│
├── storage/              # 存储模块（需要平台适配）
│   ├── factory/
│   │   └── storage-factory.ts            # 存储工厂
│   ├── interfaces/
│   │   ├── i-storage.ts                  # 存储接口
│   │   ├── i-storage-adapter.ts          # 存储适配器接口
│   │   └── i-storage-interceptor.ts      # 存储拦截器接口
│   ├── impl/
│   │   └── storage.ts                    # 存储核心实现
│   ├── adapters/                         # 平台适配器
│   │   ├── uni-storage-adapter.ts       # uni-app平台适配
│   │   └── web-storage-adapter.ts        # Web平台适配
│   ├── interceptors/                     # 拦截器（可选实现）
│   │   └── cache-interceptor.ts          # 缓存拦截器示例
│   └── index.ts                          # 统一导出
│
└── logger/               # 日志模块（无需平台适配）
    ├── factory/
    │   └── logger-factory.ts             # 日志工厂
    ├── interfaces/
    │   ├── i-logger.ts                   # 日志接口
    │   └── i-logger-interceptor.ts       # 日志拦截器接口
    ├── impl/
    │   └── logger.ts                     # 日志实现
    ├── interceptors/                     # 拦截器（可选实现）
    │   └── format-interceptor.ts         # 格式化拦截器示例
    └── index.ts                          # 统一导出
```

> **说明**：
> - **有平台差异的模块**（如 network、storage）需要 `adapters/` 目录
> - **无平台差异的模块**（如 logger）可省略 `adapters/` 目录
> - **所有模块都支持拦截器**：必须在 `interfaces/` 中定义拦截器接口，允许外部设置拦截器
> - **interceptors/ 目录可选**：模块内可以提供默认拦截器实现，也可以不提供，由外部（adapters层）实现

## 子目录职责说明

| 目录名 | 职责 | 是否必需 | 说明 |
|--------|------|---------|------|
| **factory/** | 工厂类 | ✅ 必需 | 使用工厂模式创建模块实例，隔离实例化逻辑 |
| **interfaces/** | 接口定义 | ✅ 必需 | 定义模块的接口契约（含拦截器接口），实现依赖倒置 |
| **impl/** | 核心实现 | ✅ 必需 | 模块的核心业务逻辑实现，必须支持拦截器机制 |
| **adapters/** | 平台适配器 | ⚠️ 按需 | 适配不同平台的差异，无平台差异时可省略 |
| **interceptors/** | 拦截器实现 | ⚠️ 可选 | 模块内置的拦截器实现，可以为空，由外部提供 |
| **index.ts** | 统一导出 | ✅ 必需 | 导出对外暴露的接口、类型、工厂方法和拦截器接口 |

## 各层详细说明

### 1. factory（工厂层）

- **作用**：创建和管理模块实例
- **职责**：
  - 根据环境/配置选择合适的实现，管理单例
  - **支持外部 adapter 注入**：如果模块配置了 adapter 多实现，即使有内部实现，也必须允许用户通过 factory 设置外部的 adapter
- **Adapter 配置原则**：
  - ✅ **有 adapter 的模块**：factory 必须支持通过配置传入外部 adapter 实例
  - ✅ **内部实现优先**：factory 默认使用内部 adapter 实现（如 `UniHttpAdapter`）
  - ✅ **允许覆盖**：用户可以通过 factory 方法传入自定义 adapter，覆盖默认实现
  - ⚠️ **无 adapter 的模块**：如果模块本身不需要 adapter（如 logger），则无需支持此功能
- **示例**：
  ```typescript
  // http-client-factory.ts - 支持外部 adapter
  export class HttpClientFactory {
    private static instance: IHttpClient | null = null;
    
    /**
     * 初始化 HTTP 客户端（使用默认 adapter）
     */
    static initialize(config: HttpClientConfig): IHttpClient {
      // 默认使用内部 UniHttpAdapter
      const adapter = new UniHttpAdapter(config);
      this.instance = new HttpClient(adapter, config);
      return this.instance;
    }
    
    /**
     * 初始化 HTTP 客户端（使用自定义 adapter）
     * ✅ 允许用户传入外部 adapter，覆盖默认实现
     */
    static initializeWithAdapter(
      adapter: IHttpAdapter, 
      config: HttpClientConfig
    ): IHttpClient {
      this.instance = new HttpClient(adapter, config);
      return this.instance;
    }
    
    /**
     * 创建新实例（支持自定义 adapter）
     */
    static create(
      config: HttpClientConfig, 
      adapter?: IHttpAdapter
    ): IHttpClient {
      const finalAdapter = adapter || new UniHttpAdapter(config);
      return new HttpClient(finalAdapter, config);
    }
  }
  
  // logger-factory.ts - 无 adapter，无需支持外部注入
  export class LoggerFactory {
    private static instance: ILogger;
    
    static create(config?: LoggerConfig): ILogger {
      if (!this.instance) {
        this.instance = new Logger(config);
      }
      return this.instance;
    }
  }
  ```

### 2. interfaces（接口层）

- **作用**：定义模块的接口契约
- **职责**：定义核心接口、适配器接口、拦截器接口、类型定义
- **命名规范**：接口以 `I` 开头，如 `ILogger`、`IStorage`、`ILoggerInterceptor`
- **示例**：
  ```typescript
  // i-logger.ts - 核心接口
  export interface ILogger {
    info(message: string, data?: any): void;
    error(message: string, error?: Error): void;
    warn(message: string): void;
    
    // 拦截器管理（所有模块必须支持）
    use(interceptor: ILoggerInterceptor): void;
    eject(interceptor: ILoggerInterceptor): void;
  }
  
  // i-logger-interceptor.ts - 拦截器接口
  export interface ILoggerInterceptor {
    // 日志输出前的拦截
    beforeLog?(level: string, message: string, data?: any): { message: string; data?: any } | void;
    // 日志输出后的拦截
    afterLog?(level: string, message: string, data?: any): void;
  }
  ```

### 3. impl（实现层）

- **作用**：实现接口定义的核心逻辑
- **职责**：实现接口，编写核心业务逻辑，调用 adapters，支持拦截器机制
- **示例**：
  ```typescript
  // logger.ts
  export class Logger implements ILogger {
    private interceptors: ILoggerInterceptor[] = [];
    
    // 添加拦截器
    use(interceptor: ILoggerInterceptor): void {
      this.interceptors.push(interceptor);
    }
    
    // 移除拦截器
    eject(interceptor: ILoggerInterceptor): void {
      const index = this.interceptors.indexOf(interceptor);
      if (index > -1) {
        this.interceptors.splice(index, 1);
      }
    }
    
    info(message: string, data?: any): void {
      // 执行拦截器的 beforeLog
      let finalMessage = message;
      let finalData = data;
      for (const interceptor of this.interceptors) {
        if (interceptor.beforeLog) {
          const result = interceptor.beforeLog('info', finalMessage, finalData);
          if (result) {
            finalMessage = result.message;
            finalData = result.data;
          }
        }
      }
      
      // 执行核心逻辑
      console.log(`[INFO] ${finalMessage}`, finalData);
      
      // 执行拦截器的 afterLog
      for (const interceptor of this.interceptors) {
        interceptor.afterLog?.('info', finalMessage, finalData);
      }
    }
    
    error(message: string, error?: Error): void {
      console.error(`[ERROR] ${message}`, error);
    }
  }
  ```

### 4. adapters（适配器层）

- **作用**：抹平不同平台的API差异
- **职责**：实现平台特定逻辑，将平台API转换为统一接口
- **何时使用**：
  - ✅ 存在平台差异时使用（如 storage、network）
  - ❌ 无平台差异时省略（如 logger）
- **示例**：
  ```typescript
  // web-storage-adapter.ts
  export class WebStorageAdapter implements IStorageAdapter {
    get(key: string): any {
      return localStorage.getItem(key);
    }
    
    set(key: string, value: any): void {
      localStorage.setItem(key, value);
    }
  }
  ```

### 5. interceptors（拦截器层）

- **作用**：提供可选的默认拦截器实现
- **职责**：实现常用的拦截器，可由外部（adapters层）按需使用
- **何时提供**：
  - ✅ 模块内可以提供默认拦截器（如 HTTP 的 Token 拦截器）
  - ✅ 也可以不提供，完全由外部实现
  - ✅ 拦截器接口必须在 interfaces 中定义
- **示例**：
  ```typescript
  // logger/interceptors/format-interceptor.ts
  import { ILoggerInterceptor } from '../interfaces/i-logger-interceptor';
  
  export class FormatInterceptor implements ILoggerInterceptor {
    beforeLog(level: string, message: string, data?: any) {
      // 在日志前添加时间戳
      const timestamp = new Date().toISOString();
      return {
        message: `[${timestamp}] ${message}`,
        data
      };
    }
  }
  ```

### 6. index.ts（导出层）

- **作用**：统一导出模块的公开API
- **职责**：导出工厂类、接口、类型和拦截器接口，隐藏内部实现
- **示例**：
  ```typescript
  // logger/index.ts
  export { LoggerFactory } from './factory/logger-factory';
  export type { ILogger } from './interfaces/i-logger';
  export type { ILoggerInterceptor } from './interfaces/i-logger-interceptor';
  
  // 导出默认拦截器（如果有）
  export { FormatInterceptor } from './interceptors/format-interceptor';
  ```

## 使用流程

```
1. 定义核心接口 (interfaces/i-xxx.ts)
   ↓
2. 定义拦截器接口 (interfaces/i-xxx-interceptor.ts) ← 必需
   ↓
3. 实现核心逻辑 (impl)，支持拦截器机制
   ↓
4. 实现平台适配 (adapters) ← 按需
   ↓
5. 实现默认拦截器 (interceptors) ← 可选
   ↓
6. 创建工厂方法 (factory)
   ↓
7. 统一导出 (index.ts)
   ↓
8. 在 adapters 层初始化并配置拦截器
```

## 最佳实践

1. **保持独立性**：模块之间避免直接依赖，通过 adapters 层集成
2. **接口优先**：先定义接口，再实现逻辑
3. **拦截器支持**：所有模块必须支持拦截器机制，定义拦截器接口
4. **适配器隔离**：平台相关代码必须封装在 adapters 中
5. **工厂集中**：所有实例创建逻辑放在 factory 中
6. **外部 adapter 支持**：
   - ✅ **有 adapter 的模块**：factory 必须支持通过配置传入外部 adapter 实例
   - ✅ **允许覆盖**：即使有内部实现，也必须允许用户通过 factory 设置外部的 adapter
   - ✅ **默认实现**：factory 默认使用内部 adapter 实现，用户可以选择覆盖
   - ⚠️ **无 adapter 的模块**：如果模块本身不需要 adapter（如 logger），则无需支持此功能
7. **拦截器可选**：模块内可以提供默认拦截器，也可以完全由外部实现
8. **类型导出**：每个模块的 index.ts 必须导出类型定义和拦截器接口
