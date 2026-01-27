<template>
  <div class="language-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ $t('语言管理') }}</span>
          <div class="header-actions">
            <el-input v-model="query.keyword" :placeholder="$t('搜索代码/名称')" clearable style="width: 220px" @keyup.enter="loadList" />
            <el-select v-model="query.status" :placeholder="$t('状态')" clearable style="width: 140px" @change="loadList">
              <el-option :label="$t('启用')" :value="1" />
              <el-option :label="$t('禁用')" :value="0" />
            </el-select>
            <el-button type="primary" @click="openCreate">{{ $t('新增语言') }}</el-button>
            <el-button :loading="loading" @click="loadList">{{ $t('刷新') }}</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" style="width: 100%">
        <el-table-column prop="id" :label="$t('ID')" width="90" />
        <el-table-column prop="code" :label="$t('语言代码')" width="150" />
        <el-table-column prop="name" :label="$t('语言名称')" min-width="150" />
        <el-table-column prop="nativeName" :label="$t('本地名称')" min-width="150" />
        <el-table-column prop="flag" :label="$t('图标')" width="100">
          <template #default="{ row }">
            <span v-if="row.flag">{{ row.flag }}</span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" :label="$t('排序')" width="100" />
        <el-table-column prop="status" :label="$t('状态')" width="140">
          <template #default="{ row }">
            <el-switch :model-value="row.status === 1" :loading="row._changingStatus" @change="(val: boolean) => handleToggleStatus(row, val)" />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" :label="$t('更新时间')" width="180" />
        <el-table-column :label="$t('操作')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">{{ $t('编辑') }}</el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ $t('删除') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? $t('新增语言') : $t('编辑语言')" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item :label="$t('语言代码')" prop="code">
          <el-input v-model="form.code" :placeholder="$t('如：zh-CN, en-US')" :disabled="dialogMode === 'edit'" />
        </el-form-item>
        <el-form-item :label="$t('语言名称')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('如：简体中文、English')" />
        </el-form-item>
        <el-form-item :label="$t('本地名称')" prop="nativeName">
          <el-input v-model="form.nativeName" :placeholder="$t('如：简体中文、English')" />
        </el-form-item>
        <el-form-item :label="$t('图标标识')" prop="flag">
          <el-input v-model="form.flag" :placeholder="$t('如：CN, US')" />
        </el-form-item>
        <el-form-item :label="$t('排序')" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999999" />
        </el-form-item>
        <el-form-item :label="$t('状态')" prop="status">
          <el-switch v-model="formStatusSwitch" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">{{ $t('保存') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { createLanguage, deleteLanguage, getLanguageList, updateLanguage, updateLanguageStatus, type LanguageItem } from '@app/service/language';

type LanguageRow = LanguageItem & { _changingStatus?: boolean };

const { t } = useI18n();
const loading = ref(false);
const saving = ref(false);
const list = ref<LanguageRow[]>([]);

const query = reactive<{ keyword: string; status: number | '' }>({
  keyword: '',
  status: '',
});

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);

const formRef = ref();
const form = reactive<{ code: string; name: string; nativeName: string | null; flag: string | null; sort: number; status: number }>({
  code: '',
  name: '',
  nativeName: null,
  flag: null,
  sort: 0,
  status: 1,
});

const formStatusSwitch = computed({
  get: () => form.status === 1,
  set: (val: boolean) => {
    form.status = val ? 1 : 0;
  },
});

const rules = computed(() => ({
  code: [{ required: true, message: t('请输入语言代码'), trigger: 'blur' }],
  name: [{ required: true, message: t('请输入语言名称'), trigger: 'blur' }],
}));

const loadList = async () => {
  loading.value = true;
  try {
    const data = await getLanguageList({
      keyword: query.keyword || undefined,
      status: query.status,
    });
    list.value = data.map((item) => ({ ...item }));
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('加载语言列表失败'));
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.code = '';
  form.name = '';
  form.nativeName = null;
  form.flag = null;
  form.sort = 0;
  form.status = 1;
};

const openCreate = () => {
  dialogMode.value = 'create';
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
};

const openEdit = (row: LanguageItem) => {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  form.code = row.code;
  form.name = row.name;
  form.nativeName = row.nativeName ?? null;
  form.flag = row.flag ?? null;
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
      await createLanguage({
        code: form.code,
        name: form.name,
        nativeName: form.nativeName,
        flag: form.flag,
        sort: form.sort,
        status: form.status,
      });
      ElMessage.success(t('创建成功'));
    } else if (editingId.value) {
      await updateLanguage(editingId.value, {
        name: form.name,
        nativeName: form.nativeName,
        flag: form.flag,
        sort: form.sort,
        status: form.status,
      });
      ElMessage.success(t('更新成功'));
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

const handleDelete = async (row: LanguageItem) => {
  try {
    await ElMessageBox.confirm(t('确认删除语言「{name}」？', { name: row.name }), t('提示'), { type: 'warning' });
    await deleteLanguage(row.id);
    ElMessage.success(t('删除成功'));
    await loadList();
  } catch (error) {
    if (error instanceof Error && error.message) {
      return;
    }
  }
};

const handleToggleStatus = async (row: LanguageRow, val: boolean) => {
  row._changingStatus = true;
  const nextStatus = val ? 1 : 0;
  try {
    const updated = await updateLanguageStatus(row.id, nextStatus);
    row.status = updated.status;
    ElMessage.success(t('状态已更新'));
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('更新状态失败'));
  } finally {
    row._changingStatus = false;
  }
};

onMounted(() => {
  loadList();
});
</script>

<style scoped>
.language-manage {
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
