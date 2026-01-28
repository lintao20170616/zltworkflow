<template>
  <div class="translation-task-detail">
    <el-card v-if="taskDetail">
      <template #header>
        <div class="card-header">
          <div>
            <el-button type="text" @click="goBack">← {{ $t('返回列表') }}</el-button>
            <span style="margin-left: 16px; font-size: 16px; font-weight: bold">{{ taskDetail.taskNumber }}</span>
          </div>
          <div class="header-actions">
            <el-button v-if="taskDetail.isBackfilled === 0" type="primary" :loading="batchTranslating" @click="handleBatchTranslateWithAI">{{
              $t('批量AI翻译')
            }}</el-button>
            <el-button v-if="taskDetail.isBackfilled === 0" type="success" :loading="backfilling" @click="handleBackfill">{{ $t('回填翻译结果') }}</el-button>
            <el-button :loading="loading" @click="loadDetail">{{ $t('刷新') }}</el-button>
          </div>
        </div>
      </template>

      <div class="task-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('任务编号')">{{ taskDetail.taskNumber }}</el-descriptions-item>
          <el-descriptions-item :label="$t('项目名称')">{{ taskDetail.projectName }}</el-descriptions-item>
          <el-descriptions-item :label="$t('文案条数')">{{ taskDetail.textCount }}</el-descriptions-item>
          <el-descriptions-item :label="$t('状态')">
            <el-tag :type="getStatusType(taskDetail.status)">{{ getStatusText(taskDetail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('是否回填')">
            <el-tag :type="taskDetail.isBackfilled === 1 ? 'success' : 'info'">{{ taskDetail.isBackfilled === 1 ? $t('已回填') : $t('未回填') }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('进度')">
            <el-progress :percentage="taskDetail.totalCount > 0 ? Math.round((taskDetail.textCount / taskDetail.totalCount) * 100) : 0" />
          </el-descriptions-item>
          <el-descriptions-item :label="$t('创建时间')" :span="2">{{ taskDetail.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <el-card style="margin-top: 20px">
        <template #header>
          <span>{{ $t('翻译记录列表') }}</span>
        </template>
        <el-tabs
          v-if="taskDetail?.project?.targetLanguages && taskDetail.project.targetLanguages.length > 0"
          v-model="activeTab"
          style="margin-top: 0"
          @tab-change="handleTabChange"
        >
          <el-tab-pane v-for="lang in taskDetail.project.targetLanguages" :key="lang.id" :label="lang.name" :name="String(lang.id)">
            <div class="tab-content">
              <el-table v-loading="loading" :data="translationListMap[String(lang.id)] || []" style="width: 100%">
                <el-table-column prop="key" :label="$t('翻译键')" min-width="200" />
                <el-table-column prop="sourceText" :label="$t('源文本')" min-width="200" show-overflow-tooltip />
                <el-table-column prop="translatedText" :label="$t('翻译文本')" min-width="250" show-overflow-tooltip>
                  <template #default="{ row }">
                    <span v-if="row.translatedText">{{ row.translatedText }}</span>
                    <span v-else style="color: #999">{{ $t('未翻译') }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" :label="$t('状态')" width="120">
                  <template #default="{ row }">
                    <el-tag :type="getTranslationStatusType(row.status)">{{ getTranslationStatusText(row.status) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="updatedAt" :label="$t('更新时间')" width="180" />
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
        <div v-else style="text-align: center; padding: 40px; color: #999">
          {{ $t('暂无翻译记录') }}
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  backfillTranslationTask,
  batchTranslateWithAI,
  getTranslationTaskDetail,
  getTranslationTaskTranslations,
  type TranslationItem,
  type TranslationTaskDetail,
} from '@app/service/translation';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const taskId = ref<number>(Number(route.params.id));
const loading = ref(false);
const backfilling = ref(false);
const batchTranslating = ref(false);
const taskDetail = ref<TranslationTaskDetail | null>(null);
const activeTab = ref<string>('');
const translationListMap = ref<Record<string, TranslationItem[]>>({});
const paginationMap = ref<Record<string, { total: number; current: number; pageSize: number }>>({});
const translationQueryMap = reactive<Record<string, { page: number; pageSize: number }>>({});

const getStatusType = (status: number): string => {
  const map: Record<number, string> = { 1: 'warning', 2: 'primary', 3: 'info', 4: 'success', 5: 'danger' };
  return map[status] || 'info';
};

const getStatusText = (status: number): string => {
  const map: Record<number, string> = { 1: t('待翻译'), 2: t('翻译中'), 3: t('待审核'), 4: t('已完成'), 5: t('已取消') };
  return map[status] || t('未知');
};

const getTranslationStatusType = (status: number): string => {
  const map: Record<number, string> = { 1: 'warning', 2: 'primary', 3: 'success' };
  return map[status] || 'info';
};

const getTranslationStatusText = (status: number): string => {
  const map: Record<number, string> = { 1: t('待翻译'), 2: t('翻译中'), 3: t('已完成') };
  return map[status] || t('未知');
};

const loadDetail = async () => {
  loading.value = true;
  try {
    const data = await getTranslationTaskDetail(taskId.value);
    taskDetail.value = data;
    if (data.project?.targetLanguages && data.project.targetLanguages.length > 0) {
      data.project.targetLanguages.forEach((lang) => {
        const langId = String(lang.id);
        if (!translationQueryMap[langId]) {
          translationQueryMap[langId] = { page: 1, pageSize: 20 };
        }
        translationListMap.value[langId] = [];
        paginationMap.value[langId] = { total: 0, current: 1, pageSize: 20 };
      });
      activeTab.value = String(data.project.targetLanguages[0].id);
      await loadTranslationList();
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('加载任务详情失败'));
    router.push('/translation/tasks');
  } finally {
    loading.value = false;
  }
};

const loadTranslationList = async () => {
  if (!activeTab.value) return;
  loading.value = true;
  try {
    const currentQuery = translationQueryMap[activeTab.value] || { page: 1, pageSize: 20 };
    const result = await getTranslationTaskTranslations(taskId.value, {
      languageId: Number(activeTab.value),
      page: currentQuery.page || 1,
      pageSize: currentQuery.pageSize || 20,
    });
    translationListMap.value[activeTab.value] = result?.data || [];
    paginationMap.value[activeTab.value] = result?.pagination || { total: 0, current: 1, pageSize: 20 };
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('加载翻译列表失败'));
  } finally {
    loading.value = false;
  }
};

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;
  if (!translationQueryMap[tabName]) {
    translationQueryMap[tabName] = { page: 1, pageSize: 20 };
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

const handleBatchTranslateWithAI = async () => {
  if (batchTranslating.value) return;
  try {
    await ElMessageBox.confirm(t('确认使用AI批量翻译该任务下的所有待翻译内容？'), t('提示'), { type: 'warning' });
    batchTranslating.value = true;
    const result = await batchTranslateWithAI(taskId.value);
    ElMessage.success(t('批量AI翻译完成！成功 {success} 条，失败 {fail} 条', { success: result.successCount, fail: result.failCount }));
    if (result.errors && result.errors.length > 0) {
      console.warn('批量翻译错误:', result.errors);
    }
    await loadDetail();
  } catch (error) {
    if (error instanceof Error && error.message) {
      if (error.message !== 'cancel') {
        ElMessage.error(error.message);
      }
      return;
    }
    ElMessage.error(t('批量AI翻译失败'));
  } finally {
    batchTranslating.value = false;
  }
};

const handleBackfill = async () => {
  if (backfilling.value) return;
  try {
    await ElMessageBox.confirm(t('确认回填翻译结果到语言文件？'), t('提示'), { type: 'warning' });
    backfilling.value = true;
    const result = await backfillTranslationTask(taskId.value);
    ElMessage.success(t('回填成功！成功 {count} 个文件', { count: result.successCount }));
    await loadDetail();
  } catch (error) {
    if (error instanceof Error && error.message) {
      if (error.message !== 'cancel') {
        ElMessage.error(error.message);
      }
      return;
    }
    ElMessage.error(t('回填失败'));
  } finally {
    backfilling.value = false;
  }
};

const goBack = () => {
  router.push('/translation/tasks');
};

onMounted(() => {
  loadDetail();
});
</script>

<style scoped>
.translation-task-detail {
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

.task-info {
  margin-bottom: 20px;
}

.tab-content {
  padding: 16px 0;
}
</style>
