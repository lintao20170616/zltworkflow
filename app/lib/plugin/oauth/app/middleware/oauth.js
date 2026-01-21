module.exports = (options = {}) => {
  return async function oauth(ctx, next) {
    const { enable = true, whitelist = [], userKey = 'user' } = options;
    if (!enable) {
      await next();
      return;
    }

    const path = ctx.path;
    const isWhitelisted = whitelist.some((pattern) => {
      if (typeof pattern === 'string') {
        return path === pattern || path.startsWith(pattern);
      }
      if (pattern instanceof RegExp) {
        return pattern.test(path);
      }
      return false;
    });

    if (isWhitelisted) {
      await next();
      return;
    }

    if (!ctx.session || !ctx.session[userKey]) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: 'Unauthorized',
        data: null,
      };
      return;
    }

    await next();
  };
};
