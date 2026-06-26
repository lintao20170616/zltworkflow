<template>
  <div class="lowcode-projects">
    <div class="quick-actions">
      <div class="action-card" @click="openCreate">
        <div class="action-icon primary">
          <el-icon><plus /></el-icon>
        </div>
        <span>新建项目</span>
      </div>
      <div class="action-card" @click="openTemplate">
        <div class="action-icon">
          <el-icon><document /></el-icon>
        </div>
        <span>从模板创建</span>
      </div>
    </div>

    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>低代码页面项目管理</span>
            <el-tag size="small" type="info">{{ list.length }} 个项目</el-tag>
          </div>
          <div class="header-right">
            <div class="search-bar">
              <el-input v-model="query.keyword" placeholder="搜索项目名称或描述" clearable style="width: 280px" :prefix-icon="Search" @keyup.enter="loadList" />
              <el-select v-model="query.status" placeholder="状态" clearable style="width: 140px" @change="loadList">
                <el-option label="全部" value="" />
                <el-option label="草稿" value="draft" />
                <el-option label="发布中" value="publishing" />
                <el-option label="已发布" value="published" />
              </el-select>
              <el-select v-model="query.sort" placeholder="排序" style="width: 140px" @change="loadList">
                <el-option label="最近更新" value="updatedAt" />
                <el-option label="创建时间" value="createdAt" />
                <el-option label="名称" value="name" />
              </el-select>
            </div>
            <div class="view-switcher">
              <el-button :type="viewMode === 'grid' ? 'primary' : 'default'" :icon="Grid" circle size="small" @click="viewMode = 'grid'" />
              <el-button :type="viewMode === 'list' ? 'primary' : 'default'" :icon="List" circle size="small" @click="viewMode = 'list'" />
            </div>
          </div>
        </div>
      </template>

      <div v-if="selectedProjects.length > 0" class="batch-actions">
        <span>已选择 {{ selectedProjects.length }} 个项目</span>
        <el-button size="small" @click="batchDelete">批量删除</el-button>
        <el-button size="small" @click="batchDuplicate">批量复制</el-button>
      </div>

      <el-row v-if="viewMode === 'grid'" :gutter="20" style="margin-top: 16px">
        <el-col v-for="project in list" :key="project.id" :xs="24" :sm="12" :lg="8">
          <el-card class="project-card" hover @click="openEditor(project.id)">
            <div class="card-preview">
              <div class="preview-placeholder">
                <el-icon class="preview-icon"><monitor /></el-icon>
              </div>
              <div class="card-checkbox">
                <el-checkbox v-model="selectedProjects" :value="project.id" @change.stop />
              </div>
            </div>
            <div class="card-content">
              <div class="card-header-row">
                <h3 class="project-name">{{ project.name }}</h3>
                <el-tag :type="getStatusType(project.status)" size="small">
                  {{ getStatusText(project.status) }}
                </el-tag>
              </div>
              <p v-if="project.description" class="project-desc">
                {{ project.description }}
              </p>
              <div class="card-footer">
                <span class="update-time">{{ formatRelativeTime(project.updatedAt) }}</span>
                <div class="card-actions">
                  <el-button size="small" @click.stop="openEdit(project)">编辑</el-button>
                  <el-button size="small" @click.stop="handleDuplicate(project)">复制</el-button>
                  <el-button size="small" type="danger" @click.stop="handleDelete(project)">删除</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-table v-else v-loading="loading" :data="list" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" min-width="300" />
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatRelativeTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditor(row.id)">打开编辑器</el-button>
            <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button type="primary" link @click="handleDuplicate(row)">复制</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新建项目' : '编辑项目'" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入项目描述" />
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="form.status" placeholder="选择状态" style="width: 100%">
            <el-option label="草稿" value="draft" />
            <el-option label="发布中" value="publishing" />
            <el-option label="已发布" value="published" />
          </el-select>
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
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Grid, List, Plus, Document, Monitor } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface PageConfig {
  version: string;
  page: {
    title: string;
    layout: string;
  };
  components: Record<string, unknown>[];
}

interface LowcodeProject {
  id: string;
  name: string;
  description?: string;
  status?: 'draft' | 'publishing' | 'published';
  config?: PageConfig;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'lowcode_projects';

const router = useRouter();
const loading = ref(false);
const saving = ref(false);
const list = ref<LowcodeProject[]>([]);
const viewMode = ref<'grid' | 'list'>('grid');
const selectedProjects = ref<string[]>([]);

const query = reactive<{
  keyword: string;
  status: string;
  sort: string;
}>({
  keyword: '',
  status: '',
  sort: 'updatedAt',
});

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<string | null>(null);

const formRef = ref();
const form = reactive<{ name: string; description: string; status: string }>({
  name: '',
  description: '',
  status: 'draft',
});

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择项目状态', trigger: 'change' }],
} as const;

const getStatusType = (status?: string) => {
  const statusMap: Record<string, string> = {
    draft: 'info',
    publishing: 'warning',
    published: 'success',
  };
  return statusMap[status || 'draft'] || 'info';
};

const getStatusText = (status?: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    publishing: '发布中',
    published: '已发布',
  };
  return statusMap[status || 'draft'] || '草稿';
};

const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
};

const formatRelativeTime = (dateStr: string): string => {
  return dayjs(dateStr).fromNow();
};

