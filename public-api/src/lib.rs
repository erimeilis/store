use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wasm_bindgen::JsValue;
use worker::*;

mod utils;

// ============================================================================
// CACHE KEYS AND CONSTANTS
// ============================================================================

const CACHE_KEY_PUBLIC_TABLES: &str = "public:tables:all";
const CACHE_TTL_QUERY_RESULTS: u64 = 60; // 60 seconds for query results
const CACHE_TTL_PUBLIC_TABLES: u64 = 300; // 5 minutes for public tables list

// ============================================================================
// DATA STRUCTURES
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
struct TableRow {
    id: String,
    #[serde(rename = "tableId")]
    table_id: String,
    data: String,
    #[serde(rename = "createdAt")]
    created_at: Option<String>,
    #[serde(rename = "updatedAt")]
    updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct TableRecord {
    id: String,
    #[serde(rename = "tableId")]
    table_id: String,
    #[serde(rename = "tableName")]
    table_name: String,
    #[serde(rename = "tableType")]
    table_type: String,
    #[serde(flatten)]
    data: serde_json::Value,
    #[serde(rename = "createdAt", skip_serializing_if = "Option::is_none")]
    created_at: Option<String>,
    #[serde(rename = "updatedAt", skip_serializing_if = "Option::is_none")]
    updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct PublicTable {
    id: String,
    name: String,
    description: Option<String>,
    #[serde(rename = "tableType")]
    table_type: String,
    #[serde(rename = "rowCount")]
    row_count: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct TableColumn {
    id: String,
    name: String,
    #[serde(rename = "columnType")]
    column_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct TokenInfo {
    id: String,
    #[serde(rename = "tableAccess")]
    table_access: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ApiResponse<T> {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct TablesResponse {
    tables: Vec<PublicTable>,
    count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
struct RecordsResponse {
    records: Vec<serde_json::Value>,
    count: usize,
    total: i64,
    pagination: PaginationInfo,
    #[serde(skip_serializing_if = "Option::is_none")]
    filters: Option<HashMap<String, String>>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ItemsResponse {
    items: Vec<serde_json::Value>,
    #[serde(rename = "tableId")]
    table_id: String,
    #[serde(rename = "tableName")]
    table_name: String,
    #[serde(rename = "tableType")]
    table_type: String,
    count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
struct ValuesResponse {
    column: String,
    values: Vec<serde_json::Value>,
    count: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    filters: Option<HashMap<String, String>>,
    #[serde(rename = "tablesSampled")]
    tables_sampled: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct SearchResponse {
    tables: Vec<PublicTable>,
    count: usize,
    #[serde(rename = "searchedColumns")]
    searched_columns: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct PaginationInfo {
    total: i64,
    page: u32,
    limit: u32,
    #[serde(rename = "hasMore")]
    has_more: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct AvailabilityResponse {
    available: bool,
    #[serde(rename = "availableQty")]
    available_qty: i64,
    #[serde(rename = "requestedQty")]
    requested_qty: u32,
}

/// Cached query results structure
#[derive(Debug, Serialize, Deserialize)]
struct QueryResultsCache {
    records: Vec<serde_json::Value>,
    total: i64,
    #[serde(rename = "cachedAt")]
    cached_at: u64,
}

/// Cached public tables structure (for unrestricted tokens)
#[derive(Debug, Serialize, Deserialize, Clone)]
struct CachedPublicTable {
    id: String,
    name: String,
    description: Option<String>,
    #[serde(rename = "tableType")]
    table_type: String,
    #[serde(rename = "rowCount")]
    row_count: i64,
}

/// Cached public tables list with timestamp
#[derive(Debug, Serialize, Deserialize)]
struct PublicTablesCache {
    tables: Vec<CachedPublicTable>,
    #[serde(rename = "cachedAt")]
    cached_at: u64,
}

/// Cached token info for auth caching
#[derive(Debug, Serialize, Deserialize, Clone)]
struct CachedTokenInfo {
    id: String,
    #[serde(rename = "tableAccess")]
    table_access: Option<String>,
    #[serde(rename = "cachedAt")]
    cached_at: u64,
}

// ============================================================================
// HELPERS
// ============================================================================

fn cors_headers() -> Headers {
    let headers = Headers::new();
    let _ = headers.set("Access-Control-Allow-Origin", "*");
    let _ = headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    let _ = headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    let _ = headers.set("Content-Type", "application/json");
    let _ = headers.set("X-Worker", "rust");
    headers
}

fn json_response<T: Serialize>(data: T, status: u16) -> Result<Response> {
    let body = serde_json::to_string(&data)?;
    let mut response = Response::ok(body)?;
    *response.headers_mut() = cors_headers();
    Ok(response.with_status(status))
}

fn error_response(message: &str, status: u16) -> Result<Response> {
    let response = ApiResponse::<()> {
        success: false,
        data: None,
        error: Some(message.to_string()),
    };
    json_response(response, status)
}

/// Flatten a data JSON string into a Value with fields at top level
fn flatten_record(
    row_id: &str,
    table_id: &str,
    table_name: &str,
    table_type: &str,
    data_str: &str,
    created_at: Option<&str>,
    updated_at: Option<&str>,
) -> serde_json::Value {
    let data: serde_json::Value = serde_json::from_str(data_str).unwrap_or(serde_json::json!({}));

    let mut flat = serde_json::Map::new();
    flat.insert("id".to_string(), serde_json::json!(row_id));
    flat.insert("tableId".to_string(), serde_json::json!(table_id));
    flat.insert("tableName".to_string(), serde_json::json!(table_name));
    flat.insert("tableType".to_string(), serde_json::json!(table_type));

    // Flatten data fields to top level
    if let serde_json::Value::Object(obj) = data {
        for (key, value) in obj {
            flat.insert(key, value);
        }
    }

    if let Some(ca) = created_at {
        flat.insert("createdAt".to_string(), serde_json::json!(ca));
    }
    if let Some(ua) = updated_at {
        flat.insert("updatedAt".to_string(), serde_json::json!(ua));
    }

    serde_json::Value::Object(flat)
}

/// Parse query params into HashMap
fn parse_query_params(url: &Url) -> HashMap<String, String> {
    url.query_pairs()
        .map(|(k, v)| (k.to_string(), v.to_string()))
        .collect()
}

/// Extract where conditions from query params (where[col]=value format)
fn extract_where_conditions(query: &HashMap<String, String>) -> HashMap<String, String> {
    let mut conditions = HashMap::new();
    for (key, value) in query {
        if let Some(col) = key.strip_prefix("where[").and_then(|s| s.strip_suffix("]")) {
            conditions.insert(col.to_string(), value.clone());
        }
    }
    conditions
}

/// Get current timestamp in seconds (WASM-compatible using js_sys::Date)
fn current_timestamp() -> u64 {
    // js_sys::Date::now() returns milliseconds since UNIX epoch
    (js_sys::Date::now() / 1000.0) as u64
}

/// DJB2 hash function for generating short cache keys (matching TypeScript implementation)
fn djb2_hash(s: &str) -> u32 {
    let mut hash: u32 = 5381;
    for c in s.bytes() {
        hash = hash.wrapping_mul(33).wrapping_add(c as u32);
    }
    hash
}

/// Generate a short cache key hash from input string
fn short_hash(s: &str) -> String {
    format!("{:x}", djb2_hash(s))
}

// ============================================================================
// CACHE HELPERS
// ============================================================================

/// Get token from KV cache
async fn cache_get_token(kv: &kv::KvStore, token_string: &str) -> Option<CachedTokenInfo> {
    let cache_key = format!("auth:token:{}", token_string);
    match kv.get(&cache_key).json::<CachedTokenInfo>().await {
        Ok(Some(cached)) => Some(cached),
        _ => None,
    }
}

/// Store token in KV cache (no TTL - tokens are invalidated explicitly)
async fn cache_set_token(kv: &kv::KvStore, token_string: &str, token_info: &TokenInfo) {
    let cache_key = format!("auth:token:{}", token_string);
    let cached = CachedTokenInfo {
        id: token_info.id.clone(),
        table_access: token_info.table_access.clone(),
        cached_at: current_timestamp(),
    };
    if let Ok(json) = serde_json::to_string(&cached) {
        // No expiration - tokens are cached indefinitely until invalidated
        if let Ok(builder) = kv.put(&cache_key, json) {
            let _ = builder.execute().await;
        }
    }
}

/// Get public tables list from KV cache
async fn cache_get_public_tables(kv: &kv::KvStore) -> Option<Vec<CachedPublicTable>> {
    match kv.get(CACHE_KEY_PUBLIC_TABLES).json::<PublicTablesCache>().await {
        Ok(Some(cached)) => {
            // Check TTL
            let now = current_timestamp();
            if now - cached.cached_at < CACHE_TTL_PUBLIC_TABLES {
                Some(cached.tables)
            } else {
                None // Expired
            }
        }
        _ => None,
    }
}

/// Store public tables list in KV cache
async fn cache_set_public_tables(kv: &kv::KvStore, tables: &[PublicTable]) {
    let cached_tables: Vec<CachedPublicTable> = tables.iter().map(|t| CachedPublicTable {
        id: t.id.clone(),
        name: t.name.clone(),
        description: t.description.clone(),
        table_type: t.table_type.clone(),
        row_count: t.row_count,
    }).collect();

    let cached = PublicTablesCache {
        tables: cached_tables,
        cached_at: current_timestamp(),
    };

    if let Ok(json) = serde_json::to_string(&cached) {
        if let Ok(builder) = kv.put(CACHE_KEY_PUBLIC_TABLES, json) {
            let _ = builder
                .expiration_ttl(CACHE_TTL_PUBLIC_TABLES)
                .execute()
                .await;
        }
    }
}

/// Get query results from KV cache
async fn cache_get_query_results(
    kv: &kv::KvStore,
    table_ids: &[String],
    where_conditions: &HashMap<String, String>,
    limit: u32,
    offset: u32,
) -> Option<QueryResultsCache> {
    // Generate cache key from query params (matching TypeScript pattern)
    let table_hash = short_hash(&table_ids.join(","));
    let where_hash = if where_conditions.is_empty() {
        "none".to_string()
    } else {
        let mut where_parts: Vec<String> = where_conditions
            .iter()
            .map(|(k, v)| format!("{}={}", k, v))
            .collect();
        where_parts.sort();
        short_hash(&where_parts.join("&"))
    };

    let cache_key = format!("query:{}:{}:{}:{}", table_hash, where_hash, limit, offset);

    match kv.get(&cache_key).json::<QueryResultsCache>().await {
        Ok(Some(cached)) => {
            // Check TTL
            let now = current_timestamp();
            if now - cached.cached_at < CACHE_TTL_QUERY_RESULTS {
                Some(cached)
            } else {
                None // Expired
            }
        }
        _ => None,
    }
}

/// Store query results in KV cache
async fn cache_set_query_results(
    kv: &kv::KvStore,
    table_ids: &[String],
    where_conditions: &HashMap<String, String>,
    limit: u32,
    offset: u32,
    records: &[serde_json::Value],
    total: i64,
) {
    let table_hash = short_hash(&table_ids.join(","));
    let where_hash = if where_conditions.is_empty() {
        "none".to_string()
    } else {
        let mut where_parts: Vec<String> = where_conditions
            .iter()
            .map(|(k, v)| format!("{}={}", k, v))
            .collect();
        where_parts.sort();
        short_hash(&where_parts.join("&"))
    };

    let cache_key = format!("query:{}:{}:{}:{}", table_hash, where_hash, limit, offset);

    let cached = QueryResultsCache {
        records: records.to_vec(),
        total,
        cached_at: current_timestamp(),
    };

    if let Ok(json) = serde_json::to_string(&cached) {
        if let Ok(builder) = kv.put(&cache_key, json) {
            let _ = builder
                .expiration_ttl(CACHE_TTL_QUERY_RESULTS)
                .execute()
                .await;
        }
    }
}

// ============================================================================
// PROXY HELPER
// ============================================================================

/// Proxy a request to the TypeScript API worker via service binding
async fn proxy_to_api(mut req: Request, env: &Env) -> Result<Response> {
    // Get service binding
    let api = match env.service("API") {
        Ok(s) => s,
        Err(e) => {
            console_error!("Service binding error: {:?}", e);
            return error_response("Service binding not available", 503);
        }
    };

    // Clone the original request to forward it
    let url = req.url()?;
    let method = req.method();
    let headers = req.headers().clone();

    // For POST requests, get the body as text (JSON)
    let body_text = req.text().await?;

    // Create a new request with the same properties
    let mut init = RequestInit::new();
    init.with_method(method);
    init.with_headers(headers);

    // Set body if present
    if !body_text.is_empty() {
        init.with_body(Some(JsValue::from_str(&body_text)));
    }

    let proxy_req = Request::new_with_init(url.as_str(), &init)?;

    // Forward to TypeScript API
    match api.fetch_request(proxy_req).await {
        Ok(response) => Ok(response),
        Err(e) => {
            console_error!("Proxy fetch error: {:?}", e);
            error_response(&format!("Proxy error: {:?}", e), 502)
        }
    }
}

// ============================================================================
// AUTH
// ============================================================================

async fn validate_token(req: &Request, env: &Env) -> Result<Option<TokenInfo>> {
    let auth_header = req.headers().get("Authorization")?;

    let token_string = match auth_header {
        Some(header) => {
            if header.starts_with("Bearer ") {
                header[7..].to_string()
            } else {
                return Ok(None);
            }
        }
        None => return Ok(None),
    };

    // Check KV cache first
    let kv = env.kv("KV")?;
    if let Some(cached) = cache_get_token(&kv, &token_string).await {
        return Ok(Some(TokenInfo {
            id: cached.id,
            table_access: cached.table_access,
        }));
    }

    // Cache miss - check D1 database for token
    let db = env.d1("DB")?;
    let stmt = db.prepare(
        "SELECT id, tableAccess FROM tokens WHERE token = ? AND (expiresAt IS NULL OR expiresAt = 'null' OR expiresAt > datetime('now'))"
    );
    let result = stmt.bind(&[token_string.clone().into()])?.first::<TokenInfo>(None).await?;

    // Cache valid tokens
    if let Some(ref token_info) = result {
        cache_set_token(&kv, &token_string, token_info).await;
    }

    Ok(result)
}

/// Get allowed table IDs from token
fn get_allowed_table_ids(token: &TokenInfo) -> Option<Vec<String>> {
    // Admin and frontend tokens have unrestricted access
    if token.id == "admin-token" || token.id == "frontend-token" {
        return None; // null means unrestricted
    }

    // Parse tableAccess JSON array
    if let Some(ref access_str) = token.table_access {
        if let Ok(ids) = serde_json::from_str::<Vec<String>>(access_str) {
            return Some(ids);
        }
    }

    // No access defined - empty array
    Some(vec![])
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/// GET /api/public/tables - List all accessible public tables
async fn get_tables(env: &Env, token: &TokenInfo) -> Result<Response> {
    let db = env.d1("DB")?;
    let kv = env.kv("KV")?;
    let allowed = get_allowed_table_ids(token);

    let tables: Vec<PublicTable> = if let Some(ref ids) = allowed {
        if ids.is_empty() {
            vec![]
        } else {
            // Token has specific table access - no caching for restricted tokens
            let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
            let sql = format!(
                "SELECT ut.id, ut.name, ut.description, ut.tableType,
                        (SELECT COUNT(*) FROM tableData WHERE tableId = ut.id) as rowCount
                 FROM userTables ut
                 WHERE ut.id IN ({})
                   AND ut.tableType IN ('sale', 'rent')
                 ORDER BY ut.name ASC",
                placeholders
            );
            let mut stmt = db.prepare(&sql);
            let bindings: Vec<JsValue> = ids.iter().map(|id| id.clone().into()).collect();
            stmt = stmt.bind(&bindings)?;
            stmt.all().await?.results()?
        }
    } else {
        // Unrestricted access - check KV cache first
        if let Some(cached) = cache_get_public_tables(&kv).await {
            // Convert cached tables to PublicTable
            return json_response(TablesResponse {
                count: cached.len(),
                tables: cached.into_iter().map(|t| PublicTable {
                    id: t.id,
                    name: t.name,
                    description: t.description,
                    table_type: t.table_type,
                    row_count: t.row_count,
                }).collect(),
            }, 200);
        }

        // Cache miss - query database
        let stmt = db.prepare(
            "SELECT ut.id, ut.name, ut.description, ut.tableType,
                    (SELECT COUNT(*) FROM tableData WHERE tableId = ut.id) as rowCount
             FROM userTables ut
             WHERE ut.visibility IN ('public', 'shared')
               AND ut.tableType IN ('sale', 'rent')
             ORDER BY ut.name ASC"
        );
        let result: Vec<PublicTable> = stmt.all().await?.results()?;

        // Cache the results
        cache_set_public_tables(&kv, &result).await;

        result
    };

    json_response(TablesResponse {
        count: tables.len(),
        tables,
    }, 200)
}

/// GET /api/public/tables/search?columns=col1,col2 - Search tables by column presence
async fn search_tables(env: &Env, token: &TokenInfo, query: &HashMap<String, String>) -> Result<Response> {
    let columns_param = query.get("columns").map(|s| s.as_str()).unwrap_or("");
    let search_columns: Vec<&str> = columns_param.split(',').map(|s| s.trim()).filter(|s| !s.is_empty()).collect();

    if search_columns.is_empty() {
        return error_response("columns parameter is required", 400);
    }

    let db = env.d1("DB")?;
    let allowed = get_allowed_table_ids(token);

    // Get all accessible tables first
    let all_tables: Vec<PublicTable> = if let Some(ref ids) = allowed {
        if ids.is_empty() {
            vec![]
        } else {
            let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
            let sql = format!(
                "SELECT ut.id, ut.name, ut.description, ut.tableType,
                        (SELECT COUNT(*) FROM tableData WHERE tableId = ut.id) as rowCount
                 FROM userTables ut
                 WHERE ut.id IN ({}) AND ut.tableType IN ('sale', 'rent')",
                placeholders
            );
            let mut stmt = db.prepare(&sql);
            let bindings: Vec<JsValue> = ids.iter().map(|id| id.clone().into()).collect();
            stmt = stmt.bind(&bindings)?;
            stmt.all().await?.results()?
        }
    } else {
        let stmt = db.prepare(
            "SELECT ut.id, ut.name, ut.description, ut.tableType,
                    (SELECT COUNT(*) FROM tableData WHERE tableId = ut.id) as rowCount
             FROM userTables ut
             WHERE ut.visibility IN ('public', 'shared') AND ut.tableType IN ('sale', 'rent')"
        );
        stmt.all().await?.results()?
    };

    // Filter tables that have ALL requested columns
    #[derive(Debug, Deserialize)]
    struct ColumnName {
        name: String,
    }

    let mut matching_tables = vec![];
    for table in all_tables {
        let col_stmt = db.prepare("SELECT name FROM tableColumns WHERE tableId = ?");
        let cols: Vec<ColumnName> = col_stmt.bind(&[table.id.clone().into()])?.all().await?.results()?;
        let col_names: Vec<String> = cols.iter().map(|c| c.name.to_lowercase()).collect();

        let has_all = search_columns.iter().all(|sc| col_names.contains(&sc.to_lowercase()));
        if has_all {
            matching_tables.push(table);
        }
    }

    json_response(SearchResponse {
        count: matching_tables.len(),
        tables: matching_tables,
        searched_columns: search_columns.iter().map(|s| s.to_string()).collect(),
    }, 200)
}

/// GET /api/public/tables/:tableId/items - Get items from a specific table
async fn get_table_items(env: &Env, token: &TokenInfo, table_id: &str, query: &HashMap<String, String>) -> Result<Response> {
    let db = env.d1("DB")?;
    let flat_mode = query.get("flat").map(|s| s == "true").unwrap_or(false);

    // Get table info and verify access
    let table_stmt = db.prepare(
        "SELECT id, name, tableType, visibility FROM userTables WHERE id = ?"
    );

    #[derive(Debug, Deserialize)]
    struct TableInfo {
        id: String,
        name: String,
        #[serde(rename = "tableType")]
        table_type: String,
        visibility: String,
    }

    let table: Option<TableInfo> = table_stmt.bind(&[table_id.into()])?.first(None).await?;

    let table = match table {
        Some(t) => t,
        None => return error_response("Table not found", 404),
    };

    // Check access
    let allowed = get_allowed_table_ids(token);
    let has_access = match allowed {
        None => table.visibility == "public" || table.visibility == "shared",
        Some(ref ids) => ids.contains(&table.id),
    };

    if !has_access {
        return error_response("Table is not accessible with this token", 403);
    }

    if table.table_type != "sale" && table.table_type != "rent" {
        return error_response("This endpoint only supports sale and rent tables", 403);
    }

    // Get items
    let data_stmt = db.prepare(
        "SELECT id, tableId, data, createdAt, updatedAt FROM tableData WHERE tableId = ? ORDER BY createdAt DESC"
    );
    let rows: Vec<TableRow> = data_stmt.bind(&[table_id.into()])?.all().await?.results()?;

    let items: Vec<serde_json::Value> = if flat_mode {
        rows.iter().map(|row| {
            flatten_record(
                &row.id, &row.table_id, &table.name, &table.table_type,
                &row.data, row.created_at.as_deref(), row.updated_at.as_deref()
            )
        }).collect()
    } else {
        rows.iter().map(|row| {
            let data: serde_json::Value = serde_json::from_str(&row.data).unwrap_or(serde_json::json!({}));
            serde_json::json!({
                "id": row.id,
                "data": data,
                "createdAt": row.created_at,
                "updatedAt": row.updated_at
            })
        }).collect()
    };

    json_response(ItemsResponse {
        count: items.len(),
        items,
        table_id: table.id,
        table_name: table.name,
        table_type: table.table_type,
    }, 200)
}

/// GET /api/public/tables/:tableId/items/:itemId - Get single item
async fn get_table_item(env: &Env, token: &TokenInfo, table_id: &str, item_id: &str) -> Result<Response> {
    let db = env.d1("DB")?;

    // Verify table access first
    let table_stmt = db.prepare(
        "SELECT id, name, tableType, visibility FROM userTables WHERE id = ?"
    );

    #[derive(Debug, Deserialize)]
    struct TableInfo {
        id: String,
        name: String,
        #[serde(rename = "tableType")]
        table_type: String,
        visibility: String,
    }

    let table: Option<TableInfo> = table_stmt.bind(&[table_id.into()])?.first(None).await?;
    let table = match table {
        Some(t) => t,
        None => return error_response("Table not found", 404),
    };

    // Check access
    let allowed = get_allowed_table_ids(token);
    let has_access = match allowed {
        None => table.visibility == "public" || table.visibility == "shared",
        Some(ref ids) => ids.contains(&table.id),
    };

    if !has_access {
        return error_response("Table is not accessible with this token", 403);
    }

    // Get item
    let item_stmt = db.prepare(
        "SELECT id, tableId, data, createdAt, updatedAt FROM tableData WHERE id = ? AND tableId = ?"
    );
    let row: Option<TableRow> = item_stmt.bind(&[item_id.into(), table_id.into()])?.first(None).await?;

    match row {
        Some(row) => {
            let item = flatten_record(
                &row.id, &row.table_id, &table.name, &table.table_type,
                &row.data, row.created_at.as_deref(), row.updated_at.as_deref()
            );
            json_response(item, 200)
        }
        None => error_response("Item not found", 404),
    }
}

/// GET /api/public/tables/:tableId/items/:itemId/availability - Check item availability
async fn get_item_availability(env: &Env, token: &TokenInfo, table_id: &str, item_id: &str, query: &HashMap<String, String>) -> Result<Response> {
    let quantity: u32 = query.get("quantity").and_then(|q| q.parse().ok()).unwrap_or(1);
    let db = env.d1("DB")?;

    // Verify table access
    let table_stmt = db.prepare("SELECT id, tableType, visibility FROM userTables WHERE id = ?");

    #[derive(Debug, Deserialize)]
    struct TableInfo {
        id: String,
        #[serde(rename = "tableType")]
        table_type: String,
        visibility: String,
    }

    let table: Option<TableInfo> = table_stmt.bind(&[table_id.into()])?.first(None).await?;
    let table = match table {
        Some(t) => t,
        None => return error_response("Table not found", 404),
    };

    let allowed = get_allowed_table_ids(token);
    let has_access = match allowed {
        None => table.visibility == "public" || table.visibility == "shared",
        Some(ref ids) => ids.contains(&table.id),
    };

    if !has_access {
        return error_response("Table is not accessible with this token", 403);
    }

    // Get item data
    let item_stmt = db.prepare("SELECT data FROM tableData WHERE id = ? AND tableId = ?");

    #[derive(Debug, Deserialize)]
    struct ItemData {
        data: String,
    }

    let item: Option<ItemData> = item_stmt.bind(&[item_id.into(), table_id.into()])?.first(None).await?;
    let item = match item {
        Some(i) => i,
        None => return error_response("Item not found", 404),
    };

    let data: serde_json::Value = serde_json::from_str(&item.data).unwrap_or(serde_json::json!({}));

    // Calculate availability based on table type
    let available_qty: i64 = if table.table_type == "sale" {
        data.get("qty").and_then(|v| v.as_i64()).unwrap_or(0)
    } else {
        // rent type - check if not currently rented
        let used = data.get("used").and_then(|v| v.as_bool()).unwrap_or(false);
        if used { 0 } else { 1 }
    };

    json_response(AvailabilityResponse {
        available: available_qty >= quantity as i64,
        available_qty,
        requested_qty: quantity,
    }, 200)
}

/// GET /api/public/records - Get records with filtering across all accessible tables
async fn get_records(env: &Env, token: &TokenInfo, query: &HashMap<String, String>) -> Result<Response> {
    let db = env.d1("DB")?;
    let kv = env.kv("KV")?;
    let where_conditions = extract_where_conditions(query);
    let limit: u32 = query.get("limit").and_then(|l| l.parse().ok()).unwrap_or(100).min(1000);
    let offset: u32 = query.get("offset").and_then(|o| o.parse().ok()).unwrap_or(0);
    let columns_param = query.get("columns");

    let allowed = get_allowed_table_ids(token);

    // Get accessible tables
    #[derive(Debug, Deserialize, Clone)]
    struct TableInfo {
        id: String,
        name: String,
        #[serde(rename = "tableType")]
        table_type: String,
    }

    let tables: Vec<TableInfo> = if let Some(ref ids) = allowed {
        if ids.is_empty() {
            vec![]
        } else {
            let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
            let sql = format!(
                "SELECT id, name, tableType FROM userTables WHERE id IN ({}) AND tableType IN ('sale', 'rent')",
                placeholders
            );
            let mut stmt = db.prepare(&sql);
            let bindings: Vec<JsValue> = ids.iter().map(|id| id.clone().into()).collect();
            stmt = stmt.bind(&bindings)?;
            stmt.all().await?.results()?
        }
    } else {
        let stmt = db.prepare(
            "SELECT id, name, tableType FROM userTables WHERE visibility IN ('public', 'shared') AND tableType IN ('sale', 'rent')"
        );
        stmt.all().await?.results()?
    };

    if tables.is_empty() {
        return json_response(RecordsResponse {
            records: vec![],
            count: 0,
            total: 0,
            pagination: PaginationInfo { total: 0, page: 1, limit, has_more: false },
            filters: if where_conditions.is_empty() { None } else { Some(where_conditions) },
        }, 200);
    }

    let table_ids: Vec<String> = tables.iter().map(|t| t.id.clone()).collect();
    let table_map: HashMap<String, TableInfo> = tables.into_iter().map(|t| (t.id.clone(), t)).collect();

    // Check KV cache for query results (only for unrestricted tokens without column filtering)
    let can_use_cache = allowed.is_none() && columns_param.is_none();
    if can_use_cache {
        if let Some(cached) = cache_get_query_results(&kv, &table_ids, &where_conditions, limit, offset).await {
            let page = (offset / limit) + 1;
            return json_response(RecordsResponse {
                count: cached.records.len(),
                records: cached.records,
                total: cached.total,
                pagination: PaginationInfo {
                    total: cached.total,
                    page,
                    limit,
                    has_more: (offset + limit) < cached.total as u32,
                },
                filters: if where_conditions.is_empty() { None } else { Some(where_conditions) },
            }, 200);
        }
    }

    // Build SQL with where conditions
    let placeholders = table_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let mut sql = format!(
        "SELECT id, tableId, data, createdAt, updatedAt FROM tableData WHERE tableId IN ({})",
        placeholders
    );
    let mut bindings: Vec<JsValue> = table_ids.iter().map(|id| id.clone().into()).collect();

    for (col, val) in &where_conditions {
        sql.push_str(&format!(" AND LOWER(json_extract(data, '$.{}')) = LOWER(?)", col));
        bindings.push(val.clone().into());
    }

    // Count total
    let count_sql = sql.replace("SELECT id, tableId, data, createdAt, updatedAt", "SELECT COUNT(*) as cnt");
    let count_stmt = db.prepare(&count_sql).bind(&bindings)?;

    #[derive(Debug, Deserialize)]
    struct CountResult { cnt: i64 }
    let count_result: Option<CountResult> = count_stmt.first(None).await?;
    let total = count_result.map(|c| c.cnt).unwrap_or(0);

    // Get paginated results - use inline values for limit/offset (D1 doesn't like bigint bindings)
    sql.push_str(&format!(" ORDER BY updatedAt DESC LIMIT {} OFFSET {}", limit, offset));

    let data_stmt = db.prepare(&sql).bind(&bindings)?;
    let rows: Vec<TableRow> = data_stmt.all().await?.results()?;

    // Flatten records
    let mut records: Vec<serde_json::Value> = rows.iter().map(|row| {
        let table_info = table_map.get(&row.table_id);
        let (name, ttype) = table_info.map(|t| (t.name.as_str(), t.table_type.as_str())).unwrap_or(("Unknown", "unknown"));
        flatten_record(
            &row.id, &row.table_id, name, ttype,
            &row.data, row.created_at.as_deref(), row.updated_at.as_deref()
        )
    }).collect();

    // Cache results before column filtering (for unrestricted tokens)
    if can_use_cache {
        cache_set_query_results(&kv, &table_ids, &where_conditions, limit, offset, &records, total).await;
    }

    // Filter columns if specified
    if let Some(cols) = columns_param {
        let include_cols: Vec<&str> = cols.split(',').map(|s| s.trim()).collect();
        records = records.into_iter().map(|mut rec| {
            if let serde_json::Value::Object(ref mut obj) = rec {
                let keys_to_remove: Vec<String> = obj.keys()
                    .filter(|k| {
                        !matches!(k.as_str(), "id" | "tableId" | "tableName" | "tableType")
                            && !include_cols.contains(&k.as_str())
                    })
                    .cloned()
                    .collect();
                for key in keys_to_remove {
                    obj.remove(&key);
                }
            }
            rec
        }).collect();
    }

    let page = (offset / limit) + 1;
    json_response(RecordsResponse {
        count: records.len(),
        records,
        total,
        pagination: PaginationInfo {
            total,
            page,
            limit,
            has_more: (offset + limit) < total as u32,
        },
        filters: if where_conditions.is_empty() { None } else { Some(where_conditions) },
    }, 200)
}

/// GET /api/public/values/:columnName - Get distinct values for a column
async fn get_values(env: &Env, token: &TokenInfo, column_name: &str, query: &HashMap<String, String>) -> Result<Response> {
    let db = env.d1("DB")?;
    let where_conditions = extract_where_conditions(query);
    let allowed = get_allowed_table_ids(token);

    // Get accessible tables
    #[derive(Debug, Deserialize)]
    struct TableInfo {
        id: String,
        name: String,
    }

    let tables: Vec<TableInfo> = if let Some(ref ids) = allowed {
        if ids.is_empty() {
            vec![]
        } else {
            let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
            let sql = format!(
                "SELECT id, name FROM userTables WHERE id IN ({}) AND tableType IN ('sale', 'rent')",
                placeholders
            );
            let mut stmt = db.prepare(&sql);
            let bindings: Vec<JsValue> = ids.iter().map(|id| id.clone().into()).collect();
            stmt = stmt.bind(&bindings)?;
            stmt.all().await?.results()?
        }
    } else {
        let stmt = db.prepare(
            "SELECT id, name FROM userTables WHERE visibility IN ('public', 'shared') AND tableType IN ('sale', 'rent')"
        );
        stmt.all().await?.results()?
    };

    if tables.is_empty() {
        return json_response(ValuesResponse {
            column: column_name.to_string(),
            values: vec![],
            count: 0,
            filters: if where_conditions.is_empty() { None } else { Some(where_conditions) },
            tables_sampled: vec![],
        }, 200);
    }

    // Filter tables that have the requested column
    let mut eligible_tables = vec![];
    for table in &tables {
        let col_stmt = db.prepare("SELECT name FROM tableColumns WHERE tableId = ? AND LOWER(name) = LOWER(?)");

        #[derive(Debug, Deserialize)]
        struct ColName { name: String }

        let col: Option<ColName> = col_stmt.bind(&[table.id.clone().into(), column_name.into()])?.first(None).await?;
        if col.is_some() {
            eligible_tables.push(table);
        }
    }

    if eligible_tables.is_empty() {
        return json_response(ValuesResponse {
            column: column_name.to_string(),
            values: vec![],
            count: 0,
            filters: if where_conditions.is_empty() { None } else { Some(where_conditions) },
            tables_sampled: vec![],
        }, 200);
    }

    let table_ids: Vec<String> = eligible_tables.iter().map(|t| t.id.clone()).collect();
    let tables_sampled: Vec<String> = eligible_tables.iter().map(|t| t.name.clone()).collect();

    // Get distinct values
    let placeholders = table_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let mut sql = format!(
        "SELECT DISTINCT json_extract(data, '$.{}') as val FROM tableData WHERE tableId IN ({}) AND json_extract(data, '$.{}') IS NOT NULL",
        column_name, placeholders, column_name
    );
    let mut bindings: Vec<JsValue> = table_ids.iter().map(|id| id.clone().into()).collect();

    for (col, val) in &where_conditions {
        sql.push_str(&format!(" AND LOWER(json_extract(data, '$.{}')) = LOWER(?)", col));
        bindings.push(val.clone().into());
    }

    let stmt = db.prepare(&sql).bind(&bindings)?;

    #[derive(Debug, Deserialize)]
    struct ValueRow { val: serde_json::Value }

    let rows: Vec<ValueRow> = stmt.all().await?.results()?;
    let values: Vec<serde_json::Value> = rows.into_iter().map(|r| r.val).collect();

    json_response(ValuesResponse {
        column: column_name.to_string(),
        count: values.len(),
        values,
        filters: if where_conditions.is_empty() { None } else { Some(where_conditions) },
        tables_sampled,
    }, 200)
}

// ============================================================================
// MAIN ROUTER
// ============================================================================

#[event(fetch)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    utils::set_panic_hook();

    let url = req.url()?;
    let path = url.path();
    let method = req.method();

    // Handle CORS preflight
    if method == Method::Options {
        let mut response = Response::ok("")?;
        *response.headers_mut() = cors_headers();
        return Ok(response);
    }

    // Health check endpoint (no auth required)
    if path == "/health" || path == "/api/public/health" {
        return json_response(serde_json::json!({
            "status": "ok",
            "service": "store-public-api",
            "runtime": "rust",
            "routes": [
                "GET /api/public/tables",
                "GET /api/public/tables/search",
                "GET /api/public/tables/:id/items",
                "GET /api/public/tables/:id/items/:itemId",
                "GET /api/public/tables/:id/items/:itemId/availability",
                "GET /api/public/records",
                "GET /api/public/values/:column"
            ]
        }), 200);
    }

    // All other endpoints require authentication
    let token = match validate_token(&req, &env).await? {
        Some(t) => t,
        None => return error_response("Unauthorized", 401),
    };

    let query = parse_query_params(&url);

    // Route handling - order matters for path matching!
    match method {
        Method::Get => {
            // /api/public/tables/search?columns=...
            if path == "/api/public/tables/search" {
                return search_tables(&env, &token, &query).await;
            }

            // /api/public/tables/:id/items/:itemId/availability
            if path.starts_with("/api/public/tables/") && path.ends_with("/availability") {
                let parts: Vec<&str> = path.split('/').collect();
                if parts.len() == 8 && parts[5] == "items" {
                    let table_id = parts[4];
                    let item_id = parts[6];
                    return get_item_availability(&env, &token, table_id, item_id, &query).await;
                }
            }

            // /api/public/tables/:id/items/:itemId
            if path.starts_with("/api/public/tables/") && path.contains("/items/") {
                let parts: Vec<&str> = path.split('/').collect();
                if parts.len() == 7 && parts[5] == "items" {
                    let table_id = parts[4];
                    let item_id = parts[6];
                    return get_table_item(&env, &token, table_id, item_id).await;
                }
            }

            // /api/public/tables/:id/items
            if path.starts_with("/api/public/tables/") && path.ends_with("/items") {
                let table_id = path
                    .strip_prefix("/api/public/tables/")
                    .and_then(|s| s.strip_suffix("/items"))
                    .unwrap_or("");
                if !table_id.is_empty() {
                    return get_table_items(&env, &token, table_id, &query).await;
                }
            }

            // /api/public/tables
            if path == "/api/public/tables" {
                return get_tables(&env, &token).await;
            }

            // /api/public/records
            if path == "/api/public/records" {
                return get_records(&env, &token, &query).await;
            }

            // /api/public/values/:columnName
            if path.starts_with("/api/public/values/") {
                let column_name = path.strip_prefix("/api/public/values/").unwrap_or("");
                if !column_name.is_empty() {
                    return get_values(&env, &token, column_name, &query).await;
                }
            }

            error_response("Not found", 404)
        }
        Method::Post => {
            // POST endpoints (buy, rent, release) are write operations
            // Proxy these to the TypeScript API which has the business logic
            if path == "/api/public/buy" || path == "/api/public/rent" || path == "/api/public/release" {
                return proxy_to_api(req, &env).await;
            }
            error_response("Not found", 404)
        }
        _ => error_response("Method not allowed", 405),
    }
}
