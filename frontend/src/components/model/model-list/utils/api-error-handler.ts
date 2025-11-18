/**
 * Helper function to extract user-friendly error messages from API responses
 */
export async function extractErrorMessage(response: Response): Promise<string> {
    try {
        const errorData = await response.json() as any

        // Handle different error response formats
        if (errorData.message) {
            return errorData.message
        } else if (errorData.error) {
            return errorData.error
        } else if (errorData.details) {
            return `${errorData.error || 'Operation failed'}: ${errorData.details}`
        }

        // Fallback based on status code
        switch (response.status) {
            case 403:
                return 'You don\'t have permission to perform this action. This operation may compromise system security.'
            case 401:
                return 'Authentication required. Please log in again.'
            case 404:
                return 'The requested item was not found.'
            case 400:
                return 'Invalid request. Please check your input and try again.'
            default:
                return `Operation failed with status ${response.status}`
        }
    } catch {
        // If we can't parse JSON, return a generic message based on status
        switch (response.status) {
            case 403:
                return 'Access denied. This operation may violate security policies.'
            case 401:
                return 'Authentication required. Please log in again.'
            case 404:
                return 'The requested item was not found.'
            case 400:
                return 'Invalid request. Please check your input and try again.'
            default:
                return `Operation failed (${response.status})`
        }
    }
}
