<template>
  <div class="translation-project-detail">
    <el-card v-if="projectDetail">
      <template #header>
        <div class="card-header">
          <div>
            <el-button type="text" @click="goBack">← 返回列表</el-button>
            <span style="margin-left: 16px; font-size: 16px; font-weight: bold">{{ projectDetail.name }}</span>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="openCreateTranslation">新增翻译</el-button>
            <el-button :loading="loading" @click="loadTranslationList">刷新</el-button>
          </div>
        </div>
      </template>

      <div class="project-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="项目名称">{{ projectDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="项目状态">
            <el-tag :type="getStatusType(projectDetail.status)">{{ getStatusText(projectDetail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="项目描述" :span="2">{{ projectDetail.description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="源语言">{{ projectDetail.sourceLanguage?.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="目标语言数量">{{ projectDetail.targetLanguages?.length || 0 }} 种</el-descriptions-item>
        </el-descriptions>
      </div>

      <el-tabs v-model="activeTab" style="margin-top: 20px" @tab-change="handleTabChange">
        <el-tab-pane v-for="lang in projectDetail.targetLanguages" :key="lang.id" :label="lang.name" :name="String(lang.id)">
          <div class="tab-content">
            <div class="tab-header">
              <el-input
                v-model="translationQueryMap[String(lang.id)].keyword"
                placeholder="搜索翻译键或翻译文本"
                clearable
                style="width: 300px"
                @keyup.enter="handleSearch"
                @clear="handleSearch"
              />
              <el-button :loading="loading" @click="handleSearch">搜索</el-button>
            </div>

            <el-table v-loading="loading" :data="translationListMap[String(lang.id)] || []" style="width: 100%; margin-top: 16px">
              <el-table-column prop="key" label="翻译键" min-width="200" />
              <el-table-column prop="sourceText" label="源文本" min-width="200" show-overflow-tooltip />
              <el-table-column prop="translatedText" label="翻译文本" min-width="250" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row.translatedText">{{ row.translatedText }}</span>
                  <span v-else style="color: #999">未翻译</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="getTranslationStatusType(row.status)">{{ getTranslationStatusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="updatedAt" label="更新时间" width="180" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link @click="openEditTranslation(row)">编辑</el-button>
                  <el-button type="danger" link @click="handleDeleteTranslation(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-pagination
              v-if="paginationMap[String(lang.id)]"
              v-model:current-page="translationQueryMap[String(lang.id)].page"
              v-model:page-size="translationQueryMap[String(lang.id)].pageSize"
              :total="paginationMap[String(lang.id)].total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              style="margin-top: 16px; justify-content: flex-end"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="translationDialogVisible" :title="translationDialogMode === 'create' ? '新增翻译' : '编辑翻译'" width="600px">
      <el-form ref="translationFormRef" :model="translationForm" :rules="translationRules" label-width="100px">
        <el-form-item label="翻译键" prop="key">
          <el-input v-model="translationForm.key" placeholder="请输入翻译键" :disabled="translationDialogMode === 'edit'" />
        </el-form-item>
        <el-form-item label="源文本" prop="sourceText">
          <el-input v-model="translationForm.sourceText" type="textarea" :rows="3" placeholder="请输入源文本" />
        </el-form-item>
        <el-form-item label="翻译文本" prop="translatedText">
          <el-input v-model="translationForm.translatedText" type="textarea" :rows="3" placeholder="请输入翻译文本" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="translationForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="待翻译" :value="1" />
            <el-option label="翻译中" :value="2" />
            <el-option label="已完成" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="translationDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmitTranslation">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  createTranslation,
  deleteTranslation,
  getTranslationList,
  getTranslationProjectDetail,
  pushDefaultJson,
  updateTranslation,
  type TranslationItem,
  type TranslationProjectDetail,
} from '@app/service/translation';

const route = useRoute();
const router = useRouter();
const projectId = ref<number>(Number(route.params.id));
const loading = ref(false);
const saving = ref(false);
const pushing = ref(false);
const projectDetail = ref<TranslationProjectDetail | null>(null);
const activeTab = ref<string>('');
const translationListMap = ref<Record<string, TranslationItem[]>>({});
const paginationMap = ref<Record<string, { total: number; current: number; pageSize: number }>>({});

const translationQueryMap = reactive<Record<string, { keyword: string; page: number; pageSize: number }>>({});

const translationDialogVisible = ref(false);
const translationDialogMode = ref<'create' | 'edit'>('create');
const editingTranslationId = ref<number | null>(null);

const translationFormRef = ref();
const translationForm = reactive<{ key: string; sourceText: string | null; translatedText: string | null; status: number }>({
  key: '',
  sourceText: null,
  translatedText: null,
  status: 1,
});

const translationRules = {
  key: [{ required: true, message: '请输入翻译键', trigger: 'blur' }],
} as const;

const getStatusType = (status: number): string => {
  const map: Record<number, string> = { 1: 'success', 2: 'info', 3: 'warning' };
  return map[status] || 'info';
};

const getStatusText = (status: number): string => {
  const map: Record<number, string> = { 1: '进行中', 2: '已完成', 3: '已归档' };
  return map[status] || '未知';
};

const getTranslationStatusType = (status: number): string => {
  const map: Record<number, string> = { 1: 'warning', 2: 'primary', 3: 'success' };
  return map[status] || 'info';
};

const getTranslationStatusText = (status: number): string => {
  const map: Record<number, string> = { 1: '待翻译', 2: '翻译中', 3: '已完成' };
  return map[status] || '未知';
};

const loadProjectDetail = async () => {
  loading.value = true;
  try {
    const data = await getTranslationProjectDetail(projectId.value);
    projectDetail.value = data;
    if (data.targetLanguages && data.targetLanguages.length > 0) {
      data.targetLanguages.forEach((lang) => {
        const langId = String(lang.id);
        if (!translationQueryMap[langId]) {
          translationQueryMap[langId] = { keyword: '', page: 1, pageSize: 20 };
        }
        translationListMap.value[langId] = [];
        paginationMap.value[langId] = { total: 0, current: 1, pageSize: 20 };
      });
      activeTab.value = String(data.targetLanguages[0].id);
      await loadTranslationList();
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载项目详情失败');
    router.push('/translation/projects');
  } finally {
    loading.value = false;
  }
};

const loadTranslationList = async () => {
  if (!activeTab.value) return;
  loading.value = true;
  try {
    const currentQuery = translationQueryMap[activeTab.value] || { keyword: '', page: 1, pageSize: 20 };
    const result = await getTranslationList({
      projectId: projectId.value,
      languageId: Number(activeTab.value),
      keyword: currentQuery.keyword || undefined,
      page: currentQuery.page || 1,
      pageSize: currentQuery.pageSize || 20,
    });
    translationListMap.value[activeTab.value] = result?.data || [];
    paginationMap.value[activeTab.value] = result?.pagination || { total: 0, current: 1, pageSize: 20 };
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载翻译列表失败');
  } finally {
    loading.value = false;
  }
};

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;
  if (!translationQueryMap[tabName]) {
    translationQueryMap[tabName] = { keyword: '', page: 1, pageSize: 20 };
  }
  if (!translationListMap.value[tabName] || translationListMap.value[tabName].length === 0) {
    loadTranslationList();
  }
};

const handleSizeChange = (pageSize: number) => {
  if (!activeTab.value) return;
  const currentQuery = translationQueryMap[activeTab.value];
  if (currentQuery) {
    currentQuery.pageSize = pageSize;
    currentQuery.page = 1;
    loadTranslationList();
  }
};

const handleCurrentChange = (page: number) => {
  if (!activeTab.value) return;
  const currentQuery = translationQueryMap[activeTab.value];
  if (currentQuery) {
    currentQuery.page = page;
    loadTranslationList();
  }
};

const handleSearch = () => {
  if (!activeTab.value) return;
  const currentQuery = translationQueryMap[activeTab.value];
  if (currentQuery) {
    currentQuery.page = 1;
    loadTranslationList();
  }
};

const resetTranslationForm = () => {
  translationForm.key = '';
  translationForm.sourceText = null;
  translationForm.translatedText = null;
  translationForm.status = 1;
};

const openCreateTranslation = () => {
  if (!activeTab.value) {
    ElMessage.warning('请先选择一个语言 Tab');
    return;
  }
  translationDialogMode.value = 'create';
  editingTranslationId.value = null;
  resetTranslationForm();
  translationDialogVisible.value = true;
};

const openEditTranslation = (row: TranslationItem) => {
  translationDialogMode.value = 'edit';
  editingTranslationId.value = row.id;
  translationForm.key = row.key;
  translationForm.sourceText = row.sourceText ?? null;
  translationForm.translatedText = row.translatedText ?? null;
  translationForm.status = row.status;
  translationDialogVisible.value = true;
};

const handleSubmitTranslation = async () => {
  if (saving.value || !activeTab.value) return;
  saving.value = true;
  try {
    await translationFormRef.value?.validate?.();
    if (translationDialogMode.value === 'create') {
      await createTranslation({
        projectId: projectId.value,
        key: translationForm.key,
        sourceText: translationForm.sourceText,
        languageId: Number(activeTab.value),
        translatedText: translationForm.translatedText,
        status: translationForm.status,
      });
      ElMessage.success('创建成功');
    } else if (editingTranslationId.value) {
      await updateTranslation(editingTranslationId.value, {
        sourceText: translationForm.sourceText,
        translatedText: translationForm.translatedText,
        status: translationForm.status,
      });
      ElMessage.success('更新成功');
    }
    translationDialogVisible.value = false;
    await loadTranslationList();
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message);
    }
  } finally {
    saving.value = false;
  }
};

const handleDeleteTranslation = async (row: TranslationItem) => {
  try {
    await ElMessageBox.confirm(`确认删除翻译「${row.key}」？`, '提示', { type: 'warning' });
    await deleteTranslation(row.id);
    ElMessage.success('删除成功');
    await loadTranslationList();
  } catch (error) {
    if (error instanceof Error && error.message) {
      return;
    }
  }
};

const handlePushDefaultJson = async () => {
  if (pushing.value) return;
  try {
    await ElMessageBox.confirm('确认推送 default.json 到当前项目？将自动创建翻译任务。', '提示', { type: 'warning' });
    pushing.value = true;
    const result = await pushDefaultJson({ projectId: projectId.value });
    ElMessage.success(`推送成功！创建任务 ${result.taskNumber}，成功 ${result.successCount} 条，失败 ${result.failCount} 条`);
    await loadTranslationList();
  } catch (error) {
    if (error instanceof Error && error.message) {
      if (error.message !== 'cancel') {
        ElMessage.error(error.message);
      }
      return;
    }
    ElMessage.error('推送失败');
  } finally {
    pushing.value = false;
  }
};

const goBack = () => {
  router.push('/translation/projects');
};

onMounted(() => {
  loadProjectDetail();
});
</script>

<style scoped>
.translation-project-detail {
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

.project-info {
  margin-bottom: 20px;
}

.tab-content {
  padding: 16px 0;
}

.tab-header {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
