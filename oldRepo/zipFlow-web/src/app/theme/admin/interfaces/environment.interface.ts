export interface EnvironmentInterface {
  production: boolean,
  apiUrl: string,
  appUrl: string,
  assetsUrl: string,
  secretKey: string | null,
  externalScripts: string[],
  appName: string
}
