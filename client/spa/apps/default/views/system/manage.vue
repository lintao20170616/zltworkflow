<template>
  <div class="system-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统管理</span>
          <div class="header-actions">
            <el-input v-model="query.keyword" placeholder="搜索编码/名称" clearable style="width: 220px" @keyup.enter="loadList" />
            <el-select v-model="query.status" placeholder="状态" clearable style="width: 140px" @change="loadList">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <el-button type="primary" @click="openCreate">新增系统</el-button>
            <el-button :loading="loading" @click="loadList">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" style="width: 100%">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="code" label="编码" width="180" />
        <el-table-column prop="name" label="名称" min-width="200" />
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

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增系统' : '编辑系统'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入系统编码" :disabled="dialogMode === 'edit'" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入系统名称" />
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
import { createSystem, deleteSystem, getSystemList, updateSystem, updateSystemStatus, type SystemItem } from '@app/service/system';

type SystemRow = SystemItem & { _changingStatus?: boolean };

const loading = ref(false);
const saving = ref(false);
const list = ref<SystemRow[]>([]);

const query = reactive<{ keyword: string; status: number | '' }>({
  keyword: '',
  status: '',
});

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);

const formRef = ref();
const form = reactive<{ code: string; name: string; sort: number; status: number }>({
  code: '',
  name: '',
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
  code: [{ required: true, message: '请输入系统编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
} as const;

const loadList = async () => {
  loading.value = true;
  try {
    const data = await getSystemList({
      keyword: query.keyword || undefined,
      status: query.status,
    });
    list.value = data.map((item) => ({ ...item }));
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载系统列表失败');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.code = '';
  form.name = '';
  form.sort = 0;
  form.status = 1;
};

const openCreate = () => {
  dialogMode.value = 'create';
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
};

const openEdit = (row: SystemItem) => {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  form.code = row.code;
  form.name = row.name;
  form.sort = row.sort;
  form.status = row.status;
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (saving.value) return;
  saving.value = true;
  try {
    await formRef.value?.validate?.();
    if (dialogMode.value === 'create') {
      await createSystem({
        code: form.code,
        name: form.name,
        sort: form.sort,
        status: form.status,
      });
      ElMessage.success('创建成功');
    } else if (editingId.value) {
      await updateSystem(editingId.value, {
        name: form.name,
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

const handleDelete = async (row: SystemItem) => {
  try {
    await ElMessageBox.confirm(`确认删除系统「${row.name}」？`, '提示', { type: 'warning' });
    await deleteSystem(row.id);
    ElMessage.success('删除成功');
    await loadList();
  } catch (error) {
    if (error instanceof Error && error.message) {
      return;
    }
  }
};

const handleToggleStatus = async (row: SystemRow, val: boolean) => {
  row._changingStatus = true;
  const nextStatus = val ? 1 : 0;
  try {
    const updated = await updateSystemStatus(row.id, nextStatus);
    row.status = updated.status;
    ElMessage.success('状态已更新');
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '更新状态失败');
  } finally {
    row._changingStatus = false;
  }
};

onMounted(() => {
  loadList();
});
</script>

<style scoped>
.system-manage {
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
