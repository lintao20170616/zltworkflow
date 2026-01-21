<template>
  <div class="dashboard">
    <h1>仪表盘</h1>
    
    <div class="actions">
      <el-button @click="goBack">返回首页</el-button>
      <el-button @click="logout">退出登录</el-button>
      <el-button type="primary" :loading="loading" @click="loadUserList">刷新列表</el-button>
    </div>

    <div class="user-list">
      <el-table v-loading="loading" :data="userList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roles" label="角色" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              type="info"
              style="margin-right: 8px; margin-bottom: 4px"
            >
              {{ role.name }}
            </el-tag>
            <span v-if="!row.roles || row.roles.length === 0" style="color: #999">无角色</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElButton, ElTable, ElTableColumn, ElTag, ElMessage } from 'element-plus';
import { useUserStore } from '../store/user';
import { getUserList, type UserListItem } from '../service/auth';

const router = useRouter();
const userStore = useUserStore();
const userList = ref<UserListItem[]>([]);
const loading = ref(false);

const goBack = () => {
  router.push('/');
};

const logout = async () => {
  await userStore.logout();
  await router.push('/');
};

const loadUserList = async () => {
  loading.value = true;
  try {
    const data = await getUserList();
    userList.value = data;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUserList();
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.user-list {
  margin-top: 20px;
}
</style>
