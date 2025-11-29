/**
 * Help Page Handler
 */

import type { Context } from 'hono'
import type { Env, Variables } from '@/types/hono'
import { renderDashboardPage, buildPageProps } from '@/lib/handler-utils'

export async function handleHelpPage(c: Context<{ Bindings: Env; Variables: Variables }>) {
  const user = c.get('user')

  // Help page is static documentation content
  const helpProps = buildPageProps(user, c, {})

  return renderDashboardPage(c, '/dashboard/help', helpProps)
}
