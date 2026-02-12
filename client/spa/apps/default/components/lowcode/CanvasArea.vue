<template>
  <div class="canvas-area" :class="{ 'drag-over': isDragOver }" @dragover.prevent="handleDragOver" @dragleave="handleDragLeave" @drop.prevent="handleDrop">
    <div v-if="dropIndicator.show" class="drop-indicator" :class="dropIndicator.position" :style="dropIndicator.style" />
    <div v-if="!hasComponents" class="canvas-empty">
      <el-empty description="从左侧组件库拖拽组件到此处" :image-size="120" />
    </div>
    <div v-else class="canvas-content" @click.self="handleCanvasClick">
      <component-wrapper v-for="comp in rootChildren" :key="comp.id" :config="comp" :preview-mode="previewMode" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLowcodeStore, CONTAINER_COMPONENTS } from '@app/store/lowcode';
import ComponentWrapper from './ComponentWrapper.vue';

const store = useLowcodeStore();
const isDragOver = ref(false);
const dropIndicator = ref<{ show: boolean; position: string; style: Record<string, string>; parentId?: string; siblingId?: string }>({
  show: false,
  position: 'append',
  style: {},
});

const rootChildren = computed(() => store.rootChildren);
const hasComponents = computed(() => rootChildren.value.length > 0);
const previewMode = computed(() => store.previewMode);

interface DragPayload {
  type: string;
  name: string;
  category: string;
}

function parseDragData(e: DragEvent): DragPayload | null {
  try {
    const raw = e.dataTransfer?.getData('application/json');
    if (!raw) return null;
    return JSON.parse(raw) as DragPayload;
  } catch {
    return null;
  }
}

/**
 * 获取拖拽目标信息
 * @param e 拖拽事件
 * @returns 目标父节点/兄弟节点及插入位置
 */
function getDropTarget(e: DragEvent): { parentId?: string; position: 'append' } | null {
  const pointX = e.clientX;
  const pointY = e.clientY;

  // 获取鼠标当前位置下的元素
  const el = document.elementFromPoint(pointX, pointY);
  if (!el) return { position: 'append' };

  // 判断落在空白/内容区
  const canvasContent = el.closest('.canvas-content');
  const canvasEmpty = el.closest('.canvas-empty');

  // 落在空画布区域，直接追加
  if (canvasEmpty) {
    return { position: 'append' };
  }

  // 未落在有效画布内容区，直接追加
  if (!canvasContent) {
    return { position: 'append' };
  }

  //根据e.target 找到最近的含有data-component-id的父节点
  const dropTargetWrapper = e.target instanceof Element ? e.target.closest('[data-component-id]') : null;

  if (dropTargetWrapper) {
    const compId = dropTargetWrapper.getAttribute('data-component-id');
    if (!compId) return null;
    const comp = store.getComponentById(compId);
    if (!comp) return null;
    if (CONTAINER_COMPONENTS.includes(comp.type)) {
      return { parentId: compId, position: 'append' };
    }
  }

  return { position: 'append' };
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  e.dataTransfer!.dropEffect = 'copy';
  isDragOver.value = true;
}

function handleDragLeave(e: DragEvent) {
  const target = e.currentTarget as HTMLElement | null;
  const related = e.relatedTarget as Node | null;
  if (!target || !related || !target.contains(related)) {
    isDragOver.value = false;
    dropIndicator.value = { show: false, position: 'append', style: {} };
  }
}

// 处理拖拽释放事件
function handleDrop(e: DragEvent) {
  e.preventDefault(); // 阻止默认行为
  e.stopPropagation(); // 阻止事件冒泡

  // 解析拖拽携带的数据
  const payload = parseDragData(e);

  // 若无有效组件类型则重置拖拽状态并退出
  if (!payload?.type) {
    isDragOver.value = false;
    dropIndicator.value = { show: false, position: 'append', style: {} };
    return;
  }

  // 判断具体的落点目标
  const target = getDropTarget(e);

  // 拖拽结束后统一隐藏拖拽指示器和拖拽状态
  isDragOver.value = false;
  dropIndicator.value = { show: false, position: 'append', style: {} };

  // 没有目标则默认直接添加组件
  if (!target) {
    store.addComponent(payload.type);
    return;
  }

  // 有父ID时添加到父容器末尾
  if (target.parentId) {
    store.addComponent(payload.type, { parentId: target.parentId, position: 'append' });
  }
  // 兜底逻辑，直接添加
  else {
    store.addComponent(payload.type);
  }
}

function handleCanvasClick() {
  store.selectComponent(null);
}
</script>

<style scoped>
.canvas-area {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: #f5f7fa;
  padding: 24px;
}

.canvas-area.drag-over {
  background: #ecf5ff;
}

.canvas-empty {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-content {
  min-height: 400px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drop-indicator {
  pointer-events: none;
  background: #409eff;
  border-radius: 2px;
  z-index: 1000;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.5);
}
</style>
