<!--
  组件名称：FileUploader

  组件描述：通用图片上传组件，支持选择、多图预览、删除、大小与数量限制，交互参考 Vant Uploader。

  组件参数说明：
  - modelValue: 已选择文件列表（v-model）
  - multiple: 是否开启多选
  - maxCount: 最大上传数量
  - maxSize: 单文件大小限制（byte）
  - previewSize: 预览项尺寸（默认 160rpx）
  - deletable: 是否允许删除
  - disabled: 是否禁用
  - readonly: 是否只读（只看不改）
  - showUpload: 是否显示上传入口
  - previewImage: 是否展示预览图
  - previewFullImage: 点击预览时是否全屏查看
  - uploadText: 上传区域文案

  组件事件说明：
  - update:modelValue: 文件列表变化时触发
  - after-read: 读取文件后触发
  - oversize: 文件超过大小限制时触发
  - delete: 删除文件时触发
  - click-upload: 点击上传入口时触发
  - click-preview: 点击预览项时触发

  组件使用示例：
  <FileUploader
    v-model="fileList"
    :multiple="true"
    :max-count="3"
    :max-size="500 * 1024"
    @after-read="handleAfterRead"
    @oversize="handleOversize"
  />
-->
<template>
  <view class="file-uploader">
    <view class="file-uploader__list">
      <view
        v-for="(file, index) in fileList"
        :key="`${file.url}-${index}`"
        class="file-uploader__item"
        :style="previewStyle"
      >
        <slot
          name="preview"
          :file="file"
          :index="index"
          :onPreview="() => onPreview(index)"
          :onChoose="onChoose"
          :onDelete="() => onDelete(index)"
          :canDelete="canDelete(file)"
        >
          <image
            v-if="previewImage"
            class="file-uploader__preview"
            :src="file.url"
            mode="aspectFill"
            @tap="onPreview(index)"
          />
          <view
            v-else
            class="file-uploader__preview file-uploader__preview--placeholder"
            @tap="onPreview(index)"
          >
            <text class="file-uploader__placeholder-text">文件</text>
          </view>

          <view v-if="canDelete(file)" class="file-uploader__delete" @tap.stop="onDelete(index)">
            <text class="file-uploader__delete-text">x</text>
          </view>

          <view v-if="file.status && file.status !== 'done'" class="file-uploader__mask">
            <text class="file-uploader__mask-text">{{ file.message || file.status }}</text>
          </view>
        </slot>
      </view>

      <slot
        v-if="showUploadCell"
        name="upload"
        :onChoose="onChoose"
        :disabled="disabled || readonly"
      >
        <view
          class="file-uploader__upload"
          :style="previewStyle"
          :class="{ 'file-uploader__upload--disabled': disabled || readonly }"
          @tap="onChoose"
        >
          <text class="file-uploader__upload-icon">+</text>
          <text v-if="uploadText" class="file-uploader__upload-text">{{ uploadText }}</text>
        </view>
      </slot>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import type { FileUploaderEmits, FileUploaderItem, FileUploaderProps } from './types'

  const props = withDefaults(defineProps<FileUploaderProps>(), {
    modelValue: () => [],
    multiple: false,
    maxCount: Number.POSITIVE_INFINITY,
    maxSize: Number.POSITIVE_INFINITY,
    previewSize: '160rpx',
    deletable: true,
    disabled: false,
    readonly: false,
    showUpload: true,
    previewImage: true,
    previewFullImage: true,
    uploadText: ''
  })

  const emit = defineEmits<FileUploaderEmits>()

  defineOptions({ name: 'FileUploader' })

  const fileList = computed(() => props.modelValue ?? [])
  const choosing = ref(false)

  const previewStyle = computed(() => {
    const size =
      typeof props.previewSize === 'number' ? `${props.previewSize}px` : props.previewSize
    return { width: size, height: size }
  })

  const showUploadCell = computed(() => {
    return props.showUpload && fileList.value.length < props.maxCount
  })

  function canDelete(file: FileUploaderItem) {
    if (props.disabled || props.readonly || !props.deletable) return false
    return file.deletable !== false
  }

  async function onChoose() {
    emit('click-upload')
    if (props.disabled || props.readonly) return
    if (choosing.value) return

    const remain = Math.max(props.maxCount - fileList.value.length, 0)
    const canReplaceSingle = !props.multiple && props.maxCount === 1 && fileList.value.length >= 1
    if (remain <= 0 && !canReplaceSingle) return

    const uniWithChooseImage = uni as typeof uni & {
      chooseImage?: (options: {
        count: number
        sizeType: string[]
        sourceType: string[]
      }) => Promise<{
        tempFilePaths?: string[]
        tempFiles?: Array<{ path?: string; size?: number }>
      }>
    }

    if (!uniWithChooseImage.chooseImage) {
      uni.showToast({ title: '当前环境不支持上传', icon: 'none' })
      return
    }

    choosing.value = true
    try {
      const result = await uniWithChooseImage.chooseImage({
        count: props.multiple ? Math.min(remain, 9) : 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      const paths = result.tempFilePaths ?? []
      const tempFiles = result.tempFiles ?? []
      const picked: FileUploaderItem[] = paths.map((path, index) => ({
        url: path,
        name: path.split('/').pop() || `image-${Date.now()}-${index}`,
        size: tempFiles[index]?.size,
        isImage: true,
        status: 'done'
      }))

      const oversizeFiles = picked.filter((file) => {
        const size = typeof file.size === 'number' ? file.size : 0
        return size > props.maxSize
      })

      if (oversizeFiles.length > 0) {
        emit('oversize', oversizeFiles)
      }

      const accepted = picked.filter((file) => !oversizeFiles.includes(file))
      if (accepted.length === 0) return

      const next = canReplaceSingle
        ? accepted[0]
          ? [accepted[0]]
          : []
        : [...fileList.value, ...accepted].slice(0, props.maxCount)
      emit('update:modelValue', next)
      emit('after-read', props.multiple ? accepted : accepted[0])
    } catch (error) {
      const errMsg =
        typeof error === 'object' && error !== null
          ? String((error as { errMsg?: unknown }).errMsg ?? '')
          : ''
      // 用户主动取消选择，不作为错误提示
      if (/cancel/i.test(errMsg)) return
      uni.showToast({ title: '选择文件失败', icon: 'none' })
    } finally {
      choosing.value = false
    }
  }

  function onDelete(index: number) {
    const file = fileList.value[index]
    if (!file || !canDelete(file)) return
    const next = fileList.value.filter((_, i) => i !== index)
    emit('update:modelValue', next)
    emit('delete', { index, file })
  }

  function onPreview(index: number) {
    const file = fileList.value[index]
    if (!file) return
    emit('click-preview', { index, file })
    if (!props.previewFullImage) return

    const uniWithPreview = uni as typeof uni & {
      previewImage?: (options: { current?: string; urls: string[] }) => void
    }

    if (!uniWithPreview.previewImage) return
    uniWithPreview.previewImage({
      current: file.url,
      urls: fileList.value.map((item) => item.url)
    })
  }
</script>

<style scoped lang="scss">
  @use '@/styles/theme/base/base.scss' as *;
  @use '@/styles/theme/themes/default.scss' as *;

  .file-uploader {
    width: 100%;
  }

  .file-uploader__list {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  .file-uploader__item {
    position: relative;
    border-radius: $radius-sm;
    overflow: hidden;
    background-color: $bg-secondary;
  }

  .file-uploader__preview {
    width: 100%;
    height: 100%;
    display: block;
  }

  .file-uploader__preview--placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $bg-secondary;
  }

  .file-uploader__placeholder-text {
    color: $text-tertiary;
    font-size: $font-xs;
  }

  .file-uploader__delete {
    position: absolute;
    right: 0;
    top: 0;
    width: 36rpx;
    height: 36rpx;
    background-color: $overlay-50;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom-left-radius: $radius-xs;
  }

  .file-uploader__delete-text {
    color: $text-white;
    font-size: $font-xs;
    line-height: 1;
  }

  .file-uploader__mask {
    position: absolute;
    inset: 0;
    background-color: $overlay-40;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 $spacing-sm;
    box-sizing: border-box;
  }

  .file-uploader__mask-text {
    color: $text-white;
    font-size: $font-xs;
    text-align: center;
  }

  .file-uploader__upload {
    border-radius: $radius-sm;
    border: 1rpx dashed $border;
    background-color: $bg-secondary;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    box-sizing: border-box;
  }

  .file-uploader__upload--disabled {
    opacity: $opacity-disabled;
  }

  .file-uploader__upload-icon {
    color: $text-quaternary;
    font-size: $font-xl;
    line-height: 1;
  }

  .file-uploader__upload-text {
    color: $text-tertiary;
    font-size: $font-xs;
  }
</style>
