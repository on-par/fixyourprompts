import fetch from 'node-fetch';

class ApiKeyValidatorService {
  constructor() {
    this.timeout = 5000; // 5 second timeout for validation requests
  }

  /**
   * Validates an OpenAI API key
   * @param {string} key - The API key to validate
   * @returns {Promise<{valid: boolean, message: string}>}
   */
  async validateOpenAI(key) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 200) {
        return {
          valid: true,
          message: 'OpenAI API key is valid'
        };
      } else if (response.status === 401) {
        return {
          valid: false,
          message: 'Invalid OpenAI API key'
        };
      } else {
        return {
          valid: false,
          message: `OpenAI validation failed with status ${response.status}`
        };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          valid: false,
          message: 'OpenAI validation timeout'
        };
      }
      return {
        valid: false,
        message: `OpenAI validation error: ${error.message}`
      };
    }
  }

  /**
   * Validates an Anthropic API key
   * @param {string} key - The API key to validate
   * @returns {Promise<{valid: boolean, message: string}>}
   */
  async validateAnthropic(key) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [
            {
              role: 'user',
              content: 'test'
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 200) {
        return {
          valid: true,
          message: 'Anthropic API key is valid'
        };
      } else if (response.status === 401) {
        return {
          valid: false,
          message: 'Invalid Anthropic API key'
        };
      } else if (response.status === 400) {
        // For validation, we expect a 400 error since we're sending minimal request
        // But if we get here, the key is at least authenticated
        const errorData = await response.json();
        if (errorData.error && errorData.error.type === 'invalid_request_error') {
          // This is expected for our minimal validation request
          return {
            valid: true,
            message: 'Anthropic API key is valid'
          };
        }
        return {
          valid: false,
          message: `Anthropic validation failed: ${errorData.error?.message || 'Unknown error'}`
        };
      } else {
        return {
          valid: false,
          message: `Anthropic validation failed with status ${response.status}`
        };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          valid: false,
          message: 'Anthropic validation timeout'
        };
      }
      return {
        valid: false,
        message: `Anthropic validation error: ${error.message}`
      };
    }
  }

  /**
   * Validates an OpenRouter API key
   * @param {string} key - The API key to validate
   * @returns {Promise<{valid: boolean, message: string}>}
   */
  async validateOpenRouter(key) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 200) {
        const data = await response.json();
        if (data.data && data.data.label !== undefined) {
          return {
            valid: true,
            message: 'OpenRouter API key is valid'
          };
        }
        return {
          valid: false,
          message: 'OpenRouter API key validation response invalid'
        };
      } else if (response.status === 401 || response.status === 403) {
        return {
          valid: false,
          message: 'Invalid OpenRouter API key'
        };
      } else {
        return {
          valid: false,
          message: `OpenRouter validation failed with status ${response.status}`
        };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          valid: false,
          message: 'OpenRouter validation timeout'
        };
      }
      return {
        valid: false,
        message: `OpenRouter validation error: ${error.message}`
      };
    }
  }

  /**
   * Validates an API key for the specified provider
   * @param {string} provider - The provider name ('openai', 'anthropic', 'openrouter')
   * @param {string} key - The API key to validate
   * @returns {Promise<{valid: boolean, message: string}>}
   */
  async validate(provider, key) {
    if (!key || key.trim() === '') {
      return {
        valid: false,
        message: 'API key cannot be empty'
      };
    }

    switch (provider.toLowerCase()) {
      case 'openai':
        return this.validateOpenAI(key);
      case 'anthropic':
        return this.validateAnthropic(key);
      case 'openrouter':
        return this.validateOpenRouter(key);
      default:
        return {
          valid: false,
          message: `Unknown provider: ${provider}`
        };
    }
  }
}

export default new ApiKeyValidatorService();