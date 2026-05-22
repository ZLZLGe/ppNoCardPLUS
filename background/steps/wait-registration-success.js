(function attachBackgroundStep6(root, factory) {
  root.MultiPageBackgroundStep6 = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createBackgroundStep6Module() {
  const DEFAULT_REGISTRATION_SUCCESS_WAIT_MS = 4000;
  const LOCAL_CPA_JSON_NO_RT_PANEL_MODE = 'local-cpa-json-no-rt';
  const LOCAL_CPA_JSON_EXPORT_NODE_ID = 'local-cpa-json-export';
  const CHATGPT_SESSION_EXPORT_URL = 'https://chatgpt.com/api/auth/session';
  const CHATGPT_SESSION_EXPORT_ATTEMPTS = 5;
  const CHATGPT_SESSION_EXPORT_RETRY_DELAY_MS = 3000;
  const LOCAL_CPA_JSON_SAVE_ATTEMPTS = 5;
  const LOCAL_CPA_JSON_SAVE_RETRY_DELAY_MS = 2000;
  const LOCAL_CPA_JSON_SAVE_REQUEST_TIMEOUT_MS = 10000;
  const LOCAL_CPA_JSON_DOWNLOAD_COMPLETE_TIMEOUT_MS = 60000;
  const STEP6_COOKIE_CLEAR_DOMAINS = [
    'chatgpt.com',
    'chat.openai.com',
    'pay.openai.com',
    'openai.com',
    'auth.openai.com',
    'auth0.openai.com',
    'accounts.openai.com',
    'paypal.com',
    'stripe.com',
    'checkout.stripe.com',
    'meiguodizhi.com',
    'mail-api.yuecheng.shop',
    'yuecheng.shop',
  ];
  const STEP6_COOKIE_CLEAR_ORIGINS = [
    'https://chatgpt.com',
    'https://chat.openai.com',
    'https://pay.openai.com',
    'https://auth.openai.com',
    'https://auth0.openai.com',
    'https://accounts.openai.com',
    'https://openai.com',
    'https://www.paypal.com',
    'https://paypal.com',
    'https://checkout.stripe.com',
    'https://www.meiguodizhi.com',
    'https://meiguodizhi.com',
    'https://mail-api.yuecheng.shop',
  ];

  function normalizeStep6CookieDomain(domain) {
    return String(domain || '').trim().replace(/^\.+/, '').toLowerCase();
  }

  function shouldClearStep6Cookie(cookie) {
    const domain = normalizeStep6CookieDomain(cookie?.domain);
    if (!domain) return false;
    return STEP6_COOKIE_CLEAR_DOMAINS.some((target) => (
      domain === target || domain.endsWith(`.${target}`)
    ));
  }

  function buildStep6CookieRemovalUrl(cookie) {
    const host = normalizeStep6CookieDomain(cookie?.domain);
    const rawPath = String(cookie?.path || '/');
    const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    return `https://${host}${path}`;
  }

  async function collectStep6Cookies(chromeApi) {
    if (!chromeApi.cookies?.getAll) {
      return [];
    }

    const stores = chromeApi.cookies.getAllCookieStores
      ? await chromeApi.cookies.getAllCookieStores()
      : [{ id: undefined }];
    const cookies = [];
    const seen = new Set();

    for (const store of stores) {
      const storeId = store?.id;
      const batch = await chromeApi.cookies.getAll(storeId ? { storeId } : {});
      for (const cookie of batch || []) {
        if (!shouldClearStep6Cookie(cookie)) continue;
        const key = [
          cookie.storeId || storeId || '',
          cookie.domain || '',
          cookie.path || '',
          cookie.name || '',
          cookie.partitionKey ? JSON.stringify(cookie.partitionKey) : '',
        ].join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        cookies.push(cookie);
      }
    }

    return cookies;
  }

  async function removeStep6Cookie(chromeApi, cookie, getErrorMessage) {
    const details = {
      url: buildStep6CookieRemovalUrl(cookie),
      name: cookie.name,
    };
    if (cookie.storeId) {
      details.storeId = cookie.storeId;
    }
    if (cookie.partitionKey) {
      details.partitionKey = cookie.partitionKey;
    }

    try {
      const result = await chromeApi.cookies.remove(details);
      return Boolean(result);
    } catch (error) {
      console.warn('[MultiPage:step6] remove cookie failed', {
        domain: cookie?.domain,
        name: cookie?.name,
        message: getErrorMessage(error),
      });
      return false;
    }
  }

  function createStep6Executor(deps = {}) {
    const {
      addLog = async () => {},
      buildLocalHelperEndpoint = null,
      chrome: chromeApi = globalThis.chrome,
      completeNodeFromBackground,
      createLocalCliProxyApi = null,
      ensureContentScriptReadyOnTab = async () => {},
      getErrorMessage = (error) => error?.message || String(error || '未知错误'),
      getPanelMode = (state = {}) => String(state?.panelMode || '').trim() || 'cpa',
      getTabId = async () => null,
      isStepDoneStatus = (status) => status === 'completed' || status === 'manual_completed' || status === 'skipped',
      normalizeHotmailLocalBaseUrl = (value) => String(value || '').trim(),
      registrationSuccessWaitMs = DEFAULT_REGISTRATION_SUCCESS_WAIT_MS,
      sessionExportInjectFiles = ['content/utils.js', 'content/operation-delay.js', 'content/plus-checkout.js'],
      sendToContentScriptResilient = null,
      sleepWithStop = async (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0))),
    } = deps;

    function normalizeString(value = '') {
      return String(value || '').trim();
    }

    function normalizeChatGptPlanType(value = '') {
      return normalizeString(value).toLowerCase();
    }

    function extractChatGptPlanType(sessionResult = {}) {
      const session = sessionResult?.session || {};
      const account = session?.account || sessionResult?.account || {};
      const candidates = [
        account?.planType,
        account?.plan_type,
        account?.plan,
        account?.planName,
        account?.plan_name,
        session?.planType,
        session?.plan_type,
        sessionResult?.planType,
        sessionResult?.plan_type,
        sessionResult?.chatgpt_plan_type,
      ];
      for (const candidate of candidates) {
        const normalized = normalizeChatGptPlanType(candidate);
        if (normalized) {
          return normalized;
        }
      }
      return '';
    }

    function isLocalCpaJsonNoRtMode(state = {}) {
      return normalizeString(getPanelMode(state)) === LOCAL_CPA_JSON_NO_RT_PANEL_MODE;
    }

    function getLocalCliProxyApi() {
      const factory = createLocalCliProxyApi
        || globalThis.MultiPageBackgroundLocalCliProxyApi?.createLocalCliProxyApi
        || null;
      if (typeof factory !== 'function') {
        throw new Error('本地 CPA JSON 无RT 模块未加载，无法导出认证文件。');
      }
      return factory({
        crypto: globalThis.crypto,
        fetch: typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null,
        sessionToJsonConverter: globalThis.MultiPageSessionToJsonConverter,
      });
    }

    async function fetchWithTimeout(url, options = {}, timeoutMs = LOCAL_CPA_JSON_SAVE_REQUEST_TIMEOUT_MS) {
      const effectiveTimeoutMs = Math.max(1000, Math.floor(Number(timeoutMs) || LOCAL_CPA_JSON_SAVE_REQUEST_TIMEOUT_MS));
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      let didTimeout = false;
      let timer = null;
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => {
          didTimeout = true;
          if (controller) {
            controller.abort();
          }
          reject(new Error(`本地 helper 请求超时（>${Math.round(effectiveTimeoutMs / 1000)} 秒）：${url}`));
        }, effectiveTimeoutMs);
      });

      try {
        return await Promise.race([
          fetch(url, {
            ...options,
            ...(controller ? { signal: controller.signal } : {}),
          }),
          timeoutPromise,
        ]);
      } catch (error) {
        if (didTimeout || error?.name === 'AbortError') {
          throw new Error(`本地 helper 请求超时（>${Math.round(effectiveTimeoutMs / 1000)} 秒）：${url}`);
        }
        throw error;
      } finally {
        if (timer) {
          clearTimeout(timer);
        }
      }
    }

    async function saveLocalCpaJsonArtifactViaHelper(helperBaseUrl, artifact) {
      const endpoint = typeof buildLocalHelperEndpoint === 'function'
        ? buildLocalHelperEndpoint(helperBaseUrl, '/save-auth-json')
        : new URL('/save-auth-json', `${helperBaseUrl.replace(/\/+$/, '')}/`).toString();
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: artifact.filePath,
          directoryPath: artifact.directoryPath,
          content: artifact.jsonText,
        }),
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (!response.ok || payload?.ok === false) {
        const helperError = normalizeString(payload?.error);
        if (/Missing email\/clientId\/refreshToken/i.test(helperError)) {
          throw new Error('本地 helper 未识别 /save-auth-json，当前运行的 hotmail_helper.py 版本过旧或不是当前项目目录。请停止旧 helper，并从当前 FlowPilot-FlowPilot1.0.2 目录重新启动本地助手。');
        }
        throw new Error(helperError || `本地 helper 写入失败（HTTP ${response.status}）。`);
      }

      return {
        ...artifact,
        filePath: normalizeString(payload?.filePath) || artifact.filePath,
      };
    }

    function getLocalCpaJsonHelperSaveEndpoints(helperBaseUrl) {
      const primary = typeof buildLocalHelperEndpoint === 'function'
        ? buildLocalHelperEndpoint(helperBaseUrl, '/save-auth-json')
        : new URL('/save-auth-json', `${helperBaseUrl.replace(/\/+$/, '')}/`).toString();
      const endpoints = [primary];
      try {
        const parsed = new URL(primary);
        if (parsed.hostname === 'localhost') {
          parsed.hostname = '127.0.0.1';
          endpoints.push(parsed.toString());
        } else if (parsed.hostname === '127.0.0.1') {
          parsed.hostname = 'localhost';
          endpoints.push(parsed.toString());
        }
      } catch {
        // Keep only the configured endpoint.
      }
      return Array.from(new Set(endpoints));
    }

    function sanitizeDownloadFileName(value, fallback = 'chatgpt-session-plus.json') {
      const raw = normalizeString(value || fallback)
        .replace(/[\\/:*?"<>|]+/g, '-')
        .replace(/[\x00-\x1f]+/g, '')
        .replace(/^\.+/, '')
        .trim();
      return raw || fallback;
    }

    async function waitForDownloadComplete(downloadId) {
      const numericId = Number(downloadId);
      if (!Number.isInteger(numericId) || numericId <= 0) {
        return;
      }

      const downloadsApi = chromeApi?.downloads;
      const onChanged = downloadsApi?.onChanged;
      if (onChanged?.addListener && onChanged?.removeListener) {
        await new Promise((resolve, reject) => {
          let timer = null;
          const cleanup = () => {
            if (timer) clearTimeout(timer);
            try {
              onChanged.removeListener(listener);
            } catch {
              // Ignore listener cleanup failures.
            }
          };
          const listener = (delta = {}) => {
            if (Number(delta?.id) !== numericId) {
              return;
            }
            const state = normalizeString(delta?.state?.current).toLowerCase();
            if (state === 'complete') {
              cleanup();
              resolve();
              return;
            }
            if (state === 'interrupted') {
              const errorText = normalizeString(delta?.error?.current) || 'interrupted';
              cleanup();
              reject(new Error(`浏览器下载本地 CPA JSON 被中断：${errorText}`));
            }
          };
          timer = setTimeout(() => {
            cleanup();
            reject(new Error(`浏览器下载本地 CPA JSON 超时：${Math.round(LOCAL_CPA_JSON_DOWNLOAD_COMPLETE_TIMEOUT_MS / 1000)} 秒内未完成。`));
          }, LOCAL_CPA_JSON_DOWNLOAD_COMPLETE_TIMEOUT_MS);
          onChanged.addListener(listener);
        });
        return;
      }

      if (typeof downloadsApi?.search === 'function') {
        const startedAt = Date.now();
        while (Date.now() - startedAt < LOCAL_CPA_JSON_DOWNLOAD_COMPLETE_TIMEOUT_MS) {
          const items = await downloadsApi.search({ id: numericId }).catch(() => []);
          const item = Array.isArray(items) ? items[0] : null;
          const state = normalizeString(item?.state).toLowerCase();
          if (state === 'complete') {
            return;
          }
          if (state === 'interrupted') {
            throw new Error(`浏览器下载本地 CPA JSON 被中断：${normalizeString(item?.error) || 'interrupted'}`);
          }
          await sleepWithStop(500);
        }
        throw new Error(`浏览器下载本地 CPA JSON 超时：${Math.round(LOCAL_CPA_JSON_DOWNLOAD_COMPLETE_TIMEOUT_MS / 1000)} 秒内未完成。`);
      }
    }

    function createDownloadCompletionWaiter() {
      const downloadsApi = chromeApi?.downloads;
      const onChanged = downloadsApi?.onChanged;
      if (!onChanged?.addListener || !onChanged?.removeListener) {
        return null;
      }

      let expectedDownloadId = null;
      const pendingDeltas = [];
      let settled = false;
      let timer = null;
      let resolveWait = null;
      let rejectWait = null;
      const listener = (delta = {}) => {
        if (!Number.isInteger(expectedDownloadId)) {
          pendingDeltas.push(delta);
          if (pendingDeltas.length > 20) {
            pendingDeltas.shift();
          }
          return;
        }
        if (Number(delta?.id) !== expectedDownloadId) {
          return;
        }
        const state = normalizeString(delta?.state?.current).toLowerCase();
        if (state === 'complete') {
          finish(resolveWait, undefined);
          return;
        }
        if (state === 'interrupted') {
          const errorText = normalizeString(delta?.error?.current) || 'interrupted';
          finish(rejectWait, new Error(`浏览器下载本地 CPA JSON 被中断：${errorText}`));
        }
      };
      const cleanup = () => {
        if (timer) clearTimeout(timer);
        timer = null;
        try {
          onChanged.removeListener(listener);
        } catch {
          // Ignore listener cleanup failures.
        }
      };
      const finish = (callback, value) => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        callback(value);
      };
      const promise = new Promise((resolve, reject) => {
        resolveWait = resolve;
        rejectWait = reject;
        timer = setTimeout(() => {
          finish(reject, new Error(`浏览器下载本地 CPA JSON 超时：${Math.round(LOCAL_CPA_JSON_DOWNLOAD_COMPLETE_TIMEOUT_MS / 1000)} 秒内未完成。`));
        }, LOCAL_CPA_JSON_DOWNLOAD_COMPLETE_TIMEOUT_MS);
      });

      onChanged.addListener(listener);
      return {
        setDownloadId(downloadId) {
          expectedDownloadId = Number(downloadId);
          if (!Number.isInteger(expectedDownloadId) || expectedDownloadId <= 0) {
            finish(resolveWait, undefined);
          } else {
            const pendingIndex = pendingDeltas.findIndex((delta) => Number(delta?.id) === expectedDownloadId);
            if (pendingIndex >= 0) {
              const [delta] = pendingDeltas.splice(pendingIndex, 1);
              listener(delta);
            }
          }
        },
        wait() {
          return promise;
        },
        cancel() {
          finish(resolveWait, undefined);
        },
      };
    }

    async function downloadLocalCpaJsonArtifactWithBrowser(artifact, helperError = null) {
      if (!chromeApi?.downloads?.download) {
        throw helperError || new Error('当前 Chrome 未开放 downloads 权限，无法使用浏览器下载兜底保存本地 CPA JSON。');
      }

      const fileName = sanitizeDownloadFileName(artifact?.fileName);
      const downloadPath = `GuJumpgate-CPA/${fileName}`;
      const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(String(artifact?.jsonText || ''))}`;
      let downloadId = null;
      const downloadWaiter = createDownloadCompletionWaiter();
      try {
        downloadId = await chromeApi.downloads.download({
          url: dataUrl,
          filename: downloadPath,
          saveAs: false,
          conflictAction: 'uniquify',
        });
        downloadWaiter?.setDownloadId(downloadId);
      } catch (downloadError) {
        downloadWaiter?.cancel();
        const helperMessage = helperError ? `本地 helper 错误：${getErrorMessage(helperError)}；` : '';
        throw new Error(`${helperMessage}浏览器下载兜底也失败：${getErrorMessage(downloadError)}`);
      }

      if (downloadWaiter) {
        await downloadWaiter.wait();
      } else {
        await waitForDownloadComplete(downloadId);
      }

      return {
        ...artifact,
        filePath: `Downloads/${downloadPath}`,
        downloadId,
        downloadFileName: downloadPath,
        savedByDownloadFallback: true,
      };
    }

    async function saveLocalCpaJsonArtifactRobustly(helperBaseUrl, artifact) {
      const endpoints = getLocalCpaJsonHelperSaveEndpoints(helperBaseUrl);
      let lastError = null;
      for (let attempt = 1; attempt <= LOCAL_CPA_JSON_SAVE_ATTEMPTS; attempt += 1) {
        for (const endpoint of endpoints) {
          try {
            const endpointBaseUrl = endpoint.replace(/\/save-auth-json(?:[?#].*)?$/i, '');
            return await saveLocalCpaJsonArtifactViaHelper(endpointBaseUrl, artifact);
          } catch (error) {
            lastError = error;
          }
        }

        if (attempt < LOCAL_CPA_JSON_SAVE_ATTEMPTS) {
          await addLog(`步骤 7：保存本地 CPA JSON 失败（${getErrorMessage(lastError)}），等待 ${Math.round(LOCAL_CPA_JSON_SAVE_RETRY_DELAY_MS / 1000)} 秒后重试（${attempt}/${LOCAL_CPA_JSON_SAVE_ATTEMPTS}）...`, 'warn');
          await sleepWithStop(LOCAL_CPA_JSON_SAVE_RETRY_DELAY_MS);
        }
      }
      await addLog(`步骤 7：本地 helper 仍不可用，改用浏览器下载兜底保存 JSON。最后错误：${getErrorMessage(lastError)}`, 'warn');
      return downloadLocalCpaJsonArtifactWithBrowser(artifact, new Error(`保存本地 CPA JSON 失败：无法连接本地 helper ${endpoints.join(' 或 ')}。请确认 start-hotmail-helper 已启动，或重新启动本地助手后再点第 7 步。最后错误：${getErrorMessage(lastError)}`));
    }

    async function openChatGptSessionExportTab(state = {}) {
      if (chromeApi?.tabs?.create) {
        const tab = await chromeApi.tabs.create({
          url: CHATGPT_SESSION_EXPORT_URL,
          active: false,
        });
        const tabId = Number(tab?.id);
        if (Number.isInteger(tabId) && tabId > 0) {
          return {
            source: 'plus-checkout',
            tabId,
            temporary: true,
          };
        }
      }

      const fallbackTabId = Number(state?.plusCheckoutTabId || await getTabId('plus-checkout') || await getTabId('signup-page'));
      if (!Number.isInteger(fallbackTabId) || fallbackTabId <= 0) {
        throw new Error('未找到可读取 ChatGPT 会话的标签页，无法导出本地 CPA JSON 无RT。');
      }
      return {
        source: 'plus-checkout',
        tabId: fallbackTabId,
        temporary: false,
      };
    }

    async function closeTemporarySessionExportTab(tabInfo = {}) {
      if (!tabInfo?.temporary || !Number.isInteger(Number(tabInfo?.tabId)) || !chromeApi?.tabs?.remove) {
        return;
      }
      await chromeApi.tabs.remove(Number(tabInfo.tabId)).catch(() => {});
    }

    function isRetryableChatGptSessionExportError(error) {
      const message = getErrorMessage(error);
      return /failed to fetch|networkerror|network error|fetch failed|load failed|net::err_|未返回可用 accessToken|缺少 accessToken|会话读取|session/i.test(message);
    }

    function createChatGptSessionExportError(error, attempts) {
      const message = getErrorMessage(error);
      if (/failed to fetch|networkerror|network error|fetch failed|load failed|net::err_/i.test(message)) {
        return new Error(`读取 ChatGPT 会话失败：浏览器访问 /api/auth/session 网络异常，已重试 ${attempts} 次。请确认当前 Chrome 仍登录 ChatGPT，网络/代理可访问 chatgpt.com 后再重试。原始错误：${message}`);
      }
      if (/未返回可用 accessToken|缺少 accessToken/i.test(message)) {
        return new Error(`读取 ChatGPT 会话失败：/api/auth/session 没有返回 accessToken，已重试 ${attempts} 次。请确认订阅完成后的 ChatGPT 标签页仍是登录状态，再重新执行导出。原始错误：${message}`);
      }
      return new Error(`读取 ChatGPT 会话失败，已重试 ${attempts} 次。原始错误：${message}`);
    }

    async function readChatGptSessionForExport(state = {}, visibleStep = 7) {
      if (typeof sendToContentScriptResilient !== 'function') {
        throw new Error('当前环境缺少 ChatGPT 会话读取通道，无法导出本地 CPA JSON 无RT。');
      }

      const tabInfo = await openChatGptSessionExportTab(state);
      try {
        await ensureContentScriptReadyOnTab(tabInfo.source, tabInfo.tabId, {
          inject: sessionExportInjectFiles,
          injectSource: tabInfo.source,
          timeoutMs: 30000,
          retryDelayMs: 800,
          logMessage: `步骤 ${visibleStep}：正在连接 ChatGPT 页面，准备读取当前会话并导出 JSON...`,
          logStep: visibleStep,
          logStepKey: LOCAL_CPA_JSON_EXPORT_NODE_ID,
        });

        let lastError = null;
        for (let attempt = 1; attempt <= CHATGPT_SESSION_EXPORT_ATTEMPTS; attempt += 1) {
          const sessionResult = await sendToContentScriptResilient(tabInfo.source, {
            type: 'PLUS_CHECKOUT_GET_STATE',
            step: visibleStep,
            source: 'background',
            payload: {
              includeSession: true,
              includeAccessToken: true,
            },
          }, {
            timeoutMs: 15000,
            retryDelayMs: 500,
            logMessage: `步骤 ${visibleStep}：正在等待 ChatGPT 页面返回当前登录会话...`,
            logStep: visibleStep,
            logStepKey: LOCAL_CPA_JSON_EXPORT_NODE_ID,
          });

          if (!sessionResult?.error && normalizeString(sessionResult?.accessToken)) {
            return sessionResult;
          }

          lastError = new Error(sessionResult?.error || 'ChatGPT 页面未返回可用 accessToken。');
          if (attempt >= CHATGPT_SESSION_EXPORT_ATTEMPTS || !isRetryableChatGptSessionExportError(lastError)) {
            throw createChatGptSessionExportError(lastError, attempt);
          }
          await addLog(`步骤 ${visibleStep}：读取 ChatGPT 会话失败（${getErrorMessage(lastError)}），等待 ${Math.round(CHATGPT_SESSION_EXPORT_RETRY_DELAY_MS / 1000)} 秒后重试（${attempt}/${CHATGPT_SESSION_EXPORT_ATTEMPTS}）...`, 'warn');
          await sleepWithStop(CHATGPT_SESSION_EXPORT_RETRY_DELAY_MS);
        }
        throw createChatGptSessionExportError(lastError || new Error('ChatGPT 页面未返回会话。'), CHATGPT_SESSION_EXPORT_ATTEMPTS);
      } finally {
        await closeTemporarySessionExportTab(tabInfo);
      }
    }

    async function exportLocalCpaJsonNoRt(state = {}, options = {}) {
      const visibleStep = Math.max(1, Math.floor(Number(options.visibleStep) || 7));
      const helperBaseUrl = normalizeHotmailLocalBaseUrl(state.hotmailLocalBaseUrl);
      const pluginDir = normalizeString(state.localCpaJsonPluginDir);
      if (!helperBaseUrl) {
        throw new Error('尚未配置 Hotmail 本地助手地址，请先在侧边栏填写。');
      }
      if (!pluginDir) {
        throw new Error('尚未配置本地插件目录，请先在侧边栏填写。');
      }

      const sessionResult = await readChatGptSessionForExport(state, visibleStep);
      const planType = extractChatGptPlanType(sessionResult);
      await addLog(`步骤 ${visibleStep}：ChatGPT session 当前计划为 planType=${planType || '空'}，按当前模式继续导出保存。`, 'info');
      const api = getLocalCliProxyApi();
      const artifact = await api.buildAuthJsonArtifact({
        pluginDir,
        relativeAuthDir: state.localCpaJsonRelativeAuthDir,
        session: sessionResult?.session,
        accessToken: sessionResult?.accessToken,
        sessionToken: sessionResult?.session?.sessionToken,
        email: sessionResult?.email || sessionResult?.session?.user?.email || state?.email,
        expiresAt: sessionResult?.expiresAt || sessionResult?.session?.expires,
        accountId: sessionResult?.session?.account?.id,
        userId: sessionResult?.session?.user?.id,
        planType,
        lastRefresh: '',
        sourceName: 'SessionToJson Local No RT',
      });

      for (const warning of Array.isArray(artifact.warnings) ? artifact.warnings : []) {
        await addLog(`步骤 ${visibleStep}：${warning}`, 'warn');
      }

      const saved = await saveLocalCpaJsonArtifactRobustly(helperBaseUrl, artifact);
      const verifiedStatus = `本地CPA JSON 无RT 已导出：${saved.filePath}`;
      await addLog(`步骤 ${visibleStep}：${verifiedStatus}`, 'ok');
      return {
        verifiedStatus,
        localCpaJsonFilePath: saved.filePath,
      };
    }

    async function clearCookiesIfEnabled(state = {}) {
      if (!state?.step6CookieCleanupEnabled) {
        return;
      }
      if (!chromeApi?.cookies?.getAll || !chromeApi.cookies?.remove) {
        await addLog('步骤 6：当前浏览器不支持 cookies API，跳过第六步 Cookies 清理。', 'warn');
        return;
      }

      try {
        await addLog('步骤 6：已开启 Cookies 清理，正在清理 ChatGPT / OpenAI cookies...', 'info');
        const cookies = await collectStep6Cookies(chromeApi);
        let removedCount = 0;
        for (const cookie of cookies) {
          if (await removeStep6Cookie(chromeApi, cookie, getErrorMessage)) {
            removedCount += 1;
          }
        }

        if (chromeApi.browsingData?.removeCookies) {
          try {
            await chromeApi.browsingData.removeCookies({
              since: 0,
              origins: STEP6_COOKIE_CLEAR_ORIGINS,
            });
          } catch (error) {
            await addLog(`步骤 6：browsingData 补扫 cookies 失败：${getErrorMessage(error)}`, 'warn');
          }
        }

        await addLog(`步骤 6：已清理 ${removedCount} 个 ChatGPT / OpenAI cookies。`, 'ok');
      } catch (error) {
        await addLog(`步骤 6：Cookies 清理失败，已跳过并继续后续流程：${getErrorMessage(error)}`, 'warn');
      }
    }

    async function executeStep6(state = {}) {
      const baseWaitMs = Math.max(0, Math.floor(Number(registrationSuccessWaitMs) || 0));
      const waitMs = baseWaitMs;
      if (waitMs > 0) {
        await addLog(`步骤 6：等待 ${Math.round(waitMs / 1000)} 秒，确认注册成功并让页面稳定...`, 'info');
        await sleepWithStop(waitMs);
      }
      await clearCookiesIfEnabled(state);
      await addLog('步骤 6：注册成功等待完成，注册阶段已结束。', 'ok');
      await completeNodeFromBackground('wait-registration-success', {});
    }

    async function executeLocalCpaJsonNoRtExport(state = {}) {
      if (!isLocalCpaJsonNoRtMode(state)) {
        throw new Error('当前不是本地CPA JSON 无RT 模式，不能执行无RT导出节点。');
      }
      await addLog('步骤 7：Plus Checkout 已完成/已跳过，等待 5 秒后导出本地 CPA JSON 无RT...', 'info');
      const plusCheckoutStatus = normalizeString(state?.nodeStatuses?.['plus-checkout-create']);
      if (!isStepDoneStatus(plusCheckoutStatus)) {
        throw new Error(`步骤 7：Plus Checkout 尚未完全完成，当前第 6 步状态为 ${plusCheckoutStatus || 'pending'}，已阻止提前导出本地 CPA JSON。`);
      }
      await sleepWithStop(5000);
      const completionPayload = await exportLocalCpaJsonNoRt(state, { visibleStep: 7 });
      await completeNodeFromBackground(LOCAL_CPA_JSON_EXPORT_NODE_ID, completionPayload);
    }

    return {
      executeLocalCpaJsonNoRtExport,
      executeStep6,
    };
  }

  return { createStep6Executor };
});
