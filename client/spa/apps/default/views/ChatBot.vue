<template>
  <div class="chatbot">
    <el-container class="chatbot-container">
      <el-aside width="250px" class="conversation-sidebar">
        <div class="sidebar-header">
          <el-button type="primary" size="small" @click="showNewConversationDialog = true">新建会话</el-button>
        </div>
        <div v-loading="loadingConversations" class="conversation-list">
          <div
            v-for="conversation in conversations"
            :key="conversation.id"
            :class="['conversation-item', { active: currentConversationId === conversation.id }]"
            @click="handleSelectConversation(conversation.id)"
          >
            <div class="conversation-content">
              <div class="conversation-title">{{ conversation.title || '新对话' }}</div>
              <div class="conversation-time">{{ formatDate(conversation.updatedAt) }}</div>
            </div>
            <el-button type="danger" :icon="Delete" size="small" text @click.stop="handleDeleteConversation(conversation.id)" />
          </div>
          <el-empty v-if="!loadingConversations && conversations.length === 0" description="暂无会话" :image-size="80" />
        </div>
      </el-aside>
      <el-main class="chat-main">
        <el-card class="chat-card">
          <template #header>
            <div class="card-header">
              <span>{{ currentConversationTitle || '聊天机器人' }}</span>
            </div>
          </template>
          <div class="chat-container">
            <div v-if="!currentConversationId" class="empty-state">
              <el-empty description="请先选择一个会话或创建新会话" />
            </div>
            <template v-else>
              <div ref="messagesRef" v-loading="loadingMessages" class="chat-messages">
                <div v-for="(message, index) in messages" :key="message.id || index" :class="['message', message.role]">
                  <div class="message-content">
                    <div class="message-text">{{ message.content }}</div>
                    <div class="message-time">{{ formatTime(message.createdAt) }}</div>
                  </div>
                </div>
              </div>
              <div class="chat-input">
                <el-input v-model="inputMessage" type="textarea" :rows="3" placeholder="请输入消息..." @keyup.enter.ctrl="sendMessage" />
                <div class="input-actions">
                  <el-button type="primary" :loading="sending" @click="sendMessage"> 发送 </el-button>
                  <el-button @click="clearMessages">清空</el-button>
                  <el-button type="info" :loading="testingOllama" @click="handleTestOllama">测试 Ollama</el-button>
                </div>
              </div>
            </template>
          </div>
        </el-card>
      </el-main>
    </el-container>

    <el-dialog v-model="showNewConversationDialog" title="新建会话" width="400px">
      <el-form :model="newConversationForm" label-width="80px">
        <el-form-item label="会话标题">
          <el-input v-model="newConversationForm.title" placeholder="请输入会话标题（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNewConversationDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreateConversation">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import {
  sendMessage as sendChatMessage,
  createConversation,
  getConversations,
  getMessages,
  deleteConversation,
  testOllama,
  type ChatMessage,
  type Conversation,
} from '../service/chatbot';
import { useUserStore } from '../store';

const userStore = useUserStore();
const messages = ref<ChatMessage[]>([]);
const conversations = ref<Conversation[]>([]);
const inputMessage = ref('');
const sending = ref(false);
const creating = ref(false);
const loadingConversations = ref(false);
const loadingMessages = ref(false);
const testingOllama = ref(false);
const messagesRef = ref<HTMLElement>();
const currentConversationId = ref<number | undefined>();
const showNewConversationDialog = ref(false);
const newConversationForm = ref({
  title: '',
});

const currentConversationTitle = computed(() => {
  const conversation = conversations.value.find((c) => c.id === currentConversationId.value);
  return conversation?.title || '新对话';
});

const loadConversations = async () => {
  if (!userStore.user?.id) return;

  loadingConversations.value = true;
  try {
    conversations.value = await getConversations();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载会话列表失败');
  } finally {
    loadingConversations.value = false;
  }
};

const loadMessages = async (conversationId: number) => {
  loadingMessages.value = true;
  try {
    const messageList = await getMessages(conversationId);
    messages.value = messageList;
    await scrollToBottom();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '加载消息失败');
  } finally {
    loadingMessages.value = false;
  }
};

const handleSelectConversation = async (conversationId: number) => {
  if (currentConversationId.value === conversationId) return;

  currentConversationId.value = conversationId;
  await loadMessages(conversationId);
};

