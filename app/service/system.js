const { Service } = require('egg');

class SystemService extends Service {
  async list({ keyword, status } = {}) {
    const { ctx } = this;
    const Op = ctx.app.Sequelize.Op;

    const where = {};
    if (typeof status !== 'undefined' && status !== '') {
      where.status = Number(status);
    }
    if (keyword && String(keyword).trim()) {
      const kw = `%${String(keyword).trim()}%`;
      where[Op.or] = [{ code: { [Op.like]: kw } }, { name: { [Op.like]: kw } }];
    }

    const systems = await ctx.model.System.findAll({
      where,
      order: [
        ['sort', 'ASC'],
        ['id', 'DESC'],
      ],
    });

    return { success: true, data: systems };
  }

  async create({ code, name, status = 1, sort = 0 }) {
    const { ctx } = this;
    const existing = await ctx.model.System.findOne({ where: { code: String(code) } });
    if (existing) {
      return { success: false, message: '系统编码已存在' };
    }

    const system = await ctx.model.System.create({
      code: String(code),
      name: String(name),
      status: Number(status),
      sort: Number(sort),
    });

    return { success: true, data: system };
  }

  async update(id, { code, name, status, sort }) {
    const { ctx } = this;
    const system = await ctx.model.System.findByPk(Number(id));
    if (!system) {
      return { success: false, message: '系统不存在' };
    }

    if (typeof code !== 'undefined' && String(code) !== system.code) {
      const existing = await ctx.model.System.findOne({ where: { code: String(code) } });
      if (existing) {
        return { success: false, message: '系统编码已存在' };
      }
      system.code = String(code);
    }

    if (typeof name !== 'undefined') {
      system.name = String(name);
    }
    if (typeof status !== 'undefined') {
      system.status = Number(status);
    }
    if (typeof sort !== 'undefined') {
      system.sort = Number(sort);
    }

    await system.save();
    return { success: true, data: system };
  }

  async delete(id) {
    const { ctx } = this;
    const system = await ctx.model.System.findByPk(Number(id));
    if (!system) {
      return { success: false, message: '系统不存在' };
    }
    await system.destroy();
    return { success: true };
  }

  async updateStatus(id, status) {
    const { ctx } = this;
    const system = await ctx.model.System.findByPk(Number(id));
    if (!system) {
      return { success: false, message: '系统不存在' };
    }
    system.status = Number(status);
    await system.save();
    return { success: true, data: system };
  }

  async menuTree({ systemId, status } = {}) {
    const { ctx } = this;

    const systemWhere = {};
    const menuWhere = {};

    if (systemId !== undefined && systemId !== null && systemId !== '') {
      const sid = Number(systemId);
      if (!Number.isFinite(sid) || sid <= 0) {
        return { success: false, message: 'systemId 不合法' };
      }
      systemWhere.id = sid;
      menuWhere.systemId = sid;
    }

    if (typeof status !== 'undefined' && status !== '') {
      const s = Number(status);
      if (!Number.isFinite(s)) {
        return { success: false, message: 'status 不合法' };
      }
      systemWhere.status = s;
      menuWhere.status = s;
    } else {
      systemWhere.status = 1;
      menuWhere.status = 1;
    }

    const systems = await ctx.model.System.findAll({
      where: systemWhere,
      order: [
        ['sort', 'ASC'],
        ['id', 'ASC'],
      ],
      raw: true,
    });

    if (systemWhere.id && systems.length === 0) {
      return { success: false, message: '系统不存在' };
    }

    const menus = await ctx.model.Menu.findAll({
      where: menuWhere,
      order: [
        ['sort', 'ASC'],
        ['id', 'ASC'],
      ],
      raw: true,
    });

    const menusBySystemId = new Map();
    for (const m of menus) {
      const sid = Number(m.systemId);
      if (!menusBySystemId.has(sid)) menusBySystemId.set(sid, []);
      menusBySystemId.get(sid).push(m);
    }

    const sortTree = (nodes) => {
      nodes.sort((a, b) => {
        const sa = Number(a.sort ?? 0);
        const sb = Number(b.sort ?? 0);
        if (sa !== sb) return sa - sb;
        return Number(a.id) - Number(b.id);
      });
      for (const n of nodes) {
        if (Array.isArray(n.children) && n.children.length > 0) {
          sortTree(n.children);
        }
      }
    };

    const buildMenuTree = (systemMenus) => {
      const nodeMap = new Map();
      for (const m of systemMenus) {
        nodeMap.set(Number(m.id), {
          id: m.id,
          systemId: m.systemId,
          parentId: m.parentId,
          title: m.title,
          name: m.name,
          path: m.path,
          icon: m.icon,
          component: m.component,
          status: m.status,
          sort: m.sort,
          children: [],
        });
      }

      const roots = [];
      for (const node of nodeMap.values()) {
        const pid = node.parentId;
        if (pid === null || pid === undefined || pid === '' || Number(pid) === 0) {
          roots.push(node);
          continue;
        }
        const parent = nodeMap.get(Number(pid));
        if (!parent) {
          roots.push(node);
          continue;
        }
        parent.children.push(node);
      }

      sortTree(roots);
      return roots;
    };

    const data = systems.map((sys) => {
      const systemMenus = menusBySystemId.get(Number(sys.id)) || [];
      return {
        id: sys.id,
        code: sys.code,
        name: sys.name,
        title: sys.name,
        children: buildMenuTree(systemMenus),
      };
    });

    return { success: true, data };
  }
}

module.exports = SystemService;
