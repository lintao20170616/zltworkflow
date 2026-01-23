<template>
  <div class="dashboard">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>仪表盘</span>
          <el-button type="primary" :loading="loading" @click="loadUserList"> 刷新列表 </el-button>
        </div>
      </template>
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
              <el-tag v-for="role in row.roles" :key="role.id" type="info" style="margin-right: 8px; margin-bottom: 4px">
                {{ role.name }}
              </el-tag>
              <span v-if="!row.roles || row.roles.length === 0" style="color: #999">无角色</span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getUserList, type UserListItem } from '@app/service/auth';

const userList = ref<UserListItem[]>([]);
const loading = ref(false);

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
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-list {
  margin-top: 20px;
}
</style>
