// app/service/user.js
const { Service } = require('egg');

/**
 * @class AdminService
 * @augments Service
 * @description 管理员相关的业务逻辑和数据访问
 */
class AdminService extends Service {
  /**
   * 更新用户信息
   * @param {number} id - 用户ID
   * @param {Object} updates - 要更新的字段
   * @return {Promise<boolean>} - 返回是否更新成功
   */
  async getInfo() {
    const info = {};
    console.log(this.config); // const { sessionKey, clients, localeClientMap, extraInfo } = this.config.eggIluc
    return { info: 'zltadminweb is running' };
  }
}

// 直接导出类
module.exports = AdminService;
