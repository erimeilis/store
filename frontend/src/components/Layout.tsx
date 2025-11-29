import { jsx } from 'hono/jsx'

interface LayoutProps {
  children: any
  title?: string
}

export const Layout = ({ children, title = 'Store' }: LayoutProps) => (
  <html>
    <head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="stylesheet" href="/src/styles/globals.css" />
    </head>
    <body className="min-h-screen bg-base-200">
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          {children}
        </div>
      </div>
    </body>
  </html>
)
