<template>
  <div class="chatbot">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>聊天机器人</span>
        </div>
      </template>
      <div class="chat-container">
        <div ref="messagesRef" class="chat-messages">
          <div v-for="(message, index) in messages" :key="index" :class="['message', message.type]">
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ message.time }}</div>
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
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';

interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  time: string;
}

const messages = ref<ChatMessage[]>([]);
const inputMessage = ref('');
const sending = ref(false);
const messagesRef = ref<HTMLElement>();

const sendMessage = async () => {
  if (!inputMessage.value.trim()) {
    ElMessage.warning('请输入消息内容');
    return;
  }

  const userMessage: ChatMessage = {
    type: 'user',
    content: inputMessage.value,
    time: dayjs().format('HH:mm:ss'),
  };

  messages.value.push(userMessage);
  inputMessage.value = '';
  sending.value = true;

  await scrollToBottom();

  setTimeout(() => {
    const botMessage: ChatMessage = {
      type: 'bot',
      content: `收到您的消息："${userMessage.content}"。这是一个示例回复。`,
      time: dayjs().format('HH:mm:ss'),
    };
    messages.value.push(botMessage);
    sending.value = false;
    scrollToBottom();
  }, 500);
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

onMounted(() => {
  const welcomeMessage: ChatMessage = {
    type: 'bot',
    content: '您好！我是聊天机器人，有什么可以帮助您的吗？',
    time: dayjs().format('HH:mm:ss'),
  };
  messages.value.push(welcomeMessage);
});
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

.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
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
