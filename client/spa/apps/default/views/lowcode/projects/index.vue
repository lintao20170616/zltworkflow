<template>
  <div class="lowcode-projects">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>低代码页面项目管理</span>
          <div class="header-actions">
            <el-input v-model="query.keyword" placeholder="搜索项目名称" clearable style="width: 220px" @keyup.enter="loadList" />
            <el-button type="primary" @click="openCreate">新建项目</el-button>
            <el-button :loading="loading" @click="loadList">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" style="width: 100%">
        <el-table-column prop="id" label="ID" min-width="300" />
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
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
import dayjs from 'dayjs';

interface LowcodeProject {
  id: string;
  name: string;
  description?: string;
  config?: any;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'lowcode_projects';

const router = useRouter();
const loading = ref(false);
const saving = ref(false);
const list = ref<LowcodeProject[]>([]);

const query = reactive<{ keyword: string }>({
  keyword: '',
});

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const editingId = ref<string | null>(null);

const formRef = ref();
const form = reactive<{ name: string; description: string }>({
  name: '',
  description: '',
});

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
} as const;

const loadList = () => {
  loading.value = true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let projects: LowcodeProject[] = stored ? JSON.parse(stored) : [];

    if (query.keyword) {
      projects = projects.filter((p) => p.name.includes(query.keyword));
    }

    projects.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
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
};

const openCreate = () => {
  dialogMode.value = 'create';
  editingId.value = null;
  resetForm();
  dialogVisible.value = true;
};

const openEdit = (row: LowcodeProject) => {
  dialogMode.value = 'edit';
  editingId.value = row.id;
  form.name = row.name;
  form.description = row.description || '';
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

const openEditor = (projectId: string) => {
  router.push({
    path: '/lowcode-editor',
    query: { projectId },
  });
};

const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
};

onMounted(() => {
  loadList();
});
</script>

<style scoped>
.lowcode-projects {
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
