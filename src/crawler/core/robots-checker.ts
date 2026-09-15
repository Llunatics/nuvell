// Robots.txt Parser & Compliance Checker for nuvelll

export interface RobotsRule {
  userAgent: string;
  disallowed: string[];
  allowed: string[];
  crawlDelay?: number;
}

export class RobotsChecker {
  private cache: Map<string, { rules: RobotsRule[]; fetchedAt: number }> = new Map();
  private defaultTtlMs = 1000 * 60 * 60 * 24; // 24 hours

  /**
   * Parses raw robots.txt file text
   */
  public parse(content: string): RobotsRule[] {
    const lines = content.split('\n');
    const rules: RobotsRule[] = [];
    let currentAgent = '*';
    let currentDisallowed: string[] = [];
    let currentAllowed: string[] = [];
    let currentDelay: number | undefined;

    for (const rawLine of lines) {
      const line = rawLine.split('#')[0].trim();
      if (!line) continue;

      const [field, ...valParts] = line.split(':');
      const key = field.trim().toLowerCase();
      const val = valParts.join(':').trim();

      if (key === 'user-agent') {
        if (currentDisallowed.length > 0 || currentAllowed.length > 0 || currentDelay !== undefined) {
          rules.push({
            userAgent: currentAgent,
            disallowed: [...currentDisallowed],
            allowed: [...currentAllowed],
            crawlDelay: currentDelay,
          });
          currentDisallowed = [];
          currentAllowed = [];
          currentDelay = undefined;
        }
        currentAgent = val.toLowerCase();
      } else if (key === 'disallow') {
        if (val) currentDisallowed.push(val);
      } else if (key === 'allow') {
        if (val) currentAllowed.push(val);
      } else if (key === 'crawl-delay') {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) currentDelay = parsed;
      }
    }

    if (currentDisallowed.length > 0 || currentAllowed.length > 0 || currentDelay !== undefined) {
      rules.push({
        userAgent: currentAgent,
        disallowed: currentDisallowed,
        allowed: currentAllowed,
        crawlDelay: currentDelay,
      });
    }

    return rules;
  }

  /**
   * Checks whether a path is allowed to be crawled for a given bot User-Agent
   */
  public isAllowed(rules: RobotsRule[], path: string, botUserAgent = 'nuvelll-bot'): boolean {
    const agent = botUserAgent.toLowerCase();

    // Look for matching rule or fallback to wildcard '*'
    const rule = rules.find((r) => r.userAgent === agent) || rules.find((r) => r.userAgent === '*');
    if (!rule) return true;

    // Check explicitly allowed paths first
    for (const allowPattern of rule.allowed) {
      if (this.pathMatches(path, allowPattern)) return true;
    }

    // Check disallowed paths
    for (const disallowPattern of rule.disallowed) {
      if (this.pathMatches(path, disallowPattern)) return false;
    }

    return true;
  }

  public getCrawlDelay(rules: RobotsRule[], botUserAgent = 'nuvelll-bot'): number | null {
    const agent = botUserAgent.toLowerCase();
    const rule = rules.find((r) => r.userAgent === agent) || rules.find((r) => r.userAgent === '*');
    return rule?.crawlDelay ?? null;
  }

  private pathMatches(path: string, pattern: string): boolean {
    if (pattern === '/') return true;
    if (pattern === '') return false;
    const regexStr = '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '\\?') + '.*';
    try {
      return new RegExp(regexStr).test(path);
    } catch {
      return path.startsWith(pattern);
    }
  }
}

export const robotsChecker = new RobotsChecker();
