/**
 * API Documentation Page Handler
 */

import type { Context } from 'hono'
import type { Env, Variables } from '@/types/hono'
import { renderDashboardPage, buildPageProps } from '@/lib/handler-utils'

export async function handleDocsPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')

  // API docs page doesn't need to fetch any API data
  // The page will be purely static with documentation content
  const docsProps = buildPageProps(user, c, {})

  return renderDashboardPage(c, '/dashboard/docs', docsProps)
}