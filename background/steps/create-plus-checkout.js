(function attachBackgroundPlusCheckoutCreate(root, factory) {
  root.MultiPageBackgroundPlusCheckoutCreate = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createBackgroundPlusCheckoutCreateModule() {
  const PLUS_CHECKOUT_SOURCE = 'plus-checkout';
  const PAYPAL_SOURCE = 'paypal-flow';
  const PLUS_CHECKOUT_ENTRY_URL = 'https://chatgpt.com/';
  const PLUS_CHECKOUT_INJECT_FILES = ['content/utils.js', 'content/operation-delay.js', 'content/plus-checkout.js'];
  const PAYPAL_INJECT_FILES = ['content/utils.js', 'content/operation-delay.js', 'content/paypal-flow.js'];
  const PLUS_PAYMENT_METHOD_PAYPAL = 'paypal';
  const PLUS_PAYMENT_METHOD_GOPAY = 'gopay';
  const PLUS_PAYMENT_METHOD_GPC_HELPER = 'gpc-helper';
  const DEFAULT_GPC_HELPER_API_URL = 'https://your-gpc-helper-domain.example';
  const BUILTIN_PLUS_CHECKOUT_CLOUD_CONVERSION_API_URL = 'https://gujumpgate.zg.fyi/api/checkout';
  const BUILTIN_PLUS_CHECKOUT_CLOUD_CONVERSION_API_KEY = '2KwVxE6f0ABH002JLkoQJ9ReRf4_d01y';
  const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
  const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
  const CHECKOUT_READY_URL_PATTERN = /^https:\/\/(?:chatgpt\.com\/checkout|pay\.openai\.com\/c\/pay|checkout\.stripe\.com\/c\/pay)(?:\/|$)/i;
  const CHECKOUT_REDIRECT_WAIT_TIMEOUT_MS = 15000;
  const HOSTED_CHECKOUT_ADDRESS_ENDPOINT = 'https://www.meiguodizhi.com/api/v1/dz';
  const HOSTED_CHECKOUT_VERIFICATION_CODE_ENDPOINT = 'https://mail.test.com/api/text-relay/eca_tr_xxxxxxxxx';
  const HOSTED_CHECKOUT_TRANSITION_TIMEOUT_MS = 120000;
  const HOSTED_CHECKOUT_SUCCESS_WAIT_TIMEOUT_MS = 180000;
  const HOSTED_CHECKOUT_PAYPAL_LOOP_TIMEOUT_MS = 10 * 60 * 1000;
  const HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS = 12;
  const HOSTED_CHECKOUT_VERIFICATION_POLL_INTERVAL_MS = 5000;
  const HOSTED_CHECKOUT_VERIFICATION_RETRY_MAX_ATTEMPTS = 5;
  const HOSTED_CHECKOUT_VERIFICATION_RETRY_DELAY_MS = 30000;
  const HOSTED_CHECKOUT_VERIFICATION_POPUP_DELAY_MIN_SECONDS = 0;
  const HOSTED_CHECKOUT_VERIFICATION_POPUP_DELAY_MAX_SECONDS = 60;
  const HOSTED_CHECKOUT_VERIFICATION_POPUP_DELAY_DEFAULT_SECONDS = 20;
  const HOSTED_CHECKOUT_PAYPAL_GENERIC_ERROR_SETTLE_MS = 60000;
  const HOSTED_CHECKOUT_PAYPAL_STUCK_REFRESH_MS = 120000;
  const HOSTED_CHECKOUT_PAYPAL_BUSY_REFRESH_MS = 60000;
  const HOSTED_CHECKOUT_PAYPAL_STUCK_REFRESH_MAX_ATTEMPTS = 3;
  const HOSTED_CHECKOUT_TAB_LOAD_TIMEOUT_MS = 120000;
  const HOSTED_CHECKOUT_CONTENT_READY_TIMEOUT_MS = 45000;
  const HOSTED_CHECKOUT_STATE_MESSAGE_TIMEOUT_MS = 15000;
  const HOSTED_CHECKOUT_ACTION_MESSAGE_TIMEOUT_MS = 45000;
  const HOSTED_CHECKOUT_CREATE_MESSAGE_TIMEOUT_MS = 120000;
  const HOSTED_CHECKOUT_PAYPAL_DEFAULT_PHONE = '1234567890';
  const HOSTED_CHECKOUT_SUCCESS_URL_PATTERN = /^https:\/\/(?:chatgpt\.com|www\.chatgpt\.com|chat\.openai\.com)\/(?:backend-api\/)?payments\/success(?:[/?#]|$)/i;
  const CHATGPT_SESSION_STATE_URL = 'https://chatgpt.com/api/auth/session';
  const HOSTED_CHECKOUT_PAID_PLAN_VERIFY_TIMEOUT_MS = 180000;
  const HOSTED_CHECKOUT_PAID_PLAN_VERIFY_INTERVAL_MS = 5000;
  const HOSTED_CHECKOUT_SMS_POOL_SEPARATOR = '----';
  const HOSTED_CHECKOUT_SAMPLE_PHONE = '1234567890';
  const HOSTED_CHECKOUT_SAMPLE_VERIFICATION_URL = 'https://mail.test.com/api/text-relay/eca_tr_xxxxxxxxx';
  const CHECKOUT_CONVERSION_PROXY_SETTINGS_SCOPE = 'regular';
  const CHECKOUT_CONVERSION_PROXY_BYPASS_LIST = ['<local>', 'localhost', '127.0.0.1'];
  const CHECKOUT_CONVERSION_PROXY_TARGET_HOST_PATTERNS = [
    'chatgpt.com',
    '*.chatgpt.com',
    'openai.com',
    '*.openai.com',
    'oaistatic.com',
    '*.oaistatic.com',
    'stripe.com',
    '*.stripe.com',
    'pay.openai.com',
    'checkout.stripe.com',
  ];
  const CHECKOUT_CONVERSION_PROXY_TEST_PROBE_ENDPOINTS = [
    'http://ip-api.com/json?lang=en',
    'https://ipinfo.io/json',
    'https://chatgpt.com/cdn-cgi/trace',
  ];
  const CHECKOUT_CONVERSION_PROXY_TEST_TARGET_ENDPOINTS = [
    'https://chatgpt.com/',
  ];
  const CHECKOUT_CONVERSION_PROXY_TEST_TARGET_HOST_PATTERNS = [
    ...CHECKOUT_CONVERSION_PROXY_TARGET_HOST_PATTERNS,
    'ip-api.com',
    '*.ip-api.com',
    'ipinfo.io',
    '*.ipinfo.io',
  ];

  function createPlusCheckoutCreateExecutor(deps = {}) {
    const {
      addLog: rawAddLog = async () => {},
      applyCheckoutScopedProxyFromUrl = null,
      broadcastDataUpdate = null,
      chrome,
      completeNodeFromBackground,
      createAutomationTab = null,
      enableHostedCheckoutAutomation = false,
      ensureContentScriptReadyOnTabUntilStopped,
      failNodeFromBackground = null,
      fetch: fetchImpl = null,
      getErrorMessage = (error) => error?.message || String(error || 'unknown error'),
      getState = null,
      hostedCheckoutPlanVerifyIntervalMs = HOSTED_CHECKOUT_PAID_PLAN_VERIFY_INTERVAL_MS,
      hostedCheckoutPlanVerifyTimeoutMs = HOSTED_CHECKOUT_PAID_PLAN_VERIFY_TIMEOUT_MS,
      markCurrentRegistrationAccountUsed = null,
      registerTab,
      restoreCheckoutScopedProxySnapshot = null,
      sendTabMessageUntilStopped,
      setState,
      sleepWithStop,
      waitForTabCompleteUntilStopped,
      waitForTabUrlMatchUntilStopped = null,
      requestStop = null,
      throwIfStopped = () => {},
    } = deps;

    function addLog(message, level = 'info', options = {}) {
      return rawAddLog(message, level, {
        step: 6,
        stepKey: 'plus-checkout-create',
        ...(options && typeof options === 'object' ? options : {}),
      });
    }

    function normalizePlusPaymentMethod(value = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.normalizePlusPaymentMethod) {
        return rootScope.GoPayUtils.normalizePlusPaymentMethod(value);
      }
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === PLUS_PAYMENT_METHOD_GPC_HELPER) {
        return PLUS_PAYMENT_METHOD_GPC_HELPER;
      }
      return normalized === PLUS_PAYMENT_METHOD_GOPAY ? PLUS_PAYMENT_METHOD_GOPAY : PLUS_PAYMENT_METHOD_PAYPAL;
    }

    function getCheckoutModeLabel(state = {}) {
      const paymentMethod = normalizePlusPaymentMethod(state?.plusPaymentMethod);
      if (paymentMethod === PLUS_PAYMENT_METHOD_GPC_HELPER) {
        return 'GPC 订阅页';
      }
      return paymentMethod === PLUS_PAYMENT_METHOD_GOPAY ? 'GoPay 订阅页' : 'Plus Checkout';
    }

    function getPlusPaymentMethodLabel(method = PLUS_PAYMENT_METHOD_PAYPAL) {
      const paymentMethod = normalizePlusPaymentMethod(method);
      if (paymentMethod === PLUS_PAYMENT_METHOD_GPC_HELPER) {
        return 'GPC';
      }
      return paymentMethod === PLUS_PAYMENT_METHOD_GOPAY ? 'GoPay' : 'PayPal';
    }

    function shouldWaitForHostedCheckoutSuccess(state = {}, paymentMethod = PLUS_PAYMENT_METHOD_PAYPAL) {
      return normalizePlusPaymentMethod(paymentMethod) === PLUS_PAYMENT_METHOD_PAYPAL
        && state?.plusHostedCheckoutIsFinalStep !== false;
    }

    function isCheckoutReadyUrl(url = '') {
      return CHECKOUT_READY_URL_PATTERN.test(String(url || ''));
    }

    function isPaymentsSuccessUrl(url = '') {
      return HOSTED_CHECKOUT_SUCCESS_URL_PATTERN.test(String(url || ''));
    }

    function normalizeChatGptPlanType(value = '') {
      return String(value || '').trim().toLowerCase();
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

    function isPaidChatGptPlanType(planType = '') {
      const normalized = normalizeChatGptPlanType(planType);
      if (!normalized || ['free', 'none', 'null', 'unpaid', 'inactive'].includes(normalized)) {
        return false;
      }
      return /plus|pro|team|business|enterprise|paid|premium/.test(normalized);
    }

    function normalizePlanVerifyDurationMs(value, fallbackMs) {
      if (value === 0 || value === '0') {
        return 0;
      }
      const numeric = Math.floor(Number(value));
      if (!Number.isFinite(numeric) || numeric < 0) {
        return Math.max(0, fallbackMs);
      }
      return numeric;
    }

    function buildUnboundCheckoutError(planType = '', lastError = null) {
      const normalizedPlan = normalizeChatGptPlanType(planType) || 'empty';
      const suffix = lastError ? ` Last session read error: ${getErrorMessage(lastError)}` : '';
      return `Step 6 payment returned success, but ChatGPT session is still not paid (planType=${normalizedPlan}). Subscription was not bound to the current account.${suffix}`;
    }

    function isPayPalUrl(url = '') {
      return /paypal\./i.test(String(url || ''));
    }

    function isPayPalHermesUrl(url = '') {
      return /paypal\.com\/webapps\/hermes/i.test(String(url || ''));
    }

    function isPayPalHostedGenericErrorUrl(url = '') {
      return /paypal\.[^/]+\/(?:checkoutweb\/genericerror|pay\/generic-error)(?:[/?#]|$)/i.test(String(url || ''));
    }

    function normalizeHostedCheckoutVerificationPopupDelaySeconds(
      value,
      fallback = HOSTED_CHECKOUT_VERIFICATION_POPUP_DELAY_DEFAULT_SECONDS
    ) {
      const rawValue = String(value ?? '').trim();
      const fallbackValue = Math.min(
        HOSTED_CHECKOUT_VERIFICATION_POPUP_DELAY_MAX_SECONDS,
        Math.max(
          HOSTED_CHECKOUT_VERIFICATION_POPUP_DELAY_MIN_SECONDS,
          Math.floor(Number(fallback) || HOSTED_CHECKOUT_VERIFICATION_POPUP_DELAY_DEFAULT_SECONDS)
        )
      );
      if (!rawValue) {
        return fallbackValue;
      }

      const numeric = Number(rawValue);
      if (!Number.isFinite(numeric)) {
        return fallbackValue;
      }

      return Math.min(
        HOSTED_CHECKOUT_VERIFICATION_POPUP_DELAY_MAX_SECONDS,
        Math.max(HOSTED_CHECKOUT_VERIFICATION_POPUP_DELAY_MIN_SECONDS, Math.floor(numeric))
      );
    }

    function normalizeCheckoutConversionProxyUrl(value = '') {
      return String(value || '').trim();
    }

    function normalizePlusCheckoutCloudConversionApiUrl(value = '') {
      const rawValue = String(value || '').trim();
      if (!rawValue) {
        return '';
      }
      try {
        const parsed = new URL(rawValue);
        parsed.hash = '';
        return parsed.toString();
      } catch {
        return rawValue;
      }
    }

    function isPlusCheckoutCloudConversionEnabled(state = {}, paymentMethod = PLUS_PAYMENT_METHOD_PAYPAL) {
      return normalizePlusPaymentMethod(paymentMethod) === PLUS_PAYMENT_METHOD_PAYPAL
        && Boolean(state?.plusCheckoutCloudConversionEnabled);
    }

    function getCheckoutBillingDetailsForPaymentMethod(paymentMethod = PLUS_PAYMENT_METHOD_PAYPAL) {
      return normalizePlusPaymentMethod(paymentMethod) === PLUS_PAYMENT_METHOD_GOPAY
        ? { country: 'ID', currency: 'IDR' }
        : { country: 'US', currency: 'USD' };
    }

    function formatCloudCheckoutErrorDetail(value, fallback = '') {
      if (typeof value === 'string') {
        return value.trim() || fallback;
      }
      if (value && typeof value === 'object') {
        return String(value.message || value.detail || value.error || JSON.stringify(value)).trim() || fallback;
      }
      return String(value ?? fallback).trim() || fallback;
    }

    function isCloudCheckoutAlreadyPaidDetail(value = '') {
      return /User\s+is\s+already\s+paid/i.test(String(value || ''));
    }

    function normalizeCheckoutConversionProxyProtocol(value = '') {
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === 'socks5h') {
        return 'socks5';
      }
      return ['http', 'https', 'socks4', 'socks5'].includes(normalized) ? normalized : '';
    }

    function normalizeCheckoutConversionProxyPort(value = '') {
      const numeric = Number.parseInt(String(value || '').trim(), 10);
      if (!Number.isInteger(numeric) || numeric <= 0 || numeric > 65535) {
        return 0;
      }
      return numeric;
    }

    function parseCheckoutConversionProxyUrl(value = '') {
      const rawValue = normalizeCheckoutConversionProxyUrl(value);
      if (!rawValue) {
        return null;
      }

      let parsed = null;
      try {
        parsed = new URL(rawValue);
      } catch {
        throw new Error('支付转换代理不是有效 URL，请填写 http://host:port 或 socks5h://user:pass@host:port。');
      }

      const protocol = normalizeCheckoutConversionProxyProtocol(String(parsed.protocol || '').replace(/:$/g, ''));
      if (!protocol) {
        throw new Error('支付转换代理仅支持 http / https / socks4 / socks5 / socks5h。');
      }

      const host = String(parsed.hostname || '').trim();
      if (!host) {
        throw new Error('支付转换代理缺少主机名。');
      }

      const port = normalizeCheckoutConversionProxyPort(parsed.port);
      if (!port) {
        throw new Error('支付转换代理缺少有效端口。');
      }

      return {
        protocol,
        host,
        port,
        username: parsed.username ? decodeURIComponent(parsed.username) : '',
        password: parsed.password ? decodeURIComponent(parsed.password) : '',
      };
    }

    function describeCheckoutConversionProxyEntry(entry = null) {
      if (!entry || typeof entry !== 'object') {
        return '';
      }
      return `${String(entry.protocol || '').toLowerCase()}://${String(entry.host || '').trim()}:${Number(entry.port) || 0}`;
    }

    function buildCheckoutConversionFixedProxyConfig(entry = null) {
      if (!entry?.host || !entry?.port) {
        return null;
      }
      const scheme = String(entry.protocol || '').trim().toLowerCase();
      return {
        mode: 'fixed_servers',
        rules: {
          singleProxy: {
            scheme: scheme === 'socks5h' ? 'socks5' : scheme,
            host: entry.host,
            port: entry.port,
          },
          bypassList: CHECKOUT_CONVERSION_PROXY_BYPASS_LIST.slice(),
        },
      };
    }

    function validateCheckoutProxyControlAfterApply(details = {}, entry = null) {
      const level = String(details?.levelOfControl || '').trim();
      if (level && level !== 'controlled_by_this_extension') {
        return {
          ok: false,
          message: `代理控制权不在当前扩展（levelOfControl=${level || 'unknown'}）`,
        };
      }

      const mode = String(details?.value?.mode || '').trim().toLowerCase();
      if (mode !== 'fixed_servers') {
        return {
          ok: false,
          message: `代理模式不是 fixed_servers（当前为 ${mode || 'unknown'}）`,
        };
      }

      const singleProxy = details?.value?.rules?.singleProxy || null;
      const appliedHost = String(singleProxy?.host || '').trim().toLowerCase();
      const appliedPort = Number.parseInt(String(singleProxy?.port || ''), 10) || 0;
      const expectedHost = String(entry?.host || '').trim().toLowerCase();
      const expectedPort = Number.parseInt(String(entry?.port || ''), 10) || 0;
      if (!appliedHost || !appliedPort || appliedHost !== expectedHost || appliedPort !== expectedPort) {
        return {
          ok: false,
          message: `fixed_servers 未绑定到当前代理节点 ${expectedHost}:${expectedPort}，疑似被其他代理配置覆盖`,
        };
      }

      return { ok: true };
    }

    function getCheckoutProxySettings(details = { incognito: false }) {
      const proxySettings = chrome?.proxy?.settings;
      if (!proxySettings || typeof proxySettings.get !== 'function') {
        return Promise.reject(new Error('当前浏览器不支持扩展代理 API。'));
      }
      return new Promise((resolve, reject) => {
        proxySettings.get(details, (value) => {
          const runtimeError = chrome?.runtime?.lastError;
          if (runtimeError) {
            reject(new Error(runtimeError.message || '读取浏览器代理配置失败。'));
            return;
          }
          resolve(value || {});
        });
      });
    }

    function setCheckoutProxySettings(value) {
      const proxySettings = chrome?.proxy?.settings;
      if (!proxySettings || typeof proxySettings.set !== 'function') {
        return Promise.reject(new Error('当前浏览器不支持扩展代理 API。'));
      }
      return new Promise((resolve, reject) => {
        proxySettings.set({
          value,
          scope: CHECKOUT_CONVERSION_PROXY_SETTINGS_SCOPE,
        }, () => {
          const runtimeError = chrome?.runtime?.lastError;
          if (runtimeError) {
            reject(new Error(runtimeError.message || '写入浏览器代理配置失败。'));
            return;
          }
          resolve();
        });
      });
    }

    function clearCheckoutProxySettings() {
      const proxySettings = chrome?.proxy?.settings;
      if (!proxySettings || typeof proxySettings.clear !== 'function') {
        return Promise.reject(new Error('当前浏览器不支持扩展代理 API。'));
      }
      return new Promise((resolve, reject) => {
        proxySettings.clear({
          scope: CHECKOUT_CONVERSION_PROXY_SETTINGS_SCOPE,
        }, () => {
          const runtimeError = chrome?.runtime?.lastError;
          if (runtimeError) {
            reject(new Error(runtimeError.message || '清理浏览器代理配置失败。'));
            return;
          }
          resolve();
        });
      });
    }

    async function defaultApplyCheckoutScopedProxyFromUrl(proxyUrl) {
      const entry = parseCheckoutConversionProxyUrl(proxyUrl);
      if (!entry) {
        return null;
      }

      const previousProxySettings = await getCheckoutProxySettings({ incognito: false }).catch(() => ({}));
      const previousAuthEntry = typeof currentIpProxyAuthEntry === 'undefined'
        ? null
        : (currentIpProxyAuthEntry ? { ...currentIpProxyAuthEntry } : null);
      const fixedProxyConfig = buildCheckoutConversionFixedProxyConfig(entry);
      if (!fixedProxyConfig) {
        throw new Error('支付转换代理配置不完整，无法生成 fixed_servers 规则。');
      }

      try {
        if (typeof installIpProxyAuthListener === 'function') {
          installIpProxyAuthListener();
        }
        if (typeof installIpProxyErrorListener === 'function') {
          installIpProxyErrorListener();
        }
        if (typeof currentIpProxyAuthEntry !== 'undefined') {
          currentIpProxyAuthEntry = entry.username
            ? {
                host: entry.host,
                port: entry.port,
                username: entry.username,
                password: String(entry.password || ''),
              }
            : null;
        }
        await setCheckoutProxySettings(fixedProxyConfig);
        const appliedSettings = await getCheckoutProxySettings({ incognito: false }).catch(() => null);
        const takeoverCheck = validateCheckoutProxyControlAfterApply(appliedSettings || {}, entry);
        if (!takeoverCheck?.ok) {
          throw new Error(takeoverCheck.message || '支付转换代理接管校验失败。');
        }
      } catch (error) {
        if (typeof currentIpProxyAuthEntry !== 'undefined') {
          currentIpProxyAuthEntry = previousAuthEntry ? { ...previousAuthEntry } : null;
        }
        try {
          const restoreValue = previousProxySettings?.value;
          if (restoreValue && restoreValue.mode) {
            await setCheckoutProxySettings(restoreValue);
          } else {
            await clearCheckoutProxySettings();
          }
        } catch {
          // Ignore restore failures here and surface the original apply error.
        }
        throw error;
      }

      return {
        applied: true,
        entry,
        displayName: describeCheckoutConversionProxyEntry(entry),
        previousProxySettings,
        previousAuthEntry,
      };
    }

    async function defaultRestoreCheckoutScopedProxySnapshot(snapshot = null) {
      if (!snapshot?.applied) {
        return;
      }
      if (typeof currentIpProxyAuthEntry !== 'undefined') {
        currentIpProxyAuthEntry = snapshot.previousAuthEntry ? { ...snapshot.previousAuthEntry } : null;
      }
      const restoreValue = snapshot?.previousProxySettings?.value;
      if (restoreValue && restoreValue.mode) {
        await setCheckoutProxySettings(restoreValue);
        return;
      }
      await clearCheckoutProxySettings();
    }

    function summarizeCheckoutConversionProxyDiagnostics(items = [], maxItems = 3) {
      const normalizedItems = Array.isArray(items)
        ? Array.from(new Set(items.map((item) => String(item || '').trim()).filter(Boolean)))
        : [];
      if (!normalizedItems.length) {
        return '';
      }
      if (typeof buildProbeDiagnosticsSummary === 'function') {
        return buildProbeDiagnosticsSummary(normalizedItems, maxItems);
      }
      return normalizedItems.slice(0, Math.max(1, Number(maxItems) || 3)).join(' | ');
    }

    async function testCheckoutConversionProxy(options = {}) {
      const proxyUrl = normalizeCheckoutConversionProxyUrl(options?.proxyUrl);
      if (!proxyUrl) {
        throw new Error('请先填写支付转换代理地址。');
      }

      const parsedEntry = parseCheckoutConversionProxyUrl(proxyUrl);
      const applyProxy = typeof applyCheckoutScopedProxyFromUrl === 'function'
        ? applyCheckoutScopedProxyFromUrl
        : defaultApplyCheckoutScopedProxyFromUrl;
      const restoreProxy = typeof restoreCheckoutScopedProxySnapshot === 'function'
        ? restoreCheckoutScopedProxySnapshot
        : defaultRestoreCheckoutScopedProxySnapshot;
      const probeDiagnostics = [];
      const targetDiagnostics = [];
      let snapshot = null;

      try {
        snapshot = await applyProxy(proxyUrl, {
          targetHostPatterns: CHECKOUT_CONVERSION_PROXY_TEST_TARGET_HOST_PATTERNS,
        });

        let exit = null;
        if (typeof detectProxyExitInfoByPageContext === 'function') {
          exit = await detectProxyExitInfoByPageContext({
            timeoutMs: 12000,
            errors: probeDiagnostics,
            probeEndpoints: CHECKOUT_CONVERSION_PROXY_TEST_PROBE_ENDPOINTS,
          }).catch((error) => {
            probeDiagnostics.push(`probe:page_context:${error?.message || error}`);
            return { ip: '', region: '', source: 'page_context_unavailable', endpoint: '' };
          });
        }
        if (!exit?.ip && typeof detectProxyExitInfoByBackgroundFetch === 'function') {
          exit = await detectProxyExitInfoByBackgroundFetch({
            timeoutMs: 12000,
            errors: probeDiagnostics,
            probeEndpoints: CHECKOUT_CONVERSION_PROXY_TEST_PROBE_ENDPOINTS,
          }).catch((error) => {
            probeDiagnostics.push(`probe:background:${error?.message || error}`);
            return exit || { ip: '', region: '', source: 'background_unavailable', endpoint: '' };
          });
        }

        const exitIp = String(exit?.ip || '').trim();
        const exitRegion = String(exit?.region || '').trim();
        if (!exitIp) {
          const diagnostics = summarizeCheckoutConversionProxyDiagnostics(probeDiagnostics, 4);
          throw new Error(diagnostics
            ? `未检测到代理出口 IP。诊断：${diagnostics}`
            : '未检测到代理出口 IP。');
        }

        let reachability = { reachable: true, skipped: true, endpoint: '', source: '' };
        if (typeof detectIpProxyTargetReachabilityByPageContext === 'function') {
          reachability = await detectIpProxyTargetReachabilityByPageContext({
            timeoutMs: 12000,
            errors: targetDiagnostics,
            targetReachabilityEndpoints: CHECKOUT_CONVERSION_PROXY_TEST_TARGET_ENDPOINTS,
          }).catch((error) => {
            targetDiagnostics.push(`target:${error?.message || error}`);
            return {
              reachable: false,
              endpoint: CHECKOUT_CONVERSION_PROXY_TEST_TARGET_ENDPOINTS[0],
              source: 'target_page_context',
              error: error?.message || String(error || '目标站点连通性检测失败'),
            };
          });
        }

        if (reachability?.reachable === false && reachability?.skipped !== true) {
          const failureMessage = typeof buildTargetReachabilityFailureMessage === 'function'
            ? buildTargetReachabilityFailureMessage({
              exitIp,
              exitRegion,
            }, reachability)
            : `已检测到出口 IP ${exitIp}${exitRegion ? ` [${exitRegion}]` : ''}，但 chatgpt.com 不可达。`;
          throw new Error(failureMessage);
        }

        return {
          ok: true,
          proxyDisplayName: describeCheckoutConversionProxyEntry(parsedEntry),
          exitIp,
          exitRegion,
          exitSource: String(exit?.source || '').trim(),
          exitEndpoint: String(exit?.endpoint || '').trim(),
          targetEndpoint: String(reachability?.endpoint || CHECKOUT_CONVERSION_PROXY_TEST_TARGET_ENDPOINTS[0] || '').trim(),
          diagnostics: summarizeCheckoutConversionProxyDiagnostics([
            ...probeDiagnostics,
            ...targetDiagnostics,
          ], 4),
        };
      } finally {
        if (snapshot?.applied) {
          await restoreProxy(snapshot).catch(() => {});
        }
      }
    }

    async function maybeApplyCheckoutConversionProxy(state = {}, paymentMethod = PLUS_PAYMENT_METHOD_PAYPAL) {
      if (normalizePlusPaymentMethod(paymentMethod) !== PLUS_PAYMENT_METHOD_PAYPAL) {
        return null;
      }
      if (isPlusCheckoutCloudConversionEnabled(state, paymentMethod)) {
        const proxyUrl = normalizeCheckoutConversionProxyUrl(state?.plusCheckoutConversionProxyUrl);
        if (proxyUrl) {
          await addLog('步骤 6：已启用云端支付转换，本地支付转换代理配置已忽略。', 'info');
        }
        return null;
      }
      const proxyUrl = normalizeCheckoutConversionProxyUrl(state?.plusCheckoutConversionProxyUrl);
      if (!proxyUrl) {
        return null;
      }
      const applyProxy = typeof applyCheckoutScopedProxyFromUrl === 'function'
        ? applyCheckoutScopedProxyFromUrl
        : defaultApplyCheckoutScopedProxyFromUrl;
      const snapshot = await applyProxy(proxyUrl, {
        targetHostPatterns: CHECKOUT_CONVERSION_PROXY_TARGET_HOST_PATTERNS,
      });
      const displayName = String(snapshot?.displayName || describeCheckoutConversionProxyEntry(snapshot?.entry) || proxyUrl).trim();
      await addLog(`步骤 6：已启用支付转换代理 ${displayName}，仅临时接管 checkout session 到 hosted checkout 的跳转链路。`, 'info');
      return snapshot;
    }

    async function maybeRestoreCheckoutConversionProxy(snapshot = null) {
      if (!snapshot?.applied) {
        return;
      }
      const restoreProxy = typeof restoreCheckoutScopedProxySnapshot === 'function'
        ? restoreCheckoutScopedProxySnapshot
        : defaultRestoreCheckoutScopedProxySnapshot;
      await restoreProxy(snapshot);
      await addLog('步骤 6：支付转换代理已释放，后续步骤恢复原网络/原代理环境。', 'info');
    }

    function getBoundedCheckoutTimeoutMs(defaultTimeoutMs) {
      const value = Math.floor(Number(defaultTimeoutMs) || 0);
      if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'test') {
        const override = Math.floor(Number(process.env.GUJUMPGATE_TEST_CHECKOUT_TIMEOUT_MS) || 0);
        if (override > 0) {
          return override;
        }
      }
      return Math.max(1000, value || 30000);
    }

    function buildHostedCheckoutPayPalProgressSignature(currentUrl = '', tab = {}, pageState = {}) {
      return [
        String(pageState?.url || currentUrl || '').trim(),
        String(tab?.status || '').trim(),
        String(pageState?.readyState || '').trim(),
        String(pageState?.hostedStage || '').trim(),
        String(pageState?.loginPhase || '').trim(),
        pageState?.hasEmailInput ? 'email' : '',
        pageState?.hasPasswordInput ? 'password' : '',
        pageState?.hasHostedGuestCheckout ? 'guest' : '',
        pageState?.hostedBusyVisible ? 'busy' : '',
        pageState?.verificationInputsVisible ? 'verification_inputs' : '',
        pageState?.verificationErrorVisible ? 'verification_error' : '',
        String(pageState?.verificationErrorText || '').trim(),
        pageState?.reviewConsentReady ? 'review_ready' : '',
        pageState?.approveReady ? 'approve_ready' : '',
        pageState?.hostedErrorVisible ? 'hosted_error' : '',
      ].join('|');
    }

    async function reloadHostedCheckoutPayPalTab(tabId, reason = '') {
      const suffix = reason ? `（${reason}）` : '';
      await addLog(`步骤 6：PayPal hosted checkout 页面超过 120 秒没有进展${suffix}，正在刷新当前页面后继续...`, 'warn');
      if (chrome?.tabs?.reload) {
        await chrome.tabs.reload(tabId, { bypassCache: true });
      } else {
        const tab = await chrome?.tabs?.get?.(tabId).catch(() => null);
        const currentUrl = String(tab?.url || '').trim();
        if (!currentUrl || !chrome?.tabs?.update) {
          throw new Error('步骤 6：PayPal hosted checkout 页面长时间无进展，但当前运行环境不支持刷新页面。');
        }
        await chrome.tabs.update(tabId, { url: currentUrl, active: true });
      }
      await sleepWithStop(2000);
    }

    async function waitForHostedCheckoutPayPalTabComplete(tabId, reason = '') {
      const refreshReason = reason || '页面加载超时';
      for (let refreshAttempt = 0; refreshAttempt <= HOSTED_CHECKOUT_PAYPAL_STUCK_REFRESH_MAX_ATTEMPTS; refreshAttempt += 1) {
        const startedAt = Date.now();
        while (Date.now() - startedAt < HOSTED_CHECKOUT_PAYPAL_STUCK_REFRESH_MS) {
          throwIfStopped();
          if (!chrome?.tabs?.get) {
            return waitForTabCompleteUntilStopped(tabId, {
              timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_TAB_LOAD_TIMEOUT_MS),
              retryDelayMs: 500,
            });
          }
          const tab = await chrome.tabs.get(tabId).catch(() => null);
          if (!tab) {
            throw new Error('步骤 6：hosted checkout PayPal 标签页已关闭。');
          }
          const tabStatus = String(tab.status || '').toLowerCase();
          if (!tabStatus || tabStatus === 'complete') {
            return tab;
          }
          await sleepWithStop(500);
        }

        if (refreshAttempt >= HOSTED_CHECKOUT_PAYPAL_STUCK_REFRESH_MAX_ATTEMPTS) {
          throw new Error(`步骤 6：PayPal hosted checkout 页面连续 ${HOSTED_CHECKOUT_PAYPAL_STUCK_REFRESH_MAX_ATTEMPTS} 次刷新后仍加载超时。`);
        }
        await reloadHostedCheckoutPayPalTab(tabId, refreshReason);
      }
      return waitForTabCompleteUntilStopped(tabId, {
        timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_TAB_LOAD_TIMEOUT_MS),
        retryDelayMs: 500,
      });
    }

    function normalizeHostedCheckoutPoolText(value = '') {
      return String(value || '')
        .replace(/\r/g, '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join('\n');
    }

    function normalizeHostedCheckoutUsPhoneDigits(value = '') {
      const rawValue = String(value || '').trim();
      const digits = rawValue.replace(/\D+/g, '');
      if (digits.length === 11 && digits.startsWith('1')) {
        return digits.slice(1);
      }
      return digits || rawValue;
    }

    function normalizeHostedCheckoutPoolPhone(value = '') {
      return normalizeHostedCheckoutUsPhoneDigits(value);
    }

    function normalizeHostedCheckoutPoolUrl(value = '') {
      const rawValue = String(value || '').trim();
      if (!rawValue) {
        return '';
      }
      try {
        const parsed = new URL(rawValue);
        parsed.searchParams.delete('t');
        return parsed.toString();
      } catch {
        return rawValue
          .replace(/([?&])t=\d+(?=(&|$))/i, '$1')
          .replace(/[?&]$/g, '');
      }
    }

    function buildHostedCheckoutPoolKey(phone = '', verificationUrl = '') {
      const normalizedPhone = normalizeHostedCheckoutPoolPhone(phone);
      const normalizedUrl = normalizeHostedCheckoutPoolUrl(verificationUrl);
      return normalizedPhone && normalizedUrl
        ? `${normalizedPhone}${HOSTED_CHECKOUT_SMS_POOL_SEPARATOR}${normalizedUrl}`
        : '';
    }

    function isHostedCheckoutSampleEntry(phone = '', verificationUrl = '') {
      return normalizeHostedCheckoutPoolPhone(phone) === HOSTED_CHECKOUT_SAMPLE_PHONE
        && normalizeHostedCheckoutPoolUrl(verificationUrl) === HOSTED_CHECKOUT_SAMPLE_VERIFICATION_URL;
    }

    function parseHostedCheckoutSmsPoolEntries(text = '') {
      const lines = normalizeHostedCheckoutPoolText(text).split('\n').filter(Boolean);
      const seen = new Set();
      const entries = [];
      for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const separatorIndex = line.indexOf(HOSTED_CHECKOUT_SMS_POOL_SEPARATOR);
        const hasSeparator = separatorIndex > 0;
        const phone = hasSeparator
          ? normalizeHostedCheckoutPoolPhone(line.slice(0, separatorIndex))
          : normalizeHostedCheckoutPoolPhone(line);
        const verificationUrl = hasSeparator
          ? normalizeHostedCheckoutPoolUrl(line.slice(separatorIndex + HOSTED_CHECKOUT_SMS_POOL_SEPARATOR.length))
          : normalizeHostedCheckoutPoolUrl(lines[index + 1] || '');
        if (!hasSeparator && verificationUrl) {
          index += 1;
        }
        const key = buildHostedCheckoutPoolKey(phone, verificationUrl);
        if (!phone || !verificationUrl || !key || seen.has(key) || isHostedCheckoutSampleEntry(phone, verificationUrl)) {
          continue;
        }
        seen.add(key);
        entries.push({
          index: entries.length,
          key,
          phone,
          verificationUrl,
        });
      }
      return entries;
    }

    function normalizeHostedCheckoutSmsPoolUsage(value = {}) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
      }
      return Object.fromEntries(Object.entries(value).map(([key, item]) => {
        const usage = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
        const legacyUsedCount = Number(usage.usedAt) > 0 ? 1 : 0;
        const useCount = Math.max(0, Math.floor(Number(usage.useCount ?? usage.usageCount ?? legacyUsedCount) || 0));
        return [String(key || '').trim(), {
          useCount,
          usedAt: Math.max(0, Number(usage.usedAt) || 0),
          lastAttemptAt: Math.max(0, Number(usage.lastAttemptAt) || 0),
          lastError: String(usage.lastError || '').trim(),
        }];
      }).filter(([key]) => Boolean(key)));
    }

    function normalizeHostedCheckoutCurrentSmsEntry(entry = null, entries = []) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return null;
      }
      const key = String(
        entry.key
        || buildHostedCheckoutPoolKey(entry.phone, entry.verificationUrl)
      ).trim();
      if (!key) {
        return null;
      }
      const matchedEntry = Array.isArray(entries)
        ? entries.find((candidate) => candidate.key === key)
        : null;
      if (matchedEntry) {
        return { ...matchedEntry };
      }
      const phone = normalizeHostedCheckoutPoolPhone(entry.phone);
      const verificationUrl = normalizeHostedCheckoutPoolUrl(entry.verificationUrl);
      if (!phone || !verificationUrl) {
        return null;
      }
      return {
        key,
        phone,
        verificationUrl,
      };
    }

    function chooseHostedCheckoutSmsPoolEntry(entries = [], usage = {}) {
      if (!Array.isArray(entries) || entries.length === 0) {
        return null;
      }
      const normalizedUsage = normalizeHostedCheckoutSmsPoolUsage(usage);
      return entries
        .map((entry, index) => {
          const itemUsage = normalizedUsage[entry.key] || {};
          return {
            ...entry,
            index: Number.isFinite(entry.index) ? entry.index : index,
            useCount: Math.max(0, Math.floor(Number(itemUsage.useCount) || 0)),
            usedAt: Math.max(0, Number(itemUsage.usedAt) || 0),
          };
        })
        .sort((left, right) => {
          if (left.useCount !== right.useCount) {
            return left.useCount - right.useCount;
          }
          if (left.usedAt !== right.usedAt) {
            return left.usedAt - right.usedAt;
          }
          return left.index - right.index;
        })[0] || null;
    }

    function buildHostedCheckoutConfigDiagnostics({
      state = {},
      stored = {},
      poolEntries = [],
      selectedSmsEntry = null,
    } = {}) {
      return {
        stateHostedCheckoutPhoneNumber: String(state?.hostedCheckoutPhoneNumber || '').trim(),
        localHostedCheckoutPhoneNumber: String(stored?.hostedCheckoutPhoneNumber || '').trim(),
        stateHostedCheckoutVerificationUrl: String(state?.hostedCheckoutVerificationUrl || '').trim(),
        localHostedCheckoutVerificationUrl: String(stored?.hostedCheckoutVerificationUrl || '').trim(),
        stateHostedCheckoutSmsPoolTextLines: parseHostedCheckoutSmsPoolEntries(state?.hostedCheckoutSmsPoolText || '').length,
        localHostedCheckoutSmsPoolTextLines: parseHostedCheckoutSmsPoolEntries(stored?.hostedCheckoutSmsPoolText || '').length,
        effectiveHostedSmsPoolEntries: Array.isArray(poolEntries) ? poolEntries.length : 0,
        selectedHostedSmsPoolPhone: String(selectedSmsEntry?.phone || '').trim(),
        selectedHostedSmsPoolVerificationUrl: String(selectedSmsEntry?.verificationUrl || '').trim(),
      };
    }

    async function applyHostedCheckoutRuntimePatch(patch = {}) {
      if (!patch || typeof patch !== 'object' || Array.isArray(patch) || Object.keys(patch).length === 0) {
        return;
      }
      if (typeof setState === 'function') {
        await setState(patch);
      }
      if (typeof broadcastDataUpdate === 'function') {
        broadcastDataUpdate(patch);
      }
    }

    async function clearHostedCheckoutCurrentSmsEntry() {
      await applyHostedCheckoutRuntimePatch({
        hostedCheckoutCurrentSmsEntry: null,
      });
    }

    async function updateHostedCheckoutPoolUsage(entry = null, options = {}) {
      const normalizedEntry = normalizeHostedCheckoutCurrentSmsEntry(entry);
      if (!normalizedEntry?.key || typeof getState !== 'function') {
        return null;
      }
      const state = await getState().catch(() => ({}));
      const usage = normalizeHostedCheckoutSmsPoolUsage(state?.hostedCheckoutSmsPoolUsage || {});
      const previous = usage[normalizedEntry.key] || {};
      const now = Date.now();
      const incrementUseCount = Boolean(options.incrementUseCount);
      const success = options.success === true;
      const nextUsage = {
        ...usage,
        [normalizedEntry.key]: {
          useCount: incrementUseCount
            ? Math.max(0, Math.floor(Number(previous.useCount) || 0)) + 1
            : Math.max(0, Math.floor(Number(previous.useCount) || 0)),
          usedAt: incrementUseCount
            ? now
            : Math.max(0, Number(previous.usedAt) || 0),
          lastAttemptAt: now,
          lastError: success ? '' : String(options.error || '').trim(),
        },
      };
      await applyHostedCheckoutRuntimePatch({
        hostedCheckoutCurrentSmsEntry: normalizedEntry,
        hostedCheckoutSmsPoolUsage: nextUsage,
      });
      return nextUsage;
    }

    async function getHostedCheckoutRuntimeConfig(options = {}) {
      const {
        ensureCurrentSmsEntry = false,
      } = options || {};
      const state = typeof getState === 'function' ? await getState().catch(() => ({})) : {};
      let stored = {};
      if (chrome?.storage?.local?.get) {
        stored = await chrome.storage.local.get([
          'hostedCheckoutVerificationUrl',
          'hostedCheckoutPhoneNumber',
          'hostedCheckoutVerificationPopupDelaySeconds',
          'hostedCheckoutSmsPoolText',
          'hostedCheckoutSmsPoolUsage',
        ]).catch(() => ({}));
      }
      const poolEntries = parseHostedCheckoutSmsPoolEntries(
        stored?.hostedCheckoutSmsPoolText
        || state?.hostedCheckoutSmsPoolText
        || ''
      );
      const poolUsage = normalizeHostedCheckoutSmsPoolUsage(
        stored?.hostedCheckoutSmsPoolUsage
        || state?.hostedCheckoutSmsPoolUsage
        || {}
      );
      let selectedSmsEntry = normalizeHostedCheckoutCurrentSmsEntry(state?.hostedCheckoutCurrentSmsEntry, poolEntries);
      if (!selectedSmsEntry && ensureCurrentSmsEntry && poolEntries.length > 0) {
        selectedSmsEntry = chooseHostedCheckoutSmsPoolEntry(poolEntries, poolUsage);
        if (selectedSmsEntry) {
          const nextUsage = await updateHostedCheckoutPoolUsage(selectedSmsEntry, {
            incrementUseCount: true,
            success: true,
          });
          await addLog(
            `步骤 6：Hosted 接码池已选择号码 ${selectedSmsEntry.phone}（最少使用次数优先，当前累计 ${Math.max(0, Number(nextUsage?.[selectedSmsEntry.key]?.useCount) || 0)} 次）。`,
            'info'
          );
        }
      }
      const fallbackEntry = poolEntries.length > 0 && !selectedSmsEntry
        ? chooseHostedCheckoutSmsPoolEntry(poolEntries, poolUsage)
        : null;
      const verificationUrl = String(
        selectedSmsEntry?.verificationUrl
        || fallbackEntry?.verificationUrl
        || ''
      ).trim() || String(
        stored?.hostedCheckoutVerificationUrl
        || state?.hostedCheckoutVerificationUrl
        || HOSTED_CHECKOUT_VERIFICATION_CODE_ENDPOINT
        || ''
      ).trim();
      const phone = String(
        selectedSmsEntry?.phone
        || fallbackEntry?.phone
        || ''
      ).trim() || String(
        stored?.hostedCheckoutPhoneNumber
        || state?.hostedCheckoutPhoneNumber
        || HOSTED_CHECKOUT_PAYPAL_DEFAULT_PHONE
        || ''
      ).trim();
      const verificationPopupDelaySeconds = normalizeHostedCheckoutVerificationPopupDelaySeconds(
        stored?.hostedCheckoutVerificationPopupDelaySeconds ?? state?.hostedCheckoutVerificationPopupDelaySeconds
      );
      const diagnostics = buildHostedCheckoutConfigDiagnostics({
        state,
        stored,
        poolEntries,
        selectedSmsEntry,
      });
      return {
        verificationUrl,
        verificationPopupDelaySeconds,
        popupDelaySeconds: verificationPopupDelaySeconds,
        phone,
        hostedCheckoutCurrentSmsEntry: selectedSmsEntry,
        hostedCheckoutUsesSmsPool: Boolean(selectedSmsEntry),
        diagnostics,
      };
    }

    async function waitForCheckoutSurface(tabId) {
      if (!chrome?.tabs?.get) {
        return null;
      }
      if (typeof waitForTabUrlMatchUntilStopped === 'function') {
        try {
          return await waitForTabUrlMatchUntilStopped(tabId, (url) => isCheckoutReadyUrl(url), {
            timeoutMs: getBoundedCheckoutTimeoutMs(CHECKOUT_REDIRECT_WAIT_TIMEOUT_MS),
            retryDelayMs: 300,
          });
        } catch {
          return null;
        }
      }

      const startedAt = Date.now();
      while (Date.now() - startedAt < CHECKOUT_REDIRECT_WAIT_TIMEOUT_MS) {
        const tab = await chrome.tabs.get(tabId).catch(() => null);
        if (!tab) {
          return null;
        }
        if (isCheckoutReadyUrl(tab.url || '')) {
          return tab;
        }
        await sleepWithStop(300);
      }
      return null;
    }

    async function waitForUrlMatch(tabId, matcher, timeoutMs = 30000, retryDelayMs = 400) {
      if (typeof waitForTabUrlMatchUntilStopped === 'function') {
        return await waitForTabUrlMatchUntilStopped(tabId, matcher, {
          timeoutMs: getBoundedCheckoutTimeoutMs(timeoutMs),
          retryDelayMs,
        }) || null;
      }

      const startedAt = Date.now();
      while (Date.now() - startedAt < timeoutMs) {
        throwIfStopped();
        const tab = await chrome?.tabs?.get?.(tabId).catch(() => null);
        if (!tab) {
          return null;
        }
        if (typeof matcher === 'function' && matcher(tab.url || '', tab)) {
          return tab;
        }
        await sleepWithStop(retryDelayMs);
      }
      return null;
    }

    async function openFreshChatGptTabForCheckoutCreate() {
      const tab = typeof createAutomationTab === 'function'
        ? await createAutomationTab({ url: PLUS_CHECKOUT_ENTRY_URL, active: true })
        : await chrome.tabs.create({ url: PLUS_CHECKOUT_ENTRY_URL, active: true });
      const tabId = Number(tab?.id);
      if (!Number.isInteger(tabId)) {
        throw new Error('步骤 6：打开 ChatGPT 页面失败，无法创建订阅页。');
      }
      if (typeof registerTab === 'function') {
        await registerTab(PLUS_CHECKOUT_SOURCE, tabId);
      }
      return tabId;
    }

    function buildHostedCheckoutRandomEmail() {
      const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let localPart = '';
      for (let index = 0; index < 16; index += 1) {
        localPart += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      return `${localPart}@gmail.com`;
    }

    function buildHostedCheckoutRandomPassword() {
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const digits = '0123456789';
      const symbols = '!@#$%^';
      const alphabet = `${lowercase}${uppercase}${digits}${symbols}`;
      const values = [
        lowercase[Math.floor(Math.random() * lowercase.length)],
        uppercase[Math.floor(Math.random() * uppercase.length)],
        digits[Math.floor(Math.random() * digits.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ];
      while (values.length < 14) {
        values.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
      }
      return values.sort(() => Math.random() - 0.5).join('');
    }

    function buildHostedCheckoutVisaCard() {
      const prefixes = [
        [4, 1, 4, 7],
        [4, 1, 0, 0],
      ];
      const digits = prefixes[Math.floor(Math.random() * prefixes.length)].slice();
      while (digits.length < 15) {
        digits.push(Math.floor(Math.random() * 10));
      }
      const reversed = digits.slice().reverse();
      let sum = 0;
      for (let index = 0; index < reversed.length; index += 1) {
        let digit = reversed[index];
        if (index % 2 === 0) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        sum += digit;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      digits.push(checkDigit);
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const currentYear = new Date().getFullYear() % 100;
      const year = currentYear + Math.floor(Math.random() * 4) + 2;
      const cvv = String(Math.floor(100 + Math.random() * 900));
      return {
        number: digits.join(''),
        expiry: `${month} / ${year}`,
        cvv,
      };
    }

    async function fetchHostedCheckoutAddress() {
      const { response, data } = await fetchJsonWithTimeout(HOSTED_CHECKOUT_ADDRESS_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/',
          method: 'address',
        }),
      }, 30000);
      if (!response?.ok) {
        throw new Error(`获取 hosted checkout 地址失败（HTTP ${response?.status || 0}）。`);
      }
      const address = data?.address || data || {};
      return {
        street: String(address.Address || address.street || '123 Main St').trim(),
        city: String(address.City || address.city || 'New York').trim(),
        state: String(address.State_Full || address.State || address.state || 'New York').trim(),
        zip: String(address.Zip_Code || address.zip || '10001').trim().slice(0, 5) || '10001',
      };
    }

    function buildHostedCheckoutAddressSeed(address = {}) {
      return {
        countryCode: 'US',
        skipAutocomplete: true,
        autoCheckAgreement: true,
        fallback: {
          address1: String(address.street || '123 Main St').trim(),
          city: String(address.city || 'New York').trim(),
          region: String(address.state || 'New York').trim(),
          postalCode: String(address.zip || '10001').trim(),
        },
      };
    }

    function buildHostedCheckoutGuestProfile(address = {}, config = {}) {
      const card = buildHostedCheckoutVisaCard();
      return {
        email: buildHostedCheckoutRandomEmail(),
        password: buildHostedCheckoutRandomPassword(),
        phone: String(config?.phone || HOSTED_CHECKOUT_PAYPAL_DEFAULT_PHONE || '').trim(),
        firstName: 'James',
        lastName: 'Smith',
        fullName: 'James Smith',
        cardNumber: card.number,
        cardExpiry: card.expiry,
        cardCvv: card.cvv,
        address,
      };
    }

    function extractHostedCheckoutVerificationCode(payload = {}) {
      const candidates = [
        payload?.data,
        payload?.code,
        payload?.text,
        payload?.message,
        payload,
      ];
      for (const candidate of candidates) {
        const text = String(candidate || '').trim();
        if (!text) {
          continue;
        }
        const match = text.match(/\d{6}/);
        if (match) {
          return match[0];
        }
        const digits = text.replace(/\D+/g, '').slice(0, 6);
        if (digits.length === 6) {
          return digits;
        }
      }
      return '';
    }

    async function fetchHostedCheckoutVerificationCode() {
      const runtimeConfig = await getHostedCheckoutRuntimeConfig({
        ensureCurrentSmsEntry: true,
      });
      const verificationUrl = runtimeConfig.verificationUrl;
      await addLog(`步骤 6：当前 hosted checkout 验证码接口配置为 ${verificationUrl || '(空)'}。`, 'info');
      const fetcher = typeof fetchImpl === 'function'
        ? fetchImpl
        : (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
      if (typeof fetcher !== 'function') {
        throw new Error('当前运行环境不支持 fetch，无法获取 hosted checkout 验证码。');
      }
      if (!verificationUrl) {
        throw new Error('当前未配置 hosted checkout 验证码接口地址。');
      }
      const separator = verificationUrl.includes('?') ? '&' : '?';
      const response = await fetcher(`${verificationUrl}${separator}t=${Date.now()}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json,text/plain,*/*',
        },
      });
      const text = await response.text().catch(() => '');
      let payload = text;
      try {
        payload = text ? JSON.parse(text) : {};
      } catch {
        payload = text;
      }
      const code = extractHostedCheckoutVerificationCode(payload);
      if (!code) {
        if (runtimeConfig.hostedCheckoutUsesSmsPool && runtimeConfig.hostedCheckoutCurrentSmsEntry) {
          await updateHostedCheckoutPoolUsage(runtimeConfig.hostedCheckoutCurrentSmsEntry, {
            success: false,
            error: 'hosted checkout 验证码接口暂未返回有效验证码。',
          });
        }
        throw new Error('hosted checkout 验证码接口暂未返回有效验证码。');
      }
      if (runtimeConfig.hostedCheckoutUsesSmsPool && runtimeConfig.hostedCheckoutCurrentSmsEntry) {
        await updateHostedCheckoutPoolUsage(runtimeConfig.hostedCheckoutCurrentSmsEntry, {
          success: true,
        });
      }
      return code;
    }

    async function fetchHostedCheckoutVerificationCodeManually(options = {}) {
      const manualVerificationUrl = String(options?.verificationUrl || '').trim();
      if (manualVerificationUrl) {
        const fetcher = typeof fetchImpl === 'function'
          ? fetchImpl
          : (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
        if (typeof fetcher !== 'function') {
          throw new Error('当前运行环境不支持 fetch，无法获取 hosted checkout 验证码。');
        }
        const separator = manualVerificationUrl.includes('?') ? '&' : '?';
        const response = await fetcher(`${manualVerificationUrl}${separator}t=${Date.now()}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json,text/plain,*/*',
          },
        });
        const text = await response.text().catch(() => '');
        let payload = text;
        try {
          payload = text ? JSON.parse(text) : {};
        } catch {
          payload = text;
        }
        const code = extractHostedCheckoutVerificationCode(payload);
        if (!code) {
          throw new Error('hosted checkout 验证码接口暂未返回有效验证码。');
        }
        return {
          code,
          verificationUrl: manualVerificationUrl,
        };
      }

      try {
        const code = await fetchHostedCheckoutVerificationCode();
        const runtimeConfig = await getHostedCheckoutRuntimeConfig();
        return {
          code,
          verificationUrl: String(runtimeConfig?.verificationUrl || '').trim(),
        };
      } finally {
        await clearHostedCheckoutCurrentSmsEntry();
      }
    }

    async function pollHostedCheckoutVerificationCode(options = {}) {
      const excludeCodes = new Set(
        (Array.isArray(options.excludeCodes) ? options.excludeCodes : [])
          .map((code) => String(code || '').replace(/\D+/g, '').slice(0, 6))
          .filter((code) => code.length === 6)
      );
      let lastError = null;
      for (let attempt = 1; attempt <= HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS; attempt += 1) {
        throwIfStopped();
        try {
          const code = await fetchHostedCheckoutVerificationCode();
          if (excludeCodes.has(code)) {
            lastError = new Error(`验证码接口仍返回已试过的旧验证码：${code}`);
            await addLog(
              `步骤 6：验证码接口仍返回已试过的旧验证码 ${code}（${attempt}/${HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS}），继续等待新验证码...`,
              'warn'
            );
            if (attempt < HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS) {
              await sleepWithStop(HOSTED_CHECKOUT_VERIFICATION_POLL_INTERVAL_MS);
              continue;
            }
            break;
          }
          await addLog(`步骤 6：已获取 hosted checkout 验证码（${attempt}/${HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS}）。`, 'info');
          return code;
        } catch (error) {
          lastError = error;
          await addLog(
            `步骤 6：hosted checkout 验证码暂不可用（${attempt}/${HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS}）：${error?.message || error}`,
            'warn'
          );
          if (attempt < HOSTED_CHECKOUT_VERIFICATION_POLL_ATTEMPTS) {
            await sleepWithStop(HOSTED_CHECKOUT_VERIFICATION_POLL_INTERVAL_MS);
          }
        }
      }
      throw lastError || new Error('hosted checkout 验证码轮询失败。');
    }

    async function runHostedCheckoutOpenAiFlow(tabId, guestProfile) {
      await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
        inject: PLUS_CHECKOUT_INJECT_FILES,
        injectSource: PLUS_CHECKOUT_SOURCE,
        timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_CONTENT_READY_TIMEOUT_MS),
        logMessage: '步骤 6：hosted checkout 页面仍在加载，等待脚本就绪...',
      });
      await addLog('步骤 6：hosted checkout 已打开，正在按油猴脚本顺序自动切换 PayPal、填写地址并提交...', 'info');
      const initialResult = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
        type: 'RUN_HOSTED_OPENAI_CHECKOUT_STEP',
        source: 'background',
        payload: {
          address: guestProfile.address,
        },
      }, {
        timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_ACTION_MESSAGE_TIMEOUT_MS),
        responseTimeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_ACTION_MESSAGE_TIMEOUT_MS),
      });
      if (initialResult?.error) {
        throw new Error(initialResult.error);
      }

      const startedAt = Date.now();
      let verificationSubmitted = false;
      while (Date.now() - startedAt < HOSTED_CHECKOUT_TRANSITION_TIMEOUT_MS) {
        throwIfStopped();
        const tab = await chrome?.tabs?.get?.(tabId).catch(() => null);
        if (!tab) {
          throw new Error('步骤 6：hosted checkout 标签页已关闭。');
        }
        const currentUrl = String(tab.url || '').trim();
        if (isPayPalUrl(currentUrl) || isPaymentsSuccessUrl(currentUrl)) {
          return {
            transitioned: true,
            url: currentUrl,
          };
        }

        const state = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
          type: 'PLUS_CHECKOUT_GET_STATE',
          source: 'background',
          payload: {},
        }, {
          timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_STATE_MESSAGE_TIMEOUT_MS),
          responseTimeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_STATE_MESSAGE_TIMEOUT_MS),
        });
        if (state?.error) {
          throw new Error(state.error);
        }
        if (state?.hostedVerificationVisible && !verificationSubmitted) {
          await addLog('步骤 6：检测到 hosted checkout OpenAI 验证码弹窗，正在获取并填写验证码...', 'info');
          const verificationCode = await pollHostedCheckoutVerificationCode();
          const verifyResult = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
            type: 'RUN_HOSTED_OPENAI_CHECKOUT_STEP',
            source: 'background',
            payload: {
              verificationCode,
            },
          }, {
            timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_ACTION_MESSAGE_TIMEOUT_MS),
            responseTimeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_ACTION_MESSAGE_TIMEOUT_MS),
          });
          if (verifyResult?.error) {
            throw new Error(verifyResult.error);
          }
          verificationSubmitted = true;
        }
        await sleepWithStop(500);
      }

      throw new Error('步骤 6：hosted checkout OpenAI/Stripe 页面提交后长时间未跳转到 PayPal 或成功页。');
    }

    async function runHostedCheckoutPayPalStep(tabId, payload = {}) {
      await waitForHostedCheckoutPayPalTabComplete(tabId, '操作前页面加载超时');
      await sleepWithStop(1000);
      await ensureContentScriptReadyOnTabUntilStopped(PAYPAL_SOURCE, tabId, {
        inject: PAYPAL_INJECT_FILES,
        injectSource: PAYPAL_SOURCE,
        timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_CONTENT_READY_TIMEOUT_MS),
        logMessage: '步骤 6：PayPal hosted checkout 页面仍在加载，等待脚本就绪...',
      });
      const result = await sendTabMessageUntilStopped(tabId, PAYPAL_SOURCE, {
        type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
        source: 'background',
        payload,
      }, {
        timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_ACTION_MESSAGE_TIMEOUT_MS),
        responseTimeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_ACTION_MESSAGE_TIMEOUT_MS),
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      return result || {};
    }

    async function getHostedCheckoutPayPalState(tabId) {
      await ensureContentScriptReadyOnTabUntilStopped(PAYPAL_SOURCE, tabId, {
        inject: PAYPAL_INJECT_FILES,
        injectSource: PAYPAL_SOURCE,
        timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_CONTENT_READY_TIMEOUT_MS),
        logMessage: '步骤 6：正在等待 PayPal hosted checkout 页面脚本就绪...',
      });
      const result = await sendTabMessageUntilStopped(tabId, PAYPAL_SOURCE, {
        type: 'PAYPAL_HOSTED_GET_STATE',
        source: 'background',
        payload: {},
      }, {
        timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_STATE_MESSAGE_TIMEOUT_MS),
        responseTimeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_STATE_MESSAGE_TIMEOUT_MS),
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      return result || {};
    }

    async function readChatGptSessionStateFromTab(tabId, options = {}) {
      const ensureLoaded = options.ensureLoaded !== false;
      if (ensureLoaded) {
        await waitForTabCompleteUntilStopped(tabId, {
          timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_TAB_LOAD_TIMEOUT_MS),
          retryDelayMs: 500,
        });
        await sleepWithStop(1000);
      }
      await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
        inject: PLUS_CHECKOUT_INJECT_FILES,
        injectSource: PLUS_CHECKOUT_SOURCE,
        timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_CONTENT_READY_TIMEOUT_MS),
        logMessage: options.logMessage || '步骤 6：正在等待 ChatGPT 页面完成加载，再继续读取 session...',
      });

      const sessionResult = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
        type: 'PLUS_CHECKOUT_GET_STATE',
        source: 'background',
        payload: {
          includeSession: true,
          includeAccessToken: true,
        },
      }, {
        timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_STATE_MESSAGE_TIMEOUT_MS),
        responseTimeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_STATE_MESSAGE_TIMEOUT_MS),
      });
      if (sessionResult?.error) {
        throw new Error(sessionResult.error);
      }
      return sessionResult || {};
    }

    async function openChatGptSessionStateTab() {
      const tab = typeof createAutomationTab === 'function'
        ? await createAutomationTab({ url: CHATGPT_SESSION_STATE_URL, active: false })
        : await chrome.tabs.create({ url: CHATGPT_SESSION_STATE_URL, active: false });
      const tabId = Number(tab?.id);
      if (!Number.isInteger(tabId)) {
        throw new Error('步骤 6：打开 ChatGPT session 页面失败，无法确认订阅状态。');
      }
      if (typeof registerTab === 'function') {
        await registerTab(PLUS_CHECKOUT_SOURCE, tabId);
      }
      return tabId;
    }

    async function readHostedCheckoutPlanTypeForRecord(completionPayload = {}, options = {}) {
      let sessionTabId = null;
      const timeoutMs = normalizePlanVerifyDurationMs(
        options.timeoutMs ?? hostedCheckoutPlanVerifyTimeoutMs,
        HOSTED_CHECKOUT_PAID_PLAN_VERIFY_TIMEOUT_MS
      );
      const intervalMs = normalizePlanVerifyDurationMs(
        options.intervalMs ?? hostedCheckoutPlanVerifyIntervalMs,
        HOSTED_CHECKOUT_PAID_PLAN_VERIFY_INTERVAL_MS
      );
      const startedAt = Date.now();
      let lastPlanType = '';
      let lastError = null;

      try {
        sessionTabId = await openChatGptSessionStateTab();
        while (true) {
          throwIfStopped();
          try {
            const sessionResult = await readChatGptSessionStateFromTab(sessionTabId, {
              logMessage: '步骤 6：正在读取 ChatGPT session，确认订阅是否已绑定到当前账号...',
            });
            const planType = extractChatGptPlanType(sessionResult);
            lastPlanType = planType;
            lastError = null;
            if (isPaidChatGptPlanType(planType)) {
              await addLog(`步骤 6：已确认 ChatGPT session 为付费计划（planType=${planType}），继续后续保存。`, 'ok');
              return {
                ...completionPayload,
                plusHostedCheckoutVerifiedPlanType: planType,
              };
            }
            await addLog(`步骤 6：支付成功页已出现，但当前账号仍不是付费计划（planType=${planType || '空'}），继续等待权益绑定...`, 'warn');
          } catch (error) {
            lastError = error;
            await addLog(`步骤 6：读取 ChatGPT session 计划状态失败，继续重试：${getErrorMessage(error)}`, 'warn');
          }

          if (Date.now() - startedAt >= timeoutMs) {
            throw new Error(buildUnboundCheckoutError(lastPlanType, lastError));
          }
          if (intervalMs > 0) {
            await sleepWithStop(Math.min(intervalMs, Math.max(0, timeoutMs - (Date.now() - startedAt))));
          } else {
            await sleepWithStop(0);
          }
        }
      } finally {
        if (chrome?.tabs?.remove && Number.isInteger(sessionTabId)) {
          await chrome.tabs.remove(sessionTabId).catch(() => {});
        }
      }
    }

    async function completeHostedCheckoutAfterPaidPlanVerified(completionPayload = {}, options = {}) {
      const verifiedPayload = await readHostedCheckoutPlanTypeForRecord(completionPayload, options);
      await completeNodeFromBackground('plus-checkout-create', verifiedPayload);
    }

    async function waitForHostedCheckoutPaymentsSuccess(tabId) {
      const successTab = await waitForUrlMatch(
        tabId,
        (url) => isPaymentsSuccessUrl(url),
        HOSTED_CHECKOUT_SUCCESS_WAIT_TIMEOUT_MS,
        500
      );
      if (!successTab?.url || !isPaymentsSuccessUrl(successTab.url)) {
        throw new Error('步骤 6：hosted checkout 已离开 PayPal，但长时间未回到 ChatGPT 支付成功页。');
      }
      await addLog('步骤 6：hosted checkout 已回到 ChatGPT 支付成功页，等待扩展继续后续 OAuth 流程。', 'ok');
      return successTab;
    }

    async function finishHostedCheckoutAfterPayPalGenericError(tabId, completionPayload = {}, pageState = {}) {
      const errorText = String(pageState?.hostedErrorText || '').trim()
        || 'Things don\'t appear to be working at the moment.';
      await addLog(`步骤 6：PayPal 暂时显示 genericError（${errorText}），按实际成功回跳处理：等待 60 秒让 ChatGPT 订阅状态落地...`, 'warn');
      await sleepWithStop(HOSTED_CHECKOUT_PAYPAL_GENERIC_ERROR_SETTLE_MS);
      await chrome?.tabs?.remove?.(tabId).catch(() => {});
      await setState({ plusCheckoutTabId: null });
      await addLog('步骤 6：已等待 60 秒并关闭 PayPal 错误页，正在确认 ChatGPT 订阅状态。', 'ok');
      await completeHostedCheckoutAfterPaidPlanVerified({
        ...completionPayload,
        plusHostedCheckoutCompleted: true,
        plusHostedCheckoutClosedPayPalGenericError: true,
      });
    }

    async function runHostedCheckoutPayPalFlow(tabId, guestProfile) {
      const startedAt = Date.now();
      const attemptedVerificationCodes = new Set();
      let verificationRetryCount = 0;
      let verificationPopupFirstSeenAt = 0;
      let lastProgressSignature = '';
      let lastProgressAt = Date.now();
      let busyFirstSeenAt = 0;
      let payLoginSubmittedAt = 0;
      let payLoginSubmittedSignature = '';
      let stuckRefreshAttempts = 0;
      while (Date.now() - startedAt < HOSTED_CHECKOUT_PAYPAL_LOOP_TIMEOUT_MS) {
        throwIfStopped();
        const tab = await chrome?.tabs?.get?.(tabId).catch(() => null);
        if (!tab) {
          throw new Error('步骤 6：hosted checkout PayPal 标签页已关闭。');
        }
        const currentUrl = String(tab.url || '').trim();
        if (!currentUrl) {
          await sleepWithStop(500);
          continue;
        }
        if (isPayPalHostedGenericErrorUrl(currentUrl)) {
          return {
            completedViaGenericError: true,
            pageState: {
              hostedStage: 'generic_error',
              hostedErrorVisible: true,
              hostedErrorText: 'Things don\'t appear to be working at the moment.',
            },
          };
        }
        if (isPaymentsSuccessUrl(currentUrl)) {
          await addLog('步骤 6：hosted checkout 已直接进入 ChatGPT 支付成功页。', 'ok');
          return;
        }
        if (!isPayPalUrl(currentUrl)) {
          await addLog(`步骤 6：hosted checkout 已离开 PayPal（${currentUrl}），继续等待 ChatGPT 支付成功页...`, 'info');
          await waitForHostedCheckoutPaymentsSuccess(tabId);
          return;
        }

        if (isPayPalHermesUrl(currentUrl)) {
          await addLog(`步骤 6：检测到 PayPal Hermes 复核页（${currentUrl}），按油猴脚本方式直接等待并点击 Agree and Continue...`, 'info');
          await runHostedCheckoutPayPalStep(tabId, {});
          await sleepWithStop(1000);
          continue;
        }

        if (String(tab.status || '').toLowerCase() === 'loading') {
          await waitForHostedCheckoutPayPalTabComplete(tabId, '页面加载超时');
          lastProgressSignature = '';
          lastProgressAt = Date.now();
          continue;
        }

        const pageState = await getHostedCheckoutPayPalState(tabId);
        if (pageState.hostedStage === 'generic_error' || pageState.hostedErrorVisible) {
          return {
            completedViaGenericError: true,
            pageState,
          };
        }

        const progressSignature = buildHostedCheckoutPayPalProgressSignature(currentUrl, tab, pageState);
        if (progressSignature !== lastProgressSignature) {
          lastProgressSignature = progressSignature;
          lastProgressAt = Date.now();
        } else if (Date.now() - lastProgressAt >= HOSTED_CHECKOUT_PAYPAL_STUCK_REFRESH_MS) {
          stuckRefreshAttempts += 1;
          if (stuckRefreshAttempts > HOSTED_CHECKOUT_PAYPAL_STUCK_REFRESH_MAX_ATTEMPTS) {
            throw new Error(`步骤 6：PayPal hosted checkout 页面连续 ${HOSTED_CHECKOUT_PAYPAL_STUCK_REFRESH_MAX_ATTEMPTS} 次刷新后仍长时间无进展。`);
          }
          const stageLabel = String(pageState?.hostedStage || 'unknown').trim() || 'unknown';
          await reloadHostedCheckoutPayPalTab(tabId, `当前阶段：${stageLabel}`);
          lastProgressSignature = '';
          lastProgressAt = Date.now();
          verificationPopupFirstSeenAt = 0;
          await waitForTabCompleteUntilStopped(tabId, {
            timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_TAB_LOAD_TIMEOUT_MS),
            retryDelayMs: 500,
          });
          continue;
        }

        if (pageState.hostedBusyVisible) {
          if (!busyFirstSeenAt) {
            busyFirstSeenAt = Date.now();
          }
          const busyElapsedMs = Date.now() - busyFirstSeenAt;
          if (busyElapsedMs >= HOSTED_CHECKOUT_PAYPAL_BUSY_REFRESH_MS) {
            stuckRefreshAttempts += 1;
            if (stuckRefreshAttempts > HOSTED_CHECKOUT_PAYPAL_STUCK_REFRESH_MAX_ATTEMPTS) {
              throw new Error(`步骤 6：PayPal hosted checkout 页面连续 ${HOSTED_CHECKOUT_PAYPAL_STUCK_REFRESH_MAX_ATTEMPTS} 次刷新后仍停留在加载中。`);
            }
            await reloadHostedCheckoutPayPalTab(tabId, 'PayPal 登录页持续转圈');
            lastProgressSignature = '';
            lastProgressAt = Date.now();
            busyFirstSeenAt = 0;
            verificationPopupFirstSeenAt = 0;
            payLoginSubmittedAt = 0;
            payLoginSubmittedSignature = '';
            await waitForTabCompleteUntilStopped(tabId, {
              timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_TAB_LOAD_TIMEOUT_MS),
              retryDelayMs: 500,
            });
            continue;
          }
          await sleepWithStop(1000);
          continue;
        }
        busyFirstSeenAt = 0;

        if (pageState.hostedStage === 'verification' && pageState.verificationInputsVisible) {
          if (!verificationPopupFirstSeenAt) {
            verificationPopupFirstSeenAt = Date.now();
          }

          const runtimeConfig = await getHostedCheckoutRuntimeConfig();
          const configuredDelayMs = Math.max(0, Math.floor(Number(runtimeConfig?.popupDelaySeconds) || 0) * 1000);
          const baseDelayMs = verificationRetryCount > 0
            ? Math.max(configuredDelayMs, HOSTED_CHECKOUT_VERIFICATION_RETRY_DELAY_MS)
            : configuredDelayMs;
          const elapsedSincePopupMs = Date.now() - verificationPopupFirstSeenAt;
          if (baseDelayMs > elapsedSincePopupMs) {
            const waitMs = baseDelayMs - elapsedSincePopupMs;
            await addLog(`步骤 6：检测到 PayPal 验证码弹窗，先等待 ${Math.ceil(waitMs / 1000)} 秒再获取验证码，避免读取旧码...`, 'info');
            await sleepWithStop(waitMs);
            verificationPopupFirstSeenAt = Math.min(verificationPopupFirstSeenAt, Date.now() - baseDelayMs);
            continue;
          }

          if (pageState.verificationErrorVisible) {
            verificationRetryCount += 1;
            if (verificationRetryCount > HOSTED_CHECKOUT_VERIFICATION_RETRY_MAX_ATTEMPTS) {
              throw new Error(`步骤 6：PayPal 验证码连续失败，已达到 ${HOSTED_CHECKOUT_VERIFICATION_RETRY_MAX_ATTEMPTS} 次重试上限。最后错误：${pageState.verificationErrorText || '验证码被拒绝'}`);
            }
            await addLog(`步骤 6：PayPal 提示验证码无效/过期（${pageState.verificationErrorText || '未知错误'}），正在关闭验证码页并重新点击 Agree & Create Account 获取新验证码...`, 'warn');
            await runHostedCheckoutPayPalStep(tabId, {
              requestVerificationRetry: true,
              closeWaitMs: 2500,
            });
            verificationPopupFirstSeenAt = Date.now();
            await addLog(`步骤 6：已重新触发 PayPal 发送验证码，将至少等待 ${Math.ceil(Math.max(configuredDelayMs, HOSTED_CHECKOUT_VERIFICATION_RETRY_DELAY_MS) / 1000)} 秒后再取码...`, 'info');
            continue;
          }

          await addLog('步骤 6：检测到 PayPal hosted checkout 验证码弹窗，正在获取并填写验证码...', 'info');
          const verificationCode = await pollHostedCheckoutVerificationCode({
            excludeCodes: Array.from(attemptedVerificationCodes),
          });
          attemptedVerificationCodes.add(verificationCode);
          const submitResult = await runHostedCheckoutPayPalStep(tabId, {
            verificationCode,
          });
          if (submitResult?.verificationErrorVisible) {
            await addLog(`步骤 6：PayPal 验证码提交前页面已提示错误：${submitResult.verificationErrorText || '验证码被拒绝'}，准备重试获取新验证码...`, 'warn');
            continue;
          }
          await sleepWithStop(3000);
          continue;
        }

        verificationPopupFirstSeenAt = 0;

        if (pageState.hostedStage === 'pay_login') {
          const loginSignature = `${currentUrl}|${String(pageState.loginPhase || '').trim()}|${pageState.hasEmailInput ? 'email' : ''}|${pageState.hasPasswordInput ? 'password' : ''}`;
          if (payLoginSubmittedAt && payLoginSubmittedSignature === loginSignature) {
            const loginWaitMs = Date.now() - payLoginSubmittedAt;
            if (loginWaitMs >= HOSTED_CHECKOUT_PAYPAL_BUSY_REFRESH_MS) {
              stuckRefreshAttempts += 1;
              if (stuckRefreshAttempts > HOSTED_CHECKOUT_PAYPAL_STUCK_REFRESH_MAX_ATTEMPTS) {
                throw new Error(`Step 6: PayPal login page stayed stuck after ${HOSTED_CHECKOUT_PAYPAL_STUCK_REFRESH_MAX_ATTEMPTS} refresh attempts.`);
              }
              await reloadHostedCheckoutPayPalTab(tabId, 'PayPal login stayed on the same email page after submit');
              lastProgressSignature = '';
              lastProgressAt = Date.now();
              busyFirstSeenAt = 0;
              verificationPopupFirstSeenAt = 0;
              payLoginSubmittedAt = 0;
              payLoginSubmittedSignature = '';
              await waitForTabCompleteUntilStopped(tabId, {
                timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_TAB_LOAD_TIMEOUT_MS),
                retryDelayMs: 500,
              });
              continue;
            }
            await sleepWithStop(1000);
            continue;
          }
          await addLog('步骤 6：检测到 PayPal hosted checkout 登录页，正在填写邮箱并继续...', 'info');
          await runHostedCheckoutPayPalStep(tabId, {
            email: guestProfile.email,
          });
          payLoginSubmittedAt = Date.now();
          payLoginSubmittedSignature = loginSignature;
          await sleepWithStop(1000);
          continue;
        }
        payLoginSubmittedAt = 0;
        payLoginSubmittedSignature = '';

        if (
          pageState.hostedStage === 'guest_checkout'
          || (
            pageState.hostedStage === 'approval'
            && (
              pageState.hasHostedGuestCheckout
              || /\/pay\/billing(?:[/?#]|$)/i.test(String(pageState?.url || currentUrl || ''))
            )
          )
        ) {
          const runtimeConfig = await getHostedCheckoutRuntimeConfig();
          const configuredPhone = String(runtimeConfig?.phone || '').trim();
          await addLog(`步骤 6：当前 hosted checkout 电话配置为 ${configuredPhone || '(空，将回退默认值)'}。`, 'info');
          await addLog(`步骤 6：发送到 PayPal guest checkout 的 payload：${JSON.stringify({
            phone: String(runtimeConfig?.phone || guestProfile.phone || '').trim(),
            address: guestProfile.address || {},
          })}`, 'info');
          await addLog('步骤 6：检测到 PayPal hosted checkout 卡支付页，正在填写卡资料并提交...', 'info');
          await runHostedCheckoutPayPalStep(tabId, {
            ...guestProfile,
            phone: String(runtimeConfig?.phone || guestProfile.phone || '').trim(),
          });
          await sleepWithStop(1500);
          continue;
        }

        if (pageState.hostedStage === 'review_consent') {
          await addLog('步骤 6：检测到 PayPal hosted checkout 账单确认页，正在点击继续...', 'info');
          await runHostedCheckoutPayPalStep(tabId, {});
          await sleepWithStop(1000);
          continue;
        }

        if (pageState.hostedStage === 'approval') {
          throw new Error('步骤 6：hosted checkout 流程意外进入了普通 PayPal 授权页，当前流程未配置 PayPal 账号授权。');
        }

        await sleepWithStop(1000);
      }
      throw new Error('步骤 6：hosted checkout PayPal 自动化超时，长时间未完成支付链路。');
    }

    async function runHostedCheckoutAutomation(tabId, completionPayload = {}) {
      const runtimeConfig = await getHostedCheckoutRuntimeConfig({
        ensureCurrentSmsEntry: true,
      });
      const address = await fetchHostedCheckoutAddress();
      await addLog(`步骤 6：hosted checkout 配置快照：${JSON.stringify(runtimeConfig?.diagnostics || {})}`, 'info');
      await addLog(`步骤 6：hosted checkout 初始电话配置为 ${runtimeConfig.phone || '(空)'}。`, 'info');
      await addLog(`步骤 6：hosted checkout 地址数据：${JSON.stringify(address)}`, 'info');
      const guestProfile = buildHostedCheckoutGuestProfile(address, runtimeConfig);
      await runHostedCheckoutOpenAiFlow(tabId, guestProfile);

      const transitionTab = await waitForUrlMatch(
        tabId,
        (url) => isPayPalUrl(url) || isPaymentsSuccessUrl(url),
        HOSTED_CHECKOUT_TRANSITION_TIMEOUT_MS,
        500
      );
      const transitionUrl = String(transitionTab?.url || '').trim();
      if (!transitionUrl) {
        throw new Error('步骤 6：hosted checkout 提交后长时间未跳转到 PayPal 或 ChatGPT 支付成功页。');
      }
      if (isPaymentsSuccessUrl(transitionUrl)) {
        await addLog('步骤 6：hosted checkout 在提交后已直接进入 ChatGPT 支付成功页。', 'ok');
        await completeHostedCheckoutAfterPaidPlanVerified(completionPayload);
        return;
      }

      await addLog('步骤 6：hosted checkout 已跳转到 PayPal，准备继续 guest/card 流自动化。', 'info');
      const paypalResult = await runHostedCheckoutPayPalFlow(tabId, guestProfile);
      if (paypalResult?.completedViaGenericError) {
        await finishHostedCheckoutAfterPayPalGenericError(tabId, completionPayload, paypalResult.pageState);
        return;
      }
      await addLog('步骤 6：hosted checkout 支付链路已完成，准备进入下一步。', 'ok');
      await completeHostedCheckoutAfterPaidPlanVerified(completionPayload);
    }

    function isHostedCheckoutNonFreeTrialFailure(error) {
      const message = getErrorMessage(error);
      return /PLUS_CHECKOUT_NON_FREE_TRIAL::|今日应付金额不是\s*0|没有免费试用资格|该账号已经开通过\s*ChatGPT\s*订阅套餐，不能重复订阅/i.test(message);
    }

    function stripHostedCheckoutNonFreeTrialPrefix(message) {
      return String(message || '').replace(/^PLUS_CHECKOUT_NON_FREE_TRIAL::/i, '').trim();
    }

    function startHostedCheckoutAutomation(tabId, completionPayload = {}) {
      if (!enableHostedCheckoutAutomation) {
        return;
      }
      void runHostedCheckoutAutomation(tabId, completionPayload)
        .catch(async (error) => {
          const message = error?.message || String(error || 'hosted checkout automation failed');
          if (isHostedCheckoutNonFreeTrialFailure(error)) {
            const stopReason = stripHostedCheckoutNonFreeTrialPrefix(message)
              || '步骤 6：检测到当前账号没有免费试用资格，本轮将结束并继续下一轮。';
            await addLog(stopReason, 'warn');
            if (typeof markCurrentRegistrationAccountUsed === 'function') {
              const latestState = typeof getState === 'function' ? await getState().catch(() => ({})) : {};
              await markCurrentRegistrationAccountUsed(latestState, {
                reason: 'plus-checkout-non-free-trial',
                logPrefix: 'Plus Checkout：当前账号没有免费试用资格',
              });
            }
            if (typeof failNodeFromBackground === 'function') {
              await failNodeFromBackground('plus-checkout-create', `PLUS_CHECKOUT_NON_FREE_TRIAL::${stopReason}`);
            }
            return;
          }
          await addLog(`步骤 6：hosted checkout 自动化失败：${message}`, 'error');
          if (typeof failNodeFromBackground === 'function') {
            await failNodeFromBackground('plus-checkout-create', message);
          }
        })
        .finally(async () => {
          await clearHostedCheckoutCurrentSmsEntry();
        });
    }

    function normalizeHelperCountryCode(countryCode = '86') {
      const digits = String(countryCode || '').replace(/\D/g, '');
      return digits || '86';
    }

    function normalizeHelperPhoneNumber(phone = '', countryCode = '86') {
      const cleaned = String(phone || '').replace(/\D/g, '');
      const countryDigits = normalizeHelperCountryCode(countryCode);
      if (countryDigits && cleaned.startsWith(countryDigits) && cleaned.length > countryDigits.length) {
        return cleaned.slice(countryDigits.length);
      }
      return cleaned;
    }

    function normalizeGpcHelperPhoneMode(value = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.normalizeGpcHelperPhoneMode) {
        return rootScope.GoPayUtils.normalizeGpcHelperPhoneMode(value);
      }
      const normalized = String(value || '').trim().toLowerCase();
      return normalized === GPC_HELPER_PHONE_MODE_AUTO || normalized === 'builtin'
        ? GPC_HELPER_PHONE_MODE_AUTO
        : GPC_HELPER_PHONE_MODE_MANUAL;
    }

    function normalizeGpcOtpChannel(value = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.normalizeGpcOtpChannel) {
        return rootScope.GoPayUtils.normalizeGpcOtpChannel(value);
      }
      return String(value || '').trim().toLowerCase() === 'sms' ? 'sms' : 'whatsapp';
    }

    function resolveGpcHelperApiKey(state = {}) {
      const apiKey = String(
        state?.gopayHelperApiKey
        || state?.gpcApiKey
        || state?.apiKey
        || ''
      ).trim();
      if (!apiKey) {
        throw new Error('创建 GPC 订单失败：缺少 API Key。');
      }
      return apiKey;
    }

    function normalizeGpcHelperBaseUrl(apiUrl = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.normalizeGpcHelperBaseUrl) {
        return rootScope.GoPayUtils.normalizeGpcHelperBaseUrl(apiUrl);
      }
      let normalized = String(apiUrl || DEFAULT_GPC_HELPER_API_URL).trim().replace(/\/+$/g, '');
      normalized = normalized.replace(/\/api\/checkout\/start$/i, '');
      normalized = normalized.replace(/\/api\/gopay\/(?:otp|pin)$/i, '');
      normalized = normalized.replace(/\/api\/gp\/tasks(?:\/[^/?#]+)?(?:\/(?:otp|pin|stop))?(?:\?.*)?$/i, '');
      normalized = normalized.replace(/\/api\/gp\/balance(?:\?.*)?$/i, '');
      normalized = normalized.replace(/\/api\/card\/balance(?:\?.*)?$/i, '');
      normalized = normalized.replace(/\/api\/card\/redeem-api-key(?:\?.*)?$/i, '');
      return normalized || DEFAULT_GPC_HELPER_API_URL;
    }

    function buildGpcHelperApiUrl(apiUrl = '', path = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.buildGpcHelperApiUrl) {
        return rootScope.GoPayUtils.buildGpcHelperApiUrl(apiUrl, path);
      }
      const baseUrl = normalizeGpcHelperBaseUrl(apiUrl);
      if (!baseUrl) {
        return '';
      }
      const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${String(path || '')}`;
      return `${baseUrl}${normalizedPath}`;
    }

    function buildGpcTaskCreateUrl(apiUrl = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.buildGpcTaskCreateUrl) {
        return rootScope.GoPayUtils.buildGpcTaskCreateUrl(apiUrl);
      }
      return buildGpcHelperApiUrl(apiUrl, '/api/gp/tasks');
    }

    function buildGpcBalanceUrl(apiUrl = '') {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.buildGpcApiKeyBalanceUrl) {
        return rootScope.GoPayUtils.buildGpcApiKeyBalanceUrl(apiUrl);
      }
      if (rootScope.GoPayUtils?.buildGpcCardBalanceUrl) {
        return rootScope.GoPayUtils.buildGpcCardBalanceUrl(apiUrl);
      }
      return buildGpcHelperApiUrl(apiUrl, '/api/gp/balance');
    }

    function unwrapGpcResponse(payload = {}) {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.unwrapGpcResponse) {
        return rootScope.GoPayUtils.unwrapGpcResponse(payload);
      }
      if (payload && typeof payload === 'object' && !Array.isArray(payload)
        && Object.prototype.hasOwnProperty.call(payload, 'data')
        && (Object.prototype.hasOwnProperty.call(payload, 'code') || Object.prototype.hasOwnProperty.call(payload, 'message'))) {
        return payload.data ?? {};
      }
      return payload;
    }

    function isGpcUnifiedResponseOk(payload = {}) {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.isGpcUnifiedResponseOk) {
        return rootScope.GoPayUtils.isGpcUnifiedResponseOk(payload);
      }
      if (!payload || typeof payload !== 'object' || !Object.prototype.hasOwnProperty.call(payload, 'code')) {
        return true;
      }
      const code = Number(payload.code);
      return Number.isFinite(code) ? code >= 200 && code < 300 : String(payload.code || '').trim() === '200';
    }

    function getGpcResponseErrorDetail(payload = {}, status = 0) {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.extractGpcResponseErrorDetail) {
        return rootScope.GoPayUtils.extractGpcResponseErrorDetail(payload, status);
      }
      return payload?.data?.detail || payload?.detail || payload?.message || payload?.error || `HTTP ${status || 0}`;
    }

    function getGpcRemainingUses(payload = {}) {
      const rootScope = typeof self !== 'undefined' ? self : globalThis;
      if (rootScope.GoPayUtils?.getGpcBalanceRemainingUses) {
        return rootScope.GoPayUtils.getGpcBalanceRemainingUses(payload);
      }
      const data = unwrapGpcResponse(payload);
      const numeric = Number(data?.remaining_uses ?? data?.remainingUses ?? data?.balance ?? data?.remaining);
      return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : null;
    }

    function normalizeGpcAutoModePermissionValue(value) {
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'number') {
        if (value === 1) return true;
        if (value === 0) return false;
      }
      const normalized = String(value ?? '').trim().toLowerCase();
      if (!normalized) {
        return null;
      }
      if (['true', '1', 'yes', 'y', 'on', 'enabled', 'enable'].includes(normalized)) {
        return true;
      }
      if (['false', '0', 'no', 'n', 'off', 'disabled', 'disable'].includes(normalized)) {
        return false;
      }
      return null;
    }

    function getGpcAutoModePermission(payload = {}) {
      const data = unwrapGpcResponse(payload);
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return null;
      }
      return normalizeGpcAutoModePermissionValue(
        data.auto_mode_enabled
        ?? data.autoModeEnabled
        ?? data.auto_enabled
        ?? data.autoEnabled
      );
    }

    function isGpcAutoModePermissionDenied(payload = {}) {
      return getGpcAutoModePermission(payload) === false;
    }

    async function assertGpcApiKeyReadyForCreate(state = {}, phoneMode = GPC_HELPER_PHONE_MODE_MANUAL, apiKey = '') {
      const apiUrl = buildGpcBalanceUrl(state?.gopayHelperApiUrl);
      if (!apiUrl) {
        throw new Error('创建 GPC 订单失败：缺少 API 地址。');
      }
      const { response, data } = await fetchJsonWithTimeout(apiUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-API-Key': apiKey,
        },
      }, 30000);
      if (!response?.ok || !isGpcUnifiedResponseOk(data)) {
        const detail = getGpcResponseErrorDetail(data, response?.status || 0);
        throw new Error(`创建 GPC 订单失败：API Key 校验失败：${detail}`);
      }
      const balanceData = unwrapGpcResponse(data);
      const remainingUses = getGpcRemainingUses(balanceData);
      const status = String(balanceData?.status || balanceData?.card_status || balanceData?.cardStatus || '').trim().toLowerCase();
      if (status && status !== 'active') {
        throw new Error(`创建 GPC 订单失败：API Key 状态不可用（${status}）。`);
      }
      if (remainingUses !== null && remainingUses <= 0) {
        throw new Error('创建 GPC 订单失败：API Key 剩余次数不足。');
      }
      if (phoneMode === GPC_HELPER_PHONE_MODE_AUTO && isGpcAutoModePermissionDenied(balanceData)) {
        throw new Error('创建 GPC 订单失败：当前 GPC API Key 未开通自动模式。');
      }
    }

    async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 30000) {
      const fetcher = typeof fetchImpl === 'function'
        ? fetchImpl
        : (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
      if (typeof fetcher !== 'function') {
        throw new Error('当前运行环境不支持 fetch，无法调用 GPC API。');
      }
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const effectiveTimeoutMs = Math.max(1000, Number(timeoutMs) || 30000);
      let didTimeout = false;
      let timer = null;
      const buildTimeoutError = () => new Error(`GPC API 请求超时（>${Math.round(effectiveTimeoutMs / 1000)} 秒）：${url}`);
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => {
          didTimeout = true;
          reject(buildTimeoutError());
          if (controller) {
            controller.abort();
          }
        }, effectiveTimeoutMs);
      });
      try {
        const response = await Promise.race([
          fetcher(url, { ...options, ...(controller ? { signal: controller.signal } : {}) }),
          timeoutPromise,
        ]);
        const data = await Promise.race([
          response.json().catch(() => ({})),
          timeoutPromise,
        ]);
        return { response, data };
      } catch (error) {
        if (didTimeout || error?.name === 'AbortError') {
          throw buildTimeoutError();
        }
        throw error;
      } finally {
        if (timer) clearTimeout(timer);
      }
    }

    async function readAccessTokenFromChatGptSessionTab(tabId) {
      await waitForTabCompleteUntilStopped(tabId, {
        timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_TAB_LOAD_TIMEOUT_MS),
        retryDelayMs: 500,
      });
      await sleepWithStop(1000);
      await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
        inject: PLUS_CHECKOUT_INJECT_FILES,
        injectSource: PLUS_CHECKOUT_SOURCE,
        timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_CONTENT_READY_TIMEOUT_MS),
        logMessage: '步骤 6：正在等待 ChatGPT 页面完成加载，再继续获取 accessToken...',
      });

      const sessionResult = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
        type: 'PLUS_CHECKOUT_GET_STATE',
        source: 'background',
        payload: {
          includeSession: true,
          includeAccessToken: true,
        },
      }, {
        timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_STATE_MESSAGE_TIMEOUT_MS),
        responseTimeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_STATE_MESSAGE_TIMEOUT_MS),
      });
      if (sessionResult?.error) {
        throw new Error(sessionResult.error);
      }
      return String(sessionResult?.accessToken || sessionResult?.session?.accessToken || '').trim();
    }

    function shouldUseFreeTrialPromo(state = {}) {
      return state?.plusCheckoutUseFreeTrialPromo !== false;
    }

    async function generateCloudCheckoutFromApi(accessToken = '', paymentMethod = PLUS_PAYMENT_METHOD_PAYPAL, state = {}) {
      const token = String(accessToken || '').trim();
      if (!token) {
        throw new Error('步骤 6：云端支付转换缺少 accessToken。');
      }

      const apiUrl = normalizePlusCheckoutCloudConversionApiUrl(
        state?.plusCheckoutCloudConversionApiUrl || BUILTIN_PLUS_CHECKOUT_CLOUD_CONVERSION_API_URL
      );
      if (!apiUrl) {
        throw new Error('步骤 6：已启用云端支付转换，但未配置云端服务地址。');
      }
      try {
        const parsed = new URL(apiUrl);
        if (!/^https?:$/i.test(String(parsed.protocol || ''))) {
          throw new Error('unsupported protocol');
        }
      } catch {
        throw new Error('步骤 6：云端支付转换服务地址不是有效的 HTTP/HTTPS URL。');
      }

      const billingDetails = getCheckoutBillingDetailsForPaymentMethod(paymentMethod);
      const headers = {
        Accept: 'application/json',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Content-Type': 'application/json',
      };
      const apiKey = String(state?.plusCheckoutCloudConversionApiKey || BUILTIN_PLUS_CHECKOUT_CLOUD_CONVERSION_API_KEY).trim();
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      const { response, data } = await fetchJsonWithTimeout(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          accessToken: token,
          paymentMethod: normalizePlusPaymentMethod(paymentMethod),
          country: billingDetails.country,
          currency: billingDetails.currency,
          useFreeTrialPromo: shouldUseFreeTrialPromo(state),
          promoCampaignId: shouldUseFreeTrialPromo(state) ? 'plus-1-month-free' : '',
        }),
      }, 45000);

      const targetCheckoutUrl = String(
        data?.preferredCheckoutUrl
        || data?.hostedCheckoutUrl
        || data?.convertedCheckoutUrl
        || data?.chatgptCheckoutUrl
        || data?.checkoutUrl
        || ''
      ).trim();
      if (!response?.ok || !targetCheckoutUrl) {
        const detail = formatCloudCheckoutErrorDetail(
          data?.detail || data?.message || data?.error,
          `HTTP ${response?.status || 0}`
        );
        if (isCloudCheckoutAlreadyPaidDetail(detail)) {
          return {
            checkoutUrl: '',
            chatgptCheckoutUrl: '',
            checkoutSessionId: '',
            processorEntity: '',
            hostedCheckoutUrl: '',
            convertedCheckoutUrl: '',
            preferredCheckoutUrl: '',
            country: billingDetails.country,
            currency: billingDetails.currency,
            checkoutSource: 'cloud-converted-checkout-already-paid',
            alreadyPaid: true,
            alreadyPaidReason: detail,
          };
        }
        throw new Error(`步骤 6：云端支付转换失败：${detail}`);
      }

      return {
        checkoutUrl: String(data?.checkoutUrl || '').trim(),
        chatgptCheckoutUrl: String(data?.chatgptCheckoutUrl || '').trim(),
        checkoutSessionId: String(data?.checkoutSessionId || '').trim(),
        processorEntity: String(data?.processorEntity || '').trim(),
        hostedCheckoutUrl: String(data?.hostedCheckoutUrl || '').trim(),
        convertedCheckoutUrl: String(data?.chatgptCheckoutUrl || data?.convertedCheckoutUrl || '').trim(),
        preferredCheckoutUrl: targetCheckoutUrl,
        country: String(data?.country || billingDetails.country).trim() || billingDetails.country,
        currency: String(data?.currency || billingDetails.currency).trim() || billingDetails.currency,
        checkoutSource: 'cloud-converted-checkout',
      };
    }

    async function generateGpcCheckoutFromApi(accessToken = '', state = {}) {
      const token = String(accessToken || '').trim();
      if (!token) {
        throw new Error('创建 GPC 订单失败：缺少 accessToken。');
      }
      const apiUrl = buildGpcTaskCreateUrl(state?.gopayHelperApiUrl);
      if (!apiUrl) {
        throw new Error('创建 GPC 订单失败：缺少 API 地址。');
      }
      const phoneMode = normalizeGpcHelperPhoneMode(state?.gopayHelperPhoneMode || state?.phoneMode);
      const isAutoMode = phoneMode === GPC_HELPER_PHONE_MODE_AUTO;
      const phoneNumber = String(state?.gopayHelperPhoneNumber || '').trim();
      const countryCode = normalizeHelperCountryCode(state?.gopayHelperCountryCode || '86');
      const pin = String(state?.gopayHelperPin || '').trim();
      const apiKey = resolveGpcHelperApiKey(state);
      if (!isAutoMode && !phoneNumber) {
        throw new Error('创建 GPC 订单失败：手动模式缺少手机号。');
      }
      if (!isAutoMode && !pin) {
        throw new Error('创建 GPC 订单失败：手动模式缺少 PIN。');
      }

      throwIfStopped();
      await assertGpcApiKeyReadyForCreate(state, phoneMode, apiKey);
      throwIfStopped();
      const payload = {
        access_token: token,
        phone_mode: phoneMode,
      };
      if (!isAutoMode) {
        payload.country_code = countryCode;
        payload.phone_number = normalizeHelperPhoneNumber(phoneNumber, countryCode);
        payload.otp_channel = normalizeGpcOtpChannel(state?.gopayHelperOtpChannel);
      }

      const orderCreatedAt = Date.now();
      const { response, data } = await fetchJsonWithTimeout(apiUrl, {
        method: 'POST',
        headers: {
          Accept: '*/*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(payload),
      }, 30000);

      const taskData = unwrapGpcResponse(data);
      const taskId = String(taskData?.task_id || taskData?.taskId || '').trim();

      if (!response?.ok || !isGpcUnifiedResponseOk(data) || !taskId) {
        const detail = getGpcResponseErrorDetail(data, response?.status || 0);
        throw new Error(`创建 GPC 订单失败：${detail}`);
      }

      return {
        taskId,
        taskStatus: String(taskData?.status || '').trim(),
        statusText: String(taskData?.status_text || taskData?.statusText || '').trim(),
        remoteStage: String(taskData?.remote_stage || taskData?.remoteStage || '').trim(),
        orderCreatedAt,
        responsePayload: taskData && typeof taskData === 'object' && !Array.isArray(taskData) ? taskData : null,
        phoneMode: normalizeGpcHelperPhoneMode(taskData?.phone_mode || taskData?.phoneMode || phoneMode),
        country: 'ID',
        currency: 'IDR',
        checkoutSource: PLUS_PAYMENT_METHOD_GPC_HELPER,
      };
    }

    async function executeGpcCheckoutCreate(state = {}) {
      let accessToken = String(state?.contributionAccessToken || state?.accessToken || state?.chatgptAccessToken || '').trim();
      if (!accessToken) {
        await addLog('步骤 6：正在获取 accessToken...', 'info');
        const tokenTabId = await openFreshChatGptTabForCheckoutCreate();
        try {
          accessToken = await readAccessTokenFromChatGptSessionTab(tokenTabId);
        } finally {
          if (chrome?.tabs?.remove && Number.isInteger(tokenTabId)) {
            await chrome.tabs.remove(tokenTabId).catch(() => {});
          }
        }
      }
      if (!accessToken) {
        throw new Error('步骤 6：GPC 模式获取 accessToken 失败。');
      }

      await addLog('步骤 6：正在调用 GPC 接口创建订单...', 'info');
      const result = await generateGpcCheckoutFromApi(accessToken, state);
      await setState({
        plusCheckoutTabId: null,
        plusCheckoutUrl: '',
        plusCheckoutCountry: result.country || 'ID',
        plusCheckoutCurrency: result.currency || 'IDR',
        plusCheckoutSource: result.checkoutSource,
        gopayHelperTaskId: result.taskId,
        gopayHelperTaskStatus: result.taskStatus,
        gopayHelperStatusText: result.statusText,
        gopayHelperRemoteStage: result.remoteStage,
        gopayHelperTaskPayload: result.responsePayload,
        gopayHelperTaskProgressSignature: '',
        gopayHelperTaskProgressAt: 0,
        gopayHelperTaskProgressTaskId: result.taskId,
        gopayHelperReferenceId: '',
        gopayHelperGoPayGuid: '',
        gopayHelperRedirectUrl: '',
        gopayHelperNextAction: '',
        gopayHelperFlowId: '',
        gopayHelperChallengeId: '',
        gopayHelperStartPayload: null,
        gopayHelperOrderCreatedAt: result.orderCreatedAt || Date.now(),
      });
      await addLog(`步骤 6：GPC ${result.phoneMode === GPC_HELPER_PHONE_MODE_AUTO ? '自动' : '手动'}模式任务已创建（task_id: ${result.taskId}），准备继续下一步。`, 'info');
      await completeNodeFromBackground('plus-checkout-create', {
        plusCheckoutCountry: result.country || 'ID',
        plusCheckoutCurrency: result.currency || 'IDR',
        plusCheckoutSource: result.checkoutSource,
      });
    }

    async function executePlusCheckoutCreate(state = {}) {
      const paymentMethod = normalizePlusPaymentMethod(state?.plusPaymentMethod);
      if (paymentMethod === PLUS_PAYMENT_METHOD_GPC_HELPER) {
        await executeGpcCheckoutCreate(state);
        return;
      }

      if (state?.hostedCheckoutCurrentSmsEntry) {
        await clearHostedCheckoutCurrentSmsEntry();
      }
      let checkoutScopedProxySnapshot = null;
      try {
        checkoutScopedProxySnapshot = await maybeApplyCheckoutConversionProxy(state, paymentMethod);

        const paymentMethodLabel = getPlusPaymentMethodLabel(paymentMethod);
        const checkoutModeLabel = getCheckoutModeLabel(state);
        await addLog(`步骤 6：正在打开新的 ChatGPT 会话，准备创建${checkoutModeLabel}...`, 'info');
        const tabId = await openFreshChatGptTabForCheckoutCreate();

        await waitForTabCompleteUntilStopped(tabId, {
          timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_TAB_LOAD_TIMEOUT_MS),
          retryDelayMs: 500,
        });
        await sleepWithStop(1000);
        await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
          inject: PLUS_CHECKOUT_INJECT_FILES,
          injectSource: PLUS_CHECKOUT_SOURCE,
          timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_CONTENT_READY_TIMEOUT_MS),
          logMessage: '步骤 6：正在等待 ChatGPT 页面完成加载，再继续创建订阅页...',
        });

        const useCloudCheckoutConversion = isPlusCheckoutCloudConversionEnabled(state, paymentMethod);
        let result = null;
        if (useCloudCheckoutConversion) {
          await addLog('步骤 6：已启用云端支付转换，正在读取 accessToken 并请求云端服务生成订阅链接...', 'info');
          const accessToken = await readAccessTokenFromChatGptSessionTab(tabId);
          if (!accessToken) {
            throw new Error('步骤 6：云端支付转换未获取到可用 accessToken。');
          }
          result = await generateCloudCheckoutFromApi(accessToken, paymentMethod, state);
        } else {
          await addLog(
            paymentMethod === PLUS_PAYMENT_METHOD_PAYPAL
              ? '步骤 6：正在由扩展内部直连生成美国 US Stripe/外部支付链接...'
              : `步骤 6：正在由扩展内部创建${checkoutModeLabel}...`,
            'info'
          );
          const createCheckoutPayload = { paymentMethod };
          if (shouldUseFreeTrialPromo(state)) {
            createCheckoutPayload.useFreeTrialPromo = true;
          }
          result = await sendTabMessageUntilStopped(tabId, PLUS_CHECKOUT_SOURCE, {
            type: 'CREATE_PLUS_CHECKOUT',
            source: 'background',
            payload: createCheckoutPayload,
          }, {
            timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_CREATE_MESSAGE_TIMEOUT_MS),
            responseTimeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_CREATE_MESSAGE_TIMEOUT_MS),
          });

          if (result?.error) {
            throw new Error(result.error);
          }
        }
        const targetCheckoutUrl = String(
          result?.preferredCheckoutUrl
          || result?.hostedCheckoutUrl
          || result?.hostedCheckoutBaseUrl
          || result?.convertedCheckoutUrl
          || result?.chatgptCheckoutUrl
          || result?.checkoutUrl
          || ''
        ).trim();
        if (result?.alreadyPaid) {
          const alreadyPaidReason = String(result.alreadyPaidReason || 'User is already paid').trim();
          await setState({
            plusCheckoutTabId: null,
            plusCheckoutUrl: '',
            plusCheckoutCountry: result.country || 'US',
            plusCheckoutCurrency: result.currency || 'USD',
            plusReturnUrl: '',
            plusCheckoutSource: result.checkoutSource || 'cloud-converted-checkout-already-paid',
            plusCheckoutAlreadyPaid: true,
            plusCheckoutAlreadyPaidAt: Date.now(),
            plusCheckoutAlreadyPaidReason: alreadyPaidReason,
          });
          await addLog(`步骤 6：云端支付转换返回 ${alreadyPaidReason}，判断当前账号已具备 Plus，将跳过支付链接创建并继续后续流程。`, 'ok');
          await completeNodeFromBackground('plus-checkout-create', {
            plusCheckoutCountry: result.country || 'US',
            plusCheckoutCurrency: result.currency || 'USD',
            plusCheckoutSource: result.checkoutSource || 'cloud-converted-checkout-already-paid',
            plusCheckoutAlreadyPaid: true,
            plusCheckoutAlreadyPaidReason: alreadyPaidReason,
            skipCheckoutBilling: true,
          });
          return;
        }
        if (!targetCheckoutUrl) {
          throw new Error(`步骤 6：${checkoutModeLabel}未返回可用的订阅链接。`);
        }

        await addLog(`步骤 6：${checkoutModeLabel}已创建，正在打开订阅页面...`, 'ok');
        await chrome.tabs.update(tabId, { url: targetCheckoutUrl, active: true });
        await waitForTabCompleteUntilStopped(tabId, {
          timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_TAB_LOAD_TIMEOUT_MS),
          retryDelayMs: 500,
        });
        const landedTab = await waitForCheckoutSurface(tabId);
        if (landedTab?.url && landedTab.url !== targetCheckoutUrl) {
          await addLog(`步骤 6：订阅页已继续跳转到 ${landedTab.url}，准备进入自动填写。`, 'info');
        }

        if (checkoutScopedProxySnapshot?.applied) {
          try {
            await maybeRestoreCheckoutConversionProxy(checkoutScopedProxySnapshot);
          } catch (restoreError) {
            await addLog(`步骤 6：支付转换代理释放失败：${restoreError?.message || String(restoreError || '未知错误')}`, 'warn');
          } finally {
            checkoutScopedProxySnapshot = null;
          }
        }

        await sleepWithStop(1000);
        await ensureContentScriptReadyOnTabUntilStopped(PLUS_CHECKOUT_SOURCE, tabId, {
          inject: PLUS_CHECKOUT_INJECT_FILES,
          injectSource: PLUS_CHECKOUT_SOURCE,
          timeoutMs: getBoundedCheckoutTimeoutMs(HOSTED_CHECKOUT_CONTENT_READY_TIMEOUT_MS),
          logMessage: '步骤 6：正在等待订阅页面完成加载...',
        });

        const finalCheckoutUrl = String((landedTab?.url || targetCheckoutUrl || '')).trim();
        await setState({
          plusCheckoutTabId: tabId,
          plusCheckoutUrl: finalCheckoutUrl,
          plusCheckoutCountry: result.country || 'DE',
          plusCheckoutCurrency: result.currency || 'EUR',
          plusReturnUrl: '',
          plusCheckoutAlreadyPaid: false,
          plusCheckoutAlreadyPaidAt: 0,
          plusCheckoutAlreadyPaidReason: '',
          plusCheckoutSource: result.checkoutSource
            || (targetCheckoutUrl === String(result?.convertedCheckoutUrl || '').trim()
              ? 'converted-chatgpt-checkout'
              : ''),
        });

        await addLog(`步骤 6：Plus Checkout 页面已就绪（${paymentMethodLabel} / ${result.country || 'DE'} ${result.currency || 'EUR'}），准备继续下一步。`, 'info');

        if (shouldWaitForHostedCheckoutSuccess(state, paymentMethod)) {
          await addLog('步骤 6：当前 hosted checkout 流程将等待支付成功页出现后，再继续 OAuth 流程。', 'info');
          startHostedCheckoutAutomation(tabId, {
            plusCheckoutCountry: result.country || 'DE',
            plusCheckoutCurrency: result.currency || 'EUR',
          });
          return;
        }

        await completeNodeFromBackground('plus-checkout-create', {
          plusCheckoutCountry: result.country || 'DE',
          plusCheckoutCurrency: result.currency || 'EUR',
        });
      } catch (error) {
        if (isHostedCheckoutNonFreeTrialFailure(error)) {
          const stopReason = stripHostedCheckoutNonFreeTrialPrefix(getErrorMessage(error))
            || '步骤 6：检测到当前账号没有免费试用资格，本轮将结束并继续下一轮。';
          if (typeof markCurrentRegistrationAccountUsed === 'function') {
            const latestState = typeof getState === 'function' ? await getState().catch(() => state) : state;
            await markCurrentRegistrationAccountUsed(latestState || state, {
              reason: 'plus-checkout-non-free-trial',
              logPrefix: 'Plus Checkout：当前账号没有免费试用资格',
            });
          }
          throw new Error(`PLUS_CHECKOUT_NON_FREE_TRIAL::${stopReason}`);
        }
        throw error;
      } finally {
        if (checkoutScopedProxySnapshot?.applied) {
          try {
            await maybeRestoreCheckoutConversionProxy(checkoutScopedProxySnapshot);
          } catch (restoreError) {
            await addLog(`步骤 6：支付转换代理释放失败：${restoreError?.message || String(restoreError || '未知错误')}`, 'warn');
          }
        }
      }
    }

    return {
      executePlusCheckoutCreate,
      fetchHostedCheckoutVerificationCodeManually,
      testCheckoutConversionProxy,
    };
  }

  return {
    createPlusCheckoutCreateExecutor,
  };
});
