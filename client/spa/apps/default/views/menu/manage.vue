<template>
  <div class="menu-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ $t('菜单管理') }}</span>
          <div class="header-actions">
            <el-select v-model="query.systemId" placeholder="选择系统" clearable style="width: 200px" @change="handleSystemChange">
              <el-option v-for="s in systems" :key="s.id" :label="`${s.name}（${s.code}）`" :value="s.id" />
            </el-select>
            <el-input v-model="query.keyword" placeholder="搜索名称/路由" clearable style="width: 220px" :disabled="!query.systemId" @keyup.enter="loadList" />
            <el-select v-model="query.status" placeholder="状态" clearable style="width: 140px" :disabled="!query.systemId" @change="loadList">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <el-button type="primary" :disabled="!query.systemId" @click="openCreate">新增菜单</el-button>
            <el-button :loading="loading" :disabled="!query.systemId" @click="loadList">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" style="width: 100%">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="title" label="名称" min-width="160" />
        <el-table-column prop="name" label="路由名" width="160" />
        <el-table-column prop="path" label="路由路径" min-width="200" />
        <el-table-column prop="parentId" label="父级" width="100">
          <template #default="{ row }">
            <span>{{ row.parentId || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="140">
          <template #default="{ row }">
            <el-switch :model-value="row.status === 1" :loading="row._changingStatus" @change="(val: boolean) => handleToggleStatus(row, val)" />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增菜单' : '编辑菜单'" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="系统" prop="systemId">
          <el-select v-model="form.systemId" placeholder="选择系统" style="width: 100%" :disabled="dialogMode === 'edit'">
            <el-option v-for="s in systems" :key="s.id" :label="`${s.name}（${s.code}）`" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="父级" prop="parentId">
          <el-select v-model="form.parentId" placeholder="无" clearable style="width: 100%">
            <el-option v-for="m in parentOptions" :key="m.id" :label="`${m.title}（${m.id}）`" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由名" prop="name">
          <el-input v-model="form.name" placeholder="请输入路由 name" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入路由 path" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="图标名称（可选）" />
        </el-form-item>
        <el-form-item label="组件" prop="component">
          <el-input v-model="form.component" placeholder="组件标识/路径（可选）" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="formStatusSwitch" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getSystemList, type SystemItem } from '@app/service/system';
import { createMenu, deleteMenu, getMenuList, updateMenu, updateMenuStatus, type MenuItem } from '@app/service/menu';

type MenuRow = MenuItem & { _changingStatus?: boolean };

const loading = ref(false);
const saving = ref(false);

const systems = ref<SystemItem[]>([]);
const list = ref<MenuRow[]>([]);

const query = reactive<{ systemId: number | null; keyword: string; status: number | '' }>({
  systemId: null,
  keyword: '',
  status: '',
});

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);

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

const parentOptions = computed(() => {
  const options = list.value.map((m) => ({ id: m.id, title: m.title }));
  if (dialogMode.value === 'edit' && editingId.value) {
    return options.filter((o) => o.id !== editingId.value);
  }
  return options;
});

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
  await loadList();
};

const resetForm = () => {
  form.systemId = query.systemId;
  form.parentId = null;
  form.title = '';
  form.name = '';
  form.path = '';
  form.icon = null;
  form.component = null;
  form.sort = 0;
  form.status = 1;
};

const openCreate = () => {
  dialogMode.value = 'create';
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
};

const openEdit = (row: MenuItem) => {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  form.systemId = row.systemId;
  form.parentId = row.parentId;
  form.title = row.title;
  form.name = row.name;
  form.path = row.path;
  form.icon = row.icon;
  form.component = row.component;
  form.sort = row.sort;
  form.status = row.status;
  dialogVisible.value = true;
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

    if (dialogMode.value === 'create') {
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

    dialogVisible.value = false;
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
</script>

<style scoped>
.menu-manage {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
