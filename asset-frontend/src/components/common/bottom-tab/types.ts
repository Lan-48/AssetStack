/** 底部 Tab 对应业务模块 */
export type BottomTabName = 'asset' | 'wardrobe'

/** 当前无对外 props，仅占位便于后续扩展 */
export type BottomTabProps = Record<string, never>

/** 当前无对外事件（切换页由内部 uni.navigateTo 完成） */
export type BottomTabEmits = Record<string, never>