const handleCreateConversation = async () => {
  if (!userStore.user?.id) {
    ElMessage.error('请先登录');
    return;
  }

  creating.value = true;
  try {
    const conversation = await createConversation({
      title: newConversationForm.value.title || undefined,
    });

    await loadConversations();
    currentConversationId.value = conversation.id;
    messages.value = [];
    showNewConversationDialog.value = false;
    newConversationForm.value.title = '';

    const welcomeMessage: ChatMessage = {
      id: 0,
      role: 'bot',
      content: '您好！我是聊天机器人，有什么可以帮助您的吗？',
      createdAt: new Date().toISOString(),
    };
    messages.value.push(welcomeMessage);

    ElMessage.success('会话创建成功');
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '创建会话失败');
  } finally {
    creating.value = false;
  }
};

const handleDeleteConversation = async (conversationId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个会话吗？删除后无法恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await deleteConversation(conversationId);
    await loadConversations();

    if (currentConversationId.value === conversationId) {
      currentConversationId.value = undefined;
      messages.value = [];
    }

    ElMessage.success('删除成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error instanceof Error ? error.message : '删除会话失败');
    }
  }
};

const sendMessage = async () => {
  if (!currentConversationId.value) {
    ElMessage.warning('请先选择一个会话');
    return;
  }

  if (!inputMessage.value.trim()) {
    ElMessage.warning('请输入消息内容');
    return;
  }

  const userContent = inputMessage.value.trim();
  inputMessage.value = '';
  sending.value = true;

  try {
    const result = await sendChatMessage({
      message: userContent,
      conversationId: currentConversationId.value,
    });

    messages.value.push({
      id: result.userMessage.id,
      role: result.userMessage.role,
      content: result.userMessage.content,
      createdAt: result.userMessage.createdAt,
    });

    messages.value.push({
      id: result.botMessage.id,
      role: result.botMessage.role,
      content: result.botMessage.content,
      createdAt: result.botMessage.createdAt,
    });

    await scrollToBottom();
    await loadConversations();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '发送消息失败');
  } finally {
    sending.value = false;
  }
};

const clearMessages = () => {
  messages.value = [];
  ElMessage.success('消息已清空');
};

const handleTestOllama = async () => {
  const testMessage = inputMessage.value.trim() || '介绍一下自己';
  testingOllama.value = true;

  try {
    console.log('=== Ollama 测试开始 ===');
    console.log('请求消息:', testMessage);
    console.log('请求时间:', new Date().toLocaleString());

    const response = await testOllama({ message: testMessage });

    console.log('=== Ollama 测试成功 ===');
    console.log('返回数据类型:', typeof response);
    console.log('返回数据内容:', response);
    console.log('数据长度:', typeof response === 'string' ? response.length : 'N/A');
    console.log('==================');

    ElMessage.success('测试完成，请查看浏览器控制台输出');
  } catch (error) {
    console.error('=== Ollama 测试失败 ===');
    console.error('错误类型:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('错误信息:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('错误堆栈:', error.stack);
    }
    console.error('==================');
    ElMessage.error(error instanceof Error ? error.message : '测试失败');
  } finally {
    testingOllama.value = false;
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
};

const formatTime = (dateString: string) => {
  return dayjs(dateString).format('HH:mm:ss');
};

const formatDate = (dateString: string) => {
  const date = dayjs(dateString);
  const now = dayjs();
  if (date.isSame(now, 'day')) {
    return date.format('HH:mm');
  } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
    return '昨天';
  } else if (date.isSame(now, 'year')) {
    return date.format('MM-DD');
  } else {
    return date.format('YYYY-MM-DD');
  }
};

onMounted(() => {
  loadConversations();
});
</script>

<style scoped>
.chatbot {
  height: 100%;
}

.chatbot-container {
  height: 100%;
}

.conversation-sidebar {
  background-color: #f5f5f5;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.conversation-item:hover {
  background-color: #e4e7ed;
}

.conversation-item.active {
  background-color: #409eff;
  color: #fff;
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-title {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.conversation-time {
  font-size: 12px;
  color: #999;
}

.conversation-item.active .conversation-time {
  color: rgba(255, 255, 255, 0.8);
}

.chat-main {
  padding: 0;
  background-color: #fff;
}

.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 20px;
}

.message {
  margin-bottom: 16px;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.bot {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message.user .message-content {
  background-color: #409eff;
  color: #fff;
}

.message-text {
  word-wrap: break-word;
  margin-bottom: 4px;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.message.bot .message-time {
  color: #999;
}

.chat-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
