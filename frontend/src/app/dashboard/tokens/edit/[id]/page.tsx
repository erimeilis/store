import React from 'react'
import {ModelEdit} from '@/components/model/model-edit'
import InputError from '@/components/ui/input-error'
import {clientApiRequest} from '@/lib/client-api'
import {TableSelector} from '@/components/ui/table-selector'
import {Input} from '@/components/ui/input'
import {Select} from '@/components/ui/select'
import {Textarea} from '@/components/ui/textarea'
import {Button} from '@/components/ui/button'
import {IconCopy, IconDownload} from '@tabler/icons-react'

// Token interface matching our Prisma schema
interface Token {
    id: string;
    token: string;
    name: string;
    permissions: string;
    allowedIps: string | null;
    allowedDomains: string | null;
    tableAccess: string[] | null; // Array of table IDs
    expiresAt: string | null;
    createdAt?: string;
    updatedAt?: string;
}

// Form rendering function for token editing
const renderTokenForm = (
    data: Token,
    setData: (key: string, value: any) => void,
    errors: Partial<Record<string, string>>,
    processing: boolean,
    readonly?: boolean,
    tables?: { data?: any[] } | null
) => {
    return (
        <div className="space-y-4">
            {/* Name Field */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Token Name *</span>
                </label>
                <Input
                    type="text"
                    color={errors?.name ? 'error' : 'default'}
                    className="w-full"
                    value={data.name || ''}
                    onChange={(e) => setData('name', e.target.value)}
                    disabled={processing || readonly}
                    placeholder="e.g., Production API Access, Development Token"
                    maxLength={100}
                    required
                />
                <InputError message={errors?.name}/>
                <div className="label">
          <span className="label-text-alt">
            Choose a descriptive name to identify this token's purpose.
          </span>
                    <div className="mt-2 text-xs text-base-content/70">
                        💡 <strong>Tip:</strong> Use names like "Production Read Access" or "Development API Token"
                    </div>
                </div>
            </div>

            {/* Permissions Field */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Permissions *</span>
                </label>
                <Select
                    color={errors?.permissions ? 'error' : 'default'}
                    className="w-full"
                    value={data.permissions || 'read'}
                    onChange={(e) => setData('permissions', e.target.value)}
                    disabled={processing || readonly}
                    required
                >
                    <option value="read">Read Only (ro)</option>
                    <option value="read,write">Read & Write (wr)</option>
                </Select>
                <InputError message={errors?.permissions}/>
                <label className="label">
                    <span className="label-text-alt">Choose the permission level for this token.</span>
                </label>
            </div>

            {/* Table Selection Field */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Accessible Tables *</span>
                </label>
                <TableSelector
                    tables={tables?.data || []}
                    selectedIds={Array.isArray(data.tableAccess) ? data.tableAccess : []}
                    onChange={(selectedIds) => setData('tableAccess', selectedIds)}
                    disabled={processing || readonly}
                    error={errors?.tableAccess}
                />
            </div>


            {/* Allowed IPs Field */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Allowed IP Addresses (Optional)</span>
                </label>
                <Textarea
                    color={errors?.allowedIps ? 'error' : 'default'}
                    className="w-full"
                    value={data.allowedIps || ''}
                    onChange={(e) => setData('allowedIps', e.target.value)}
                    disabled={processing || readonly}
                    placeholder='["192.168.1.0/24", "10.0.0.1"]'
                    rows={3}
                />
                <InputError message={errors?.allowedIps}/>
                <div className="label">
          <span className="label-text-alt">
            JSON array of allowed IP addresses or CIDR ranges.
            <span className="text-primary font-semibold"> Leave empty for no IP restrictions.</span>
          </span>
                    <div className="mt-2 text-xs text-base-content/70">
                        <div>Examples:</div>
                        <div className="font-mono mt-1">
                            <div>• Single IP: ["192.168.1.100"]</div>
                            <div>• CIDR range: ["192.168.1.0/24"]</div>
                            <div>• Multiple: ["10.0.0.1", "192.168.1.0/24"]</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expiry Date Field */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">Expires At (Optional)</span>
                </label>
                <Input
                    type="datetime-local"
                    color={errors?.expiresAt ? 'error' : 'default'}
                    className="w-full"
                    value={data.expiresAt ? data.expiresAt.slice(0, 16) : ''}
                    onChange={(e) => setData('expiresAt', e.target.value ? new Date(e.target.value).toISOString() : null)}
                    disabled={processing || readonly}
                    min={new Date().toISOString().slice(0, 16)}
                />
                <InputError message={errors?.expiresAt}/>
                <div className="label">
          <span className="label-text-alt">
            <span className="text-primary font-semibold">Leave empty for no expiration.</span>
            Set an expiration date to automatically disable the token.
          </span>
                    <div className="mt-2 text-xs text-base-content/70">
                        💡 <strong>Tip:</strong> Use expiration dates for temporary access tokens
                    </div>
                </div>
            </div>

            {/* Token Display (for editing existing tokens) */}
            {data.token && (
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text">Token Value</span>
                    </label>
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            className="w-full font-mono text-sm"
                            value={data.token}
                            disabled
                        />
                        <Button
                            type="button"
                            style="outline"
                            icon={IconCopy}
                            onClick={() => navigator.clipboard.writeText(data.token)}
                        >
                            Copy
                        </Button>
                    </div>
                    <label className="label">
                        <span className="label-text-alt text-warning">⚠️ Keep this token secure and do not share it publicly.</span>
                    </label>
                </div>
            )}
        </div>
    )
}

export default function EditTokenPage({
                                          tokenData,
                                          tokenId,
                                          tables,
                                          ...props
                                      }: {
    tokenData?: Token | null,
    tokenId?: string,
    tables?: { data?: any[] } | null
}) {
    console.log('EditTokenPage props:', {tokenData, tokenId, tables, props})

    const [token, setToken] = React.useState<Token | null>(tokenData || null)
    const [loading, setLoading] = React.useState(!tokenData)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        // If tokenData is already provided from the server, no need to fetch
        if (tokenData) {
            setToken(tokenData)
            setLoading(false)
            return
        }

        const fetchToken = async () => {
            if (!tokenId) {
                setError('Token ID is required')
                setLoading(false)
                return
            }

            try {
                const response = await clientApiRequest(`/api/tokens/${tokenId}`)

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Token not found')
                    } else {
                        setError('Failed to load token data')
                    }
                    setLoading(false)
                    return
                }

                const fetchedTokenData = await response.json() as Token
                setToken(fetchedTokenData)
                setLoading(false)
            } catch (err) {
                console.error('Error fetching token:', err)
                setError('Failed to load token data')
                setLoading(false)
            }
        }

        fetchToken()
    }, [tokenData, tokenId])

    if (loading) {
        return (
            <div className="px-4 py-6">
                <div className="alert alert-info">
                    <span>Loading token data...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="px-4 py-6">
                <div className="alert alert-error">
                    <span>{error}</span>
                </div>
            </div>
        )
    }

    if (!token) {
        return (
            <div className="px-4 py-6">
                <div className="alert alert-error">
                    <span>Token not found</span>
                </div>
            </div>
        )
    }

    // Handle case where tables prop is not provided
    if (!tables?.data) {
        console.warn('Tables data not provided to EditTokenPage')
    }

    const handleDownloadPostman = async () => {
        try {
            const response = await clientApiRequest(`/api/tokens/${token.id}/postman`)

            if (!response.ok) {
                console.error('Failed to download Postman collection')
                return
            }

            const collection = await response.json()

            // Create blob and download
            const blob = new Blob([JSON.stringify(collection, null, 2)], {type: 'application/json'})
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${token.name.replace(/[^a-z0-9]/gi, '_')}_collection.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error downloading Postman collection:', error)
        }
    }

    return (
        <ModelEdit<Token>
            title="API Token"
            item={token}
            backRoute="/dashboard/tokens"
            submitRoute={`/api/tokens/${token.id}`}
            method="put"
            renderForm={(data, setData, errors, processing, readonly) =>
                renderTokenForm(data, setData, errors, processing, readonly, tables)
            }
            additionalActions={
                <Button
                    type="button"
                    style="soft"
                    color="primary"
                    icon={IconDownload}
                    onClick={handleDownloadPostman}
                >
                    Download Postman Collection
                </Button>
            }
        />
    )
}
