<template>
  <div class="login-container">
    <h1>ZLT Admin Web</h1>
    <p>Vue 3 + TypeScript + Element Plus</p>
    <el-tabs v-model="activeTab" class="auth-tabs">
      <el-tab-pane label="登录" name="login">
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="auth-form" @keyup.enter="handleLogin">
          <el-form-item prop="username" label="用户名">
            <el-input v-model="loginForm.username" placeholder="请输入用户名" autocomplete="username" />
          </el-form-item>
          <el-form-item prop="password" label="密码">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password autocomplete="current-password" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" style="width: 100%" :loading="loginLoading" @click="handleLogin">登录</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="注册" name="register">
        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="auth-form" @keyup.enter="handleRegister">
          <el-form-item prop="username" label="用户名">
            <el-input v-model="registerForm.username" placeholder="请输入用户名（3-50个字符，字母数字下划线）" autocomplete="username" />
          </el-form-item>
          <el-form-item prop="password" label="密码">
            <el-input v-model="registerForm.password" type="password" placeholder="请输入密码（至少6位）" show-password autocomplete="new-password" />
          </el-form-item>
          <el-form-item prop="confirmPassword" label="确认密码">
            <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password autocomplete="new-password" />
          </el-form-item>
          <el-form-item prop="email" label="邮箱">
            <el-input v-model="registerForm.email" placeholder="请输入邮箱（可选）" autocomplete="email" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" style="width: 100%" :loading="registerLoading" @click="handleRegister">注册</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import service from '@app/service';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useUserStore } from '@app/store';

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref('login');
const loginFormRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();
const loginLoading = ref(false);
const registerLoading = ref(false);

const loginForm = ref({
  username: '',
  password: '',
});

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
});

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const validateConfirmPassword = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value !== registerForm.value.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度为3-50个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return;
    loginLoading.value = true;
    try {
      const res = await service.auth.userLogin({
        username: loginForm.value.username,
        password: loginForm.value.password,
      });
      if (res && res.userInfo) {
        userStore.login(res.userInfo);
        ElMessage.success('登录成功');
        router.push('/dashboard');
      } else {
        ElMessage.error(res?.message || '登录失败');
      }
    } catch (e: unknown) {
      const error = e as Error;
      ElMessage.error(error.message || '登录失败');
      console.error('Login error:', e);
    } finally {
      loginLoading.value = false;
    }
  });
};

const handleRegister = async () => {
  if (!registerFormRef.value) return;
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return;
    registerLoading.value = true;
    try {
      const res = await service.auth.userRegister({
        username: registerForm.value.username,
        password: registerForm.value.password,
        confirmPassword: registerForm.value.confirmPassword,
        email: registerForm.value.email || undefined,
      });
      if (res && res.userInfo) {
        userStore.login(res.userInfo);
        ElMessage.success('注册成功，已自动登录');
        router.push('/dashboard');
      } else {
        ElMessage.error(res?.message || '注册失败');
      }
    } catch (e: unknown) {
      const error = e as Error;
      ElMessage.error(error.message || '注册失败');
      console.error('Register error:', e);
    } finally {
      registerLoading.value = false;
    }
  });
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 32px 24px 24px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}
.auth-tabs {
  margin-top: 20px;
}
.auth-form {
  margin-top: 20px;
  text-align: left;
}
</style>
