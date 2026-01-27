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
            <el-progress :percentage="taskDetail.textCount > 0 ? Math.round((taskDetail.progress / taskDetail.textCount) * 100) : 0" />
          </el-descriptions-item>
          <el-descriptions-item :label="$t('创建时间')" :span="2">{{ taskDetail.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <el-card style="margin-top: 20px">
        <template #header>
          <span>{{ $t('翻译记录列表') }}</span>
        </template>
        <el-table v-loading="loading" :data="translationList" style="width: 100%">
          <el-table-column prop="key" :label="$t('翻译键')" min-width="200" />
          <el-table-column prop="sourceText" :label="$t('源文本')" min-width="200" show-overflow-tooltip />
          <el-table-column prop="translatedText" :label="$t('翻译文本')" min-width="250" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.translatedText">{{ row.translatedText }}</span>
              <span v-else style="color: #999">{{ $t('未翻译') }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="language" :label="$t('语言')" width="150">
            <template #default="{ row }">
              <span>{{ row.language?.name || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="$t('状态')" width="120">
            <template #default="{ row }">
              <el-tag :type="getTranslationStatusType(row.status)">{{ getTranslationStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" :label="$t('更新时间')" width="180" />
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { backfillTranslationTask, getTranslationTaskDetail, type TranslationTaskDetail } from '@app/service/translation';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const taskId = ref<number>(Number(route.params.id));
const loading = ref(false);
const backfilling = ref(false);
const taskDetail = ref<TranslationTaskDetail | null>(null);
const translationList = ref<any[]>([]);

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
    translationList.value = data.translations || [];
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('加载任务详情失败'));
    router.push('/translation/tasks');
  } finally {
    loading.value = false;
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
</style>
