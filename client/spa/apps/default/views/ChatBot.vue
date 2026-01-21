<template>
  <div class="chatbot">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>聊天机器人</span>
          <div class="header-actions">
            <el-button type="primary" @click="showNewConversationDialog = true">新建会话</el-button>
          </div>
        </div>
      </template>
      <div class="chat-container">
        <div v-if="!currentConversationId" class="empty-state">
          <el-empty description="请先创建一个新会话" />
        </div>
        <template v-else>
          <div ref="messagesRef" class="chat-messages">
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
            </div>
          </div>
        </template>
      </div>
    </el-card>

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
import { ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { sendMessage as sendChatMessage, createConversation, type ChatMessage } from '../service/chatbot';
import { useUserStore } from '../store';

const userStore = useUserStore();
const messages = ref<ChatMessage[]>([]);
const inputMessage = ref('');
const sending = ref(false);
const creating = ref(false);
const messagesRef = ref<HTMLElement>();
const currentConversationId = ref<number | undefined>();
const showNewConversationDialog = ref(false);
const newConversationForm = ref({
  title: '',
});

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

const sendMessage = async () => {
  if (!currentConversationId.value) {
    ElMessage.warning('请先创建一个新会话');
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

const scrollToBottom = async () => {
  await nextTick();
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
};

const formatTime = (dateString: string) => {
  return dayjs(dateString).format('HH:mm:ss');
};
</script>

<style scoped>
.chatbot {
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
