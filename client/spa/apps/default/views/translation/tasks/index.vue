<template>
  <div class="translation-tasks">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ $t('翻译任务管理') }}</span>
          <div class="header-actions">
            <el-input v-model="query.taskNumber" :placeholder="$t('任务编号')" clearable style="width: 200px" @keyup.enter="loadList" />
            <el-input v-model="query.projectName" :placeholder="$t('项目名称')" clearable style="width: 200px" @keyup.enter="loadList" />
            <el-select v-model="query.status" :placeholder="$t('状态')" clearable style="width: 140px" @change="loadList">
              <el-option :label="$t('待翻译')" :value="1" />
              <el-option :label="$t('翻译中')" :value="2" />
              <el-option :label="$t('待审核')" :value="3" />
              <el-option :label="$t('已完成')" :value="4" />
              <el-option :label="$t('已取消')" :value="5" />
            </el-select>
            <el-select v-model="query.isBackfilled" :placeholder="$t('是否回填')" clearable style="width: 140px" @change="loadList">
              <el-option :label="$t('未回填')" :value="0" />
              <el-option :label="$t('已回填')" :value="1" />
            </el-select>
            <el-button type="primary" @click="openCreate">{{ $t('新增任务') }}</el-button>
            <el-button :loading="loading" @click="loadList">{{ $t('刷新') }}</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" style="width: 100%">
        <el-table-column prop="taskNumber" :label="$t('任务编号')" width="200" />
        <el-table-column prop="projectName" :label="$t('项目名称')" min-width="200" />
        <el-table-column prop="textCount" :label="$t('文案条数')" width="120" />
        <el-table-column prop="status" :label="$t('状态')" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isBackfilled" :label="$t('是否回填')" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isBackfilled === 1 ? 'success' : 'info'">{{ row.isBackfilled === 1 ? $t('已回填') : $t('未回填') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" :label="$t('进度')" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.textCount > 0 ? Math.round((row.progress / row.textCount) * 100) : 0" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="$t('创建时间')" width="180" />
        <el-table-column :label="$t('操作')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="goToDetail(row.id)">{{ $t('查看详情') }}</el-button>
            <el-button type="primary" link @click="openEdit(row)">{{ $t('编辑') }}</el-button>
            <el-button type="danger" link @click="handleDelete(row)">{{ $t('删除') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? $t('新增任务') : $t('编辑任务')" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="$t('项目')" prop="projectId">
          <el-select v-model="form.projectId" :placeholder="$t('请选择项目')" style="width: 100%" :disabled="dialogMode === 'edit'">
            <el-option v-for="project in projectList" :key="project.id" :label="project.name" :value="project.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('状态')" prop="status">
          <el-select v-model="form.status" :placeholder="$t('请选择状态')" style="width: 100%">
            <el-option :label="$t('待翻译')" :value="1" />
            <el-option :label="$t('翻译中')" :value="2" />
            <el-option :label="$t('待审核')" :value="3" />
            <el-option :label="$t('已完成')" :value="4" />
            <el-option :label="$t('已取消')" :value="5" />
          </el-select>
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
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  createTranslationTask,
  deleteTranslationTask,
  getTranslationProjectList,
  getTranslationTaskList,
  updateTranslationTask,
  type TranslationProjectItem,
  type TranslationTaskItem,
} from '@app/service/translation';

const router = useRouter();
const { t } = useI18n();
const loading = ref(false);
const saving = ref(false);
const list = ref<TranslationTaskItem[]>([]);
const projectList = ref<TranslationProjectItem[]>([]);

const query = reactive<{ taskNumber: string; projectName: string; status: number | ''; isBackfilled: number | '' }>({
  taskNumber: '',
  projectName: '',
  status: '',
  isBackfilled: '',
});

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<number | null>(null);

const formRef = ref();
const form = reactive<{ projectId: number | null; status: number }>({
  projectId: null,
  status: 1,
});

const rules = computed(() => ({
  projectId: [{ required: true, message: t('请选择项目'), trigger: 'change' }],
}));

const getStatusType = (status: number): string => {
  const map: Record<number, string> = { 1: 'warning', 2: 'primary', 3: 'info', 4: 'success', 5: 'danger' };
  return map[status] || 'info';
};

const getStatusText = (status: number): string => {
  const map: Record<number, string> = { 1: t('待翻译'), 2: t('翻译中'), 3: t('待审核'), 4: t('已完成'), 5: t('已取消') };
  return map[status] || t('未知');
};

const loadProjectList = async () => {
  try {
    const data = await getTranslationProjectList();
    projectList.value = data;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('加载项目列表失败'));
  }
};

const loadList = async () => {
  loading.value = true;
  try {
    const data = await getTranslationTaskList({
      taskNumber: query.taskNumber || undefined,
      projectName: query.projectName || undefined,
      status: query.status,
      isBackfilled: query.isBackfilled !== '' ? query.isBackfilled : undefined,
    });
    list.value = data;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('加载任务列表失败'));
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.projectId = null;
  form.status = 1;
};

const openCreate = () => {
  dialogMode.value = 'create';
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
};

const openEdit = (row: TranslationTaskItem) => {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  form.projectId = row.projectId;
  form.status = row.status;
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (saving.value) return;
  saving.value = true;
  try {
    await formRef.value?.validate?.();
    if (dialogMode.value === 'create') {
      await createTranslationTask({
        projectId: form.projectId!,
        status: form.status,
      });
      ElMessage.success(t('创建成功'));
    } else if (editingId.value) {
      await updateTranslationTask(editingId.value, {
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

const handleDelete = async (row: TranslationTaskItem) => {
  try {
    await ElMessageBox.confirm(t('确认删除任务「{name}」？', { name: row.taskNumber }), t('提示'), { type: 'warning' });
    await deleteTranslationTask(row.id);
    ElMessage.success(t('删除成功'));
    await loadList();
  } catch (error) {
    if (error instanceof Error && error.message) {
      return;
    }
  }
};

const goToDetail = (taskId: number) => {
  router.push(`/translation/tasks/${taskId}`);
};

onMounted(() => {
  loadProjectList();
  loadList();
});
</script>

<style scoped>
.translation-tasks {
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
