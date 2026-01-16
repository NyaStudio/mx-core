import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { AIProviderType, type AIProviderConfig } from './ai.types'

/**
 * 规范化 endpoint URL
 * - 移除末尾斜杠
 * - 确保有 /v1 后缀（对于 OpenAI 兼容服务）
 */
export function normalizeOpenAIEndpoint(endpoint: string): string {
  // 移除末尾斜杠
  let normalized = endpoint.replace(/\/+$/, '')
  // 如果没有 /v1 后缀，添加它
  if (!normalized.endsWith('/v1')) {
    normalized = `${normalized}/v1`
  }
  return normalized
}

export function createLanguageModel(
  config: AIProviderConfig,
  modelOverride?: string,
) {
  const modelName = modelOverride || config.defaultModel

  switch (config.type) {
    case AIProviderType.OpenAI:
      return createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.endpoint
          ? normalizeOpenAIEndpoint(config.endpoint)
          : undefined,
      })(modelName)

    case AIProviderType.OpenAICompatible: {
      if (!config.endpoint) {
        throw new Error(
          `Endpoint is required for OpenAI-compatible provider: ${config.id}`,
        )
      }
      // OpenAI-compatible providers: 创建自定义 provider 实例
      // 确保 endpoint 规范化，添加 /v1 后缀以兼容 one-api/new-api 等聚合服务
      const openai = createOpenAI({
        apiKey: config.apiKey,
        baseURL: normalizeOpenAIEndpoint(config.endpoint),
      })
      // 对于兼容 API，显式使用 chat 模型格式，避免 SDK 自动选择错误的 API 类型
      return openai.chat(modelName)
    }

    case AIProviderType.Anthropic:
      // Anthropic API 使用 /v1/messages 端点
      // 支持自定义 endpoint 以兼容 one-api/new-api 等聚合服务
      return createAnthropic({
        apiKey: config.apiKey,
        baseURL: config.endpoint
          ? normalizeOpenAIEndpoint(config.endpoint)
          : undefined,
      })(modelName)

    case AIProviderType.OpenRouter:
      return createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.endpoint
          ? normalizeOpenAIEndpoint(config.endpoint)
          : 'https://openrouter.ai/api/v1',
      })(modelName)

    default:
      throw new Error(`Unsupported provider type: ${config.type}`)
  }
}
