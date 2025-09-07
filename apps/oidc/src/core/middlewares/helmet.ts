import helmet from 'helmet';

const directives = helmet.contentSecurityPolicy.getDefaultDirectives();
// biome-ignore lint/performance/noDelete: it's fine
delete directives['form-action'];

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives,
  },
});
