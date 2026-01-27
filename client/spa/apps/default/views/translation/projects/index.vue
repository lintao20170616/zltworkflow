<template>
  <div class="translation-projects">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>翻译项目管理</span>
          <div class="header-actions">
            <el-input v-model="query.keyword" placeholder="搜索项目名称" clearable style="width: 220px" @keyup.enter="loadList" />
            <el-select v-model="query.status" placeholder="状态" clearable style="width: 140px" @change="loadList">
              <el-option label="进行中" :value="1" />
              <el-option label="已完成" :value="2" />
              <el-option label="已归档" :value="3" />
            </el-select>
            <el-button type="primary" @click="openCreate">新增项目</el-button>
            <el-button :loading="loading" @click="loadList">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" style="width: 100%">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="sourceLanguage" label="源语言" width="150">
          <template #default="{ row }">
            <span v-if="row.sourceLanguage">{{ row.sourceLanguage.name }}</span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="targetLanguageIds" label="目标语言" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="langId in row.targetLanguageIds || []" :key="langId" type="info" style="margin-right: 8px; margin-bottom: 4px">
              {{ getLanguageName(langId) }}
            </el-tag>
            <span v-if="!row.targetLanguageIds || row.targetLanguageIds.length === 0" style="color: #999">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="140">
          <template #default="{ row }">
            <el-switch :model-value="row.status === 1" :loading="row._changingStatus" @change="(val: boolean) => handleToggleStatus(row, val)" />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="goToDetail(row.id)">进入详情</el-button>
            <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增项目' : '编辑项目'" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入项目描述" />
        </el-form-item>
        <el-form-item label="源语言" prop="sourceLanguageId">
          <el-select v-model="form.sourceLanguageId" placeholder="请选择源语言" style="width: 100%">
            <el-option v-for="lang in languageList" :key="lang.id" :label="lang.name" :value="lang.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标语言" prop="targetLanguageIds">
          <el-select v-model="form.targetLanguageIds" multiple placeholder="请选择目标语言" style="width: 100%">
            <el-option v-for="lang in languageList" :key="lang.id" :label="lang.name" :value="lang.id" />
          </el-select>
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
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  createTranslationProject,
  deleteTranslationProject,
  getTranslationProjectList,
  updateTranslationProject,
  updateTranslationProjectStatus,
  type TranslationProjectItem,
} from '@app/service/translation';
import { getLanguageList, type LanguageItem } from '@app/service/language';

type ProjectRow = TranslationProjectItem & { _changingStatus?: boolean };

const router = useRouter();
const loading = ref(false);
const saving = ref(false);
const list = ref<ProjectRow[]>([]);
const languageList = ref<LanguageItem[]>([]);

const query = reactive<{ keyword: string; status: number | '' }>({
  keyword: '',
  status: '',
});

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);

const formRef = ref();
const form = reactive<{ name: string; description: string | null; sourceLanguageId: number | null; targetLanguageIds: number[]; status: number }>({
  name: '',
  description: null,
  sourceLanguageId: null,
  targetLanguageIds: [],
  status: 1,
});

const formStatusSwitch = computed({
  get: () => form.status === 1,
  set: (val: boolean) => {
    form.status = val ? 1 : 2;
  },
});

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  sourceLanguageId: [{ required: true, message: '请选择源语言', trigger: 'change' }],
  targetLanguageIds: [
    { required: true, message: '请至少选择一个目标语言', trigger: 'change' },
    { type: 'array', min: 1, message: '请至少选择一个目标语言', trigger: 'change' },
  ],
} as const;

const loadLanguageList = async () => {
  try {
    const data = await getLanguageList({ status: 1 });
    languageList.value = data;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载语言列表失败');
  }
};

const getLanguageName = (langId: number): string => {
  const lang = languageList.value.find((l) => l.id === langId);
  return lang ? lang.name : `ID:${langId}`;
};

const loadList = async () => {
  loading.value = true;
  try {
    const data = await getTranslationProjectList({
      keyword: query.keyword || undefined,
      status: query.status,
    });
    list.value = data.map((item) => ({ ...item }));
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载项目列表失败');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.name = '';
  form.description = null;
  form.sourceLanguageId = null;
  form.targetLanguageIds = [];
  form.status = 1;
};

const openCreate = () => {
  dialogMode.value = 'create';
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
};

const openEdit = (row: TranslationProjectItem) => {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  form.name = row.name;
  form.description = row.description ?? null;
  form.sourceLanguageId = row.sourceLanguageId;
  form.targetLanguageIds = row.targetLanguageIds || [];
  form.status = row.status;
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (saving.value) return;
  saving.value = true;
  try {
    await formRef.value?.validate?.();
    if (dialogMode.value === 'create') {
      await createTranslationProject({
        name: form.name,
        description: form.description,
        sourceLanguageId: form.sourceLanguageId!,
        targetLanguageIds: form.targetLanguageIds,
        status: form.status,
      });
      ElMessage.success('创建成功');
    } else if (editingId.value) {
      await updateTranslationProject(editingId.value, {
        name: form.name,
        description: form.description,
        sourceLanguageId: form.sourceLanguageId!,
        targetLanguageIds: form.targetLanguageIds,
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

const handleDelete = async (row: TranslationProjectItem) => {
  try {
    await ElMessageBox.confirm(`确认删除项目「${row.name}」？`, '提示', { type: 'warning' });
    await deleteTranslationProject(row.id);
    ElMessage.success('删除成功');
    await loadList();
  } catch (error) {
    if (error instanceof Error && error.message) {
      return;
    }
  }
};

const handleToggleStatus = async (row: ProjectRow, val: boolean) => {
  row._changingStatus = true;
  const nextStatus = val ? 1 : 2;
  try {
    const updated = await updateTranslationProjectStatus(row.id, nextStatus);
    row.status = updated.status;
    ElMessage.success('状态已更新');
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '更新状态失败');
  } finally {
    row._changingStatus = false;
  }
};

const goToDetail = (projectId: number) => {
  router.push(`/projects/${projectId}`);
};

onMounted(() => {
  loadLanguageList();
  loadList();
});
</script>

<style scoped>
.translation-projects {
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
