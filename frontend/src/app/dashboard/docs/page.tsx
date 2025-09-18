/**
 * API Documentation Page
 * Frontend-hosted interactive Swagger UI with Dark Theme Support
 */

import React, {useEffect, useRef} from 'react'

export default function DocsPage() {
    const swaggerUIRef = useRef<HTMLDivElement>(null)
    const baseApiUrl = 'http://localhost:8787'

    useEffect(() => {
        console.log('DocsPage useEffect running...')

        // Detect theme changes
        const detectTheme = () => {
            const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dim' ||
                document.documentElement.classList.contains('dark') ||
                document.body.classList.contains('dark')
            console.log('Theme detection result:', {isDarkMode})
            return isDarkMode
        }

        // Initial theme detection
        detectTheme()

        // Watch for theme changes
        const observer = new MutationObserver(() => {
            console.log('Theme change detected')
            detectTheme()
        })
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'class']
        })

        // Load Swagger UI
        const loadSwaggerUI = async () => {
            console.log('Loading Swagger UI...')

            // Check if SwaggerUIBundle is already loaded
            if (typeof (window as any).SwaggerUIBundle !== 'undefined') {
                console.log('SwaggerUIBundle already loaded, initializing...')
                initializeSwaggerUI()
                return
            }

            // Load local Swagger UI CSS with dark theme support
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = '/swagger-ui.css'
            document.head.appendChild(link)
            console.log('Local Swagger UI CSS with dark theme loaded')

            // Load JS from CDN
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.3/swagger-ui-bundle.js'
            script.onload = () => {
                console.log('Swagger UI bundle loaded, initializing...')
                initializeSwaggerUI()
            }
            script.onerror = (error) => {
                console.error('Failed to load Swagger UI bundle:', error)
            }
            document.head.appendChild(script)
        }

        const initializeSwaggerUI = () => {
            console.log('Initializing Swagger UI...')
            if (swaggerUIRef.current && (window as any).SwaggerUIBundle) {
                try {
                    (window as any).SwaggerUIBundle({
                        url: `${baseApiUrl}/api/openapi.json`,
                        dom_id: '#swagger-ui',
                        deepLinking: true,
                        presets: [
                            (window as any).SwaggerUIBundle.presets.apis,
                            (window as any).SwaggerUIBundle.presets.standalone
                        ],
                        layout: 'BaseLayout',
                        defaultModelsExpandDepth: 1,
                        defaultModelExpandDepth: 1,
                        tryItOutEnabled: true,
                        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
                        requestInterceptor: (request: any) => {
                            console.log('Request:', request)
                            return request
                        }
                    })
                    console.log('Swagger UI initialized successfully')
                } catch (error) {
                    console.error('Error initializing Swagger UI:', error)
                }
            }
        }

        void loadSwaggerUI()

        return () => {
            console.log('DocsPage cleanup...')
            observer.disconnect()
        }
    }, [baseApiUrl])

    return (
        <div className="container mx-auto px-4 py-4">
            <div className="mb-4">
                <h1 className="text-3xl font-bold mb-2">Store CRUD API Documentation</h1>
                <p className="text-base-content/70 mb-4">
                    Interactive API documentation with live testing capabilities
                </p>
                <div className="bg-info/10 p-4 rounded-lg text-sm">
                    <strong>Authentication:</strong> Most endpoints require a Bearer token. Use the "Authorize" button below to add your token.
                </div>
            </div>

            <div
                id="swagger-ui"
                ref={swaggerUIRef}
                className="rounded-lg border border-base-300 min-h-[600px]"
            />

            <div className="mt-4 text-center text-sm text-base-content/70">
                <p>
                    Need a token? Get one from the{' '}
                    <a href="/dashboard/tokens" className="link link-primary">
                        Tokens page
                    </a>
                </p>
            </div>
        </div>
    )
}
