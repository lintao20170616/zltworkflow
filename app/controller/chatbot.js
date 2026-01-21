const Controller = require('egg').Controller;

class ChatbotController extends Controller {
  async sendMessage() {
    const { ctx } = this;
    const { message, conversationId } = ctx.request.body;
    const userId = ctx.session.user?.id;

    if (!userId) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }

    if (!conversationId) {
      ctx.body = { code: 400, message: '会话ID不能为空，请先创建会话', data: null };
      ctx.status = 400;
      return;
    }

    if (!message || !message.trim()) {
      ctx.body = { code: 400, message: '消息内容不能为空', data: null };
      ctx.status = 400;
      return;
    }

    try {
      const result = await ctx.service.chatbot.sendMessage(conversationId, userId, message.trim());

      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }

      ctx.body = {
        code: 0,
        message: '发送成功',
        data: result.data,
      };
    } catch (error) {
      ctx.logger.error('[ChatbotController] sendMessage error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async getConversations() {
    const { ctx } = this;
    const userId = ctx.session.user?.id;

    if (!userId) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }

    try {
      const result = await ctx.service.chatbot.getConversations(userId);

      if (!result.success) {
        ctx.body = { code: 500, message: result.message, data: null };
        ctx.status = 500;
        return;
      }

      ctx.body = {
        code: 0,
        message: 'success',
        data: result.data,
      };
    } catch (error) {
      ctx.logger.error('[ChatbotController] getConversations error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async getMessages() {
    const { ctx } = this;
    const { conversationId } = ctx.params;
    const userId = ctx.session.user?.id;

    if (!userId) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }

    if (!conversationId) {
      ctx.body = { code: 400, message: '会话ID不能为空', data: null };
      ctx.status = 400;
      return;
    }

    try {
      const result = await ctx.service.chatbot.getMessages(conversationId, userId);

      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }

      ctx.body = {
        code: 0,
        message: 'success',
        data: result.data,
      };
    } catch (error) {
      ctx.logger.error('[ChatbotController] getMessages error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async createConversation() {
    const { ctx } = this;
    const userId = ctx.session.user?.id;
    const { title } = ctx.request.body;

    if (!userId) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }

    try {
      const result = await ctx.service.chatbot.createConversation(userId, title);

      if (!result.success) {
        ctx.body = { code: 500, message: result.message, data: null };
        ctx.status = 500;
        return;
      }

      ctx.body = {
        code: 0,
        message: '创建成功',
        data: result.data,
      };
    } catch (error) {
      ctx.logger.error('[ChatbotController] createConversation error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }

  async deleteConversation() {
    const { ctx } = this;
    const { id } = ctx.params;
    const userId = ctx.session.user?.id;

    if (!userId) {
      ctx.body = { code: 401, message: '未登录', data: null };
      ctx.status = 401;
      return;
    }

    if (!id) {
      ctx.body = { code: 400, message: '会话ID不能为空', data: null };
      ctx.status = 400;
      return;
    }

    try {
      const result = await ctx.service.chatbot.deleteConversation(id, userId);

      if (!result.success) {
        ctx.body = { code: 400, message: result.message, data: null };
        ctx.status = 400;
        return;
      }

      ctx.body = {
        code: 0,
        message: result.message,
        data: null,
      };
    } catch (error) {
      ctx.logger.error('[ChatbotController] deleteConversation error:', error);
      ctx.body = { code: 500, message: '服务器错误', data: null };
      ctx.status = 500;
    }
  }
}

module.exports = ChatbotController;
