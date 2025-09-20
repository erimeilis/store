/**
 * Demo Page Handler
 * Handles the demo items page (moved from dashboard)
 */

import type { Context } from 'hono'
import { clientApiRequest } from '@/lib/client-api'

export async function handleDemoPage(c: Context) {
  try {
    // Get query parameters for pagination, filtering, sorting
    const url = new URL(c.req.url)
    const queryParams = url.search || ''

    // Make API request to get items data
    const apiUrl = c.env?.API_URL || 'http://localhost:8787'
    const accessToken = c.env?.ADMIN_ACCESS_TOKEN

    let itemsData = null
    let filters = {}

    if (accessToken) {
      try {
        const response = await fetch(`${apiUrl}/api/items${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          itemsData = await response.json()
        }
      } catch (error) {
        console.error('Failed to fetch items for demo page:', error)
      }
    }

    // Extract filters from query parameters for client-side state
    const params = new URLSearchParams(queryParams)
    if (params.get('sort')) {
      filters = {
        sort: params.get('sort'),
        direction: params.get('direction') || 'asc'
      }
    }

    // Get the page component
    const DemoPage = (await import('@/app/demo/page')).default

    return c.render(
      <DemoPage items={itemsData} filters={filters} />,
      {
        theme: c.get('theme')
      }
    )
  } catch (error) {
    console.error('Demo page error:', error)
    return c.redirect('/error?code=500&message=Failed to load demo page')
  }
}