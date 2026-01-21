import { defineStore } from 'pinia';
import service from '../service';

interface UserInfo {
  id: number;
  username: string;
  email?: string;
  status: number;
}

interface UserState {
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: null,
    isLoggedIn: false,
  }),

  actions: {
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
      this.isLoggedIn = true;
    },

    clearUserInfo() {
      this.userInfo = null;
      this.isLoggedIn = false;
    },

    login(userInfo: UserInfo) {
      this.setUserInfo(userInfo);
    },

    async logout() {
      await service.auth.userLogout();
      this.clearUserInfo();
    },

    async checkLoginStatus() {
      try {
        const res = await service.auth.getCurrentUser();
        if (res && res.userInfo) {
          this.setUserInfo(res.userInfo);
          return true;
        }
        this.clearUserInfo();
        return false;
      } catch (error) {
        this.clearUserInfo();
        return false;
      }
    },
  },
});
