<template>
  <div class="user-info-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">
          {{ userStore.user?.username || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ userStore.user?.email || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="用户ID">
          {{ userStore.user?.id || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="userStore.user?.status === 1 ? 'success' : 'danger'">
            {{ userStore.user?.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <div class="actions" style="margin-top: 20px">
        <el-button type="primary" @click="refreshUserInfo">刷新信息</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@app/store';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();

const refreshUserInfo = async () => {
  try {
    await userStore.checkLoginStatus();
    ElMessage.success('用户信息已刷新');
  } catch (error) {
    ElMessage.error('刷新失败');
  }
};
</script>

<style scoped>
.user-info-page {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 10px;
}
</style>
