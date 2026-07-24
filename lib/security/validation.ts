// ============================================================================
// Security & Input Validation Utilities
// ============================================================================

/**
 * Validate Stellar address format
 */
export function isValidStellarAddress(address: string): boolean {
  // Basic validation: G-prefixed, 56 characters
  if (!address.startsWith('G')) return false;
  if (address.length !== 56) return false;
  
  // Check for valid base32 characters
  const base32Regex = /^[A-Z2-7]+=*$/;
  if (!base32Regex.test(address.substring(1))) return false;
  
  return true;
}

/**
 * Validate transaction hash format
 */
export function isValidTransactionHash(hash: string): boolean {
  // Stellar transaction hashes are 64 hex characters
  if (hash.length !== 64) return false;
  
  const hexRegex = /^[a-f0-9]+$/i;
  return hexRegex.test(hash);
}

/**
 * Validate contract ID format
 */
export function isValidContractId(contractId: string): boolean {
  // C-prefixed, 56 characters
  if (!contractId.startsWith('C')) return false;
  if (contractId.length !== 56) return false;
  
  const base32Regex = /^[A-Z2-7]+=*$/;
  return base32Regex.test(contractId.substring(1));
}

/**
 * Validate poll title
 */
export function validatePollTitle(title: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  
  if (title.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }
  
  // Check for potentially dangerous characters
  const dangerousChars = /<script|<\/script|javascript:|on\w+=/gi;
  if (dangerousChars.test(title)) {
    return { valid: false, error: 'Title contains invalid characters' };
  }
  
  return { valid: true };
}

/**
 * Validate poll description
 */
export function validatePollDescription(description: string): { valid: boolean; error?: string } {
  if (description.length > 1000) {
    return { valid: false, error: 'Description must be less than 1000 characters' };
  }
  
  // Check for potentially dangerous characters
  const dangerousChars = /<script|<\/script|javascript:|on\w+=/gi;
  if (dangerousChars.test(description)) {
    return { valid: false, error: 'Description contains invalid characters' };
  }
  
  return { valid: true };
}

/**
 * Validate poll option label
 */
export function validatePollOption(label: string): { valid: boolean; error?: string } {
  if (!label || label.trim().length === 0) {
    return { valid: false, error: 'Option label is required' };
  }
  
  if (label.length > 100) {
    return { valid: false, error: 'Option label must be less than 100 characters' };
  }
  
  const dangerousChars = /<script|<\/script|javascript:|on\w+=/gi;
  if (dangerousChars.test(label)) {
    return { valid: false, error: 'Option label contains invalid characters' };
  }
  
  return { valid: true };
}

/**
 * Validate poll options array
 */
export function validatePollOptions(options: string[]): { valid: boolean; error?: string } {
  if (options.length < 2) {
    return { valid: false, error: 'Poll must have at least 2 options' };
  }
  
  if (options.length > 10) {
    return { valid: false, error: 'Poll cannot have more than 10 options' };
  }
  
  // Check for duplicates
  const uniqueOptions = new Set(options.map(o => o.toLowerCase().trim()));
  if (uniqueOptions.size !== options.length) {
    return { valid: false, error: 'Option labels must be unique' };
  }
  
  // Validate each option
  for (const option of options) {
    const validation = validatePollOption(option);
    if (!validation.valid) {
      return validation;
    }
  }
  
  return { valid: true };
}

/**
 * Validate end time for poll
 */
export function validatePollEndTime(endTime: number): { valid: boolean; error?: string } {
  // If 0, no end time is set (valid)
  if (endTime === 0) {
    return { valid: true };
  }
  
  const now = Date.now() / 1000; // Convert to seconds
  
  if (endTime <= now) {
    return { valid: false, error: 'End time must be in the future' };
  }
  
  // Maximum 1 year in the future
  const maxEndTime = now + 365 * 24 * 60 * 60;
  if (endTime > maxEndTime) {
    return { valid: false, error: 'End time cannot be more than 1 year in the future' };
  }
  
  return { valid: true };
}

/**
 * Validate complete poll creation form
 */
export interface PollFormData {
  title: string;
  description: string;
  options: string[];
  endTime?: number;
}

export function validatePollForm(data: PollFormData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const titleValidation = validatePollTitle(data.title);
  if (!titleValidation.valid && titleValidation.error) {
    errors.push(titleValidation.error);
  }
  
  const descValidation = validatePollDescription(data.description);
  if (!descValidation.valid && descValidation.error) {
    errors.push(descValidation.error);
  }
  
  const optionsValidation = validatePollOptions(data.options);
  if (!optionsValidation.valid && optionsValidation.error) {
    errors.push(optionsValidation.error);
  }
  
  if (data.endTime !== undefined && data.endTime !== 0) {
    const endTimeValidation = validatePollEndTime(data.endTime);
    if (!endTimeValidation.valid && endTimeValidation.error) {
      errors.push(endTimeValidation.error);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string input (basic XSS prevention)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validate network configuration
 */
export function validateNetworkConfig(config: {
  rpcUrl: string;
  networkPassphrase: string;
  contractId: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate RPC URL
  if (!config.rpcUrl || !config.rpcUrl.startsWith('http')) {
    errors.push('Invalid RPC URL');
  }
  
  // Validate network passphrase
  if (!config.networkPassphrase) {
    errors.push('Network passphrase is required');
  }
  
  // Validate contract ID
  if (!isValidContractId(config.contractId)) {
    errors.push('Invalid contract ID format');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if environment is secure for sensitive operations
 */
export function isSecureEnvironment(): boolean {
  // Check if running in production
  if (process.env.NODE_ENV === 'production') {
    return true;
  }
  
  // Check if using HTTPS (when available)
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return true;
  }
  
  // Development is considered less secure
  return false;
}

/**
 * Validate wallet connection state
 */
export function validateWalletState(wallet: {
  address: string | null;
  isConnected: boolean;
}): { valid: boolean; error?: string } {
  if (!wallet.isConnected) {
    return { valid: false, error: 'Wallet is not connected' };
  }
  
  if (!wallet.address) {
    return { valid: false, error: 'Wallet address is missing' };
  }
  
  if (!isValidStellarAddress(wallet.address)) {
    return { valid: false, error: 'Invalid wallet address format' };
  }
  
  return { valid: true };
}

/**
 * Rate limiting helper
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => now - time < this.windowMS);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }
  
  reset(key: string): void {
    this.requests.delete(key);
  }
}

// Global rate limiter for API calls
export const apiRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
