const { Service } = require('egg');

class ChatbotService extends Service {
  async createConversation(userId, title = null) {
    const { ctx } = this;
    try {
      if (!userId) {
        return { success: false, message: '用户ID不能为空' };
      }

      const conversation = await ctx.model.Conversation.create({
        userId: Number(userId),
        title: title || '新对话',
      });
      return { success: true, data: conversation };
    } catch (error) {
      ctx.logger.error('[ChatbotService] createConversation error:', error);
      ctx.logger.error('[ChatbotService] createConversation error details:', {
        message: error.message,
        stack: error.stack,
        userId,
        title,
      });
      return { success: false, message: `创建会话失败: ${error.message}` };
    }
  }

  async getConversations(userId) {
    const { ctx } = this;
    try {
      const conversations = await ctx.model.Conversation.findAll({
        where: { userId },
        order: [['updatedAt', 'DESC']],
        include: [
          {
            model: ctx.model.Message,
            as: 'messages',
            limit: 1,
            order: [['createdAt', 'DESC']],
            attributes: ['content'],
          },
        ],
      });
      return { success: true, data: conversations };
    } catch (error) {
      ctx.logger.error('[ChatbotService] getConversations error:', error);
      return { success: false, message: '获取会话列表失败' };
    }
  }

  async getMessages(conversationId, userId) {
    const { ctx } = this;
    try {
      const conversation = await ctx.model.Conversation.findOne({
        where: { id: conversationId, userId },
      });

      if (!conversation) {
        return { success: false, message: '会话不存在' };
      }

      const messages = await ctx.model.Message.findAll({
        where: { conversationId },
        order: [['createdAt', 'ASC']],
      });

      return { success: true, data: messages };
    } catch (error) {
      ctx.logger.error('[ChatbotService] getMessages error:', error);
      return { success: false, message: '获取消息列表失败' };
    }
  }

  async sendMessage(conversationId, userId, content) {
    const { ctx } = this;
    try {
      if (!conversationId) {
        return { success: false, message: '会话ID不能为空' };
      }

      if (!userId) {
        return { success: false, message: '用户ID不能为空' };
      }

      if (!content || !content.trim()) {
        return { success: false, message: '消息内容不能为空' };
      }

      const conversation = await ctx.model.Conversation.findOne({
        where: { id: Number(conversationId), userId: Number(userId) },
      });

      if (!conversation) {
        ctx.logger.warn('[ChatbotService] sendMessage: 会话不存在', {
          conversationId: Number(conversationId),
          userId: Number(userId),
        });
        return { success: false, message: '会话不存在或无权访问' };
      }

      const userMessage = await ctx.model.Message.create({
        conversationId: Number(conversationId),
        role: 'user',
        content: content.trim(),
      });

      await conversation.update({ updatedAt: new Date() });

      const botResponse = await this.generateBotResponse(conversationId, content);

      const botMessage = await ctx.model.Message.create({
        conversationId: Number(conversationId),
        role: 'bot',
        content: botResponse,
      });

      if (!conversation.title || conversation.title === '新对话') {
        const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
        await conversation.update({ title });
      }

      return {
        success: true,
        data: {
          userMessage: {
            id: userMessage.id,
            role: userMessage.role,
            content: userMessage.content,
            createdAt: userMessage.createdAt,
          },
          botMessage: {
            id: botMessage.id,
            role: botMessage.role,
            content: botMessage.content,
            createdAt: botMessage.createdAt,
          },
          conversationId,
        },
      };
    } catch (error) {
      ctx.logger.error('[ChatbotService] sendMessage error:', error);
      ctx.logger.error('[ChatbotService] sendMessage error details:', {
        message: error.message,
        stack: error.stack,
        conversationId,
        userId,
        contentLength: content?.length,
      });
      return { success: false, message: `发送消息失败: ${error.message}` };
    }
  }

  async generateBotResponse(conversationId, userMessage) {
    const { ctx } = this;
    try {
      const recentMessages = await ctx.model.Message.findAll({
        where: { conversationId },
        order: [['createdAt', 'DESC']],
        limit: 10,
      });

      const context = recentMessages
        .reverse()
        .map((msg) => `${msg.role === 'user' ? '用户' : '助手'}: ${msg.content}`)
        .join('\n');

      const response = this.getSimpleResponse(userMessage, context);

      return response;
    } catch (error) {
      ctx.logger.error('[ChatbotService] generateBotResponse error:', error);
      return '抱歉，我现在无法回复，请稍后再试。';
    }
  }

  getSimpleResponse(userMessage, context) {
    const message = userMessage.toLowerCase().trim();

    if (message.includes('你好') || message.includes('hello') || message.includes('hi')) {
      return '您好！我是聊天机器人，很高兴为您服务。有什么可以帮助您的吗？';
    }

    if (message.includes('再见') || message.includes('bye') || message.includes('拜拜')) {
      return '再见！祝您生活愉快，期待下次与您交流！';
    }

    if (message.includes('谢谢') || message.includes('thank')) {
      return '不客气！很高兴能帮助到您。如果还有其他问题，随时告诉我。';
    }

    if (message.includes('时间') || message.includes('time')) {
      return `当前时间是：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;
    }

    if (message.includes('天气') || message.includes('weather')) {
      return '抱歉，我目前无法获取实时天气信息。建议您查看天气应用或网站获取准确的天气信息。';
    }

    if (message.includes('帮助') || message.includes('help')) {
      return '我可以帮您解答问题、提供信息、进行简单对话等。您可以问我任何问题，我会尽力回答。';
    }

    if (message.includes('功能') || message.includes('你能做什么')) {
      return '我可以：\n1. 回答您的问题\n2. 进行日常对话\n3. 提供信息和建议\n4. 与您聊天交流\n\n有什么想了解的吗？';
    }

    const responses = [
      `我理解您说的"${userMessage}"。这是一个有趣的话题，能详细说说吗？`,
      `关于"${userMessage}"，我认为这是一个值得探讨的问题。您想了解哪个方面呢？`,
      `感谢您的分享。关于"${userMessage}"，我可以提供一些信息。您希望了解什么？`,
      `我明白了。关于"${userMessage}"，让我想想... 您能提供更多细节吗？`,
      `好的，我收到了您的消息："${userMessage}"。我会认真考虑并给您回复。`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  async deleteConversation(conversationId, userId) {
    const { ctx } = this;
    try {
      const conversation = await ctx.model.Conversation.findOne({
        where: { id: conversationId, userId },
      });

      if (!conversation) {
        return { success: false, message: '会话不存在' };
      }

      await ctx.model.Message.destroy({
        where: { conversationId },
      });

      await conversation.destroy();

      return { success: true, message: '删除成功' };
    } catch (error) {
      ctx.logger.error('[ChatbotService] deleteConversation error:', error);
      return { success: false, message: '删除会话失败' };
    }
  }
}

module.exports = ChatbotService;
