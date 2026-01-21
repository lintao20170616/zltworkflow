const path = require('path');
const fs = require('fs');
const { Controller } = require('egg');

/**
 * 处理页面渲染
 */
class PagesController extends Controller {
  /**
   * 配合前端静态路由，执行页面渲染
   * @param {*} options 渲染参数
   * @param {*} htmlPath 模板页面路径
   */
  async render(options = {}, htmlPath) {
    // 设置页面跨域策略，允许页面设置document.domain
    this.ctx.set('Origin-Agent-Cluster', '?0');
    // 生成页面配置信息，整合 config 及 options 中的配置
    const pageConfig = Object.assign({}, this.app.config.pageConfig, options.pageConfig || {});
    // 记录当前提供服务的时间，用于后续和页面渲染结束的时间进行对比
    const serverTime = new Date().getTime();

    const pageData = Object.assign({ serverTime, name: this.app.name }, options);
    pageData.pageConfig = Buffer.from(JSON.stringify(pageConfig), 'utf-8').toString('base64');
    // 设置 ctx.locals，只有这样模板引擎中的 locals 变量才会生效
    Object.assign(this.ctx.locals, pageData);

    this.ctx.logger.info('[PagesController] render file:', pageData);
    const templatePath = htmlPath || 'index.html';
    await this.ctx.render(templatePath);
  }

  async index() {
    // 初始化应用信息
    const info = await this.ctx.service.admin.getInfo();
    this.ctx.state.adminInfo = info;
    // 设定页面配置并执行页面渲染
    const pageConfig = {
      adminInfo: { info },
      serverTime: new Date().getTime(),
    };
    await this.render({ pageConfig });
  }

  async errorPage() {
    await this.render({}, 'error.html');
  }
}

module.exports = PagesController;
