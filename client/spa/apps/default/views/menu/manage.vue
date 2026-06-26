<template>
  <div class="menu-manage">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon"><menu /></el-icon>
            <span class="header-title">{{ $t('菜单管理') }}</span>
          </div>
          <div class="header-actions">
            <el-select v-model="query.systemId" placeholder="选择系统" clearable style="width: 200px" @change="handleSystemChange">
              <el-option v-for="s in systems" :key="s.id" :label="`${s.name}（${s.code}）`" :value="s.id" />
            </el-select>
            <el-input v-model="query.keyword" placeholder="搜索名称/路由" clearable style="width: 220px" :disabled="!query.systemId" />
            <el-select v-model="query.status" placeholder="状态" clearable style="width: 140px" :disabled="!query.systemId" @change="loadList">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <el-button type="primary" :disabled="!query.systemId" @click="openCreate">
              <el-icon><plus /></el-icon>
              新增菜单
            </el-button>
            <el-button :loading="loading" :disabled="!query.systemId" @click="loadList">
              <el-icon><refresh /></el-icon>
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="query.systemId" class="stats-bar">
        <div class="stat-item">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">总菜单</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value stat-enabled">{{ stats.enabled }}</span>
          <span class="stat-label">启用</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value stat-disabled">{{ stats.disabled }}</span>
          <span class="stat-label">禁用</span>
        </div>
        <div class="header-actions-right">
          <el-button size="small" @click="expandAll">
            <el-icon><expand /></el-icon>
            展开全部
          </el-button>
          <el-button size="small" @click="collapseAll">
            <el-icon><fold /></el-icon>
            收起全部
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="treeList"
        style="width: 100%"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
        :expand-row-keys="expandedKeys"
        border
        stripe
        highlight-current-row
        @expand-change="handleExpandChange"
      >
        <el-table-column prop="title" label="菜单名称" min-width="200">
          <template #default="{ row }">
            <div class="menu-title-cell">
              <el-icon v-if="row.icon" :size="18" class="menu-icon">
                <component :is="getIcon(row.icon)" />
              </el-icon>
              <span>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="路由名" width="160" />
        <el-table-column prop="path" label="路由路径" min-width="200" />
        <el-table-column prop="component" label="组件" width="180" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="140">
          <template #default="{ row }">
            <el-switch :model-value="row.status === 1" :loading="row._changingStatus" @change="(val: boolean) => handleToggleStatus(row, val)" />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            <span>{{ formatTime(row.updatedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openCreate(row)">
              <el-icon><plus /></el-icon>
              新增子菜单
            </el-button>
            <el-button type="primary" link size="small" @click="openEdit(row)">
              <el-icon><edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && !query.systemId" class="empty-state">
        <el-icon class="empty-icon"><menu /></el-icon>
        <p class="empty-text">请选择系统查看菜单</p>
      </div>

      <div v-else-if="!loading && treeList.length === 0" class="empty-state">
        <el-icon class="empty-icon"><document /></el-icon>
        <p class="empty-text">暂无菜单数据</p>
        <el-button type="primary" @click="openCreate">立即创建</el-button>
      </div>
    </el-card>

    <el-drawer v-model="drawerVisible" :title="drawerMode === 'create' ? '新增菜单' : '编辑菜单'" direction="rtl" :width="560">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-form-item label="系统" prop="systemId">
          <el-select v-model="form.systemId" placeholder="选择系统" style="width: 100%" :disabled="drawerMode === 'edit'">
            <el-option v-for="s in systems" :key="s.id" :label="`${s.name}（${s.code}）`" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="父级" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentTreeOptions"
            :props="{ label: 'title', value: 'id', children: 'children' }"
            placeholder="选择父级菜单（可选）"
            clearable
            style="width: 100%"
            :disabled="drawerMode === 'edit' && !canChangeParent"
          />
        </el-form-item>
        <el-form-item label="名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="选择图标" readonly style="cursor: pointer" @click="showIconPicker = true" />
        </el-form-item>

        <el-divider content-position="left">路由配置</el-divider>
        <el-form-item label="路由名" prop="name">
          <el-input v-model="form.name" placeholder="请输入路由 name" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入路由 path" />
        </el-form-item>
        <el-form-item label="组件" prop="component">
          <el-input v-model="form.component" placeholder="组件标识/路径（可选）" />
        </el-form-item>

        <el-divider content-position="left">显示配置</el-divider>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="formStatusSwitch" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
      </template>
    </el-drawer>

    <el-dialog v-model="showIconPicker" title="选择图标" width="500px" append-to-body>
      <div class="icon-picker">
        <el-input v-model="iconFilter" placeholder="搜索图标" style="margin-bottom: 16px" />
        <div class="icon-grid">
          <div v-for="icon in filteredIcons" :key="icon.name" class="icon-item" :class="{ selected: form.icon === icon.name }" @click="selectIcon(icon.name)">
            <el-icon :size="24"><component :is="icon.component" /></el-icon>
            <span>{{ icon.name }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showIconPicker = false">取消</el-button>
        <el-button type="primary" @click="showIconPicker = false">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, resolveComponent, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Menu, Plus, Refresh, Expand, Fold, Edit, Delete, Document, HomeFilled, Odometer, User, Setting } from '@element-plus/icons-vue';
import { getSystemList, type SystemItem } from '@app/service/system';
import { buildMenuTree, createMenu, deleteMenu, getMenuList, updateMenu, updateMenuStatus, type MenuItem, type MenuTreeItem } from '@app/service/menu';

type MenuRow = MenuItem & { _changingStatus?: boolean };

const loading = ref(false);
const saving = ref(false);
const showIconPicker = ref(false);
const iconFilter = ref('');

const systems = ref<SystemItem[]>([]);
const list = ref<MenuRow[]>([]);
const expandedKeys = ref<number[]>([]);

const query = reactive<{ systemId: number | null; keyword: string; status: number | '' }>({
  systemId: null,
  keyword: '',
  status: '',
});

const drawerVisible = ref(false);
const drawerMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);
const parentMenuId = ref<number | null>(null);

const formRef = ref();
const form = reactive<{
  systemId: number | null;
  parentId: number | null;
  title: string;
  name: string;
  path: string;
  icon: string | null;
  component: string | null;
  sort: number;
  status: number;
}>({
  systemId: null,
  parentId: null,
  title: '',
  name: '',
  path: '',
  icon: null,
  component: null,
  sort: 0,
  status: 1,
});

const formStatusSwitch = computed({
  get: () => form.status === 1,
  set: (val: boolean) => {
    form.status = val ? 1 : 0;
  },
});

const rules = {
  systemId: [{ required: true, message: '请选择系统', trigger: 'change' }],
  title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  name: [{ required: true, message: '请输入路由名', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
} as const;

const treeList = computed(() => {
  return buildMenuTree(list.value);
});

const parentTreeOptions = computed(() => {
  const options = buildMenuTree(list.value);
  if (drawerMode.value === 'edit' && editingId.value) {
    const removeItem = (items: MenuTreeItem[]): MenuTreeItem[] => {
      return items
        .filter((item) => item.id !== editingId.value)
        .map((item) => ({
          ...item,
          children: item.children ? removeItem(item.children) : undefined,
        }));
    };
    return removeItem(options);
  }
  return options;
});

const canChangeParent = computed(() => {
  if (drawerMode.value !== 'edit' || !editingId.value) return true;
  const item = list.value.find((m) => m.id === editingId.value);
  return !item?.children || item.children.length === 0;
});

const stats = computed(() => {
  const total = list.value.length;
  const enabled = list.value.filter((m) => m.status === 1).length;
  const disabled = total - enabled;
  return { total, enabled, disabled };
});

const iconNames = [
  'HomeFilled',
  'Odometer',
  'User',
  'Setting',
  'Menu',
  'Folder',
  'FolderOpened',
  'Files',
  'Document',
  'Picture',
  'ShoppingCart',
  'Ticket',
  'Message',
  'Notification',
  'Bell',
  'BellFilled',
  'Clock',
  'Calendar',
  'Link',
  'CopyDocument',
  'Check',
  'Close',
  'Help',
  'Warning',
  'Search',
  'Filter',
  'Sort',
  'Download',
  'Upload',
  'Printer',
  'Share',
  'Star',
  'StarFilled',
  'View',
  'Hide',
  'Key',
  'Lock',
  'Unlock',
  'UserFilled',
  'Headset',
  'Phone',
  'More',
  'MoreFilled',
  'List',
  'FolderAdd',
  'DocumentAdd',
  'EditPen',
  'Wallet',
  'Coin',
  'Money',
  'Trophy',
  'Medal',
  'Flag',
  'Camera',
  'VideoCamera',
  'Microphone',
  'Monitor',
  'GitBranch',
  'GitCommit',
  'Code',
  'Github',
  'Mail',
  'InfoFilled',
  'WarningFilled',
  'SuccessFilled',
  'Failed',
  'Radio',
  'Switch',
  'Timer',
  'Stopwatch',
];

const allIcons = computed(() =>
  iconNames
    .map((name) => ({
      name,
      component: resolveComponent(name),
    }))
    .filter((item) => item.component),
);

const filteredIcons = computed(() => {
  if (!iconFilter.value) return allIcons.value;
  const filter = iconFilter.value.toLowerCase();
  return allIcons.value.filter((icon) => icon.name.toLowerCase().includes(filter));
});

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => query.keyword,
  () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadList();
    }, 300);
  },
);

