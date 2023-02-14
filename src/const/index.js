export const CWD = process.cwd();

export const LOG_FILE_NAME = '.performance-test.log';

export const DEFAULT_CONFIG_PATH = './performance-test.config.json';

export const DEFAULT_REPORT_DIR = './performance-test-report';

export const DEFAULT_LIGHTHOUSE_REPORT_DIR = 'lighthoust-result';

export const DEFAULT_SITESPEED_REPORT_DIR = 'sitespeed-result';

export const SITESPEED_JSON_RESULT_DIR = 'data/browsertime.summary-total.json';

const MOTOG4_USERAGENT = 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36'; // eslint-disable-line max-len
const DESKTOP_USERAGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'; // eslint-disable-line max-len

export const PERFORMANCE_TOOLS_MAP = {
  LIGHTHOUSE: 'Lighthouse',
  SITESPEED: 'Sitespeed'
};

export const USER_AGENTS = {
  MOBILE: MOTOG4_USERAGENT,
  DESKTOP: DESKTOP_USERAGENT
};

export const HEADERS = {
  Cookie:
      'OauthUserID=605711609;OauthAccessToken=dev.myones.net60571160932529168000;OauthExpires=32529168000'
};

export const METRICS_REPORT_MAP = [
  'LCP',
  'FCP',
  'CLS',
  'SI',
  'TTI',
  'TBT'
];

export const METRICS_SECOND_UNIT = [
  METRICS_REPORT_MAP[2]
];

export const METRICS_LIGHTHOUSE_MAP = {
  LCP: 'largest-contentful-paint',
  FCP: 'first-contentful-paint',
  CLS: 'cumulative-layout-shift',
  SI: 'speed-index',
  TTI: 'interactive',
  TBT: 'total-blocking-time'
};

export const METRICS_SITESPEED_MAP = {
  LCP: 'largestContentfulPaint',
  FCP: 'firstContentfulPaint',
  CLS: 'cumulativeLayoutShift',
  TTI: 'firstInputDelay',
  TBT: 'totalBlockingTime'
};

const KBPS = {
  TEN_M: 10 * 1024,
  TWENTY_M: 20 * 1024
};

export const KBPS_NAME = {
  [KBPS.TEN_M]: '10M',
  [KBPS.TWENTY_M]: '20M'
};

export const COMMON_TEST_CONFIG = {
  DOWNLOAD_KBPS: KBPS.TEN_M,
  UPLOAD_KBPS: KBPS.TEN_M,
  LATENCY: 0,
  SCREEN_PC_WIDTH: 1920,
  SCREEN_PC_HEIGHT: 1080,
  USER_AGENT: USER_AGENTS.DESKTOP
};

export const LIGHTHOUSE_DEFAULT_OPTIONS = {
  onlyCategories: ['performance'],
  output: 'html',
  extraHeaders: HEADERS
};

export const LIGHTHOUSE_DEFAULT_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance'],
    formFactor: 'desktop',

    maxWaitForFcp: 15 * 1000,
    maxWaitForLoad: 35 * 1000,
    throttling: { // constants.throttling.desktopDense4G,
      rttMs: COMMON_TEST_CONFIG.LATENCY, // Round-Trip Time，往返时延，从发送端发送数据开始，到发送端收到来自接收端的确认
      throughputKbps: KBPS.TEN_M,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: COMMON_TEST_CONFIG.LATENCY, // 0 means unset
      downloadThroughputKbps: COMMON_TEST_CONFIG.DOWNLOAD_KBPS,
      uploadThroughputKbps: COMMON_TEST_CONFIG.UPLOAD_KBPS
    },
    screenEmulation: {
      mobile: false,
      width: COMMON_TEST_CONFIG.SCREEN_PC_WIDTH,
      height: COMMON_TEST_CONFIG.SCREEN_PC_HEIGHT,
      deviceScaleFactor: 1,
      disabled: false
    },
    emulatedUserAgent: COMMON_TEST_CONFIG.USER_AGENT,
    // Skip the h2 audit so it doesn't lie to us. See https://github.com/GoogleChrome/lighthouse/issues/6539
    skipAudits: ['uses-http2']
  }
};

export const SITESPEED_DEFAULT_CONFIG = {
  'plugins.add': 'analysisstorer',
  'browsertime.headless': true,
  browser: 'chrome',
  silent: true,
  requestheader: (()=>{
    return Object.keys(HEADERS).map(headerName=>{
      return `${headerName.toLowerCase()}:'${HEADERS[headerName]}'`;
    }).join(' ');
  })()
};