const loadList = () => {
  loading.value = true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let projects: LowcodeProject[] = stored ? JSON.parse(stored) : [];

    if (query.keyword) {
      projects = projects.filter((p) => p.name.includes(query.keyword) || (p.description && p.description.includes(query.keyword)));
    }

    if (query.status) {
      projects = projects.filter((p) => p.status === query.status);
    }

    projects.sort((a, b) => {
      if (query.sort === 'name') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b[query.sort as keyof LowcodeProject] as string).getTime() - new Date(a[query.sort as keyof LowcodeProject] as string).getTime();
    });

    list.value = projects;
  } catch (error) {
    ElMessage.error('加载项目列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const saveProjects = (projects: LowcodeProject[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

const resetForm = () => {
  form.name = '';
  form.description = '';
  form.status = 'draft';
};

const openCreate = () => {
  dialogMode.value = 'create';
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
};

const openTemplate = () => {
  ElMessage.info('模板功能开发中');
};

const openEdit = (row: LowcodeProject) => {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  form.name = row.name;
  form.description = row.description || '';
  form.status = row.status || 'draft';
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (saving.value) return;
  saving.value = true;
  try {
    await formRef.value?.validate?.();

    const stored = localStorage.getItem(STORAGE_KEY);
    const projects: LowcodeProject[] = stored ? JSON.parse(stored) : [];
    const now = new Date().toISOString();

    if (dialogMode.value === 'create') {
      const newProject: LowcodeProject = {
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: form.name,
        description: form.description || undefined,
        status: form.status as LowcodeProject['status'],
        config: {
          version: '1.0.0',
          page: {
            title: form.name,
            layout: 'container',
          },
          components: [],
        },
        createdAt: now,
        updatedAt: now,
      };
      projects.push(newProject);
      ElMessage.success('创建成功');
    } else if (editingId.value) {
      const index = projects.findIndex((p) => p.id === editingId.value);
      if (index !== -1) {
        projects[index] = {
          ...projects[index],
          name: form.name,
          description: form.description || undefined,
          status: form.status as LowcodeProject['status'],
          updatedAt: now,
        };
        ElMessage.success('更新成功');
      }
    }

    saveProjects(projects);
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

const handleDelete = async (row: LowcodeProject) => {
  try {
    await ElMessageBox.confirm(`确认删除项目「${row.name}」？`, '提示', {
      type: 'warning',
    });
    const stored = localStorage.getItem(STORAGE_KEY);
    const projects: LowcodeProject[] = stored ? JSON.parse(stored) : [];
    const filtered = projects.filter((p) => p.id !== row.id);
    saveProjects(filtered);
    ElMessage.success('删除成功');
    await loadList();
  } catch (error) {
    if (error instanceof Error && error.message) {
      return;
    }
  }
};

const handleDuplicate = async (row: LowcodeProject) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const projects: LowcodeProject[] = stored ? JSON.parse(stored) : [];
    const now = new Date().toISOString();

    const duplicated: LowcodeProject = {
      ...row,
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${row.name} (副本)`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    projects.push(duplicated);
    saveProjects(projects);
    ElMessage.success('复制成功');
    await loadList();
  } catch (error) {
    ElMessage.error('复制失败');
    console.error(error);
  }
};

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedProjects.value.length} 个项目？`, '提示', {
      type: 'warning',
    });
    const stored = localStorage.getItem(STORAGE_KEY);
    const projects: LowcodeProject[] = stored ? JSON.parse(stored) : [];
    const filtered = projects.filter((p) => !selectedProjects.value.includes(p.id));
    saveProjects(filtered);
    selectedProjects.value = [];
    ElMessage.success('批量删除成功');
    await loadList();
  } catch (error) {
    if (error instanceof Error && error.message) {
      return;
    }
  }
};

const batchDuplicate = async () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const projects: LowcodeProject[] = stored ? JSON.parse(stored) : [];
    const now = new Date().toISOString();
    const duplicatedProjects: LowcodeProject[] = [];

    selectedProjects.value.forEach((id) => {
      const original = projects.find((p) => p.id === id);
      if (original) {
        duplicatedProjects.push({
          ...original,
          id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `${original.name} (副本)`,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    projects.push(...duplicatedProjects);
    saveProjects(projects);
    selectedProjects.value = [];
    ElMessage.success(`成功复制 ${duplicatedProjects.length} 个项目`);
    await loadList();
  } catch (error) {
    ElMessage.error('批量复制失败');
    console.error(error);
  }
};

const handleSelectionChange = (val: string[]) => {
  selectedProjects.value = val;
};

const openEditor = (projectId: string) => {
  router.push({
    path: '/lowcode-editor',
    query: { projectId },
  });
};

onMounted(() => {
  loadList();
});
</script>

<style scoped>
.lowcode-projects {
  height: 100%;
  padding: 20px;
}

.quick-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #606266;
}

.action-icon.primary {
  background: #ecf5ff;
  color: #409eff;
}

.action-card span {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.view-switcher {
  display: flex;
  gap: 4px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 4px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 16px;
}

.batch-actions span {
  font-size: 14px;
  color: #606266;
}

.project-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-preview {
  position: relative;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.8);
}

.card-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
}

.card-content {
  padding: 0;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-desc {
  font-size: 13px;
  color: #909399;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.update-time {
  font-size: 12px;
  color: #c0c4cc;
}

.card-actions {
  display: flex;
  gap: 8px;
}
</style>
