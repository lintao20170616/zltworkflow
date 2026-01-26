<template>
  <div class="dashboard">
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon system-icon">
            <el-icon :size="40"><setting /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ systemCount }}</div>
            <div class="stat-label">系统数量</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon user-icon">
            <el-icon :size="40"><user /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ userCount }}</div>
            <div class="stat-label">用户数量</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon active-icon">
            <el-icon :size="40"><user-filled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ activeUserCount }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon role-icon">
            <el-icon :size="40"><avatar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalRoles }}</div>
            <div class="stat-label">角色总数</div>
          </div>
        </div>
      </el-card>
    </div>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户状态分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div v-for="item in userStatusData" :key="item.status" class="chart-item">
              <div class="chart-label">
                <span>{{ item.label }}</span>
                <span class="chart-value">{{ item.count }}</span>
              </div>
              <el-progress :percentage="item.percentage" :color="item.color" :stroke-width="20" :show-text="false" />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统状态分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div v-for="item in systemStatusData" :key="item.status" class="chart-item">
              <div class="chart-label">
                <span>{{ item.label }}</span>
                <span class="chart-value">{{ item.count }}</span>
              </div>
              <el-progress :percentage="item.percentage" :color="item.color" :stroke-width="20" :show-text="false" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="features-card">
      <template #header>
        <div class="card-header">
          <span>系统主要功能</span>
          <el-button type="primary" :loading="loading" :icon="Refresh" @click="loadData">刷新数据</el-button>
        </div>
      </template>
      <div class="features-grid">
        <div class="feature-item">
          <el-icon class="feature-icon"><user /></el-icon>
          <div class="feature-content">
            <h3>用户管理</h3>
            <p>支持用户的创建、编辑、删除和状态管理，提供完整的用户信息维护功能</p>
          </div>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><setting /></el-icon>
          <div class="feature-content">
            <h3>系统管理</h3>
            <p>多系统管理，支持系统的新增、配置和状态控制，灵活的系统架构管理</p>
          </div>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><menu /></el-icon>
          <div class="feature-content">
            <h3>菜单管理</h3>
            <p>动态菜单配置，支持多级菜单结构，灵活的路由和权限配置</p>
          </div>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><lock /></el-icon>
          <div class="feature-content">
            <h3>权限控制</h3>
            <p>基于角色的访问控制（RBAC），细粒度的权限管理，保障系统安全</p>
          </div>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><chat-dot-round /></el-icon>
          <div class="feature-content">
            <h3>智能对话</h3>
            <p>集成 Ollama AI 模型，提供智能对话功能，支持本地 AI 模型调用</p>
          </div>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><data-analysis /></el-icon>
          <div class="feature-content">
            <h3>数据统计</h3>
            <p>实时数据统计和可视化展示，帮助管理员快速了解系统运行状态</p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Setting, User, UserFilled, Avatar, Refresh, Menu, Lock, ChatDotRound, DataAnalysis } from '@element-plus/icons-vue';
import { getUserList, type UserListItem } from '@app/service/auth';
import { getSystemList, type SystemItem } from '@app/service/system';

const userList = ref<UserListItem[]>([]);
const systemList = ref<SystemItem[]>([]);
const loading = ref(false);

const userCount = computed(() => userList.value.length);
const systemCount = computed(() => systemList.value.length);
const activeUserCount = computed(() => userList.value.filter((u) => u.status === 1).length);

const totalRoles = computed(() => {
  const roleSet = new Set<number>();
  userList.value.forEach((user) => {
    user.roles.forEach((role) => roleSet.add(role.id));
  });
  return roleSet.size;
});

const userStatusData = computed(() => {
  const enabled = userList.value.filter((u) => u.status === 1).length;
  const disabled = userList.value.filter((u) => u.status !== 1).length;
  const total = userList.value.length || 1;
  return [
    {
      status: 1,
      label: '启用',
      count: enabled,
      percentage: Math.round((enabled / total) * 100),
      color: '#67c23a',
    },
    {
      status: 0,
      label: '禁用',
      count: disabled,
      percentage: Math.round((disabled / total) * 100),
      color: '#f56c6c',
    },
  ];
});

const systemStatusData = computed(() => {
  const enabled = systemList.value.filter((s) => s.status === 1).length;
  const disabled = systemList.value.filter((s) => s.status !== 1).length;
  const total = systemList.value.length || 1;
  return [
    {
      status: 1,
      label: '启用',
      count: enabled,
      percentage: Math.round((enabled / total) * 100),
      color: '#409eff',
    },
    {
      status: 0,
      label: '禁用',
      count: disabled,
      percentage: Math.round((disabled / total) * 100),
      color: '#909399',
    },
  ];
});

const loadData = async () => {
  loading.value = true;
  try {
    const [users, systems] = await Promise.all([getUserList(), getSystemList()]);
    userList.value = users;
    systemList.value = systems;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取数据失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.system-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.user-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.active-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.role-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.charts-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  padding: 20px 0;
}

.chart-item {
  margin-bottom: 24px;
}

.chart-item:last-child {
  margin-bottom: 0;
}

.chart-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.chart-value {
  font-weight: bold;
  color: #303133;
}

.features-card {
  margin-top: 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s;
}

.feature-item:hover {
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 32px;
  color: #409eff;
  flex-shrink: 0;
}

.feature-content h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.feature-content p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

@media (width <= 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .charts-row :deep(.el-col) {
    margin-bottom: 20px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
