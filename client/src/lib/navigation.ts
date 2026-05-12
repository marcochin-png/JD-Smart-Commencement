export function getBaseUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

export function withBasePath(path = ''): string {
  const normalizedBase = getBaseUrl();
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return normalizedPath ? `${normalizedBase}${normalizedPath}` : normalizedBase;
}

export function toAppRelativePath(pathname: string): string {
  const normalizedBase = getBaseUrl();
  const baseWithoutTrailingSlash = normalizedBase.slice(0, -1);

  if (pathname === baseWithoutTrailingSlash || pathname === normalizedBase) {
    return '/';
  }

  if (pathname.startsWith(baseWithoutTrailingSlash + '/')) {
    return pathname.slice(baseWithoutTrailingSlash.length) || '/';
  }

  return pathname || '/';
}

export function pushAppPath(path: string) {
  window.history.pushState({}, '', withBasePath(path));
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function replaceAppLocation(path: string) {
  window.location.href = withBasePath(path);
}