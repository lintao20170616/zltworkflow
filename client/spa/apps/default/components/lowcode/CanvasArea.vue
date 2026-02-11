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

function getDropTarget(e: DragEvent): { parentId?: string; siblingId?: string; position: 'append' | 'before' | 'after' } | null {
  const pointX = e.clientX;
  const pointY = e.clientY;

  const el = document.elementFromPoint(pointX, pointY);
  if (!el) return { position: 'append' };

  const canvasContent = el.closest('.canvas-content');
  const canvasEmpty = el.closest('.canvas-empty');

  if (canvasEmpty) {
    return { position: 'append' };
  }

  if (!canvasContent) {
    return { position: 'append' };
  }

  const allWrappers = Array.from(document.querySelectorAll('[data-component-id]'));

  let bestContainer: { wrapper: Element; compId: string; area: number } | null = null;
  let siblingWrapper: Element | null = null;
  let siblingCompId: string | null = null;

  for (const wrapper of allWrappers) {
    const rect = wrapper.getBoundingClientRect();
    if (pointX >= rect.left && pointX <= rect.right && pointY >= rect.top && pointY <= rect.bottom) {
      const compId = wrapper.getAttribute('data-component-id');
      if (!compId) continue;

      const comp = store.getComponentById(compId);
      if (!comp) continue;

      const isContainer = CONTAINER_COMPONENTS.includes(comp.type);
      const isInContainerArea = pointY > rect.top + rect.height * 0.2 && pointY < rect.bottom - rect.height * 0.2;

      if (isContainer && isInContainerArea) {
        const area = rect.width * rect.height;
        if (!bestContainer || area > bestContainer.area) {
          bestContainer = { wrapper, compId, area };
        }
      } else if (!siblingWrapper) {
        siblingWrapper = wrapper;
        siblingCompId = compId;
      }
    }
  }

  if (bestContainer) {
    return { parentId: bestContainer.compId, position: 'append' };
  }

  if (siblingWrapper && siblingCompId) {
    const rect = siblingWrapper.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    if (pointY < midY) {
      return { siblingId: siblingCompId, position: 'before' };
    }
    return { siblingId: siblingCompId, position: 'after' };
  }

  return { position: 'append' };
}

function updateDropIndicator(e: DragEvent) {
  const target = getDropTarget(e);
  if (!target) {
    dropIndicator.value = { show: false, position: 'append', style: {} };
    return;
  }

  const canvasContent = document.querySelector('.canvas-content');
  const canvasEmpty = document.querySelector('.canvas-empty');

  if (target.position === 'append' && !target.parentId && !target.siblingId) {
    if (canvasEmpty) {
      const rect = canvasEmpty.getBoundingClientRect();
      dropIndicator.value = {
        show: true,
        position: 'append',
        style: {
          position: 'fixed',
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        },
      };
    } else if (canvasContent) {
      const rect = canvasContent.getBoundingClientRect();
      dropIndicator.value = {
        show: true,
        position: 'append',
        style: {
          position: 'fixed',
          top: `${rect.bottom - 4}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: '4px',
        },
      };
    }
    return;
  }

  if (target.siblingId) {
    const wrapper = document.querySelector(`[data-component-id="${target.siblingId}"]`);
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      const isBefore = target.position === 'before';
      dropIndicator.value = {
        show: true,
        position: target.position,
        style: {
          position: 'fixed',
          top: isBefore ? `${rect.top - 2}px` : `${rect.bottom - 2}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: '4px',
        },
        siblingId: target.siblingId,
        parentId: target.parentId,
      };
    }
  } else if (target.parentId) {
    const wrapper = document.querySelector(`[data-component-id="${target.parentId}"]`);
    if (wrapper) {
      const inner =
        wrapper.querySelector('.empty-container') ||
        wrapper.querySelector('.el-form') ||
        wrapper.querySelector('.el-card__body') ||
        wrapper.querySelector('.el-tabs__content') ||
        wrapper;
      const rect = inner.getBoundingClientRect();
      dropIndicator.value = {
        show: true,
        position: 'append',
        style: {
          position: 'fixed',
          top: `${rect.bottom - 4}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: '4px',
        },
        parentId: target.parentId,
      };
    }
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  e.dataTransfer!.dropEffect = 'copy';
  isDragOver.value = true;
  updateDropIndicator(e);
}

function handleDragLeave(e: DragEvent) {
  const target = e.currentTarget as HTMLElement | null;
  const related = e.relatedTarget as Node | null;
  if (!target || !related || !target.contains(related)) {
    isDragOver.value = false;
    dropIndicator.value = { show: false, position: 'append', style: {} };
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();

  const payload = parseDragData(e);
  if (!payload?.type) {
    isDragOver.value = false;
    dropIndicator.value = { show: false, position: 'append', style: {} };
    return;
  }

  const target = getDropTarget(e);
  isDragOver.value = false;
  dropIndicator.value = { show: false, position: 'append', style: {} };

  if (!target) {
    store.addComponent(payload.type);
    return;
  }

  if (target.parentId) {
    store.addComponent(payload.type, { parentId: target.parentId, position: 'append' });
  } else if (target.siblingId) {
    store.addComponent(payload.type, {
      parentId: undefined,
      position: target.position,
      siblingId: target.siblingId,
    });
  } else {
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