const getIcon = (iconName: string | null | undefined) => {
  if (!iconName) return Odometer;
  return resolveComponent(iconName) || Odometer;
};

const formatTime = (time: string) => {
  if (!time) return '-';
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const loadSystems = async () => {
  try {
    systems.value = await getSystemList();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载系统列表失败');
  }
};

const loadList = async () => {
  if (!query.systemId) return;
  loading.value = true;
  try {
    const data = await getMenuList({
      systemId: query.systemId,
      keyword: query.keyword || undefined,
      status: query.status,
    });
    list.value = data.map((item) => ({ ...item }));
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载菜单列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSystemChange = async () => {
  query.keyword = '';
  query.status = '';
  expandedKeys.value = [];
  await loadList();
};

const expandAll = () => {
  expandedKeys.value = list.value.map((item) => item.id);
};

const collapseAll = () => {
  expandedKeys.value = [];
};

const handleExpandChange = (row: MenuRow, expanded: boolean) => {
  const idx = expandedKeys.value.indexOf(row.id);
  if (expanded && idx === -1) {
    expandedKeys.value.push(row.id);
  } else if (!expanded && idx !== -1) {
    expandedKeys.value.splice(idx, 1);
  }
};

const resetForm = () => {
  form.systemId = query.systemId;
  form.parentId = parentMenuId.value || null;
  form.title = '';
  form.name = '';
  form.path = '';
  form.icon = null;
  form.component = null;
  form.sort = 0;
  form.status = 1;
};

const openCreate = (parentRow?: MenuItem) => {
  drawerMode.value = 'create';
  editingId.value = null;
  parentMenuId.value = parentRow?.id || null;
  resetForm();
  drawerVisible.value = true;
};

const openEdit = (row: MenuItem) => {
  drawerMode.value = 'edit';
  editingId.value = row.id;
  parentMenuId.value = null;
  form.systemId = row.systemId;
  form.parentId = row.parentId;
  form.title = row.title;
  form.name = row.name;
  form.path = row.path;
  form.icon = row.icon;
  form.component = row.component;
  form.sort = row.sort;
  form.status = row.status;
  drawerVisible.value = true;
};

const selectIcon = (iconName: string) => {
  form.icon = iconName;
};

const handleSubmit = async () => {
  if (saving.value) return;
  saving.value = true;
  try {
    await formRef.value?.validate?.();
    if (!form.systemId) {
      ElMessage.error('请选择系统');
      return;
    }

    if (drawerMode.value === 'create') {
      await createMenu({
        systemId: form.systemId,
        parentId: form.parentId,
        title: form.title,
        name: form.name,
        path: form.path,
        icon: form.icon,
        component: form.component,
        sort: form.sort,
        status: form.status,
      });
      ElMessage.success('创建成功');
    } else if (editingId.value) {
      await updateMenu(editingId.value, {
        parentId: form.parentId,
        title: form.title,
        name: form.name,
        path: form.path,
        icon: form.icon,
        component: form.component,
        sort: form.sort,
        status: form.status,
      });
      ElMessage.success('更新成功');
    }

    drawerVisible.value = false;
    await loadList();
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message);
    }
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (row: MenuItem) => {
  const hasChildren = list.value.some((m) => m.parentId === row.id);
  if (hasChildren) {
    ElMessage.warning('该菜单下有子菜单，无法删除');
    return;
  }

  try {
    await ElMessageBox.confirm(`确认删除菜单「${row.title}」？`, '提示', { type: 'warning' });
    await deleteMenu(row.id);
    ElMessage.success('删除成功');
    await loadList();
  } catch (error) {
    if (error instanceof Error && error.message) {
      return;
    }
  }
};

const handleToggleStatus = async (row: MenuRow, val: boolean) => {
  row._changingStatus = true;
  const nextStatus = val ? 1 : 0;
  try {
    const updated = await updateMenuStatus(row.id, nextStatus);
    row.status = updated.status;
    ElMessage.success('状态已更新');
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '更新状态失败');
  } finally {
    row._changingStatus = false;
  }
};

onMounted(async () => {
  await loadSystems();
});

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<style scoped lang="less">
.menu-manage {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;

  .header-icon {
    font-size: 20px;
    color: var(--primary-color);
  }

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.stats-bar {
  display: flex;
  align-items: center;
  padding: 16px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);

    &.stat-enabled {
      color: #67c23a;
    }

    &.stat-disabled {
      color: #f56c6c;
    }
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
  }
}

.stat-divider {
  width: 1px;
  height: 32px;
  background-color: var(--border-color);
}

.header-actions-right {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.menu-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .menu-icon {
    color: var(--primary-color);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;

  .empty-icon {
    font-size: 64px;
    color: var(--text-disabled);
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }
}

.icon-picker {
  max-height: 400px;
  overflow-y: auto;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--main-content-bg);
  }

  &.selected {
    background-color: var(--primary-color);
    color: #fff;
  }

  span {
    font-size: 10px;
    margin-top: 4px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
}
</style>
