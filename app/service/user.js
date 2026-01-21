const { Service } = require('egg');

class UserService extends Service {
  async findByUsername(username) {
    const { ctx } = this;
    return await ctx.model.User.findOne({
      where: { username },
    });
  }

  async validateUser(username, password) {
    const user = await this.findByUsername(username);
    if (!user) {
      return { success: false, message: '用户名不存在' };
    }

    if (user.status !== 1) {
      return { success: false, message: '用户已被禁用' };
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return { success: false, message: '密码错误' };
    }

    return { success: true, user };
  }

  async getUserInfo(userId) {
    const { ctx } = this;
    const user = await ctx.model.User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });
    return user;
  }

  async createUser(username, password, email) {
    const { ctx } = this;
    const existingUser = await this.findByUsername(username);
    if (existingUser) {
      return { success: false, message: '用户名已存在' };
    }

    try {
      const user = await ctx.model.User.create({
        username,
        password,
        email: email || null,
        status: 1,
      });

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          status: user.status,
        },
      };
    } catch (error) {
      ctx.logger.error('[UserService] createUser error:', error);
      return { success: false, message: '创建用户失败' };
    }
  }

  async getUserList() {
    const { ctx } = this;
    try {
      const users = await ctx.model.User.findAll({
        attributes: { exclude: ['password'] },
        include: [
          {
            model: ctx.model.Role,
            as: 'roles',
            attributes: ['id', 'name', 'description'],
            through: { attributes: [] },
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      const userList = users.map((user) => {
        const userData = user.toJSON();
        return {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          status: userData.status,
          roles: userData.roles || [],
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        };
      });

      return { success: true, data: userList };
    } catch (error) {
      ctx.logger.error('[UserService] getUserList error:', error);
      return { success: false, message: '获取用户列表失败' };
    }
  }
}

module.exports = UserService;
