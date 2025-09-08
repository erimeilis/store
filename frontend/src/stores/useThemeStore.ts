import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { idbStorage } from './idbStorage.js'

type Theme = 'dim' | 'nord'

interface ThemeStore {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
    initTheme: () => void
}

type PersistedThemeState = {
    theme: Theme
}

function isValidPersistedThemeState(state: unknown): state is Partial<PersistedThemeState> {
    return state !== null && typeof state === 'object'
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set, get) => ({
            theme: 'dim', // Default to dark theme

            setTheme: (theme: Theme) => {
                set({ theme })
                // Apply theme to both html and body immediately
                if (typeof document !== 'undefined') {
                    // Enable transitions for manual theme changes
                    document.documentElement.classList.add('theme-transitions-enabled')
                    document.documentElement.setAttribute('data-theme', theme)
                    document.body.setAttribute('data-theme', theme)
                    // Also set as cookie for server-side rendering
                    document.cookie = `theme=${theme}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
                }
            },

            toggleTheme: () => {
                const { theme, setTheme } = get()
                const newTheme = theme === 'nord' ? 'dim' : 'nord'
                setTheme(newTheme)
            },

            initTheme: () => {
                // Initialize theme on client-side only (without transitions during hydration)
                if (typeof document !== 'undefined') {
                    const { theme } = get()
                    document.documentElement.setAttribute('data-theme', theme)
                    document.body.setAttribute('data-theme', theme)
                    // Don't enable transitions here - already handled by the initial script
                }
            }
        }),
        {
            name: 'theme-storage',
            storage: idbStorage,
            version: 1,
            migrate: (persistedState: unknown, version: number): PersistedThemeState => {
                if (version === 1 && isValidPersistedThemeState(persistedState)) {
                    return {
                        theme: (persistedState.theme === 'dim' || persistedState.theme === 'nord') 
                            ? persistedState.theme 
                            : 'nord'
                    }
                }

                return {
                    theme: 'dim'
                }
            },
            partialize: (state: ThemeStore): PersistedThemeState => ({
                theme: state.theme,
            }),
        }
    )
)